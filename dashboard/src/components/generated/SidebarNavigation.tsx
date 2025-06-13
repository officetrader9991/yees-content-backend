"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Home, FileText, History, Settings, HelpCircle, Twitter } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
export interface SidebarNavigationProps {
  activeItem?: "home" | "submit" | "database" | "repost";
  collapsed?: boolean;
  onNavigate?: (item: "home" | "submit" | "database" | "repost" | "settings" | "help") => void;
}
export default function SidebarNavigation({
  activeItem = "submit",
  collapsed = false,
  onNavigate
}: SidebarNavigationProps) {
  const navigationItems = [{
    id: "home",
    label: "Home",
    icon: Home
  }, {
    id: "submit",
    label: "Submit Tweet",
    icon: FileText
  }, {
    id: "database",
    label: "Tweet Database",
    icon: FileText
  }, {
    id: "repost",
    label: "Ready to re-post",
    icon: FileText
  }];
  const bottomItems = [{
    id: "settings",
    label: "Settings",
    icon: Settings
  }, {
    id: "help",
    label: "Help",
    icon: HelpCircle
  }];
  const handleNavigation = (itemId: string) => {
    onNavigate?.(itemId as "home" | "submit" | "database" | "repost" | "settings" | "help");
  };
  return <TooltipProvider>
      <motion.nav className={cn("flex flex-col h-full bg-gray-50 border-r border-gray-200 transition-all duration-300", collapsed ? "w-16" : "w-64")} initial={{
      opacity: 0,
      x: -20
    }} animate={{
      opacity: 1,
      x: 0
    }} transition={{
      duration: 0.3
    }}>
        {/* Header */}
        <header className="flex items-center gap-3 p-6 border-b border-gray-200">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
            <Twitter className="w-5 h-5 text-white" />
          </div>
          {!collapsed && <h1 className="text-lg font-semibold text-gray-900">Tweet Insight</h1>}
        </header>

        {/* Main Navigation */}
        <div className="flex-1 py-6">
          <ul className="space-y-2 px-3" role="list">
            {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return <li key={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" className={cn("w-full justify-start gap-3 h-11 px-3 text-left font-medium transition-all duration-200", collapsed ? "px-3 justify-center" : "justify-start", isActive ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900")} onClick={() => handleNavigation(item.id)} aria-current={isActive ? "page" : undefined}>
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Button>
                    </TooltipTrigger>
                    {collapsed && <TooltipContent side="right" className="font-medium">
                        <p>{item.label}</p>
                      </TooltipContent>}
                  </Tooltip>
                </li>;
          })}
          </ul>

          {/* Custom Action Buttons Below Ready to Repost */}
          <div className="mt-8 flex flex-col gap-3 px-3" aria-label="Sidebar Actions">
            <button type="button" className="flex items-center gap-3 rounded-xl px-4 py-3 bg-gradient-to-r from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 text-blue-800 font-semibold shadow-sm border border-blue-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2" aria-label="Analyze Engagement" tabIndex={0}>
              <svg aria-hidden="true" className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20v-6m0 0V4m0 10l-3-3m3 3l3-3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="truncate">SEO Articles</span>
            </button>
            <button type="button" className="flex items-center gap-3 rounded-xl px-4 py-3 bg-gradient-to-r from-purple-100 to-purple-50 hover:from-purple-200 hover:to-purple-100 text-purple-800 font-semibold shadow-sm border border-purple-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2" aria-label="Threads" tabIndex={0}>
              {/* Threads Icon - custom SVG for premium, elegant look */}
              <svg aria-hidden="true" className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 32 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <g>
                  <path d="M16 5c-6.075 0-11 4.925-11 11 0 6.075 4.925 11 11 11 6.075 0 11-4.925 11-11 0-6.075-4.925-11-11-11z" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M11.5 16c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M16 11.5c2.485 0 4.5 2.015 4.5 4.5s-2.015 4.5-4.5 4.5" stroke="currentColor" strokeWidth="2" fill="none" />
                </g>
              </svg>
              <span className="truncate">Threads</span>
            </button>
            <button type="button" className="flex items-center gap-3 rounded-xl px-4 py-3 bg-gradient-to-r from-green-100 to-green-50 hover:from-green-200 hover:to-green-100 text-green-800 font-semibold shadow-sm border border-green-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2" aria-label="Growth Insights" tabIndex={0}>
              <svg aria-hidden="true" className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="13" r="1.5" /><circle cx="17" cy="7" r="1.5" /></svg>
              <span className="truncate">Voiceover</span>
            </button>
          </div>
        </div>

        <Separator className="mx-3" />

        {/* Bottom Navigation */}
        <div className="py-4">
          <ul className="space-y-2 px-3" role="list">
            {bottomItems.map(item => {
            const Icon = item.icon;
            return <li key={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" className={cn("w-full justify-start gap-3 h-11 px-3 text-left font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200", collapsed ? "px-3 justify-center" : "justify-start")} onClick={() => handleNavigation(item.id)}>
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Button>
                    </TooltipTrigger>
                    {collapsed && <TooltipContent side="right" className="font-medium">
                        <p>{item.label}</p>
                      </TooltipContent>}
                  </Tooltip>
                </li>;
          })}
          </ul>
        </div>
      </motion.nav>
    </TooltipProvider>;
}