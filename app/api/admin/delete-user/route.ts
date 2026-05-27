import { NextResponse } from "next/server";

import admin from "firebase-admin";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const { uid } = body;

    if (!uid) {
      return NextResponse.json(
        { error: "Missing uid" },
        { status: 400 }
      );
    }

    // DELETE FIREBASE AUTH USER
    await admin.auth().deleteUser(uid);

    // DELETE FIRESTORE DOCUMENT
    await admin.firestore()
      .collection("users")
      .doc(uid)
      .delete();

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to delete user",
      },
      {
        status: 500,
      }
    );
  }
}