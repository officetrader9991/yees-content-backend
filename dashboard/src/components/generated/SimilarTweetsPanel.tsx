"use client";

import * as React from "react";
import { motion } from "framer-motion";

const EmbeddedTweet = ({ url }: { url: string }) => {
  const tweetId = url.split("/").pop()?.split("?")[0];
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Using createTweet is more reliable than load for dynamically added tweets.
    // It directly tells the widget what to create and where.
    if (tweetId && containerRef.current && window.twttr) {
      // Clear any previous embed to avoid duplicates if the url prop changes.
      containerRef.current.innerHTML = "";
      window.twttr.widgets.createTweet(
        tweetId,
        containerRef.current,
        { theme: 'light', conversation: 'none' }
      );
    }
  }, [tweetId]);

  if (!tweetId) return null;

  return <div ref={containerRef} />;
};


export interface SimilarTweetsPanelProps {
  urls: string[];
  title: string;
}

export default function SimilarTweetsPanel({ title, urls }: SimilarTweetsPanelProps) {
  if (urls.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <div className="space-y-6">
        {urls.map((url) => (
          <EmbeddedTweet key={url} url={url} />
        ))}
      </div>
    </motion.div>
  );
} 