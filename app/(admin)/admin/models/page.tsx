"use client";

import React, { useState } from "react";
import { Box, Wrench, ShieldCheck, Activity, Plus, FileText } from "lucide-react";

interface AssetModel {
  id: string;
  type: string;
  location: string;
  status: "Active" | "Maintenance" | "Calibrating";
  lastServiced: string;
}

export default function ModelsDashboard() {
  const [assets, setAssets] = useState<AssetModel[]>([
    { id: "CAM-NIK-D50", type: "Optical Sensor", location: "Main Room 301", status: "Active", lastServiced: "2026-05-12" },
    { id: "GEAR-LN-55", type: "Focus Alignment Link", location: "Digi Room 102", status: "Maintenance", lastServiced: "2026-04-20" },
    { id: "PLC-TAG-04", type: "OCR Target Plate", location: "Main Hallway B", status: "Active", lastServiced: "2026-05-01" },
  ]);

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-8 text-[#111827]">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-34px font-bold text-[#111827]">3D Models & Hardware Assets</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage physical IoT components, sensor calibration grids, and digital twin assets.</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-[#A12124] to-[#7f1d1d] text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-md hover:opacity-90 transition-all">
          <Plus size={14} />
          <span>Register New Asset</span>
        </button>
      </div>

      {/* QUICK STATUS OVERVIEW METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-[#eceff4] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600"><Box size={22} /></div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Total Models Linked</h3>
            <h1 className="text-2xl font-bold mt-1">{assets.length} Units</h1>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#eceff4] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600"><ShieldCheck size={22} /></div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Operational Rate</h3>
            <h1 className="text-2xl font-bold mt-1">94.2%</h1>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#eceff4] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600"><Wrench size={22} /></div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500">Requires Attention</h3>
            <h1 className="text-2xl font-bold mt-1">1 Component</h1>
          </div>
        </div>
      </div>

      {/* ASSETS DATA GRID MAPPING */}
      <div className="bg-white rounded-2xl border border-[#eceff4] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#eceff4] bg-gray-50/50">
          <h3 className="font-bold text-gray-800 text-sm">Hardware Registry Reference List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Asset Model ID</th>
                <th className="px-6 py-3">Classification Type</th>
                <th className="px-6 py-3">Assigned Location</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Last Checked</th>
                <th className="px-6 py-3 text-right">Action Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceff4]">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-gray-700">{asset.id}</td>
                  <td className="px-6 py-4 text-gray-600">{asset.type}</td>
                  <td className="px-6 py-4 text-gray-600">{asset.location}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      asset.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      <Activity size={10} />
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{asset.lastServiced}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 ml-auto">
                      <FileText size={12} />
                      <span>Log Service</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}