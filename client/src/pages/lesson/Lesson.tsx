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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
    const original = document.getElementById("lesson-pdf-content");
    if (!original) return;

    const isDarkMode = document.documentElement.classList.contains("dark");
    const bgColor = isDarkMode ? "#0b1220" : "#f8fafc";
    const textColor = isDarkMode ? "#e2e8f0" : "#0f172a";
    const borderColor = isDarkMode
      ? "rgba(226,232,240,0.18)"
      : "rgba(15,23,42,0.15)";

    setIsGeneratingPdf(true);

    await new Promise((r) => setTimeout(r, 50));

    const clone = original.cloneNode(true) as HTMLElement;

    clone.querySelectorAll("*").forEach((el) => {
      const element = el as HTMLElement;
      element.style.color = textColor;
      element.style.backgroundColor = "transparent";
      element.style.borderColor = borderColor;
      element.style.boxShadow = "none";
    });

    clone.style.backgroundColor = bgColor;
    clone.style.padding = "24px";
    clone.style.width = "794px";

    clone.style.position = "fixed";
    clone.style.left = "-9999px";
    clone.style.top = "0";

    document.body.appendChild(clone);

    try {
      const canvas = await html2canvas(clone, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: bgColor,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.9);

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let position = 0;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${lesson.title}.pdf`);
    } catch (error: any) {
      errorToast("Failed to generate PDF.");
      console.error(error);
    } finally {
      document.body.removeChild(clone);
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
