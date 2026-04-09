"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Waves, Activity, ShieldAlert, Home } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { path: "/predict", label: "Predict", icon: ShieldAlert },
    { path: "/analytics", label: "Analytics", icon: Activity },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#141414] px-4 lg:px-8 py-4 flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
          <Waves className="text-white w-4 h-4" />
        </div>
        <span className="text-sm font-bold tracking-widest uppercase hidden sm:inline">Disaster Detect</span>
      </Link>

      <div className="flex gap-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-colors ${
              pathname === item.path ? "text-blue-600" : "text-gray-500 hover:text-black"
            }`}
          >
            <item.icon className="w-3 h-3" />
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-[10px] uppercase tracking-widest font-bold opacity-30 hidden lg:block">
          System_Status: <span className="text-green-600">Active</span>
        </div>
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
      </div>
    </nav>
  );
}
