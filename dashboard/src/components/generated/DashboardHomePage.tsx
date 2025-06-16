"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, MessageSquare, Users, BarChart3, Calendar, Hash, Clock, ArrowUpRight, Loader2 } from "lucide-react";
import { supabase, Tweet } from "@/lib/supabase";
import { formatDistanceToNow } from 'date-fns';
import { Tweet as EmbeddedTweet } from 'react-tweet';

export interface DashboardHomePageProps {
  className?: string;
}
export default function DashboardHomePage({
  className
}: DashboardHomePageProps) {
  const [tweets, setTweets] = React.useState<Tweet[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchTweets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('tweets')
          .select('*')
          .order('scraped_at', { ascending: false });

        if (error) {
          console.error('Error fetching tweets:', error);
          setError('Failed to load tweet data.');
          return;
        }

        setTweets(data || []);
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchTweets();
  }, []);

  // Helper function to format category names
  const formatCategoryName = (snakeCase: string) => {
    if (!snakeCase) return "Uncategorized";
    if (snakeCase.toLowerCase() === 'cta') return 'CTA';
    return snakeCase
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Calculate stats from fetched data
  const totalTweets = tweets.length;
  const uniqueCategories = [...new Set(
    tweets.flatMap(t => {
      if (typeof t.category === 'string') {
        return t.category.split(',').map(c => c.trim());
      }
      if (Array.isArray(t.category)) {
        return t.category;
      }
      return [];
    }).filter(Boolean)
  )];
  const activeCategoriesCount = uniqueCategories.length;
  const readyToPostCount = tweets.filter(t => t.status === 'ready').length;
  const thisWeekCount = tweets.filter(t => {
    if (!t.scraped_at) return false;
    const scrapedDate = new Date(t.scraped_at);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return scrapedDate > oneWeekAgo;
  }).length;
  
  const stats = [{
    title: "Total Tweets",
    value: totalTweets.toLocaleString(),
    change: "", // Dynamic change can be complex, keeping it simple for now
    trend: "up",
    icon: MessageSquare,
    color: "blue"
  }, {
    title: "Active Categories",
    value: activeCategoriesCount.toLocaleString(),
    change: "",
    trend: "up",
    icon: Hash,
    color: "green"
  }, {
    title: "Ready to Post",
    value: readyToPostCount.toLocaleString(),
    change: "",
    trend: "up",
    icon: TrendingUp,
    color: "purple"
  }, {
    title: "Scraped This Week",
    value: thisWeekCount.toLocaleString(),
    change: "",
    trend: "up",
    icon: Calendar,
    color: "orange"
  }];

  // Calculate category breakdown from fetched data
  const categoryCounts = tweets.reduce((acc, tweet) => {
    let cats: string[] = [];
    if (typeof tweet.category === 'string') {
      cats = tweet.category.split(',').map(c => c.trim());
    } else if (Array.isArray(tweet.category)) {
      cats = tweet.category;
    }

    cats.forEach(cat => {
      if (cat) {
        acc[cat] = (acc[cat] || 0) + 1;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.entries(categoryCounts)
    .map(([name, count]) => ({
      name: formatCategoryName(name),
      count,
      percentage: Math.round((count / totalTweets) * 100) || 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Show top 5 categories

  // Get recent tweets from fetched data
  const recentTweets = tweets.slice(0, 5).map(tweet => {
    let categories: string[] = [];
    if (typeof tweet.category === 'string') {
      categories = tweet.category.split(',').map(c => c.trim());
    } else if (Array.isArray(tweet.category)) {
      categories = tweet.category;
    }

    return {
      id: tweet.id,
      tweetId: tweet.tweet_id,
      content: tweet.first_tweet_text || 'No content',
      categories: categories.filter(Boolean).map(formatCategoryName),
      date: tweet.scraped_at ? formatDistanceToNow(new Date(tweet.scraped_at), { addSuffix: true }) : 'Unknown date',
      status: tweet.status || 'unknown'
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-700 border-green-200";
      case "analyzed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "processing":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };
  const getStatColor = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "green":
        return "bg-green-50 text-green-600 border-green-200";
      case "purple":
        return "bg-purple-50 text-purple-600 border-purple-200";
      case "orange":
        return "bg-orange-50 text-orange-600 border-orange-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center min-h-[50vh]", className)}>
        <div className="flex items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-xl text-gray-600">Loading Dashboard Data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center min-h-[50vh]", className)}>
        <div className="text-center space-y-4 p-6 bg-red-50 border border-red-200 rounded-lg">
           <h2 className="text-xl font-semibold text-red-800">Something went wrong</h2>
           <p className="text-red-600">{error}</p>
           <p className="text-gray-500 text-sm">Please check your connection and Supabase configuration.</p>
        </div>
      </div>
    );
  }

  return <div className={cn("space-y-8", className)}>
      {/* Page Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your tweet analysis.
        </p>
      </header>

      {/* Custom styles for embedded tweets */}
      <style>{`
        .tweet-container .react-tweet-theme {
          font-size: 70% !important;
        }
      `}</style>

      {/* Stats Cards */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Statistics Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
          const Icon = stat.icon;
          return <motion.div key={stat.title} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.3,
            delay: index * 0.1
          }}>
                <Card className="relative overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={cn("p-2 rounded-lg", getStatColor(stat.color))}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="flex items-center text-sm">
                      {stat.change && (
                        <>
                          <ArrowUpRight className={cn("h-4 w-4 mr-1", stat.trend === "up" ? "text-green-600" : "text-red-600 rotate-180")} />
                          <span className={cn("font-medium", stat.trend === "up" ? "text-green-600" : "text-red-600")}>
                            {stat.change}
                          </span>
                          <span className="text-gray-500 ml-1">from last month</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>;
        })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown */}
        <motion.section className="lg:col-span-1" initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.4,
        delay: 0.2
      }} aria-labelledby="categories-heading">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-gray-600" />
                <span>Category Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories.length > 0 ? categories.map((category, index) => <div key={category.name} className="flex items-center gap-4 text-sm">
                  <span className="font-medium text-gray-800 flex-1 truncate" title={category.name}>
                    {category.name}
                  </span>
                  <span className="text-gray-500 w-8 text-right font-medium">{category.count}</span>
                  <Progress value={category.percentage} className="w-24 h-2" />
                  <span className="text-sm font-semibold text-gray-600 w-12 text-right">
                    {category.percentage}%
                  </span>
                </div>) : <p className="text-sm text-gray-500">No category data available yet.</p>}
            </CardContent>
          </Card>
        </motion.section>

        {/* Recent Tweets */}
        <motion.section className="lg:col-span-2" initial={{
        opacity: 0,
        x: 20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.4,
        delay: 0.3
      }} aria-labelledby="recent-tweets-heading">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-600" />
                <span>Recent Tweets</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recentTweets.length > 0 ? recentTweets.map((tweet, index) => <motion.div 
                      key={tweet.id} 
                      className="border rounded-lg overflow-hidden hover:bg-gray-50/50 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="p-4 flex justify-center flex-grow">
                        <div className="w-full max-w-md tweet-container">
                          {tweet.tweetId ? (
                            <EmbeddedTweet id={tweet.tweetId} />
                          ) : (
                            <p className="text-sm text-gray-800">{tweet.content}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-auto flex flex-col items-start gap-2 px-4 py-2 border-t bg-gray-50 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          <span>Scraped: {tweet.date}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {tweet.categories.map(category => (
                            <Badge key={category} variant="secondary">{category}</Badge>
                          ))}
                          <Badge className={cn("text-xs font-semibold", getStatusColor(tweet.status))}>
                            {tweet.status}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>) : <p className="text-sm text-gray-500">No recent tweets found.</p>}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {/* Activity Summary */}
      <motion.section initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.4,
      delay: 0.5
    }} aria-labelledby="activity-heading">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <span>Weekly Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => <div key={day} className="text-center">
                  <div className="text-xs text-gray-500 mb-2">{day}</div>
                  <div className="bg-blue-100 rounded-lg mx-auto transition-all duration-200 hover:bg-blue-200" style={{
                height: `${Math.random() * 60 + 20}px`,
                width: '100%'
              }} />
                </div>)}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>This week: 89 tweets analyzed</span>
              <span className="flex items-center gap-1 text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                +12% from last week
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.section>
    </div>;
}