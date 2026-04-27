"use client";

import { Sidebar } from "@/components/layout/sidebar";
import {
  LayoutDashboard, ShieldCheck, Users, BarChart3,
  Package, MessageSquare, Rocket, CheckSquare, Calendar,
} from "lucide-react";

const sidebarItems = [
  { href: "/admin",              label: "Overview",           icon: LayoutDashboard },
  { href: "/admin/verification", label: "Verification Queue", icon: ShieldCheck },
  { href: "/admin/verify",       label: "Verify Items",       icon: CheckSquare },
  { href: "/admin/users",        label: "User Management",    icon: Users },
  { href: "/admin/analytics",    label: "Analytics",          icon: BarChart3 },
  { href: "/admin/reviews",      label: "Review Moderation",  icon: MessageSquare },
  { href: "/admin/ventures",     label: "Ventures",           icon: Rocket },
  { href: "/admin/resources",    label: "Resources",          icon: Package },
  { href: "/admin/events",       label: "Global Events",      icon: Calendar },
];

export function AdminSidebar() {
  return <Sidebar items={sidebarItems} title="Admin" />;
}
