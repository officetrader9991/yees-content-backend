"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FileText, Tag, MessageSquare, GitBranch } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
export interface AIResponsePanelProps {
  categoryTags?: string[];
  summary?: string;
  tweetType?: "Long Thread" | "Standalone";
  isLoading?: boolean;
  hasData?: boolean;
}
export default function AIResponsePanel({
  categoryTags = [],
  summary = "",
  tweetType,
  isLoading = false,
  hasData = false
}: AIResponsePanelProps) {
  const showPlaceholder = !hasData && !isLoading;
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.4,
    delay: 0.2
  }} className="w-full max-w-2xl mx-auto">
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              AI Analysis
            </h3>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isLoading ? <div className="space-y-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16" />
                  <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20" />
                  <div className="h-6 bg-gray-200 rounded-full animate-pulse w-14" />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-28" />
              </div>
            </div> : showPlaceholder ? <div className="text-center py-12">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Analysis Yet
              </h4>
              <p className="text-gray-500 max-w-sm mx-auto">
                Submit a tweet URL above to see AI-powered analysis including category tags, summary, and tweet type.
              </p>
            </div> : <div className="space-y-6">
              {/* Category Tags */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Category Tags
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categoryTags.length > 0 ? categoryTags.map((tag, index) => <Badge key={index} variant="secondary" className={cn("px-3 py-1 text-sm font-medium rounded-full border", index % 3 === 0 && "bg-blue-50 text-blue-700 border-blue-200", index % 3 === 1 && "bg-green-50 text-green-700 border-green-200", index % 3 === 2 && "bg-purple-50 text-purple-700 border-purple-200")}>
                        #{tag}
                      </Badge>) : <span className="text-gray-400 italic">No tags available</span>}
                </div>
              </div>

              <Separator />

              {/* Summary */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Summary
                  </h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  {summary ? <p className="text-gray-700 leading-relaxed">
                      {summary}
                    </p> : <p className="text-gray-400 italic">
                      No summary available
                    </p>}
                </div>
              </div>

              <Separator />

              {/* Tweet Type */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Tweet Type
                  </h4>
                </div>
                <div>
                  {tweetType ? <Badge variant="outline" className={cn("px-4 py-2 text-sm font-medium rounded-full border-2", tweetType === "Long Thread" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-indigo-50 text-indigo-700 border-indigo-200")}>
                      {tweetType}
                    </Badge> : <span className="text-gray-400 italic">No type classification available</span>}
                </div>
              </div>
            </div>}
        </CardContent>
      </Card>
    </motion.div>;
}