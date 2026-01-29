import { BookOpen, Clock, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Lesson, Module } from "@/types/common";
import useFetchLesson from "@/hooks/lessons/useFetchLesson";
import VideoBlock from "@/components/blocks/VideoBlock";
import CodeBlock from "@/components/blocks/CodeBlock";
import HeadingBlock from "@/components/blocks/HeadingBlock";
import ParagraphBlock from "@/components/blocks/ParagraphBlock";
import McqBlock from "@/components/blocks/McqBlock";
import useUpdateLesson from "@/hooks/lessons/useUpdateLesson";
import { useState } from "react";
import LessonCompleteCelebration from "@/components/lesson-celebration";
import { useNavigate } from "react-router-dom";

interface LessonContentProps {
  lesson: Lesson;
  module: Module;
  courseTitle: string;
  courseSlug: string;
}

export function LessonContent({
  lesson,
  module,
  courseTitle,
  courseSlug,
}: LessonContentProps) {
  const navigate = useNavigate();
  const { lessonData, isLoading, isError, error } = useFetchLesson();
  const [showCelebration, setShowCelebration] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(lesson.isCompleted);

  const { mutateAsync: updateLesson } = useUpdateLesson();

  const handleCompleteLesson = async (complete: boolean) => {
    if (complete) {
      setShowCelebration(true);
    }
    const result = await updateLesson(complete);
    if (!result || !result.success) {
      return;
    }

    setLessonCompleted(!lessonCompleted);
  };

  const handleNextLesson = () => {
    if (
      !lessonData?.navigation.nextModuleSlug ||
      !lessonData?.navigation.nextLessonSlug
    ) {
      return;
    }
    navigate(
      `/course/${courseSlug}/module/${lessonData?.navigation.nextModuleSlug}/lesson/${lessonData?.navigation.nextLessonSlug}`,
    );
  };

  const handlePrevLesson = () => {
    if (
      !lessonData?.navigation.prevModuleSlug ||
      !lessonData?.navigation.previousLessonSlug
    ) {
      return;
    }
    navigate(
      `/course/${courseSlug}/module/${lessonData?.navigation.prevModuleSlug}/lesson/${lessonData?.navigation.previousLessonSlug}`,
    );
  };

  if (showCelebration) {
    return (
      <LessonCompleteCelebration
        open={showCelebration}
        onDone={() => setShowCelebration(false)}
      />
    );
  }
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading lesson…</p>
        </div>
      </div>
    );
  }

  if (isError && error) {
    return (
      <div className="py-20 text-center">
        <p className="text-xs text-destructive">
          Failed to load lesson content.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 lg:px-8">
      {/* Header */}
      <div className="mb-10 space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>{courseTitle}</span>
          <span className="text-border">/</span>
          <span>{module.title}</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {lesson.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>15 min read</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {lessonCompleted ? (
              <span className="text-destructive">Completed</span>
            ) : (
              <span className="text-accent-foreground">Not completed</span>
            )}
          </div>
        </div>
      </div>

      {/* Lesson Body */}
      <div className="space-y-7">
        {Array.isArray(lessonData?.content) &&
          lessonData.content.map((block, i) => {
            switch (block.type) {
              case "code":
                return (
                  <CodeBlock
                    key={`code-${i}`}
                    language={block.language}
                    code={block.text}
                  />
                );

              case "paragraph":
                return <ParagraphBlock key={`p-${i}`} text={block.text} />;

              case "mcq":
                return (
                  <McqBlock
                    key={`mcq-${i}`}
                    answer={block.answer}
                    explanation={block.explanation}
                    options={block.options}
                    question={block.question}
                  />
                );

              case "heading":
                return (
                  <HeadingBlock key={`h-${i}`} level={2} text={block.text} />
                );

              default:
                return null;
            }
          })}

        {/* Videos */}
        {lessonData?.ytVideos && lessonData?.ytVideos?.length > 0 && (
          <div className="grid gap-6 pt-4 sm:grid-cols-1 lg:grid-cols-2">
            {lessonData.ytVideos.map((video, i) => (
              <VideoBlock videoId={video} key={`vid-${i}`} />
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        {lessonData?.navigation?.prevModuleSlug != null &&
          lessonData?.navigation?.previousLessonSlug != null && (
            <Button
              variant="default"
              className="cursor-pointer"
              onClick={handlePrevLesson}
            >
              Previous Lesson
            </Button>
          )}

        <Button
          variant="default"
          className="cursor-pointer"
          onClick={() => handleCompleteLesson(!lessonCompleted)}
        >
          {lessonCompleted ? "Mark as Incomplete" : "Mark as Complete"}
        </Button>

        {lessonData?.navigation?.nextModuleSlug != null &&
          lessonData?.navigation?.nextLessonSlug != null && (
            <Button
              variant="default"
              disabled={
                lessonData?.navigation?.nextLessonSlug === null &&
                lessonData?.navigation?.nextModuleSlug === null
              }
              className="cursor-pointer"
              onClick={handleNextLesson}
            >
              Next Lesson
            </Button>
          )}
      </div>
    </div>
  );
}
