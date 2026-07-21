import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePdf, downloadBlob, type PdfBlock } from "@/actions/pdf";

interface PdfExportButtonProps {
  title: string;
  sections: PdfBlock[];
  filename?: string;
  className?: string;
}

export function PdfExportButton({
  title,
  sections,
  filename = "document.pdf",
  className = "",
}: PdfExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const blob = await generatePdf({ title, sections });
      downloadBlob(blob, filename);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isLoading}
      className={`relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 ${
        isLoading
          ? "bg-slate-200 text-slate-500 dark:bg-slate-800"
          : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-indigo-500/20 active:scale-95"
      } ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-white" />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>Export as PDF</span>
        </>
      )}
    </Button>
  );
}

// Example usage container component so it can be viewed / rendered easily.
export function PdfExportExample() {
  const sampleSections: PdfBlock[] = [
    {
      type: "heading",
      text: "Getting Started with React and TypeScript",
      level: 1,
    },
    {
      type: "paragraph",
      text: "React and TypeScript are a powerful combination for building type-safe, maintainable web applications. TypeScript allows us to catch bugs early in development and provides amazing autocomplete support inside modern code editors like VS Code.",
    },
    {
      type: "heading",
      text: "Creating a Simple Component",
      level: 2,
    },
    {
      type: "paragraph",
      text: "Here is an example of a simple Counter component in React using TypeScript. We define an interface for the props (though it has none in this simple example) and use React's useState hook with type inference.",
    },
    {
      type: "code",
      language: "tsx",
      code: `import React, { useState } from 'react';

interface CounterProps {
  initialCount?: number;
}

export const Counter: React.FC<CounterProps> = ({ initialCount = 0 }) => {
  const [count, setCount] = useState<number>(initialCount);

  return (
    <div className="counter-container">
      <p>Current Count: {count}</p>
      <button onClick={() => setCount(prev => prev + 1)}>
        Increment
      </button>
    </div>
  );
};`,
    },
    {
      type: "heading",
      text: "Conclusion",
      level: 2,
    },
    {
      type: "paragraph",
      text: "As you can see, typing components makes it easier to understand what parameters a component expects and avoids runtime errors related to undefined props.",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-6 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm max-w-md mx-auto my-8">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          PDF Export Demo
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Click the button below to generate a beautiful, syntax-highlighted PDF
          document based on React and TypeScript content.
        </p>
      </div>
      <PdfExportButton
        title="React & TypeScript Tutorial"
        sections={sampleSections}
        filename="react_typescript_tutorial.pdf"
      />
    </div>
  );
}
