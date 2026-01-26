import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type McqBlockProps = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export default function McqBlock({
  question,
  options,
  answer,
  explanation,
}: McqBlockProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const hasAnswered = selected !== null;

  return (
    <div className="my-6 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
      {/* Question */}
      <h4 className="mb-5 text-base font-semibold leading-snug text-foreground">
        {question}
      </h4>

      {/* Options */}
      <div className="space-y-2.5">
        {options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === answer;
          const isWrong = isSelected && !isCorrect;

          return (
            <button
              key={idx}
              disabled={hasAnswered}
              onClick={() => setSelected(idx)}
              className={`
    group w-full flex items-center justify-between gap-3
    rounded-md border px-4 py-3 text-left text-sm
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background

    ${
      !hasAnswered
        ? "border-border bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent"
        : "cursor-default"
    }

    ${
      hasAnswered && isCorrect
        ? "border-primary bg-primary/10 text-primary"
        : ""
    }

    ${
      hasAnswered && isWrong
        ? "border-destructive bg-destructive/10 text-destructive"
        : ""
    }

    ${hasAnswered && !isCorrect && !isWrong ? "opacity-60" : ""}
  `}
            >
              <span className="flex-1">{opt}</span>

              {hasAnswered && isCorrect && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              )}

              {hasAnswered && isWrong && (
                <XCircle className="h-4 w-4 shrink-0 text-destructive" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {hasAnswered && (
        <div className="mt-5 rounded-md border border-border bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">
          {explanation}
        </div>
      )}
    </div>
  );
}
