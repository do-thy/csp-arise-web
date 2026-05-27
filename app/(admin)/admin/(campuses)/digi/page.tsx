"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { School, Database, HardDrive, Map, ArrowRight, Activity } from "lucide-react";

export default function DigiCampusDashboard() {
  const router = useRouter();

  // Mock metadata for the Digital/IT Campus layout
  const stats = {
    totalRooms: 42,
    activeNodes: 118,
    interconnectedLinks: 245,
    lastSync: "2026-05-27 14:15 PHT",
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-8 text-[#111827]">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
            Campus Profile
          </span>
          <h1 className="text-4xl font-bold mt-2 text-[#111827]">DigiCampus Workspace</h1>
          <p className="text-gray-500 text-sm mt-1">Operational configuration, network nodes, and spatial maps for the virtual data hub.</p>
        </div>

        <button 
          onClick={() => router.push("/admin/map-editor?view=placard")}
          className="flex items-center gap-2 bg-[#111827] hover:bg-neutral-800 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all"
        >
          <span>Launch Map Editor</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-[#eceff4] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mb-4">
            <School size={20} />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mapped Rooms</p>
          <h2 className="text-2xl font-bold mt-1 text-[#111827]">{stats.totalRooms} Areas</h2>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#eceff4] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4">
            <Database size={20} />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">OCR Placement Nodes</p>
          <h2 className="text-2xl font-bold mt-1 text-[#111827]">{stats.activeNodes} Vertices</h2>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#eceff4] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-4">
            <HardDrive size={20} />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Graph Matrix Edges</p>
          <h2 className="text-2xl font-bold mt-1 text-[#111827]">{stats.interconnectedLinks} Paths</h2>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#eceff4] shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4">
            <Activity size={20} />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Data Pipe Sync</p>
          <h2 className="text-sm font-bold mt-2 text-emerald-600 truncate">{stats.lastSync}</h2>
        </div>
      </div>

      {/* RECENT OPERATIONAL LOGS CONTAINER */}
      <div className="bg-white rounded-2xl border border-[#eceff4] shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Map size={16} className="text-red-600" />
          <span>Local Path-Finding Logs (DigiCampus Layout)</span>
        </h3>
        <div className="space-y-3 font-mono text-xs text-gray-600">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between">
            <span>[INFO] WebGL Compiled spatial context map data safely.</span>
            <span className="text-gray-400">Just now</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between">
            <span>[SUCCESS] Synchronized batch transaction pipeline (118 nodes pushed to Firestore).</span>
            <span className="text-gray-400">10 mins ago</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between">
            <span>[STABLE] Connected core graph engine interface to asset collection.</span>
            <span className="text-gray-400">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}