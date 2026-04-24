import { Schema, model, models } from "mongoose";

// room document schema
export interface RoomDocument {
  roomName: string;
  roomDescription: string;
  buildingName: string;
  department: string;
  ocrSearchTerms: string[];
  asset3d: {
    equirectangularUrl: string;
    modelPath: string;
    coordinateX: number;
    coordinateY: number;
    coordinateZ: number;
  };
}

// create the schema based on the interface
const roomSchema = new Schema<RoomDocument>(
  {
    roomName: {
      type: String,
      required: [true, "please provide a room name"],
      unique: true,
      trim: true,
    },
    roomDescription: {
      type: String,
      required: [true, "please provide a room description"],
    },
    buildingName: {
      type: String,
      required: [true, "please provide a building name"],
    },
    department: {
      type: String,
      required: [true, "please provide the department name"],
    },
    // an array of strings to catch ocr typos, abbreviations, or alternative names
    ocrSearchTerms: [
      {
        type: String,
        trim: true,
      },
    ],
    // nested object to keep the 3d asset data highly organized and clustered together
    asset3d: {
      equirectangularUrl: {
        type: String,
        required: [true, "please provide the equirectangular image url"],
      },
      modelPath: {
        type: String,
        required: [true, "please provide the 3d model path url"],
      },
      coordinateX: {
        type: Number,
        required: true,
        default: 0,
      },
      coordinateY: {
        type: Number,
        required: true,
        default: 0,
      },
      coordinateZ: {
        type: Number,
        required: true,
        default: 0,
      },
    },
  },
  {
    // automatically adds createdAt and updatedAt timestamp fields
    timestamps: true,
  }
);

// prevents mongoose from re-compiling the model during next.js hot reloads
const Room = models.Room || model<RoomDocument>("Room", roomSchema);

export default Room;