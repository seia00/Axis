"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { LayoutDashboard, Edit, Package, GitMerge, Users, GraduationCap } from "lucide-react";

const sidebarItems = [
  { href: "/network/dashboard",  label: "Dashboard",    icon: LayoutDashboard },
  { href: "/network/profile",    label: "Edit Profile", icon: Edit },
  { href: "/network/team",       label: "Team",         icon: Users },
  { href: "/network/resources",  label: "Resources",    icon: Package },
  { href: "/network/merge",      label: "Merge Program", icon: GitMerge },
  { href: "/network/onboarding", label: "Onboarding",   icon: GraduationCap },
];

export function NetworkSidebar() {
  return <Sidebar items={sidebarItems} title="Network Portal" />;
}
