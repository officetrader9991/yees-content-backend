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
  onSubmit?: (url: string, comment: string, categories: string[], isSplendid: boolean) => void;
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
        onSubmit?.(inputValue, comment, selectedCategories, isSplendid);
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
                      onBlur={() => {
                        setIsAddingCategory(false);
                        setNewCategory("");
                        setNewCategoryError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewCategory();
                        }
                      }}
                      placeholder="New Category"
                      className="h-9"
                      autoFocus
                    />
                    {newCategoryError && <p className="text-red-500 text-xs mt-1">{newCategoryError}</p>}
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsAddingCategory(true)}
                    disabled={disabled || isSubmitting}
                    className="w-9 h-9"
                  >
                    +
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Label</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSplendidClick}
                  disabled={disabled || isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Star className={cn("w-5 h-5 text-red-500", isSplendid && "fill-red-500")} />
                  <span>Splendid</span>
                </Button>
              </div>
            </div>

            <div ref={tweetPreviewRef} className="mt-4" />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!inputValue.trim() || isSubmitting || disabled || !validateTweetUrl(inputValue)}
                className={cn(
                  "px-8 py-3 h-12 font-medium rounded-xl",
                  "focus:ring-2 focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all duration-200 shadow-md hover:shadow-lg",
                  "flex items-center gap-2",
                  submissionState === "success" && "bg-green-600 hover:bg-green-700 focus:ring-green-500",
                  submissionState === "error" && "bg-red-600 hover:bg-red-700 focus:ring-red-500",
                  submissionState === "idle" && "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
                  submissionState === "loading" && "bg-blue-600 text-white"
                )}
              >
                {submissionState === "loading" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : submissionState === "success" ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Success!</span>
                  </>
                ) : submissionState === "error" ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Try Again</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </p>
            </div>
          )}

          {submissionState === "success" && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Tweet URL successfully sent for processing!
              </p>
            </div>
          )}

          <p id="tweet-url-description" className="text-sm text-gray-500 leading-relaxed">
            Enter a single tweet URL to be sent to our AI workflow for analysis and categorization.
          </p>
        </CardContent>
      </Card>
      {showConfetti && (
        <Confetti
          recycle={false}
          numberOfPieces={200}
          onConfettiComplete={() => setShowConfetti(false)}
          drawShape={(ctx: CanvasRenderingContext2D) => {
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
              ctx.lineTo(
                Math.cos(((18 + i * 72) * Math.PI) / 180) * 10,
                -Math.sin(((18 + i * 72) * Math.PI) / 180) * 10
              );
              ctx.lineTo(
                Math.cos(((54 + i * 72) * Math.PI) / 180) * 4,
                -Math.sin(((54 + i * 72) * Math.PI) / 180) * 4
              );
            }
            ctx.closePath();
            ctx.fillStyle = "red";
            ctx.fill();
          }}
        />
      )}
    </motion.div>
  );
}