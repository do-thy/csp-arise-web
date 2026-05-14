import { NextRequest, NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  : process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ? {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }
  : undefined;

if (!getApps().length) {
  if (serviceAccount) {
    initializeApp({ credential: cert(serviceAccount) });
  }
}

const getAdminAuth = () => {
  if (!getApps().length) {
    throw new Error("Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON or the equivalent admin env vars.");
  }
  return getAuth();
};

const createCustomToken = async (idToken: string) => {
  const auth = getAdminAuth();
  const decoded = await auth.verifyIdToken(idToken);
  return auth.createCustomToken(decoded.uid);
};

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  if (!token) {
    return NextResponse.json({ error: "Missing mobile auth token." }, { status: 400 });
  }

  try {
    const customToken = await createCustomToken(token);
    return NextResponse.json({ customToken });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to transfer mobile auth." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing mobile auth token." }, { status: 400 });
  }

  try {
    const customToken = await createCustomToken(token);
    return NextResponse.json({ customToken });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to transfer mobile auth." }, { status: 500 });
  }
}
