"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, MessageSquare, Users, BarChart3, Calendar, Hash, Clock, ArrowUpRight } from "lucide-react";
export interface DashboardHomePageProps {
  className?: string;
}
export default function DashboardHomePage({
  className
}: DashboardHomePageProps) {
  // Mock data for dashboard stats
  const stats = [{
    title: "Total Tweets",
    value: "2,847",
    change: "+12.5%",
    trend: "up",
    icon: MessageSquare,
    color: "blue"
  }, {
    title: "Active Categories",
    value: "24",
    change: "+3",
    trend: "up",
    icon: Hash,
    color: "green"
  }, {
    title: "Ready to Post",
    value: "156",
    change: "+8.2%",
    trend: "up",
    icon: TrendingUp,
    color: "purple"
  }, {
    title: "This Week",
    value: "89",
    change: "-2.1%",
    trend: "down",
    icon: Calendar,
    color: "orange"
  }];

  // Mock data for category breakdown
  const categories = [{
    name: "Technology",
    count: 847,
    percentage: 30,
    color: "bg-blue-500"
  }, {
    name: "Marketing",
    count: 623,
    percentage: 22,
    color: "bg-green-500"
  }, {
    name: "Business",
    count: 512,
    percentage: 18,
    color: "bg-purple-500"
  }, {
    name: "Social Media",
    count: 398,
    percentage: 14,
    color: "bg-orange-500"
  }, {
    name: "AI & ML",
    count: 284,
    percentage: 10,
    color: "bg-pink-500"
  }, {
    name: "Other",
    count: 183,
    percentage: 6,
    color: "bg-gray-500"
  }];

  // Mock data for recent tweets
  const recentTweets = [{
    id: 1,
    content: "The future of AI in social media marketing is incredibly promising. New tools are emerging daily...",
    author: "@techguru",
    category: "Technology",
    date: "2 hours ago",
    status: "analyzed"
  }, {
    id: 2,
    content: "Building a strong personal brand on Twitter requires consistency, authenticity, and value...",
    author: "@marketingpro",
    category: "Marketing",
    date: "4 hours ago",
    status: "ready"
  }, {
    id: 3,
    content: "Remote work has fundamentally changed how we approach team collaboration and productivity...",
    author: "@businessleader",
    category: "Business",
    date: "6 hours ago",
    status: "analyzed"
  }, {
    id: 4,
    content: "The latest updates to social media algorithms favor authentic engagement over vanity metrics...",
    author: "@socialmedia",
    category: "Social Media",
    date: "8 hours ago",
    status: "processing"
  }, {
    id: 5,
    content: "Machine learning models are becoming more accessible to businesses of all sizes...",
    author: "@aiexpert",
    category: "AI & ML",
    date: "12 hours ago",
    status: "ready"
  }];
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
  return <div className={cn("space-y-8", className)}>
      {/* Page Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your tweet analysis.
        </p>
      </header>

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
                      <ArrowUpRight className={cn("h-4 w-4 mr-1", stat.trend === "up" ? "text-green-600" : "text-red-600 rotate-180")} />
                      <span className={cn("font-medium", stat.trend === "up" ? "text-green-600" : "text-red-600")}>
                        {stat.change}
                      </span>
                      <span className="text-gray-500 ml-1">from last month</span>
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
            <CardContent className="space-y-4">
              {categories.map((category, index) => <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <span className="text-gray-500">{category.count}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={category.percentage} className="flex-1 h-2" />
                    <span className="text-sm font-medium text-gray-600 min-w-[3rem]">
                      {category.percentage}%
                    </span>
                  </div>
                </div>)}
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
              <div className="space-y-4">
                {recentTweets.map((tweet, index) => <motion.article key={tweet.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0" initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.2,
                delay: 0.4 + index * 0.1
              }}>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-gray-900 leading-relaxed flex-1 line-clamp-2">
                          {tweet.content}
                        </p>
                        <Badge variant="outline" className={cn("text-xs", getStatusColor(tweet.status))}>
                          {tweet.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="font-medium">{tweet.author}</span>
                          <Badge variant="secondary" className="text-xs">
                            {tweet.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{tweet.date}</span>
                        </div>
                      </div>
                    </div>
                  </motion.article>)}
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