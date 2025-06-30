"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Tweet } from 'react-tweet'
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Search, ChevronsUpDown, ExternalLink, User, Calendar, Heart, Repeat2, MessageCircle, Shuffle } from "lucide-react";

interface ArticleAnalysisResponse {
  keywords?: string[];
  // We keep this here for future use, but won't display it for now.
  suggested_tweets?: any[]; 
}

export interface ArticleInputPageProps {
  className?: string;
}

const TweetResultCard = ({ tweetData, isSelected, onSelectionChange }: { 
  tweetData: any; 
  isSelected: boolean; 
  onSelectionChange: (selected: boolean) => void; 
}) => {
    const tweetId = tweetData.tweet_url?.split('/').pop()?.split('?')[0];
    if (!tweetId) return null;
  
    const score = tweetData.worth_posting_score || 0;
    const scoreColor = score > 8 ? "text-green-500" : score > 6 ? "text-yellow-500" : "text-red-500";
    const categories = (typeof tweetData.category === 'string' && tweetData.category) 
      ? tweetData.category.split(',').map((c: string) => c.trim()).filter(Boolean) 
      : [];
  
    return (
      <div className={cn(
        "p-4 border rounded-lg mb-4 bg-white shadow-sm transition-all hover:shadow-md relative",
        isSelected && "border-orange-500 bg-orange-50 shadow-lg"
      )}>
        <div className="absolute top-2 right-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelectionChange}
            className="bg-white border-2"
          />
        </div>
        <div className="mb-4">
          <Tweet id={tweetId} />
        </div>
        <div className="space-y-4 pt-4 border-t">
          <div>
            <h5 className="text-sm font-semibold mb-2">Worth Posting Score</h5>
            <div className="flex items-center space-x-2">
              <span className={cn("text-2xl font-bold", scoreColor)}>{score.toFixed(1)}</span>
              <p className="text-xs text-gray-500">/ 10.0</p>
            </div>
          </div>
          {categories.length > 0 && (
            <div>
                <h5 className="text-sm font-semibold mb-2">Categories</h5>
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat: string, index: number) => (
                        <Badge key={index} variant="secondary">{cat}</Badge>
                    ))}
                </div>
            </div>
          )}
          {tweetData.tweet_summary && (
            <div>
                <h5 className="text-sm font-semibold mb-2">AI Summary</h5>
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-md">{tweetData.tweet_summary}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

export default function ArticleInputPage({ className }: ArticleInputPageProps) {
  const [articleText, setArticleText] = React.useState("");
  const [analyzedArticleText, setAnalyzedArticleText] = React.useState("");
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisResults, setAnalysisResults] = React.useState<ArticleAnalysisResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // State for keyword searching
  const [searchingKeyword, setSearchingKeyword] = React.useState<string | null>(null);
  const [keywordTweetResults, setKeywordTweetResults] = React.useState<Record<string, any[]>>({});

  // State for remix functionality
  const [selectedTweets, setSelectedTweets] = React.useState<Set<string>>(new Set());
  const [isRemixing, setIsRemixing] = React.useState(false);
  const [remixResult, setRemixResult] = React.useState<string | null>(null);
  const [showTweetTypeDialog, setShowTweetTypeDialog] = React.useState(false);

  const handleAnalyze = async () => {
    if (!articleText.trim()) {
      setError("Please enter an article idea to analyze");
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResults(null);
    setKeywordTweetResults({});
    setAnalyzedArticleText(articleText);

    try {
      const response = await fetch('https://growlark.app.n8n.cloud/webhook/d693f03a-2961-48e0-bde8-ce9c24687315', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article: articleText.trim() }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      let parsedKeywords: string[] = [];
      if (Array.isArray(data) && data.length > 0 && data[0]['output.keywords']) {
        parsedKeywords = data.map(item => item['output.keywords']).filter(Boolean);
      } else if (Array.isArray(data) && data.length > 0 && data[0]?.output?.keywords) {
        parsedKeywords = data[0].output.keywords;
      }
      setAnalysisResults({ keywords: parsedKeywords });
    } catch (error) {
      console.error("Error analyzing article:", error);
      setError("Failed to analyze article. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleKeywordSearch = async (keyword: string) => {
    setSearchingKeyword(keyword);
    setError(null);
    try {
      const response = await fetch('https://growlark.app.n8n.cloud/webhook/53d660f1-6a82-4d86-b8bc-3a0aff3ae3ee', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      // Normalize the response to always be an array
      const tweetsArray = Array.isArray(data) ? data : (data ? [data] : []);

      setKeywordTweetResults(prev => ({ ...prev, [keyword]: tweetsArray }));
    } catch (err) {
      setError(`Failed to fetch tweets for "${keyword}".`);
    } finally {
      setSearchingKeyword(null);
    }
  };

  const handleTweetSelection = (tweetData: any, selected: boolean) => {
    const tweetKey = `${tweetData.tweet_url}_${tweetData.tweet_summary?.substring(0, 50) || 'tweet'}`;
    setSelectedTweets(prev => {
      const newSet = new Set(prev);
      if (selected && newSet.size < 5) {
        newSet.add(tweetKey);
      } else if (!selected) {
        newSet.delete(tweetKey);
      }
      return newSet;
    });
  };

  const handleRemixClick = () => {
    if (selectedTweets.size === 0 || !articleText.trim()) return;
    setShowTweetTypeDialog(true);
  };

  const handleRemix = async (tweetType: 'short' | 'long') => {
    setShowTweetTypeDialog(false);
    setIsRemixing(true);
    setError(null);
    
    try {
      // Get the selected tweet objects
      const allTweets = Object.values(keywordTweetResults).flat();
      const selectedTweetObjects = allTweets.filter(tweet => {
        const tweetKey = `${tweet.tweet_url}_${tweet.tweet_summary?.substring(0, 50) || 'tweet'}`;
        return selectedTweets.has(tweetKey);
      });

      const response = await fetch('https://growlark.app.n8n.cloud/webhook/ac1b1006-9d5d-49bd-9904-566cd5092c95', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_tweet: articleText,
          related_tweets: selectedTweetObjects,
          tweet_type: tweetType
        }),
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      // Parse and format the remixed tweet result
      let formattedResult = '';
      
      // Handle long tweet (thread) response format - new simplified format
      if (Array.isArray(data) && data[0]?.tweet_content && data[0]?.tweet_number) {
        const tweets = data;
        const threadInfo = `Thread of ${tweets.length} tweets`;
        
        formattedResult = `${threadInfo}\n\n`;
        tweets.forEach((tweet: any) => {
          formattedResult += `TWEET_${tweet.tweet_number}\n${tweet.tweet_content}\n\n`;
        });
        formattedResult = formattedResult.trim();
      }
      // Handle long tweet (thread) response format - old nested format
      else if (Array.isArray(data) && data[0]?.output?.tweets) {
        const threadData = data[0].output;
        const tweets = threadData.tweets;
        const threadInfo = threadData.thread_info || `Thread of ${tweets.length} tweets`;
        
        formattedResult = `${threadInfo}\n\n`;
        tweets.forEach((tweet: any) => {
          formattedResult += `${tweet.tweet_number}\n${tweet.tweet_content}\n\n`;
        });
        formattedResult = formattedResult.trim();
      }
      // Handle short tweet response format
      else if (data.output) {
        formattedResult = data.output;
      } else if (data.remixed_tweet) {
        formattedResult = data.remixed_tweet;
      } else if (data.result) {
        formattedResult = data.result;
      } else {
        // Fallback to parsing any string that looks like it contains tweet content
        const stringData = JSON.stringify(data);
        const match = stringData.match(/"([^"]*Remixed Tweet[^"]*)/);
        formattedResult = match ? match[1].replace(/\\n/g, '\n') : stringData;
      }
      
      // Clean up the formatting for short tweets
      if (!Array.isArray(data) || (!data[0]?.tweet_content && !data[0]?.output?.tweets)) {
        formattedResult = formattedResult
          .replace(/\\n/g, '\n')  // Convert \n to actual line breaks
          .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove markdown bold formatting
          .replace(/^\{"output":"/, '')  // Remove JSON wrapper start
          .replace(/"\}$/, '')  // Remove JSON wrapper end
          .trim();
      }
      
      setRemixResult(formattedResult);
      
    } catch (err) {
      setError('Failed to remix tweets. Please try again.');
    } finally {
      setIsRemixing(false);
    }
  };

  const renderHighlightedText = (text: string, keywords: string[] = []) => {
    if (!keywords || keywords.length === 0) return text;
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    const regex = new RegExp(`(${sortedKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    return text.split(regex).filter(Boolean).map((part, index) => {
      const isKeyword = sortedKeywords.some(k => k.toLowerCase() === part.toLowerCase());
      if (isKeyword) {
        return (
          <Popover key={index}>
            <PopoverTrigger asChild>
              <mark className="bg-blue-100 text-black rounded-sm px-0.5 cursor-pointer hover:bg-blue-200 transition-colors">{part}</mark>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-auto p-1">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={searchingKeyword === part}
                onClick={() => handleKeywordSearch(part)}
              >
                {searchingKeyword === part ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Look for related tweets
              </Button>
            </PopoverContent>
          </Popover>
        );
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  const isAnalyzed = analysisResults !== null;
  const hasTweetResults = Object.keys(keywordTweetResults).length > 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const formatNumber = (num?: number) => {
      if (num === undefined) return "0";
      return num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num.toString();
  };

  return (
    <div className={cn("space-y-8 w-full", className)}>
      {/* Remix Result Section - Top of Page */}
      {remixResult && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Shuffle className="h-5 w-5" />
                Remixed Tweet Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded-md border max-h-96 overflow-y-auto">
                <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {remixResult.split('\n\n').map((section, index) => {
                    // Check if this section starts with TWEET_ (like "TWEET_1/4")
                    if (section.startsWith('TWEET_')) {
                      const lines = section.split('\n');
                      const tweetNumber = lines[0].replace('TWEET_', '');
                      const tweetContent = lines.slice(1).join('\n');
                      return (
                        <div key={index} className="mb-4">
                          <div className="font-semibold text-blue-600 mb-2 text-sm">
                            Tweet {tweetNumber}
                          </div>
                          <div className="p-3 bg-gray-50 rounded-md border-l-4 border-gray-300">
                            {tweetContent}
                          </div>
                        </div>
                      );
                    }
                    // Check if this is the thread info
                    else if (section.includes('Thread of')) {
                      return (
                        <div key={index} className="bg-blue-50 p-3 rounded-md mb-4 border-l-4 border-blue-400">
                          <div className="font-semibold text-blue-800">{section}</div>
                        </div>
                      );
                    }
                    // Regular content (for short tweets)
                    else {
                      return (
                        <div key={index} className="mb-4 p-3 bg-gray-50 rounded-md border-l-4 border-gray-300">
                          {section}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => setRemixResult(null)}
              >
                Clear Result
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Top Section: Input and Analysis Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel 1: Input */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Card className="w-full h-full">
              <CardHeader><CardTitle>Article Input</CardTitle></CardHeader>
              <CardContent className="flex flex-col h-full">
                  <Textarea placeholder="Write your article idea here..." value={articleText} onChange={e => setArticleText(e.target.value)} className="min-h-[300px] resize-none flex-grow" disabled={isAnalyzing} />
                  {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                  <Button onClick={handleAnalyze} disabled={isAnalyzing || !articleText.trim()} size="lg" className="w-full mt-4">
                      {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : "Analyze Article"}
                  </Button>
              </CardContent>
          </Card>
        </motion.div>

        {/* Panel 2: Analyzed Article */}
        {isAnalyzed && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Collapsible defaultOpen className="h-full">
                  <Card className="h-full">
                      <CardHeader>
                          <div className="flex justify-between items-center">
                              <CardTitle>Analyzed Article</CardTitle>
                              <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm" className="w-9 p-0">
                                      <ChevronsUpDown className="h-4 w-4" />
                                      <span className="sr-only">Toggle</span>
                                  </Button>
                              </CollapsibleTrigger>
                          </div>
                      </CardHeader>
                      <CollapsibleContent>
                          <CardContent>
                              <div className="min-h-[300px] w-full rounded-md border bg-gray-50 p-3 text-sm whitespace-pre-wrap leading-relaxed">
                                  {renderHighlightedText(analyzedArticleText, analysisResults.keywords)}
                              </div>
                          </CardContent>
                      </CollapsibleContent>
                  </Card>
              </Collapsible>
          </motion.div>
        )}
      </div>

      {/* Bottom Section: Related Tweets */}
      {hasTweetResults && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card>
                  <CardHeader>
                      <div className="flex items-center justify-between">
                          <div>
                              <CardTitle className="text-xl">Related Tweets</CardTitle>
                              <CardDescription className="text-sm">Tweets found for your selected keywords.</CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                              <p className="text-xs text-gray-600">
                                  Selected: {selectedTweets.size}/5 tweets
                              </p>
                              <Button
                                  onClick={handleRemixClick}
                                  disabled={selectedTweets.size === 0 || !articleText.trim() || isRemixing}
                                  size="sm"
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                              >
                                  {isRemixing ? (
                                      <>
                                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                          Remixing...
                                      </>
                                  ) : (
                                      <>
                                          <Shuffle className="mr-2 h-3 w-3" />
                                          Remix
                                      </>
                                  )}
                              </Button>
                          </div>
                      </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      {Object.entries(keywordTweetResults).map(([keyword, tweets]) => (
                          <div key={keyword}>
                              <h4 className="font-semibold mb-4 text-lg border-b pb-2">Results for "{keyword}"</h4>
                              {tweets.length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {tweets
                                        .sort((a, b) => (b.worth_posting_score || 0) - (a.worth_posting_score || 0))
                                        .map((tweet: any, index: number) => {
                                        const tweetKey = `${tweet.tweet_url}_${tweet.tweet_summary?.substring(0, 50) || 'tweet'}`;
                                        return (
                                          <TweetResultCard 
                                            key={index} 
                                            tweetData={tweet}
                                            isSelected={selectedTweets.has(tweetKey)}
                                            onSelectionChange={(selected) => handleTweetSelection(tweet, selected)}
                                          />
                                        );
                                      })}
                                  </div>
                              ) : <p className="text-sm text-gray-500">No tweets found for "{keyword}".</p>}
                          </div>
                      ))}

                  </CardContent>
              </Card>
          </motion.div>
      )}

      {/* Tweet Type Selection Dialog */}
      <AlertDialog open={showTweetTypeDialog} onOpenChange={setShowTweetTypeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Choose Tweet Type</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to create a short tweet or a long tweet thread?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleRemix('short')}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Short Tweet
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => handleRemix('long')}
              className="bg-green-500 hover:bg-green-600"
            >
              Long Tweet (Thread)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 