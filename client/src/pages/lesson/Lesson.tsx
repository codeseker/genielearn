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
import { useEffect, useState } from "react";
import LessonCompleteCelebration from "@/components/lesson-celebration";
import { useNavigate } from "react-router-dom";
import { generatePdf, downloadBlob } from "@/actions/pdf";
import { LessonStickyFooter } from "@/components/lesson-footer";
import { errorToast } from "@/utils/toaster";

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
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [lessonCompleted, setLessonCompleted] = useState<boolean>(false);
  const { mutateAsync: updateLesson } = useUpdateLesson();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  useEffect(() => {
    setLessonCompleted(lesson.isCompleted);
  }, [lesson]);

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
      <div className="mx-auto w-full max-w-5xl px-4 py-10 lg:px-8 animate-pulse">
        <div className="mb-10 space-y-5">
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="h-8 w-3/4 rounded bg-muted" />
          <div className="flex gap-6">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-32 rounded bg-muted" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="h-24 w-full rounded-lg bg-muted" />
          <div className="h-40 w-full rounded-lg bg-muted" />
          <div className="h-24 w-5/6 rounded-lg bg-muted" />
          <div className="h-56 w-full rounded-lg bg-muted" />
          <div className="h-28 w-2/3 rounded-lg bg-muted" />
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

  const handleGeneratePDF = async () => {
    if (!lessonData || !Array.isArray(lessonData.content)) {
      errorToast("No lesson content available to export.");
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const pdfSections: any[] = [];

      lessonData.content.forEach((block) => {
        if (block.type === "heading") {
          pdfSections.push({
            type: "heading",
            text: block.text,
            level: 2,
          });
        } else if (block.type === "paragraph") {
          pdfSections.push({
            type: "paragraph",
            text: block.text,
          });
        } else if (block.type === "code") {
          pdfSections.push({
            type: "code",
            language: block.language || "",
            code: block.text || "",
          });
        } else if (block.type === "mcq") {
          pdfSections.push({
            type: "heading",
            text: `Quiz Question: ${block.question}`,
            level: 3,
          });

          block.options.forEach((opt: string, idx: number) => {
            const optionLetter = String.fromCharCode(65 + idx);
            pdfSections.push({
              type: "paragraph",
              text: `${optionLetter}) ${opt}`,
            });
          });

          const correctLetter = String.fromCharCode(65 + block.answer);
          pdfSections.push({
            type: "paragraph",
            text: `Correct Answer: ${correctLetter} (${block.options[block.answer]})`,
          });

          if (block.explanation) {
            pdfSections.push({
              type: "paragraph",
              text: `Explanation: ${block.explanation}`,
            });
          }
        }
      });

      const filename = `${lesson.title.replace(/\s+/g, "_")}.pdf`;
      const blob = await generatePdf({
        title: lesson.title,
        sections: pdfSections,
      });

      downloadBlob(blob, filename);
    } catch (error: any) {
      errorToast("Failed to generate PDF.");
      console.error(error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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
            <CheckCircle2
              className={`h-4 w-4 ${lessonCompleted ? "text-green-600" : "text-muted-foreground"}`}
            />
            {lessonCompleted ? (
              <span className="text-green-600">Completed</span>
            ) : (
              <span className="text-muted-foreground">Not completed</span>
            )}
          </div>
        </div>
      </div>

      {/* Lesson Body */}
      <div className="space-y-7">
        <div id="lesson-pdf-content" className="sapce-y-7">
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
        </div>

        {/* Videos */}
        {lessonData?.ytVideos && lessonData?.ytVideos?.length > 0 && (
          <div className="grid gap-6 pt-4 sm:grid-cols-1 lg:grid-cols-2">
            {lessonData.ytVideos.map((video, i) => (
              <VideoBlock videoId={video} key={`vid-${i}`} />
            ))}
          </div>
        )}
      </div>

      <LessonStickyFooter
        onPrevLesson={handlePrevLesson}
        onNextLesson={handleNextLesson}
        onCompleteLesson={handleCompleteLesson}
        lessonCompleted={lessonCompleted}
        hasPrevLesson={
          lessonData?.navigation?.prevModuleSlug != null &&
          lessonData?.navigation?.previousLessonSlug != null
        }
        onGeneratePDF={handleGeneratePDF}
        hasNextLesson={
          lessonData?.navigation?.nextModuleSlug != null &&
          lessonData?.navigation?.nextLessonSlug != null
        }
        isGeneratingPdf={isGeneratingPdf}
      />
    </div>
  );
}
