"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Send,
  Inbox,
  GitBranch,
  CheckSquare,
  Mail,
  Calendar,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/contacts", icon: Users, label: "Contacts" },
  { href: "/accounts", icon: Building2, label: "Accounts" },
  { href: "/campaigns", icon: Send, label: "Campaigns" },
  { href: "/triage", icon: Inbox, label: "Triage" },
  { href: "/pipeline", icon: GitBranch, label: "Pipeline" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/mailboxes", icon: Mail, label: "Mailboxes" },
  { href: "/content", icon: Calendar, label: "Content" },
  { href: "/admin/settings", icon: Settings, label: "Admin" },
  { href: "/audit", icon: FileText, label: "Audit Log" },
];

export function Sidebar({ collapsed: initialCollapsed = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const pathname = usePathname();

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } h-full bg-slate-900 dark:bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AK</span>
            </div>
            <span className="text-white font-semibold text-sm truncate">
              AKRU OS
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-300"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? "active" : ""} ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-800">
        <div
          className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
            M
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Mohsin</p>
              <p className="text-xs text-slate-400 truncate">CEO</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
