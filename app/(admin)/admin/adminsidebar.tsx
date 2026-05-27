"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  School,
  Box,
  Users,
  Settings,
  Menu,
  X,
  ChevronDown,
  MapPinned,
  Map,
} from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [showCampuses, setShowCampuses] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] flex items-center justify-between bg-[#111827] border-b border-white/5 px-5 py-4">
        <div>
          <h1 className="text-white font-bold tracking-wide">ARISE CMS</h1>
          <p className="text-[11px] text-gray-400">Indoor Navigation System</p>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl hover:bg-white/5 transition"
        >
          {isOpen ? <X size={22} className="text-white" /> : <Menu size={22} className="text-white" />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-[280px]
          bg-[#111827] border-r border-white/5
          transform transition-transform duration-300 ease-in-out
          flex flex-col
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* LOGO */}
        <div className="hidden lg:flex h-[90px] items-center px-7 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A12124] to-[#7f1d1d] flex items-center justify-center shadow-lg shadow-red-900/20">
              <MapPinned size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">ARISE CMS</h1>
              <p className="text-xs text-gray-500 mt-1">Indoor Navigation System</p>
            </div>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex flex-col mt-8 gap-2 px-4 h-full overflow-y-auto">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={isActive("/admin")}
            onClick={() => {
              router.push("/admin");
              setIsOpen(false);
            }}
          />

          {/* CAMPUSES DROPDOWN */}
          <div>
            <button
              onClick={() => setShowCampuses(!showCampuses)}
              className="flex items-center justify-between w-full py-3 px-4 rounded-2xl text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <School size={20} />
                <span className="text-sm font-medium">Campuses</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-200 ${showCampuses ? "rotate-180" : ""}`} />
            </button>

            {showCampuses && (
              <div className="ml-6 mt-2 flex flex-col gap-1 border-l border-white/5 pl-4">
                <button
                  onClick={() => {
                    router.push("/admin/digi");
                    setIsOpen(false);
                  }}
                  className="text-left py-2 px-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition"
                >
                  DigiCampus
                </button>
                <button
                  onClick={() => {
                    router.push("/admin/main");
                    setIsOpen(false);
                  }}
                  className="text-left py-2 px-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition"
                >
                  Main Campus
                </button>
              </div>
            )}
          </div>

          {/* UNIFIED MAP EDITOR BUTTON */}
          <NavItem
            icon={<Map size={20} />}
            label="Map Editor"
            active={isActive("/admin/map-editor")}
            onClick={() => {
              router.push("/admin/map-editor");
              setIsOpen(false);
            }}
          />

          <NavItem
            icon={<Box size={20} />}
            label="3D Models"
            active={isActive("/admin/models")}
            onClick={() => {
              router.push("/admin/models");
              setIsOpen(false);
            }}
          />

          <NavItem
            icon={<Users size={20} />}
            label="Users"
            active={isActive("/admin/users")}
            onClick={() => {
              router.push("/admin/users");
              setIsOpen(false);
            }}
          />

          {/* SETTINGS */}
          <div className="mt-auto mb-6 pt-4 border-t border-white/10">
            <NavItem
              icon={<Settings size={20} />}
              label="Settings"
              active={isActive("/admin/settings")}
              onClick={() => {
                router.push("/admin/settings");
                setIsOpen(false);
              }}
            />
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY BACKDROP */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-3 w-full py-3 px-4 rounded-2xl transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-[#A12124] to-[#7f1d1d] text-white shadow-lg shadow-red-900/20"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {active && <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white" />}
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}