import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

import { Card, CardContent } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useAsyncHandler } from "@/utils/async-handler";
import { generateLessonContent } from "@/actions/lesson";

export default function Lesson() {
  const user = useSelector((state: RootState) => state.user);
  const { courseId, modId, lessonId } = useParams();
  const [logged, setLogged] = useState(false);
  const [content, setContent] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);

  const asyncHandler = useAsyncHandler();
  const safeLessonContent = asyncHandler(generateLessonContent);

  const fetchLessonContent = async () => {
    if (!courseId || !modId || !lessonId || !user.user) return;

    setLoading(true);
    try {
      const res = await safeLessonContent(user.token as string, {
        courseId,
        moduleId: modId,
        lessonId,
      });

      console.log('DATA: ', res?.data);

      setContent(res?.data?.content);
    } catch (err) {
      console.error("Failed to fetch lesson content:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonContent();
  }, [user, courseId, modId, lessonId]);

  // Intersection Observer to detect 60% scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log("🔥 User reached 60% of lesson content!");
            setLogged(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.6 }
    );

    const cardContent = document.querySelector('.prose');
    if (cardContent) {
      (cardContent as any).style.position = 'relative';
      const marker = document.createElement('div');
      marker.style.position = 'absolute';
      marker.style.top = '60%';
      marker.style.left = '0';
      marker.style.width = '100%';
      marker.style.height = '1px';
      marker.style.pointerEvents = 'none';
      marker.style.opacity = '0';

      cardContent.appendChild(marker);
      observer.observe(marker);

      return () => {
        observer.disconnect();
        if (cardContent.contains(marker)) cardContent.removeChild(marker);
      };
    }
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center px-4 md:px-6 py-6">
        <Card className="max-w-4xl w-full shadow-md border dark:border-gray-700">
          <CardContent className="prose prose-neutral dark:prose-invert lg:prose-lg pt-6">
            <h1 className="text-4xl font-bold mt-6 mb-4 text-blue-500">
              Loading...
            </h1>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!content) return null;

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
                  <table className="w-full border-collapse table-auto">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border px-3 py-2 font-semibold bg-gray-200 dark:bg-gray-800">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border px-3 py-2 dark:border-gray-700">{children}</td>
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
            }}
          >
            {content}
          </ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
}
