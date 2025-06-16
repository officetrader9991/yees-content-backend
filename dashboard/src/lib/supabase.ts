import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or key not defined in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Define the Tweet interface based on your Supabase table structure
export interface Tweet {
  id: string
  content?: string
  author?: string
  date?: string
  categories?: string[]
  status?: string
  url?: string
  
  // Actual Supabase columns
  tweet_id?: string
  author_username?: string
  first_tweet_text?: string
  reply_text?: string
  tweet_url?: string
  scraped_at?: string
  tweet_created_at?: string
  is_thread?: boolean
  category?: string
  tweet_summary?: string
  worth_posting_score?: number
  worth_posting_comment?: string
  tools_mentioned?: string[]
  
  // Engagement metrics
  favourite_count?: number
  retweet_count?: number
  reply_count?: number
  views?: number
  bookmark_count?: number
  author_follower_count?: number
  
  // Media
  first_tweet_media_url?: string[]
  first_tweet_video_url?: string
  first_tweet_media_ocr?: string
  reply_media_url?: string
  reply_media_ocr?: string
  
  // Transformed fields for UI
  engagement?: {
    likes: number
    retweets: number
    replies: number
    views: number
    bookmarks: number
  }
  author_followers?: number
  user_comment?: string
  splendid_tweet?: boolean
  target_audience?: string[]
  difficulty?: string
  discovery_category?: string
} 