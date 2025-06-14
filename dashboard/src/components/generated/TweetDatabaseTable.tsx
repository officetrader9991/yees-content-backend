"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, MessageSquare, Loader2, ExternalLink, Heart, Eye, Trash2, FileText, Clapperboard, Mic } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase, Tweet } from "@/lib/supabase";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface TweetDatabaseTableProps {
  className?: string;
}

export default function TweetDatabaseTable({
  className
}: TweetDatabaseTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [tweets, setTweets] = React.useState<Tweet[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);

  // Fetch tweets from Supabase
  React.useEffect(() => {
    fetchTweets();
  }, []);

  const fetchTweets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('tweets')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(50); // Reasonable limit

      if (error) {
        console.error('Error fetching tweets:', error);
        setError('Failed to load tweets. Please try again.');
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

  const handleRemoveSelected = async () => {
    if (selectedRows.length === 0) return;

    try {
      const { error } = await supabase
        .from('tweets')
        .delete()
        .in('id', selectedRows);

      if (error) {
        console.error("Error deleting tweets:", error);
        // You might want to show a notification to the user here
      } else {
        // Refresh data and clear selection
        fetchTweets();
        setSelectedRows([]);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const chunk = <T,>(arr: T[] = [], size: number): T[][] =>
    Array.from({ length: Math.ceil((arr || []).length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );

  const formatCommentForTooltip = (comment: string | null | undefined) => {
    if (!comment) return "No comment available.";
    const words = comment.split(' ');
    const lines = [];
    for (let i = 0; i < words.length; i += 10) {
      lines.push(words.slice(i, i + 10).join(' '));
    }
    return lines.map((line, index) => <div key={index}>{line}</div>);
  };

  // Function to convert snake_case to Title Case
  const formatCategoryName = (category: string) => {
    if (typeof category !== 'string') {
      return 'Invalid Category';
    }
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const filteredTweets = tweets.filter(tweet => {
    const content = tweet.first_tweet_text || '';
    const author = tweet.author_username || '';
    const matchesSearch = content.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         author.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Adjust category matching to handle arrays
    const tweetCategories = Array.isArray(tweet.category) ? tweet.category : [tweet.category];
    const matchesCategory = selectedCategory === "all" || (tweet.category && tweetCategories.includes(selectedCategory));

    return matchesSearch && matchesCategory;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredTweets.map(t => t.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, id]);
    } else {
      setSelectedRows(prev => prev.filter(rowId => rowId != id));
    }
  };

  // Get unique categories for filter, handling arrays
  const categories = ["all", ...Array.from(new Set(
    tweets.flatMap(tweet => tweet.category || []).filter(Boolean)
  ))];

  // Loading state
  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Tweet Database</h1>
          <p className="text-gray-600">Manage and explore all analyzed tweets in your database.</p>
        </header>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-gray-600">Loading tweets...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("space-y-6", className)}>
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Tweet Database</h1>
          <p className="text-gray-600">Manage and explore all analyzed tweets in your database.</p>
        </header>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg max-w-md">
              <p className="text-red-600">{error}</p>
            </div>
            <Button onClick={fetchTweets} variant="outline">Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Page Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Tweet Database</h1>
        <p className="text-gray-600">Manage and explore all analyzed tweets in your database.</p>
      </header>

      {selectedRows.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg">
          <span className="text-sm font-semibold">{selectedRows.length} selected</span>
          <Button variant="destructive" size="sm" className="gap-2" onClick={handleRemoveSelected}>
            <Trash2 className="h-4 w-4" /> Remove
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => console.log("Create SEO Articles for:", selectedRows)}>
            <FileText className="h-4 w-4" /> Create SEO Articles
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => console.log("Create Threads Post for:", selectedRows)}>
            <Clapperboard className="h-4 w-4" /> Create Threads Post
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => console.log("Create Voiceover for:", selectedRows)}>
            <Mic className="h-4 w-4" /> Create Voiceover
          </Button>
        </div>
      )}

      {/* Controls */}
      <section className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search tweets or authors..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pl-10" 
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {selectedCategory === "all" ? "All Categories" : formatCategoryName(selectedCategory)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {categories.map(category => (
                <DropdownMenuItem 
                  key={category} 
                  onClick={() => setSelectedCategory(category || 'all')} 
                  className={selectedCategory === category ? "bg-blue-50" : ""}
                >
                  {category === "all" ? "All Categories" : formatCategoryName(category || '')}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex gap-2">
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" onClick={fetchTweets} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </section>

      {/* Results Summary */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <MessageSquare className="h-4 w-4" />
        <span>Showing {filteredTweets.length} of {tweets.length} tweets</span>
      </div>

      {/* Simplified Table - Only 8 Essential Columns */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
      >
        <TooltipProvider>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[50px]">
                        <Checkbox 
                          checked={selectedRows.length > 0 && selectedRows.length === filteredTweets.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[120px]">Scraped Date</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[350px]">Tweet Text</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[100px]">Score</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[250px]">Summary</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[150px]">Tools Mentioned</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[120px]">Author</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[150px]">Category</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[120px]">Likes/Views</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[100px]">Tweet URL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTweets.map((tweet) => (
                      <TableRow key={tweet.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.includes(tweet.id)}
                            onCheckedChange={(checked) => handleRowSelect(tweet.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell>{tweet.scraped_at ? new Date(tweet.scraped_at).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell className="max-w-[350px] whitespace-normal">{tweet.first_tweet_text}</TableCell>
                        <TableCell>
                          {tweet.worth_posting_score != null ? (
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge 
                                  variant={tweet.worth_posting_score > 8 ? "default" : "secondary"}
                                  className={cn(
                                    {'bg-green-600 text-white': tweet.worth_posting_score > 8},
                                    {'rainbow-glow-animation': tweet.worth_posting_score > 9}
                                  )}
                                >
                                  {tweet.worth_posting_score}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                {formatCommentForTooltip(tweet.worth_posting_comment)}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell className="max-w-[250px] whitespace-normal">{tweet.tweet_summary || 'N/A'}</TableCell>
                        <TableCell>
                          {chunk(tweet.tools_mentioned, 3).map((toolChunk, index) => (
                            <div key={index} className="flex flex-wrap gap-1 mb-1 last:mb-0">
                              {toolChunk.map(tool => (
                                <Badge key={tool} variant="secondary">{tool}</Badge>
                              ))}
                            </div>
                          ))}
                        </TableCell>
                        <TableCell>{tweet.author_username}</TableCell>
                        <TableCell>
                          {Array.isArray(tweet.category) ? (
                            chunk(tweet.category, 3).map((catChunk, index) => (
                              <div key={index} className="flex flex-wrap gap-1 mb-1 last:mb-0">
                                {catChunk.map(cat => (
                                  <Badge key={cat} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-sm">
                                    {formatCategoryName(cat)}
                                  </Badge>
                                ))}
                              </div>
                            ))
                          ) : (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-sm">
                              {formatCategoryName(tweet.category || '')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Heart className="h-3 w-3 text-red-500" />
                              <span className="font-medium">{tweet.favourite_count?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Eye className="h-3 w-3 text-purple-500" />
                              <span className="font-medium">{tweet.views?.toLocaleString() || 0}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {tweet.tweet_url ? (
                            <Button variant="outline" size="sm" asChild className="h-8 text-xs">
                              <a href={tweet.tweet_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Tweet
                              </a>
                            </Button>
                          ) : (
                            <span className="text-gray-400 italic text-xs">No URL</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {filteredTweets.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tweets found</h3>
                  <p className="text-gray-500">Try adjusting your search terms or category filter.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TooltipProvider>
      </motion.div>

      {/* Pagination */}
      {filteredTweets.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing 1 to {filteredTweets.length} of {tweets.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="bg-blue-50 text-blue-600 border-blue-200">1</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}