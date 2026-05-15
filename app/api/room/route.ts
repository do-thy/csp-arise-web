import { NextResponse } from "next/server";
// adjust these import paths depending on exactly where your lib and models folders are relative to this file
import dbConnect from "@/lib/mongodb";
import Room from "@/models/room";

type RoomPostBody = {
  roomName?: string;
  roomDescription?: string;
  buildingName?: string;
  department?: string;
  ocrSearchTerms?: string[] | string;
  asset3d?: {
    equirectangularUrl?: string;
    modelPath?: string;
    coordinateX?: number;
    coordinateY?: number;
    coordinateZ?: number;
  };
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

export async function GET(request: Request) {
  try {
    // establish or retrieve the cached database connection
    await dbConnect();

    // extract the scanned text from the url query parameters 
    // example: /api/room?scannedText=comp lab 1
    const { searchParams } = new URL(request.url);
    const scannedText = searchParams.get("scannedText");

    if (!scannedText) {
      return NextResponse.json(
        { error: "please provide scanned text in the query parameters" },
        { status: 400 }
      );
    }

    // strip any accidental leading/trailing whitespace from the url parameter
    const cleanSearchText = scannedText.trim();

    // query the database
    // the regex with "i" makes the search completely case-insensitive
    // the ^ and $ ensure it matches the entire string, not just a partial substring
    const room = await Room.findOne({
      $or: [
        { roomName: { $regex: new RegExp(`^${cleanSearchText}$`, "i") } },
        { ocrSearchTerms: { $regex: new RegExp(`^${cleanSearchText}$`, "i") } },
      ],
    });

    // handle the "no match found" scenario
    if (!room) {
      return NextResponse.json(
        { error: "no matching room found in the database" },
        { status: 404 }
      );
    }

    // return the successfully found room document as json
    return NextResponse.json({ data: room }, { status: 200 });

  } catch (error) {
    console.error("database routing error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}

function buildAsset3dPayload(asset3d?: RoomPostBody["asset3d"]): Partial<RoomPostBody["asset3d"]> {
  const payload: Partial<RoomPostBody["asset3d"]> = {};

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

    const roomData: any = {
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
  } catch (error: any) {
    console.error("room create error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "a room with that name already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "internal server error" },
      { status: 500 }
    );
  }
}