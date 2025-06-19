import React, { useState, useCallback, useMemo } from 'react';
import { updateTweet } from '../lib/tweet-service';
import type { Tweet } from '../lib/supabase';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ChevronsUpDown, X, Plus } from 'lucide-react';

interface TweetEditorProps {
  tweet: Tweet;
  allCategories: string[];
  onUpdate: () => void;
  onCancel: () => void;
}

// Data for select dropdowns
const difficultyLevels = ['Beginner', 'Amateur', 'Expert'];
const discoveryCategories = ['Al News & Analysis', 'Tool Spotlights', 'Prompt & Tricks Gallery'];
const targetAudiences = ['Designers', 'Developers', 'Marketers & Creators'];

const normalizeToArray = (field: string | string[] | null | undefined): string[] => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') return [field];
  return [];
};

export const TweetEditor: React.FC<TweetEditorProps> = ({ tweet, allCategories = [], onUpdate, onCancel }) => {
  // Safety check for tweet object
  if (!tweet || !tweet.id) {
    return (
      <Card className="bg-gray-50 border-2 border-red-200 shadow-lg -m-2">
        <CardContent className="p-6">
          <p className="text-red-500">Error: Invalid tweet data</p>
          <Button onClick={onCancel} variant="ghost">Close</Button>
        </CardContent>
      </Card>
    );
  }

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for all editable fields with safe defaults
  const [firstTweetText, setFirstTweetText] = useState(tweet.first_tweet_text || '');
  const [worthPostingScore, setWorthPostingScore] = useState(tweet.worth_posting_score || 0);
  const [userComment, setUserComment] = useState(tweet.user_comment || '');
  const [splendidTweet, setSplendidTweet] = useState(!!tweet.splendid_tweet);
  const [goodTweet, setGoodTweet] = useState(!!tweet.good_tweet);
  const [categories, setCategories] = useState<string[]>(normalizeToArray(tweet.category));
  const [targetAudience, setTargetAudience] = useState<string[]>(normalizeToArray(tweet.target_audience));
  const [difficulty, setDifficulty] = useState(tweet.difficulty || '');
  const [discoveryCategory, setDiscoveryCategory] = useState(tweet.discovery_category || '');

  // State for category input
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);

    const updates: Partial<Tweet> = {
      first_tweet_text: firstTweetText,
      worth_posting_score: Number(worthPostingScore),
      user_comment: userComment,
      splendid_tweet: splendidTweet,
      good_tweet: goodTweet,
      category: categories.join(', '),
      target_audience: targetAudience,
      difficulty: difficulty,
      discovery_category: discoveryCategory,
    };

    try {
      await updateTweet(tweet.id, updates);
      onUpdate();
    } catch (err) {
      setError('Failed to save. Ensure you have permissions and check the console.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [tweet.id, firstTweetText, worthPostingScore, userComment, splendidTweet, goodTweet, categories, targetAudience, difficulty, discoveryCategory, onUpdate]);

  const handleCategoryAdd = useCallback((newCategory: string) => {
    if (!newCategory) return;
    
    const sanitizedCategory = newCategory.trim().replace(/ /g, '_');
    if (sanitizedCategory && !categories.includes(sanitizedCategory)) {
      setCategories(prev => [...prev, sanitizedCategory]);
      setNewCategoryInput('');
    }
  }, [categories]);

  const handleCategoryRemove = useCallback((categoryToRemove: string) => {
    setCategories(prev => prev.filter(c => c !== categoryToRemove));
  }, []);

  const handleCategoryInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCategoryAdd(newCategoryInput);
    }
  }, [newCategoryInput, handleCategoryAdd]);

  const handleQuickCategoryAdd = useCallback((category: string) => {
    handleCategoryAdd(category);
  }, [handleCategoryAdd]);

  // Get suggested categories that aren't already selected
  const suggestedCategories = useMemo(() => {
    return (allCategories || []).filter(c => !categories.includes(c)).slice(0, 5);
  }, [allCategories, categories]);

  return (
    <Card className="bg-gray-50 border-2 border-blue-200 shadow-lg -m-2">
      <CardContent className="p-6 space-y-6">
        {error && <p className="text-red-500 text-sm my-1 p-3 bg-red-100 rounded-md">{error}</p>}
        
        {/* Main Tweet Text */}
        <div>
          <Label htmlFor="first_tweet_text">Tweet Text</Label>
          <Textarea 
            id="first_tweet_text" 
            value={firstTweetText} 
            onChange={(e) => setFirstTweetText(e.target.value)} 
            className="w-full p-2 border rounded mt-1" 
            rows={4} 
            disabled={isSaving}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Score & Comment */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="worth_posting_score">Score</Label>
              <Input 
                id="worth_posting_score" 
                type="number" 
                value={worthPostingScore} 
                onChange={e => setWorthPostingScore(Number(e.target.value))} 
                className="mt-1" 
                disabled={isSaving}
              />
            </div>
            <div>
              <Label htmlFor="user_comment">Your Comment</Label>
              <Textarea 
                id="user_comment" 
                value={userComment} 
                onChange={e => setUserComment(e.target.value)} 
                className="mt-1" 
                rows={3} 
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Categories & Audience */}
          <div className="space-y-6">
            <div>
              <Label>Categories</Label>
              <div className="space-y-2 mt-1">
                {categories.map(cat => (
                  <div key={cat} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                    <span className="text-sm">{cat}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => handleCategoryRemove(cat)}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {/* Add new category input */}
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add new category..."
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  onKeyDown={handleCategoryInputKeyDown}
                  disabled={isSaving}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleCategoryAdd(newCategoryInput)}
                  disabled={isSaving || !newCategoryInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick add buttons for existing categories */}
              {suggestedCategories.length > 0 && (
                <div className="mt-2">
                  <Label className="text-xs text-gray-600">Quick add:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {suggestedCategories.map(cat => (
                      <Button
                        key={cat}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickCategoryAdd(cat)}
                        disabled={isSaving}
                        className="text-xs h-6 px-2"
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <Label>Target Audience</Label>
              <div className="space-y-2 mt-2">
                {targetAudiences.map(audience => (
                  <div key={audience} className="flex items-center gap-2">
                    <Checkbox
                      id={`audience-${audience}`}
                      checked={targetAudience.includes(audience)}
                      onCheckedChange={(checked) => {
                        if (checked) { 
                          setTargetAudience(prev => [...prev, audience]); 
                        } else { 
                          setTargetAudience(prev => prev.filter(a => a !== audience)); 
                        }
                      }}
                      disabled={isSaving}
                    />
                    <Label htmlFor={`audience-${audience}`}>{audience}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Difficulty, Discovery & Splendid */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty} disabled={isSaving}>
                <SelectTrigger id="difficulty" className="mt-1">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="discovery_category">Discovery Category</Label>
              <Select value={discoveryCategory} onValueChange={setDiscoveryCategory} disabled={isSaving}>
                <SelectTrigger id="discovery_category" className="mt-1">
                  <SelectValue placeholder="Select discovery category" />
                </SelectTrigger>
                <SelectContent>
                  {discoveryCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <Checkbox 
                id="splendid_tweet" 
                checked={splendidTweet} 
                onCheckedChange={checked => setSplendidTweet(!!checked)}
                disabled={isSaving}
              />
              <Label htmlFor="splendid_tweet">Splendid Tweet? ✨</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="good_tweet" 
                checked={goodTweet} 
                onCheckedChange={checked => setGoodTweet(!!checked)}
                disabled={isSaving}
              />
              <Label htmlFor="good_tweet">Good Tweet? ⭐</Label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end pt-4">
          <Button onClick={onCancel} variant="ghost" disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 