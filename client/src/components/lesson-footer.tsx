import { Button } from "@/components/ui/button";
import {
  CircleArrowRight,
  CircleArrowLeft,
  CircleCheck,
  FileDown,
} from "lucide-react";

interface LessonStickyFooterProps {
  onPrevLesson: () => void;
  onNextLesson: () => void;
  onCompleteLesson: (complete: boolean) => void;
  onGeneratePDF: () => void; 
  lessonCompleted: boolean;
  hasPrevLesson: boolean;
  hasNextLesson: boolean;
  isGeneratingPdf: boolean;
}

export function LessonStickyFooter({
  onPrevLesson,
  onNextLesson,
  onCompleteLesson,
  onGeneratePDF,
  lessonCompleted,
  hasPrevLesson,
  hasNextLesson,
  isGeneratingPdf,
}: LessonStickyFooterProps) {
  return (
    <div className="fixed bottom-2 z-10 pointer-events-none left-0 right-0 lg:left-64">
      <div className="mx-auto w-full max-w-5xl px-4 lg:px-8 pointer-events-auto">
        <div className="flex items-center justify-between rounded-xl border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur supports-backdrop-filter:bg-background/90">
          {/* LEFT SIDE CONTROLS */}
          <div className="flex items-center gap-4">
            {/* Previous */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onPrevLesson}
              disabled={!hasPrevLesson}
              className="h-10 w-10 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Lesson"
            >
              <CircleArrowLeft className="h-5 w-5" />
              <span className="sr-only">Previous</span>
            </Button>

            {/* Complete */}
            <div className="flex items-center gap-2">
              {lessonCompleted ? (
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => onCompleteLesson(!lessonCompleted)}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center text-green-600"
                    title="Completed"
                  >
                    <CircleCheck className="h-5 w-5" />
                    <span className="sr-only">Completed</span>
                  </div>
                  <span className="hidden lg:inline text-sm font-medium text-green-600">
                    Completed
                  </span>
                </div>
              ) : (
                <Button
                  onClick={() => onCompleteLesson(!lessonCompleted)}
                  variant="ghost"
                  size="sm"
                  className="h-10 px-3 text-muted-foreground hover:text-foreground hover:bg-transparent cursor-pointer"
                  title="Mark Complete"
                >
                  <CircleCheck className="h-5 w-5" />
                  <span className="hidden lg:inline ml-2 text-sm font-medium">
                    Mark Complete
                  </span>
                  <span className="sr-only">Mark Complete</span>
                </Button>
              )}
            </div>

            {/* Next */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onNextLesson}
              disabled={!hasNextLesson}
              className="h-10 w-10 text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next Lesson"
            >
              <CircleArrowRight className="h-5 w-5" />
              <span className="sr-only">Next</span>
            </Button>
          </div>

          {/* RIGHT SIDE — GENERATE PDF */}
          <Button
            onClick={onGeneratePDF}
            variant="secondary"
            size="sm"
            disabled={isGeneratingPdf}
            className="h-10 px-3 gap-2 cursor-pointer shadow-sm"
            title="Generate PDF"
          >
            {isGeneratingPdf ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="hidden sm:inline text-sm font-medium">
                  Generating...
                </span>
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium">
                  Generate PDF
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
