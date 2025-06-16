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
import OrdersTable, { Order } from "./OrdersTable";
import SimilarTweetsPanel from "./SimilarTweetsPanel";
import { supabase } from "@/lib/supabase";
import TranslatorPage from "./TranslatorPage";

export interface TweetAnalysisDashboardProps {
  userName?: string;
}

export default function TweetAnalysisDashboard({
  userName = "User"
}: TweetAnalysisDashboardProps) {
  const isMobile = useIsMobile();
  const [tweetUrl, setTweetUrl] = React.useState("");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [allCategories, setAllCategories] = React.useState<string[]>([]);
  const [analysisData, setAnalysisData] = React.useState<{
    categoryTags: string[];
    summary: string;
    tweetType: "Long Thread" | "Standalone";
  } | null>(null);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [activeNavItem, setActiveNavItem] = React.useState<"home" | "submit" | "database" | "repost" | "seo-articles" | "threads" | "voiceover" | "translator">("home");

  const [duplicateTweet, setDuplicateTweet] = React.useState<string | null>(null);
  const [authorTweets, setAuthorTweets] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('tweets').select('category');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      const allCategoryArrays = data.map(item => item.category).filter(Boolean);
      const uniqueCategories = [...new Set(allCategoryArrays.flat())];
      setAllCategories(uniqueCategories);
    };

    fetchCategories();
  }, []);

  const handleTweetSubmit = async (url: string, comment: string, categories: string[], isSplendid: boolean) => {
    setOrders(prevOrders => [...prevOrders, { url, status: "Analyzing" }]);
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('https://growlark.app.n8n.cloud/webhook/5f875500-1dcc-452e-a424-e63bcf20e05b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, comment, categories, splendid_tweet: isSplendid }),
      });

      if (response.ok) {
        // Assuming the webhook returns some data to display, but for now, we'll just mark it as analyzed.
        // const data = await response.json(); 
        // setAnalysisData(data);
        setOrders(prevOrders => prevOrders.map(order => order.url === url ? { ...order, status: "Analyzed" } : order));
      } else {
        setOrders(prevOrders => prevOrders.map(order => order.url === url ? { ...order, status: "Failed" } : order));
      }
    } catch (error) {
        console.error("Error submitting tweet for analysis:", error);
        setOrders(prevOrders => prevOrders.map(order => order.url === url ? { ...order, status: "Failed" } : order));
    } finally {
        const newOrders = orders.map(order => order.url === url ? { ...order, status: "Analyzed" } : order)
        if (!newOrders.some(o => o.status === 'Analyzing')) {
          setIsAnalyzing(false);
        }
    }
  };

  const handleSimilarityCheck = async (url: string) => {
    setDuplicateTweet(null);
    setAuthorTweets([]);

    try {
      const urlParts = url.match(/^https:\/\/(twitter|x)\.com\/([a-zA-Z0-9_]+)\/status\/(\d+)/);
      if (!urlParts) return;

      const username = urlParts[2];
      const tweetId = urlParts[3];

      // 1. Check for exact duplicate
      const { data: duplicate } = await supabase.from('tweets').select('tweet_url').eq('tweet_id', tweetId).single();
      if (duplicate) setDuplicateTweet(duplicate.tweet_url);

      // 2. Check for same author
      const { data: author } = await supabase.from('tweets').select('tweet_url').eq('author_username', username).neq('tweet_id', tweetId).order('tweet_created_at', { ascending: false }).limit(4);
      if (author) setAuthorTweets(author.map(t => t.tweet_url));

    } catch (error) {
      console.error("Error checking for similar tweets:", error);
    }
  };

  const handleNavigation = (item: "home" | "submit" | "database" | "repost" | "settings" | "help" | "seo-articles" | "threads" | "voiceover" | "translator") => {
    if (item === "home" || item === "submit" || item === "database" || item === "repost" || item === "seo-articles" || item === "threads" || item === "voiceover" || item === "translator") {
      setActiveNavItem(item);
    }
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-8">
                    <section aria-labelledby="tweet-input-heading">
                      <h2 id="tweet-input-heading" className="text-2xl font-bold mb-4">Submit Tweet</h2>
                      <TweetInputCard
                        value={tweetUrl}
                        onValueChange={setTweetUrl}
                        onSubmit={(url, comment, categories, isSplendid) => handleTweetSubmit(url, comment, categories, isSplendid)}
                        onValidUrl={handleSimilarityCheck}
                        allCategories={allCategories}
                        onNewCategory={ (newCategory: string) => {
                          if (!allCategories.includes(newCategory)) {
                            setAllCategories([...allCategories, newCategory]);
                          }
                        }}
                      />
                    </section>
                    <section aria-labelledby="orders-heading">
                      <OrdersTable orders={orders} onShowResults={() => handleNavigation("database")} />
                    </section>
                    <section aria-labelledby="ai-response-heading">
                      <h2 id="ai-response-heading" className="text-2xl font-bold mb-4 mt-8">AI Analysis</h2>
                      <AIResponsePanel categoryTags={analysisData?.categoryTags} summary={analysisData?.summary} tweetType={analysisData?.tweetType} isLoading={isAnalyzing && !analysisData} hasData={!!analysisData} />
                    </section>
                  </div>
                  <aside className="lg:col-span-1 space-y-8">
                    {duplicateTweet && <SimilarTweetsPanel title="⚠️ Exact Duplicate Found" urls={[duplicateTweet]} />}
                    <SimilarTweetsPanel title="More From This Author" urls={authorTweets} />
                  </aside>
                </div>
              </>}
            {activeNavItem === "database" && <section aria-labelledby="tweet-database-heading">
                <h2 id="tweet-database-heading" className="sr-only">Tweet Database</h2>
                <TweetDatabaseTable />
              </section>}
            {activeNavItem === "repost" && <section aria-labelledby="ready-to-repost-heading">
                <h2 id="ready-to-repost-heading" className="sr-only">Ready to Re-post</h2>
                <ReadyToRepostTable />
              </section>}
            {activeNavItem === "translator" && <TranslatorPage />}
            {activeNavItem === "seo-articles" && <h2 className="text-2xl font-bold">SEO Articles</h2>}
            {activeNavItem === "threads" && <h2 className="text-2xl font-bold">Threads</h2>}
            {activeNavItem === "voiceover" && <h2 className="text-2xl font-bold">Voiceover</h2>}
          </div>
        </motion.div>
      </main>
    </div>;
}