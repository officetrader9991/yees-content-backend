import React, { useState } from 'react';
import { updateTweet } from '../lib/tweet-service';
import type { Tweet } from '../lib/supabase';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ChevronsUpDown, X } from 'lucide-react';

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

export const TweetEditor: React.FC<TweetEditorProps> = ({ tweet, allCategories, onUpdate, onCancel }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for all editable fields
  const [firstTweetText, setFirstTweetText] = useState(tweet.first_tweet_text || '');
  const [worthPostingScore, setWorthPostingScore] = useState(tweet.worth_posting_score || 0);
  const [userComment, setUserComment] = useState(tweet.user_comment || '');
  const [splendidTweet, setSplendidTweet] = useState(tweet.splendid_tweet || false);
  const [categories, setCategories] = useState<string[]>(normalizeToArray(tweet.category));
  const [targetAudience, setTargetAudience] = useState<string[]>(normalizeToArray(tweet.target_audience));
  const [difficulty, setDifficulty] = useState(tweet.difficulty || '');
  const [discoveryCategory, setDiscoveryCategory] = useState(tweet.discovery_category || '');

  // State for the category combobox
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    const updates: Partial<Tweet> = {
      first_tweet_text: firstTweetText,
      worth_posting_score: Number(worthPostingScore),
      user_comment: userComment,
      splendid_tweet: splendidTweet,
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
  };

  const handleCategoryAdd = (newCategory: string) => {
    const sanitizedCategory = newCategory.replace(/ /g, '_');
    if (sanitizedCategory && !categories.includes(sanitizedCategory)) {
      setCategories(prev => [...prev, sanitizedCategory]);
    }
    setOpen(false);
  };

  const handleCategoryRemove = (categoryToRemove: string) => {
    setCategories(prev => prev.filter(c => c !== categoryToRemove));
  };


  return (
    <Card className="bg-gray-50 border-2 border-blue-200 shadow-lg -m-2">
      <CardContent className="p-6 space-y-6">
        {error && <p className="text-red-500 text-sm my-1 p-3 bg-red-100 rounded-md">{error}</p>}
        
        {/* Main Tweet Text */}
        <div>
          <Label htmlFor="first_tweet_text">Tweet Text</Label>
          <Textarea id="first_tweet_text" value={firstTweetText} onChange={(e) => setFirstTweetText(e.target.value)} className="w-full p-2 border rounded mt-1" rows={4} disabled={isSaving}/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Score & Comment */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="worth_posting_score">Score</Label>
              <Input id="worth_posting_score" type="number" value={worthPostingScore} onChange={e => setWorthPostingScore(Number(e.target.value))} className="mt-1" disabled={isSaving}/>
            </div>
            <div>
              <Label htmlFor="user_comment">Your Comment</Label>
              <Textarea id="user_comment" value={userComment} onChange={e => setUserComment(e.target.value)} className="mt-1" rows={3} disabled={isSaving}/>
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
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCategoryRemove(cat)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between mt-2">
                    Add category...
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search or add category..."
                      onKeyDown={(e) => {
                          if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              const value = (e.target as HTMLInputElement).value;
                              if (value) {
                                  handleCategoryAdd(value);
                                  (e.target as HTMLInputElement).value = '';
                              }
                          }
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>No results. Press Enter to add.</CommandEmpty>
                      <CommandGroup>
                        {allCategories.filter(c => !categories.includes(c)).map((cat) => (
                          <CommandItem key={cat} onSelect={() => handleCategoryAdd(cat)}>
                            {cat}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                        if (checked) { setTargetAudience(prev => [...prev, audience]); } 
                        else { setTargetAudience(prev => prev.filter(a => a !== audience)); }
                      }}
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
                <SelectTrigger id="difficulty" className="mt-1"><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="discovery_category">Discovery Category</Label>
              <Select value={discoveryCategory} onValueChange={setDiscoveryCategory} disabled={isSaving}>
                <SelectTrigger id="discovery_category" className="mt-1"><SelectValue placeholder="Select discovery category" /></SelectTrigger>
                <SelectContent>
                  {discoveryCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <Checkbox id="splendid_tweet" checked={splendidTweet} onCheckedChange={checked => setSplendidTweet(!!checked)} />
              <Label htmlFor="splendid_tweet">Splendid Tweet? ✨</Label>
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