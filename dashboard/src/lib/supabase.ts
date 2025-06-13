import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ixybqrqewlncbnmrjngo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4eWJxcnFld2xuY2JubXJqbmdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTYyNTQwMywiZXhwIjoyMDY1MjAxNDAzfQ.24YAk9KGUWzIAZTyujDYrLvL7pR7jjdS2b71FILnaQA'

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
} 