// BreezeLab – Navigation Sidebar
// Desktop collapsible sidebar + mobile drawer support.

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlayCircle,
  Binary,
  BarChart3,
  BookmarkCheck,
  BookOpen,
  Settings,
  Wind,
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
}

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/simulation', label: 'Simulation', icon: PlayCircle },
  { to: '/analysis', label: 'Vector Analysis', icon: Binary },
  { to: '/reports', label: 'Reports & Export', icon: BarChart3 },
  { to: '/scenarios', label: 'Saved Scenarios', icon: BookmarkCheck },
  { to: '/mathematics', label: 'Math Reference', icon: BookOpen },
  { to: '/settings', label: 'Settings & Tests', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = () => {
  return (
    <aside className="w-64 bg-[#123B36] border-r border-[#16877A]/30 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#16877A]/20">
          <div className="w-9 h-9 rounded-lg bg-[#16877A] flex items-center justify-center text-white shadow-sm">
            <Wind className="w-5 h-5 text-[#E1F2ED]" />
          </div>
          <div>
            <h1 className="font-bold text-base text-[#F5F7F4] tracking-tight">BreezeLab</h1>
            <p className="text-[11px] text-[#9EB3AC] leading-none">Applied Math Modelling</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#16877A] text-[#F5F7F4] shadow-sm'
                      : 'text-[#D7F5E9]/80 hover:bg-[#16877A]/20 hover:text-[#F5F7F4]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Syllabus / Academic Alignment Footer */}
      <div className="p-4 border-t border-[#16877A]/20 bg-[#0F2D29]">
        <div className="text-[11px] text-[#9EB3AC] space-y-1">
          <div className="font-semibold text-[#D7F5E9]">Academic Alignment</div>
          <p className="text-[10px] leading-relaxed text-[#9EB3AC]/90">
            CO1: 2-D Vector Calculus (Gradient, Divergence, Curl, Double Integrals) applied to
            Advection-Diffusion PDE.
          </p>
        </div>
      </div>
    </aside>
  );
};
