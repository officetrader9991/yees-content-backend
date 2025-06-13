"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Chrome } from "lucide-react";
import { motion } from "framer-motion";
export interface SignInCardProps {
  onSignIn?: (email: string, password: string) => void;
  onGoogleSignIn?: () => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
  className?: string;
}
export default function SignInCard({
  onSignIn,
  onGoogleSignIn,
  onForgotPassword,
  onSignUp,
  className
}: SignInCardProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    try {
      await onSignIn?.(email, password);
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await onGoogleSignIn?.();
    } finally {
      setIsLoading(false);
    }
  };
  return <div className={cn("flex min-h-screen items-center justify-center p-4", className)}>
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5,
      ease: "easeOut"
    }} className="w-full max-w-md">
        <Card className="border-0 shadow-2xl shadow-black/5 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-6 pb-8 pt-12 px-8">
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Sign In
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed">
                Welcome back! Please sign in to your account.
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email address
                </Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required className="h-12 text-base border-border/50 focus:border-primary transition-colors" disabled={isLoading} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required className="h-12 text-base pr-12 border-border/50 focus:border-primary transition-colors" disabled={isLoading} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)} disabled={isLoading} aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <a href="#" onClick={e => {
                e.preventDefault();
                onForgotPassword?.();
              }} className="text-sm text-primary hover:text-primary/80 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-sm">
                  Forgot password?
                </a>
              </div>

              <Button type="submit" className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 transition-colors" disabled={isLoading || !email || !password}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-8 mb-6">
              <div className="relative">
                <Separator className="bg-border/50" />
                <div className="absolute inset-0 flex justify-center">
                  <span className="bg-white px-4 text-sm text-muted-foreground font-medium">
                    or
                  </span>
                </div>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full h-12 text-base font-medium border-border/50 hover:bg-accent/50 transition-colors" onClick={handleGoogleSignIn} disabled={isLoading}>
              <Chrome className="mr-3 h-5 w-5" />
              Sign in with Google
            </Button>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <a href="#" onClick={e => {
                e.preventDefault();
                onSignUp?.();
              }} className="text-primary hover:text-primary/80 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-sm">
                  Sign up
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>;
}