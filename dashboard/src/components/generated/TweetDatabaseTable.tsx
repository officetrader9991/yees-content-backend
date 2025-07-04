"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, MessageSquare, Loader2, ExternalLink, Heart, Eye, Trash2, FileText, Clapperboard, Mic, Star } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase, Tweet } from "@/lib/supabase";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TweetEditor } from "../TweetEditor";
import { Label } from "@/components/ui/label";

const AddTweetForm = ({ onTweetAdded }: { onTweetAdded: () => void }) => {
  const [url, setUrl] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError("Please enter a tweet URL.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('https://growlark.app.n8n.cloud/webhook/5f875500-1dcc-452e-a424-e63bcf20e05b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        setSuccess("Tweet submitted for analysis! It will appear in the table shortly after processing.");
        setUrl("");
        // Refresh the table after a delay to allow for processing
        setTimeout(onTweetAdded, 5000);
      } else {
        const body = await response.text();
        setError(`Failed to submit tweet. Server responded with: ${body || response.statusText}`);
      }
    } catch (err) {
      setError("An error occurred while submitting the tweet. See the console for details.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-grow w-full">
            <Label htmlFor="tweet-url" className="sr-only">Tweet URL</Label>
            <Input
              id="tweet-url"
              placeholder="Enter Tweet URL to add and analyze..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add New Tweet"}
          </Button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
      </CardContent>
    </Card>
  );
};

export interface TweetDatabaseTableProps {
  className?: string;
}

export default function TweetDatabaseTable({
  className
}: TweetDatabaseTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [allCategories, setAllCategories] = React.useState<string[]>([]);
  const [tweets, setTweets] = React.useState<Tweet[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [editingTweetId, setEditingTweetId] = React.useState<string | null>(null);

  // Fetch tweets from Supabase
  React.useEffect(() => {
    const initializeData = async () => {
      await fetchTweets();
      await fetchAllCategories();
    };
    initializeData();
  }, []);

  const fetchAllCategories = async () => {
    try {
      const { data, error } = await supabase.from('tweets').select('category');

      if (error) {
        console.error('Error fetching all categories:', error);
        return;
      }

      // The category can be a string or an array of strings. We need to handle both.
      const categorySet = new Set<string>();
      data.forEach(item => {
        if (Array.isArray(item.category)) {
          item.category.forEach(cat => cat && categorySet.add(cat));
        } else if (typeof item.category === 'string') {
          item.category && categorySet.add(item.category);
        }
      });

      setAllCategories(Array.from(categorySet).sort());
    } catch (err) {
      console.error('Error processing categories:', err);
    }
  };

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

      console.log("Fetched tweets data:", data);
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

  const audienceDisplay: { [key: string]: string } = {
    'Designers': 'Designers 🎨',
    'Developers': 'Developers 🧑‍💻',
    'Marketers & Creators': 'Marketers & Creators 🦭',
  };

  const difficultyDisplay: { [key: string]: string } = {
    'Beginner': 'Beginner 🔰',
    'Amateur': 'Amateur 🤓',
    'Expert': 'Expert 🦹',
  };

  const discoveryCategoryDisplay: { [key: string]: string } = {
    'Al News & Analysis': 'Al News & Analysis 📰',
    'Tool Spotlights': 'Tool Spotlights 🌟',
    'Prompt & Tricks Gallery': 'Prompt & Tricks Gallery 💬',
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

      <AddTweetForm onTweetAdded={fetchTweets} />

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
                      <TableHead className="w-16 font-semibold text-gray-900">Splendid</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[120px]">Good</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[120px]">Author</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[350px]">Tweet Text</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[100px]">Score</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[250px]">Summary</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[200px]">Comment</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[150px]">Tools Mentioned</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[200px]">Discovery Category 🔍</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[150px]">Category</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[150px]">Target Audience</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[150px]">Difficulty</TableHead>
                      <TableHead className="w-32 font-semibold text-gray-900 text-center">Engagement</TableHead>
                      <TableHead className="font-semibold text-gray-900 min-w-[100px]">Tweet URL</TableHead>
                      <TableHead className="font-semibold text-gray-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTweets.map((tweet) => (
                      <React.Fragment key={tweet.id}>
                        <TableRow>
                          <TableCell>
                            <Checkbox
                              checked={selectedRows.includes(tweet.id)}
                              onCheckedChange={(checked) => handleRowSelect(tweet.id, !!checked)}
                            />
                          </TableCell>
                          <TableCell>{tweet.scraped_at ? new Date(tweet.scraped_at).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>
                            {tweet.splendid_tweet && (
                              <Star className="h-5 w-5 text-red-500 fill-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {tweet.good_tweet && (
                              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-gray-800">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <a
                                    href={`https://twitter.com/${tweet.author_username}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                  >
                                    {tweet.author_username}
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View Profile</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
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
                          <TableCell className="max-w-[200px] whitespace-normal">{tweet.user_comment || ''}</TableCell>
                          <TableCell>
                            {chunk(tweet.tools_mentioned, 3).map((toolChunk, index) => (
                              <div key={index} className="flex flex-wrap gap-1 mb-1 last:mb-0">
                                {toolChunk.map(tool => (
                                  <Badge key={tool} variant="secondary">{tool}</Badge>
                                ))}
                              </div>
                            ))}
                          </TableCell>
                          <TableCell>
                            {tweet.discovery_category && (
                              <span>{discoveryCategoryDisplay[tweet.discovery_category] || tweet.discovery_category}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(tweet.category)
                                ? chunk(tweet.category, 2).map((categoryChunk, idx) => (
                                    <div key={idx} className="flex flex-wrap gap-1">
                                      {categoryChunk.map((cat, index) => (
                                        <Badge key={index} variant="secondary" className="font-normal">
                                          {formatCategoryName(cat)}
                                        </Badge>
                                      ))}
                                    </div>
                                  ))
                                : tweet.category && (
                                    <Badge variant="secondary" className="font-normal">
                                      {formatCategoryName(tweet.category)}
                                    </Badge>
                                  )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {tweet.target_audience?.map(audience => (
                                <span key={audience}>{audienceDisplay[audience] || audience}</span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {tweet.difficulty && (
                              <span>{difficultyDisplay[tweet.difficulty] || tweet.difficulty}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center items-center gap-3 text-sm">
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4 text-red-500" />
                                <span className="font-medium">{tweet.favourite_count?.toLocaleString() || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4 text-purple-500" />
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
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingTweetId(editingTweetId === tweet.id ? null : tweet.id)}
                            >
                              {editingTweetId === tweet.id ? 'Cancel' : 'Edit'}
                            </Button>
                          </TableCell>
                        </TableRow>
                        {editingTweetId === tweet.id && (
                          <TableRow>
                            <TableCell colSpan={16}>
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <TweetEditor
                                  tweet={tweet}
                                  allCategories={allCategories}
                                  onUpdate={() => {
                                    setEditingTweetId(null);
                                    fetchTweets();
                                    fetchAllCategories();
                                  }}
                                  onCancel={() => setEditingTweetId(null)}
                                />
                              </motion.div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
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