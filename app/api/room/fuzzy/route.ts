import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/room";

// Defined a strict interface to replace "any" and satisfy TypeScript
interface RoomDocument {
  roomName: string;
  ocrSearchTerms?: string[];
  toObject: () => Record<string, unknown>;
}

/**
 * Levenshtein distance - measures the difference between two strings
 * Lower distance = more similar
 */
function levenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix: number[][] = Array(len2 + 1)
    .fill(null)
    .map(() => Array(len1 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }
  return matrix[len2][len1];
}

/**
 * Similarity score (0-1, where 1 = exact match)
 */
function similarityScore(s1: string, s2: string): number {
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(s1, s2) / maxLen;
}

export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const scannedText = searchParams.get("scannedText");
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    if (!scannedText) {
      return NextResponse.json(
        { error: "please provide scanned text in the query parameters" },
        { status: 400 }
      );
    }

    const cleanSearchText = scannedText.trim();

    // Fetch all rooms from database
    const allRooms = await Room.find({});

    // Calculate similarity for each room
    const scored = allRooms
      .map((room: RoomDocument) => {
        // Check against roomName
        const roomNameScore = similarityScore(
          cleanSearchText,
          room.roomName.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9\-'&\/]/g, "")
        );

        // Check against all ocrSearchTerms
        let bestOcrScore = 0;
        if (room.ocrSearchTerms && Array.isArray(room.ocrSearchTerms)) {
          room.ocrSearchTerms.forEach((term: string) => {
            const termScore = similarityScore(
              cleanSearchText,
              term.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9\-'&\/]/g, "")
            );
            bestOcrScore = Math.max(bestOcrScore, termScore);
          });
        }

        // Use the best score from either source
        const score = Math.max(roomNameScore, bestOcrScore);

        return {
          ...room.toObject(),
          matchScore: score,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .filter((r) => r.matchScore >= 0.2) // VERY LENIENT: Lowered from 0.5 to 0.2 (20% similarity threshold)
      .slice(0, limit);

    if (scored.length === 0) {
      return NextResponse.json(
        { error: "no similar rooms found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: scored.map(({ matchScore, ...rest }) => ({
          ...rest,
          matchScore,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("fuzzy search error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}