"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
export interface HeaderBarProps {
  userName?: string;
  onProfileClick?: () => void;
}
export default function HeaderBar({
  userName = "User",
  onProfileClick
}: HeaderBarProps) {
  return <motion.header className="w-full bg-white" initial={{
    opacity: 0,
    y: -10
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }}>
      <div className="flex items-center justify-between px-8 py-6">
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-900">
            Welcome, <span className="text-blue-600">{userName}</span>
          </h2>
        </div>
        
        <nav className="flex items-center">
          <button onClick={onProfileClick} className="flex items-center justify-center transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full" aria-label={`${userName}'s profile`}>
            <Avatar className="w-10 h-10 border-2 border-gray-200 hover:border-blue-300 transition-colors duration-200">
              <AvatarFallback className="bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 font-medium">
                <User className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
          </button>
        </nav>
      </div>
      
      <Separator className="bg-gray-100" />
    </motion.header>;
}