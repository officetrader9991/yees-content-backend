"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Calendar, Send, Edit, MoreHorizontal, MessageSquare, Hash, Clock, CheckCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
export interface ReadyToRepostTableProps {
  className?: string;
}
export default function ReadyToRepostTable({
  className
}: ReadyToRepostTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");

  // Mock data for ready-to-repost tweets
  const readyTweets = [{
    id: 1,
    originalTweet: "The future of AI in social media marketing is incredibly promising. New tools are emerging daily that help businesses connect with their audience more effectively.",
    cleanedText: "🚀 AI is revolutionizing social media marketing! New tools are helping businesses connect with audiences like never before. The future looks incredibly promising for marketers ready to embrace innovation. #AIMarketing #SocialMedia #Innovation",
    category: "Technology",
    scheduledDate: "2024-01-16T10:00:00",
    status: "scheduled"
  }, {
    id: 2,
    originalTweet: "Building a strong personal brand on Twitter requires consistency, authenticity, and providing real value to your followers every single day.",
    cleanedText: "💪 Building a strong personal brand on Twitter:\n\n✅ Consistency is key\n✅ Stay authentic\n✅ Provide real value daily\n\nYour followers will notice the difference! #PersonalBrand #TwitterTips #Authenticity",
    category: "Marketing",
    scheduledDate: "2024-01-16T14:30:00",
    status: "ready"
  }, {
    id: 3,
    originalTweet: "Machine learning models are becoming more accessible to businesses of all sizes. No-code ML platforms are democratizing artificial intelligence.",
    cleanedText: "🤖 Machine Learning is now accessible to ALL businesses!\n\nNo-code ML platforms are democratizing AI:\n• Small startups can compete with giants\n• Innovation is no longer limited by technical barriers\n• The future is inclusive! #MachineLearning #NoCode #AI",
    category: "AI & ML",
    scheduledDate: "2024-01-17T09:15:00",
    status: "scheduled"
  }, {
    id: 4,
    originalTweet: "The creator economy is reshaping how we think about work, income, and personal fulfillment. Traditional career paths are evolving rapidly.",
    cleanedText: "🎨 The Creator Economy is changing everything!\n\n📈 New ways to think about:\n• Work flexibility\n• Income streams\n• Personal fulfillment\n\nTraditional career paths are evolving. Are you ready? #CreatorEconomy #FutureOfWork #Entrepreneurship",
    category: "Business",
    scheduledDate: "2024-01-17T16:45:00",
    status: "ready"
  }, {
    id: 5,
    originalTweet: "Data visualization is an art form that bridges the gap between complex analytics and actionable business insights. Good charts tell stories.",
    cleanedText: "📊 Data visualization = Art + Science\n\nGreat charts don't just show data, they tell stories that drive action.\n\n🎯 Bridge the gap between:\n• Complex analytics\n• Actionable insights\n\nWhat story does your data tell? #DataViz #Analytics #Storytelling",
    category: "Technology",
    scheduledDate: "2024-01-18T11:20:00",
    status: "ready"
  }, {
    id: 6,
    originalTweet: "Sustainable business practices aren't just good for the planet - they're becoming essential for long-term profitability and customer loyalty.",
    cleanedText: "🌱 Sustainability = Smart Business\n\nIt's not just about saving the planet (though that's important!):\n\n✅ Long-term profitability\n✅ Customer loyalty\n✅ Future-proof operations\n\nGreen practices = Green profits 💚 #Sustainability #Business #ESG",
    category: "Business",
    scheduledDate: "2024-01-18T13:00:00",
    status: "scheduled"
  }, {
    id: 7,
    originalTweet: "The intersection of psychology and user experience design is where the magic happens. Understanding human behavior is key to great products.",
    cleanedText: "🧠 Psychology + UX Design = Magic ✨\n\nUnderstanding human behavior is the secret sauce for great products:\n\n🔍 How users think\n💭 What motivates them\n🎯 What frustrates them\n\nGreat design starts with empathy. #UXDesign #Psychology #ProductDesign",
    category: "Design",
    scheduledDate: "2024-01-19T10:30:00",
    status: "ready"
  }, {
    id: 8,
    originalTweet: "Remote work has fundamentally changed how we approach team collaboration and productivity. The tools we use today would have been science fiction 10 years ago.",
    cleanedText: "🏠 Remote work has changed EVERYTHING!\n\nThe tools we use daily would have been sci-fi 10 years ago:\n\n🚀 Virtual collaboration\n📱 Cloud-first workflows\n🤝 Global team connectivity\n\nThe future of work is here! #RemoteWork #Productivity #FutureOfWork",
    category: "Business",
    scheduledDate: "2024-01-19T15:15:00",
    status: "scheduled"
  }];
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-700 border-green-200";
      case "scheduled":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "posted":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };
  const getCategoryColor = (category: string) => {
    const colors = {
      "Technology": "bg-blue-50 text-blue-700 border-blue-200",
      "Marketing": "bg-green-50 text-green-700 border-green-200",
      "Business": "bg-purple-50 text-purple-700 border-purple-200",
      "AI & ML": "bg-pink-50 text-pink-700 border-pink-200",
      "Design": "bg-indigo-50 text-indigo-700 border-indigo-200"
    };
    return colors[category as keyof typeof colors] || "bg-gray-50 text-gray-700 border-gray-200";
  };
  const filteredTweets = readyTweets.filter(tweet => {
    const matchesSearch = tweet.cleanedText.toLowerCase().includes(searchTerm.toLowerCase()) || tweet.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tweet.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const categories = ["all", ...Array.from(new Set(readyTweets.map(tweet => tweet.category)))];
  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  };
  return <div className={cn("space-y-6", className)}>
      {/* Page Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Ready to Re-post</h1>
        <p className="text-gray-600">
          Cleaned and optimized tweets ready for scheduling and posting.
        </p>
      </header>

      {/* Controls */}
      <section className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search cleaned tweets..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {selectedCategory === "all" ? "All Categories" : selectedCategory}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {categories.map(category => <DropdownMenuItem key={category} onClick={() => setSelectedCategory(category)} className={selectedCategory === category ? "bg-blue-50" : ""}>
                  {category === "all" ? "All Categories" : category}
                </DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button className="gap-2">
          <Send className="h-4 w-4" />
          Bulk Schedule
        </Button>
      </section>

      {/* Results Summary */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <CheckCircle className="h-4 w-4" />
        <span>
          {filteredTweets.length} tweets ready to post
        </span>
      </div>

      {/* Table */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.4
    }}>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-900 w-[35%]">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Original Tweet
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        <span>Category</span>
                        {/* Elegant filter for categories */}
                        <span className="ml-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="px-2 py-1 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-blue-50 focus:ring-2 focus:ring-blue-200 focus:outline-none text-xs font-medium flex items-center gap-1" aria-label="Filter by category">
                                <Filter className="h-3 w-3 text-gray-500" />
                                <span className="hidden sm:inline text-gray-700">
                                  {selectedCategory === "all" ? "All" : selectedCategory}
                                </span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="min-w-[160px] max-h-72 overflow-y-auto rounded-xl shadow-lg border-0 p-2 bg-white">
                              {categories.map(category => <DropdownMenuItem key={category} onClick={() => setSelectedCategory(category)} className={cn("rounded-lg px-3 py-2 text-sm flex items-center gap-2 cursor-pointer transition-colors", selectedCategory === category ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-gray-50 text-gray-700")} aria-selected={selectedCategory === category}>
                                  {category === "all" ? <span className="inline-flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-gray-300" aria-hidden="true"></span>
                                      <span>All Categories</span>
                                    </span> : <span className="inline-flex items-center gap-2">
                                      <span className={cn("w-2 h-2 rounded-full", getCategoryColor(category))} aria-hidden="true"></span>
                                      <span>{category}</span>
                                    </span>}
                                </DropdownMenuItem>)}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </span>
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 w-[35%]">
                      <div className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Cleaned Text
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Scheduled Date
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTweets.map((tweet, index) => {
                  const scheduledDateTime = formatScheduledDate(tweet.scheduledDate);
                  return <motion.tr key={tweet.id} initial={{
                    opacity: 0,
                    y: 10
                  }} animate={{
                    opacity: 1,
                    y: 0
                  }} transition={{
                    duration: 0.2,
                    delay: index * 0.05
                  }} className="group hover:bg-gray-50 transition-colors">
                        <TableCell className="py-4">
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 max-w-md">
                            {tweet.originalTweet}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant="outline" className={cn("text-xs", getCategoryColor(tweet.category))}>
                            {tweet.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md">
                            <p className="text-gray-900 text-sm leading-relaxed line-clamp-4 whitespace-pre-line">
                              {tweet.cleanedText}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">
                              {scheduledDateTime.date}
                            </div>
                            <div className="text-sm text-gray-500">
                              {scheduledDateTime.time}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge variant="outline" className={cn("text-xs capitalize", getStatusColor(tweet.status))}>
                            {tweet.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit Text</DropdownMenuItem>
                              <DropdownMenuItem>Reschedule</DropdownMenuItem>
                              <DropdownMenuItem>Post Now</DropdownMenuItem>
                              <DropdownMenuItem>Preview</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                Remove from Queue
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>;
                })}
                </TableBody>
              </Table>
            </div>
            
            {filteredTweets.length === 0 && <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tweets found</h3>
                <p className="text-gray-500">
                  Try adjusting your search terms or category filter.
                </p>
              </div>}
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      {filteredTweets.length > 0 && <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing 1 to {filteredTweets.length} of {readyTweets.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-50 text-blue-600 border-blue-200">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>}
    </div>;
}