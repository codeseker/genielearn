"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function Lesson({ content }: { content: string }) {
  return (
    <div className="w-full flex justify-center px-4 md:px-6 py-6">
      <Card className="max-w-4xl w-full shadow-md border dark:border-gray-700">
        <CardContent className="prose prose-neutral dark:prose-invert lg:prose-lg pt-6">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-4xl font-bold mt-6 mb-4 text-blue-500">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold mt-6 mb-3 text-blue-400">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold mt-5 mb-2 text-blue-300">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="my-3 text-[17px] leading-[1.7]">{children}</p>
              ),
              li: ({ children }) => <li className="my-1">{children}</li>,

              pre: ({ children }) => (
                <pre className="bg-[#0d1117] text-sm rounded-lg p-4 my-4 overflow-x-auto border border-gray-700 shadow-sm !scrollbar-thin">
                  {children}
                </pre>
              ),
              code: ({ className, children }) => (
                <code
                  className={`${className} rounded px-1.5 py-0.5 bg-gray-800 text-pink-400`}
                >
                  {children}
                </code>
              ),

              blockquote: ({ children }) => (
                <blockquote className="border-l-4 pl-4 py-1 italic my-4 bg-gray-50 dark:bg-gray-900 rounded-sm text-gray-700 dark:text-gray-300">
                  {children}
                </blockquote>
              ),

              table: ({ children }) => (
                <div className="overflow-x-auto my-4 border rounded-md dark:border-gray-700">
                  <table className="w-full border-collapse table-auto">
                    {children}
                  </table>
                </div>
              ),

              th: ({ children }) => (
                <th className="border px-3 py-2 font-semibold bg-gray-200 dark:bg-gray-800">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border px-3 py-2 dark:border-gray-700">
                  {children}
                </td>
              ),

              details: ({ children }) => (
                <details className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 my-5 shadow-sm">
                  {children}
                </details>
              ),

              summary: ({ children }) => (
                <summary className="font-semibold text-blue-500 mb-2 cursor-pointer">
                  {children}
                </summary>
              ),

              // Support for Markdown Alerts (like > ⚠️ text)
            //   alert: ({ children }) => (
            //     <Alert className="my-4">
            //       <AlertTitle>Note</AlertTitle>
            //       <AlertDescription>{children}</AlertDescription>
            //     </Alert>
            //   ),
            }}
          >
            {content}
          </ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
}
