import { NextResponse } from "next/server";
// adjust these import paths depending on exactly where your lib and models folders are relative to this file
import dbConnect from "@/lib/mongodb";
import Room from "@/models/room";

type RoomAsset3d = {
  equirectangularUrl?: string;
  modelPath?: string;
  coordinateX?: number;
  coordinateY?: number;
  coordinateZ?: number;
};

type RoomPostBody = {
  roomName?: string;
  roomDescription?: string;
  buildingName?: string;
  department?: string;
  ocrSearchTerms?: string[] | string;
  asset3d?: RoomAsset3d;
};

type RoomCreatePayload = {
  roomName: string;
  roomDescription: string;
  buildingName: string;
  department: string;
  ocrSearchTerms: string[];
  asset3d?: Partial<RoomAsset3d>;
};

function normalizeSearchTerms(terms?: string[] | string): string[] {
  if (!terms) return [];
  if (Array.isArray(terms)) {
    return terms.map((term) => term.trim()).filter(Boolean);
  }

  return terms
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);
}

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "internal server error";
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("id")?.trim();
    const scannedText = searchParams.get("scannedText")?.trim();

    if (roomId) {
      const room = await Room.findById(roomId);
      if (!room) {
        return NextResponse.json({ error: "room not found" }, { status: 404 });
      }
      return NextResponse.json({ data: room }, { status: 200 });
    }

    if (!scannedText) {
      const rooms = await Room.find({}).sort({ roomName: 1 });
      return NextResponse.json({ data: rooms }, { status: 200 });
    }

    const room = await Room.findOne({
      $or: [
        { roomName: { $regex: new RegExp(`^${scannedText}$`, "i") } },
        { ocrSearchTerms: { $regex: new RegExp(`^${scannedText}$`, "i") } },
      ],
    });

    if (!room) {
      return NextResponse.json(
        { error: "no matching room found in the database" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: room }, { status: 200 });
  } catch (error) {
    console.error("database routing error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
export async function PATCH(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("id")?.trim();

    if (!roomId) {
      return NextResponse.json({ error: "room id is required" }, { status: 400 });
    }

    const body: RoomPostBody = await request.json();
    const update: Partial<RoomPostBody> = {};

    if (body.roomName?.trim()) {
      update.roomName = body.roomName.trim();
    }
    if (body.roomDescription?.trim()) {
      update.roomDescription = body.roomDescription.trim();
    }
    if (body.buildingName?.trim()) {
      update.buildingName = body.buildingName.trim();
    }
    if (body.department?.trim()) {
      update.department = body.department.trim();
    }
    if (body.ocrSearchTerms != null) {
      update.ocrSearchTerms = normalizeSearchTerms(body.ocrSearchTerms);
    }
    if (body.asset3d) {
      update.asset3d = buildAsset3dPayload(body.asset3d);
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No update fields provided" }, { status: 400 });
    }

    if (update.roomName) {
      const existingRoom = await Room.findOne({
        roomName: { $regex: new RegExp(`^${update.roomName}$`, "i") },
        _id: { $ne: roomId },
      });

      if (existingRoom) {
        return NextResponse.json(
          { error: "a room with this name already exists" },
          { status: 409 },
        );
      }
    }

    const updatedRoom = await Room.findByIdAndUpdate(roomId, update, {
      new: true,
      runValidators: true,
    });

    if (!updatedRoom) {
      return NextResponse.json({ error: "room not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updatedRoom }, { status: 200 });
  } catch (error: unknown) {
    console.error("room update error:", error);

    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { error: "a room with that name already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("id")?.trim();

    if (!roomId) {
      return NextResponse.json({ error: "room id is required" }, { status: 400 });
    }

    const deletedRoom = await Room.findByIdAndDelete(roomId);
    if (!deletedRoom) {
      return NextResponse.json({ error: "room not found" }, { status: 404 });
    }

    return NextResponse.json({ data: deletedRoom }, { status: 200 });
  } catch (error) {
    console.error("room delete error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
function buildAsset3dPayload(asset3d?: RoomAsset3d): Partial<RoomAsset3d> {
  const payload: Partial<RoomAsset3d> = {};

  if (!asset3d) {
    return payload;
  }

  if (asset3d.equirectangularUrl?.trim()) {
    payload.equirectangularUrl = asset3d.equirectangularUrl.trim();
  }

  if (asset3d.modelPath?.trim()) {
    payload.modelPath = asset3d.modelPath.trim();
  }

  if (asset3d.coordinateX != null) {
    payload.coordinateX = Number(asset3d.coordinateX);
  }

  if (asset3d.coordinateY != null) {
    payload.coordinateY = Number(asset3d.coordinateY);
  }

  if (asset3d.coordinateZ != null) {
    payload.coordinateZ = Number(asset3d.coordinateZ);
  }

  return payload;
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body: RoomPostBody = await request.json();
    const roomName = body.roomName?.trim();
    const roomDescription = body.roomDescription?.trim();
    const buildingName = body.buildingName?.trim();
    const department = body.department?.trim();
    const cleanedOcrSearchTerms = normalizeSearchTerms(body.ocrSearchTerms);

    if (!roomName || !roomDescription || !buildingName || !department) {
      return NextResponse.json(
        { error: "roomName, roomDescription, buildingName, and department are required" },
        { status: 400 }
      );
    }

    const existingRoom = await Room.findOne({
      roomName: { $regex: new RegExp(`^${roomName}$`, "i") },
    });

    if (existingRoom) {
      return NextResponse.json(
        { error: "a room with this name already exists" },
        { status: 409 }
      );
    }

    const asset3dPayload = buildAsset3dPayload(body.asset3d);

    const roomData: RoomCreatePayload = {
      roomName,
      roomDescription,
      buildingName,
      department,
      ocrSearchTerms: cleanedOcrSearchTerms,
    };

    if (Object.keys(asset3dPayload).length > 0) {
      roomData.asset3d = asset3dPayload;
    }

    const createdRoom = await Room.create(roomData);

    return NextResponse.json({ data: createdRoom }, { status: 201 });
  } catch (error: unknown) {
    console.error("room create error:", error);

    if (isDuplicateKeyError(error)) {
      return NextResponse.json(
        { error: "a room with that name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}