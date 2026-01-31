import React, { useEffect, useState } from "react";
import { Sparkles, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useCreateCourse from "@/hooks/courses/useCreateCourse";

const loadingMessages = [
  "Designing your course structure...",
  "Organizing modules for better learning flow...",
  "Crafting lessons and key outcomes...",
  "Aligning difficulty and pacing...",
  "Almost there, polishing the curriculum...",
];

export function CourseGenerator() {
  const [courseName, setCourseName] = useState("");
  const [showSlowState, setShowSlowState] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const { mutate, isPending } = useCreateCourse();

  const handleGenerate = () => {
    if (!courseName.trim()) return;

    setShowSlowState(false);
    setLoadingMessageIndex(0);

    const slowTimer = setTimeout(() => {
      setShowSlowState(true);
    }, 5000);

    mutate(courseName, {
      onSuccess: () => {
        setCourseName("");
        clearTimeout(slowTimer);
        setShowSlowState(false);
      },
      onError: () => {
        clearTimeout(slowTimer);
        setShowSlowState(false);
        setCourseName("");
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  useEffect(() => {
    if (!showSlowState) return;

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [showSlowState]);

  return (
    <div className="flex w-full max-w-2xl flex-col space-y-8 lg:space-y-6">
      <div className="w-full max-w-2xl space-y-10">
        {/* Header */}
        <div className="space-y-5 text-center lg:space-y-4">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4 shadow-sm">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Create a New Course
          </h1>

          <p className="mx-auto max-w-md text-lg leading-relaxed text-muted-foreground">
            Enter a course title and we’ll generate a structured curriculum with
            lessons, modules, and learning flow.
          </p>
        </div>

        {/* Generator Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Course Generator</CardTitle>
            <CardDescription>
              Start by entering the name of the course you want to create
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Input
                placeholder="e.g., Introduction to Machine Learning"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isPending}
              />

              <Button
                onClick={handleGenerate}
                disabled={!courseName.trim() || isPending}
                className="gap-2"
              >
                {isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Generate Course
                  </>
                )}
              </Button>
            </div>

            {isPending && showSlowState && (
              <div className="mt-6 space-y-5">
                <div className="relative h-6 overflow-hidden text-center">
                  <div
                    key={loadingMessageIndex}
                    className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground animate-message"
                  >
                    {loadingMessages[loadingMessageIndex]}
                  </div>
                </div>

                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/60 to-transparent animate-shimmer" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <div className="grid gap-4 sm:grid-cols-3 lg:gap-3">
          {[
            {
              title: "Be Specific",
              description:
                "Detailed course names produce a more structured syllabus",
            },
            {
              title: "Include Level",
              description:
                "Add ‘Beginner’ or ‘Advanced’ to tailor the difficulty",
            },
            {
              title: "Stay Focused",
              description:
                "One core topic leads to clearer modules and learning flow",
            },
          ].map((tip) => (
            <Card
              key={tip.title}
              className="border-border bg-card/60 shadow-xs backdrop-blur-sm"
            >
              <CardContent className="pt-6">
                <h3 className="font-medium text-foreground">{tip.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {tip.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
