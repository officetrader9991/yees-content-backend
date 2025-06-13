"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface TweetInputCardProps {
  value?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (url: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function TweetInputCard({
  value = "",
  onValueChange,
  onSubmit,
  isLoading = false,
  disabled = false
}: TweetInputCardProps) {
  const [inputValue, setInputValue] = React.useState(value);
  const [submissionState, setSubmissionState] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onValueChange?.(newValue);
    // Reset submission state when user starts typing again
    if (submissionState !== 'idle') {
      setSubmissionState('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && submissionState !== 'loading' && !disabled) {
      // Split by line, trim, filter out empty
      const urls = inputValue.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      if (urls.length === 0) return;

      setSubmissionState('loading');
      setErrorMessage('');

      try {
        const response = await fetch('https://growlark.app.n8n.cloud/webhook/5f875500-1dcc-452e-a424-e63bcf20e05b', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tweetUrls: urls,
            timestamp: new Date().toISOString()
          }),
          mode: 'no-cors' // This will help with CORS issues
        });

        // With no-cors mode, we can't check response.ok, so we assume success if no error was thrown
        setSubmissionState('success');
        // Clear the input after successful submission
        setInputValue('');
        onValueChange?.('');
        // Call the original onSubmit callback if provided
        onSubmit?.(urls.length === 1 ? urls[0] : urls.join('\n'));
        
        // Reset success state after 3 seconds
        setTimeout(() => {
          setSubmissionState('idle');
        }, 3000);

      } catch (error) {
        console.error('Error submitting tweet URLs:', error);
        setSubmissionState('error');
        
        // More specific error handling
        if (error instanceof TypeError && error.message.includes('fetch')) {
          setErrorMessage('Network error - please check your connection and try again.');
        } else if (error instanceof Error && error.message.includes('CORS')) {
          setErrorMessage('CORS error - the request was sent but we cannot confirm delivery due to browser security.');
        } else {
          setErrorMessage(error instanceof Error ? error.message : 'Failed to submit tweet URLs. Please try again.');
        }
      }
    }
  };

  const isSubmitting = submissionState === 'loading' || isLoading;

  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.4,
    delay: 0.1
  }} className="w-full max-w-2xl mx-auto">
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
                Tweet URLs
              </Label>
              <Textarea 
                id="tweet-url" 
                value={inputValue} 
                onChange={handleInputChange} 
                placeholder={"Paste one or more tweet URLs, one per line\nhttps://twitter.com/username/status/123...\nhttps://twitter.com/username/status/456..."} 
                disabled={disabled || isSubmitting} 
                className={cn(
                  "min-h-[90px] max-h-60 text-lg px-4 py-4 border-2 border-gray-200 rounded-xl resize-none bg-white",
                  "focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                  "hover:border-gray-300 transition-all duration-200",
                  "placeholder:text-gray-400",
                  (disabled || isSubmitting) && "opacity-50 cursor-not-allowed",
                  submissionState === 'success' && "border-green-300 bg-green-50",
                  submissionState === 'error' && "border-red-300 bg-red-50"
                )} 
                aria-describedby="tweet-url-description" 
                spellCheck={false} 
                autoCorrect="off" 
                autoCapitalize="off" 
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!inputValue.trim() || isSubmitting || disabled} 
                className={cn(
                  "px-8 py-3 h-12 font-medium rounded-xl",
                  "focus:ring-2 focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-all duration-200 shadow-md hover:shadow-lg",
                  "flex items-center gap-2",
                  submissionState === 'success' && "bg-green-600 hover:bg-green-700 focus:ring-green-500",
                  submissionState === 'error' && "bg-red-600 hover:bg-red-700 focus:ring-red-500",
                  submissionState === 'idle' && "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
                  submissionState === 'loading' && "bg-blue-600 text-white"
                )}
              >
                {submissionState === 'loading' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : submissionState === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Success!</span>
                  </>
                ) : submissionState === 'error' ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Try Again</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit {inputValue.split('\n').filter(l => l.trim()).length > 1 ? `(${inputValue.split('\n').filter(l => l.trim()).length})` : ''}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
          
          {submissionState === 'error' && errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </p>
            </div>
          )}
          
          {submissionState === 'success' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Tweet URLs successfully sent for processing!
              </p>
            </div>
          )}
          
          <p id="tweet-url-description" className="text-sm text-gray-500 leading-relaxed">
            Enter one or more tweet URLs, one per line. Each will be sent to our AI workflow for analysis and categorization.
          </p>
        </CardContent>
      </Card>
    </motion.div>;
}