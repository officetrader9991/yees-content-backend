"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Send, CheckCircle, AlertCircle, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Confetti from "react-confetti";

declare global {
  interface Window {
    twttr: any;
  }
}

export interface TweetInputCardProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (url: string, comment: string, categories: string[], isSplendid: boolean, isGood: boolean) => void;
  isLoading?: boolean;
  disabled?: boolean;
  onValidUrl?: (url: string) => void;
  allCategories?: string[];
  onNewCategory?: (category: string) => void;
}

export default function TweetInputCard({
  value = "",
  onValueChange,
  onSubmit,
  isLoading = false,
  disabled = false,
  onValidUrl,
  allCategories = [],
  onNewCategory,
}: TweetInputCardProps) {
  const [inputValue, setInputValue] = React.useState(value);
  const [comment, setComment] = React.useState("");
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [isSplendid, setIsSplendid] = React.useState(false);
  const [isGood, setIsGood] = React.useState(false);
  const [showConfetti, setShowConfetti] = React.useState(false);
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState("");
  const [newCategoryError, setNewCategoryError] = React.useState("");
  const [submissionState, setSubmissionState] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [tweetId, setTweetId] = React.useState<string | null>(null);
  const tweetPreviewRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const validateTweetUrl = (url: string) => {
    const twitterUrlRegex = /^https:\/\/(twitter|x)\.com\/[a-zA-Z0-9_]+\/status\/(\d+)/;
    return twitterUrlRegex.test(url);
  };

  const extractTweetId = (url: string) => {
    const match = url.match(/^https:\/\/(twitter|x)\.com\/[a-zA-Z0-9_]+\/status\/(\d+)/);
    return match ? match[2] : null;
  };

  React.useEffect(() => {
    if (tweetId && tweetPreviewRef.current) {
      tweetPreviewRef.current.innerHTML = "";
      window.twttr.widgets.createTweet(tweetId, tweetPreviewRef.current, {
        theme: "light",
        align: "center",
      });
    }
  }, [tweetId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onValueChange?.(newValue);

    if (validateTweetUrl(newValue)) {
      setTweetId(extractTweetId(newValue));
      setErrorMessage("");
      onValidUrl?.(newValue);
    } else {
      setTweetId(null);
      if (newValue.trim() !== "") {
        setErrorMessage("Please enter a valid Tweet URL.");
      } else {
        setErrorMessage("");
      }
    }

    if (submissionState !== "idle") {
      setSubmissionState("idle");
    }
  };

  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/\s/.test(value)) {
      setNewCategoryError("Spaces are not allowed.");
    } else {
      setNewCategoryError("");
    }
    setNewCategory(value.replace(/\s/g, ""));
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim() && !allCategories.includes(newCategory.trim())) {
      onNewCategory?.(newCategory.trim());
      setSelectedCategories((prev) => [...prev, newCategory.trim()]);
    }
    setNewCategory("");
    setIsAddingCategory(false);
    setNewCategoryError("");
  };

  const handleGoodClick = () => {
    setIsGood(!isGood);
  };

  const handleSplendidClick = () => {
    const newIsSplendid = !isSplendid;
    setIsSplendid(newIsSplendid);
    if (newIsSplendid) {
      setShowConfetti(true);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((c) => c !== category)
        : [...prevCategories, category]
    );
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const firstLine = pastedText.split("\n")[0];
    document.execCommand("insertText", false, firstLine);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && submissionState !== "loading" && !disabled) {
      if (!validateTweetUrl(inputValue)) {
        setErrorMessage("Please enter a valid Tweet URL.");
        setSubmissionState("error");
        return;
      }

      setSubmissionState("loading");
      setErrorMessage("");

      try {
        onSubmit?.(inputValue, comment, selectedCategories, isSplendid, isGood);
        setSubmissionState("success");

        setTimeout(() => {
          setSubmissionState("idle");
        }, 3000);
      } catch (error) {
        console.error("Error submitting tweet URL:", error);
        setSubmissionState("error");
        setErrorMessage("Failed to submit tweet URL. Please try again.");
      }
    }
  };

  const isSubmitting = submissionState === "loading" || isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Paste Tweet URL
          </h3>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="tweet-url" className="text-sm font-medium text-gray-700 sr-only">
                Tweet URL
              </Label>
              <Input
                id="tweet-url"
                value={inputValue}
                onChange={handleInputChange}
                onPaste={handlePaste}
                placeholder={"https://twitter.com/username/status/123..."}
                disabled={disabled || isSubmitting}
                className={cn(
                  "h-12 text-lg px-4 py-4 border-2 border-gray-200 rounded-xl bg-white",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                  "hover:border-gray-300 transition-all duration-200",
                  "placeholder:text-gray-400",
                  (disabled || isSubmitting) && "opacity-50 cursor-not-allowed",
                  submissionState === "success" && "border-green-300 bg-green-50",
                  submissionState === "error" && "border-red-300 bg-red-50"
                )}
                aria-describedby="tweet-url-description"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="comment" className="text-sm font-medium text-gray-700">
                Your comment
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your comment here..."
                disabled={disabled || isSubmitting}
                className="min-h-[100px] text-base"
              />
            </div>

            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  type="button"
                  onClick={handleSplendidClick}
                  className={cn(
                    "flex items-center gap-2 transition-all duration-300",
                    isSplendid ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  disabled={disabled || isSubmitting}
                >
                  <Star className={cn("w-5 h-5 transition-all duration-300", isSplendid ? "text-white" : "text-red-500")} />
                  <span>Splendid</span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  type="button"
                  onClick={handleGoodClick}
                  className={cn(
                    "flex items-center gap-2 transition-all duration-300",
                    isGood ? "bg-yellow-400 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  disabled={disabled || isSubmitting}
                >
                  <Star className={cn("w-5 h-5 transition-all duration-300", isGood ? "text-white" : "text-yellow-400")} />
                  <span>Good</span>
                </Button>
              </motion.div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Category
              </Label>
              <div className="flex flex-wrap gap-2 items-center">
                {allCategories.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={selectedCategories.includes(category) ? "default" : "outline"}
                    onClick={() => handleCategoryChange(category)}
                    disabled={disabled || isSubmitting}
                  >
                    {category}
                  </Button>
                ))}
                {isAddingCategory ? (
                  <div className="relative">
                    <Input
                      type="text"
                      value={newCategory}
                      onChange={handleNewCategoryChange}
                      onBlur={handleAddNewCategory}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddNewCategory();
                        if (e.key === 'Escape') {
                          setIsAddingCategory(false);
                          setNewCategory('');
                          setNewCategoryError('');
                        }
                      }}
                      placeholder="New Category"
                      className="h-9"
                      autoFocus
                    />
                    {newCategoryError && (
                      <p className="absolute text-xs text-red-500 -bottom-5 left-0">
                        {newCategoryError}
                      </p>
                    )}
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAddingCategory(true)}
                    disabled={disabled || isSubmitting}
                  >
                    + Add New
                  </Button>
                )}
              </div>
            </div>
            
            <div className="pt-4 flex flex-col items-center gap-4">
              <Button
                type="submit"
                disabled={disabled || isSubmitting || !inputValue.trim()}
                className={cn(
                  "w-full h-14 text-lg font-bold rounded-xl text-white transition-all duration-300 ease-in-out",
                  "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
                  "shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
                  (disabled || isSubmitting || !inputValue.trim()) && "opacity-60 cursor-not-allowed shadow-none transform-none"
                )}
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{
                      width: 24,
                      height: 24,
                      border: "4px solid rgba(255, 255, 255, 0.3)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    <span>Submit Tweet</span>
                  </div>
                )}
              </Button>
              {submissionState === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center text-green-600"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <p>Tweet submitted successfully!</p>
                </motion.div>
              )}
              {submissionState === "error" && errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center text-red-600"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <p>{errorMessage}</p>
                </motion.div>
              )}
            </div>
          </form>

          {tweetId && (
            <div className="mt-6">
              <div ref={tweetPreviewRef} />
            </div>
          )}
        </CardContent>
      </Card>

      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={400}
          gravity={0.15}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}
    </motion.div>
  );
}