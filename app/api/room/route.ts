import { NextResponse } from "next/server";
// adjust these import paths depending on exactly where your lib and models folders are relative to this file
import dbConnect from "@/lib/mongodb";
import Room from "@/models/room";

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