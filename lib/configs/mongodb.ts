import mongoose from "mongoose";

// explicitly define the shape of our connection cache
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// tell typescript that this specific cache object lives in the global node scope
declare global {
  var mongooseCache: MongooseCache;
}

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "please define the MONGODB_URI environment variable inside .env.local"
  );
}

// use the cache to avoid naming collisions and redundant connections
let cached = globalThis.mongooseCache;

if (!cached) {
  cached = globalThis.mongooseCache = { conn: null, promise: null };
}

// explicitly define the return type
export default async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // connect to mongodb and store the promise
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    // wait for the connection promise to resolve
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}