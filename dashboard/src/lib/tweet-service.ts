import { supabase } from "./supabase";
import type { Tweet } from "./supabase";

export const updateTweet = async (tweetId: string, updates: Partial<Tweet>) => {
  const { data, error } = await supabase
    .from('tweets')
    .update(updates)
    .eq('id', tweetId)
    .select()
    .single();

  if (error) {
    console.error('Error updating tweet:', error);
    throw error;
  }

  return data;
}; 