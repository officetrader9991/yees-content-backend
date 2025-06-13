"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import SidebarNavigation from "./SidebarNavigation";
import HeaderBar from "./HeaderBar";
import TweetInputCard from "./TweetInputCard";
import AIResponsePanel from "./AIResponsePanel";
import DashboardHomePage from "./DashboardHomePage";
import TweetDatabaseTable from "./TweetDatabaseTable";
import ReadyToRepostTable from "./ReadyToRepostTable";
export interface TweetAnalysisDashboardProps {
  userName?: string;
}
export default function TweetAnalysisDashboard({
  userName = "User"
}: TweetAnalysisDashboardProps) {
  const isMobile = useIsMobile();
  const [tweetUrl, setTweetUrl] = React.useState("");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisData, setAnalysisData] = React.useState<{
    categoryTags: string[];
    summary: string;
    tweetType: "Long Thread" | "Standalone";
  } | null>(null);
  const [activeNavItem, setActiveNavItem] = React.useState<"home" | "submit" | "database" | "repost">("home");
  const handleTweetSubmit = async (url: string) => {
    setIsAnalyzing(true);
    setAnalysisData(null);

    // Simulate API call
    setTimeout(() => {
      setAnalysisData({
        categoryTags: ["Marketing", "Technology", "Social Media"],
        summary: "This tweet discusses the latest trends in social media marketing and how businesses can leverage new platform features to increase engagement with their target audience.",
        tweetType: "Standalone"
      });
      setIsAnalyzing(false);
    }, 2000);
  };
  const handleNavigation = (item: "home" | "submit" | "database" | "repost" | "settings" | "help") => {
    if (item === "home" || item === "submit" || item === "database" || item === "repost") {
      setActiveNavItem(item);
    }
    // Handle other navigation items as needed
  };
  return <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={cn("flex-shrink-0 transition-all duration-300", isMobile ? "fixed inset-y-0 left-0 z-50" : "relative")}>
        <SidebarNavigation activeItem={activeNavItem} collapsed={isMobile} onNavigate={handleNavigation} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <motion.div className={cn("flex-1 bg-white rounded-tl-2xl shadow-xl overflow-auto", isMobile ? "ml-16 rounded-tl-none" : "ml-0")} initial={{
        opacity: 0,
        scale: 0.98
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        duration: 0.4
      }}>
          {/* Header */}
          <HeaderBar userName={userName} onProfileClick={() => console.log("Profile clicked")} />

          {/* Content Area */}
          <div className={cn("px-8 py-8 space-y-8 w-full", isMobile && "px-4 py-6 space-y-6")}>
            {activeNavItem === "home" && <section aria-labelledby="dashboard-home-heading">
                <h2 id="dashboard-home-heading" className="sr-only">Dashboard Home</h2>
                {/* Dashboard Home Page */}
                <DashboardHomePage />
              </section>}
            {activeNavItem === "submit" && <>
                <section aria-labelledby="tweet-input-heading">
                  <h2 id="tweet-input-heading" className="text-2xl font-bold mb-4">Submit Tweet</h2>
                  <TweetInputCard value={tweetUrl} onValueChange={setTweetUrl} onSubmit={handleTweetSubmit} isLoading={isAnalyzing} />
                </section>
                <section aria-labelledby="ai-response-heading">
                  <h2 id="ai-response-heading" className="text-2xl font-bold mb-4 mt-8">AI Analysis</h2>
                  <AIResponsePanel categoryTags={analysisData?.categoryTags} summary={analysisData?.summary} tweetType={analysisData?.tweetType} isLoading={isAnalyzing} hasData={!!analysisData} />
                </section>
              </>}
            {activeNavItem === "database" && <section aria-labelledby="tweet-database-heading">
                <h2 id="tweet-database-heading" className="sr-only">Tweet Database</h2>
                <TweetDatabaseTable />
              </section>}
            {activeNavItem === "repost" && <section aria-labelledby="ready-to-repost-heading">
                <h2 id="ready-to-repost-heading" className="sr-only">Ready to Re-post</h2>
                <ReadyToRepostTable />
              </section>}
          </div>
        </motion.div>
      </main>
    </div>;
}