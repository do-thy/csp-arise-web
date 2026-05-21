"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  School,
  DoorOpen,
  Box,
  Users,
  Settings,
  Menu,
  X,
  ChevronDown,
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
      {/* MOBILE TOP BAR - Fixed to Top */}
      <div className="lg:hidden flex items-center justify-between bg-[#1b1b1b] text-white p-4 sticky top-0 z-[60] w-full">
        <span className="font-bold tracking-wider">ADMIN CMS</span>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-white/10 rounded-md transition">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* SIDEBAR PANEL */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-[#1b1b1b] transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:block
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        {/* Desktop Logo Header */}
        <div className="hidden lg:flex h-[80px] items-center px-6 border-b border-white/10">
          <span className="text-lg font-bold tracking-wider text-white">ADMIN CMS</span>
        </div>

        <div className="flex flex-col mt-6 gap-1 px-3">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={isActive("/admin")} 
            onClick={() => { router.push("/admin"); setIsOpen(false); }} 
          />

          {/* Campuses Dropdown */}
          <div>
            <button
              onClick={() => setShowCampuses(!showCampuses)}
              className="w-full flex items-center justify-between py-3 px-3 rounded-lg text-white/70 hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3">
                <School size={20} />
                <span className="text-sm font-medium">Campuses</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${showCampuses ? "rotate-180" : ""}`} />
            </button>
            
            {showCampuses && (
              <div className="flex flex-col ml-6 mt-1 border-l border-white/10">
                <button onClick={() => { router.push("/admin/digi"); setIsOpen(false); }} className="text-left py-2 px-4 text-sm text-white/50 hover:text-white transition">DigiCampus</button>
                <button onClick={() => { router.push("/admin/main"); setIsOpen(false); }} className="text-left py-2 px-4 text-sm text-white/50 hover:text-white transition">Main Campus</button>
              </div>
            )}
          </div>

          <NavItem icon={<DoorOpen size={20} />} label="Rooms" active={isActive("/admin/rooms")} onClick={() => { router.push("/admin/rooms"); setIsOpen(false); }} />
          <NavItem icon={<Box size={20} />} label="3D Models" active={isActive("/admin/models")} onClick={() => { router.push("/admin/models"); setIsOpen(false); }} />
          <NavItem icon={<Users size={20} />} label="Users" active={isActive("/admin/users")} onClick={() => { router.push("/admin/users"); setIsOpen(false); }} />
          
          {/* Settings pushed to bottom on desktop, just below items on mobile */}
          <div className="lg:mt-auto mb-6 pt-4 lg:border-t lg:border-white/5">
             <NavItem icon={<Settings size={20} />} label="Settings" active={isActive("/admin/settings")} onClick={() => { router.push("/admin/settings"); setIsOpen(false); }} />
          </div>
        </div>
      </div>

      {/* OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full py-3 px-3 rounded-lg transition ${
        active 
          ? "bg-[#A12124] text-white shadow-md shadow-[#A12124]/20" 
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}