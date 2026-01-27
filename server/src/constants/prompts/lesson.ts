import { ICourse } from "../../models/course";
import { ILesson } from "../../models/lesson";
import { IModule } from "../../models/modules";


export function buildYouTubeQuery({
  course,
  module,
  lesson,
}: {
  course: ICourse;
  module: IModule;
  lesson: ILesson;
}) {
  const domainKeywordsMap: Record<string, string[]> = {
    "data-structures": ["data structures", "algorithm", "DSA"],
    "web-development": ["web development", "frontend", "backend"],
    "machine-learning": ["machine learning", "AI", "deep learning"],
    finance: ["finance", "investment"],
  };

  const domainKeywords = domainKeywordsMap[course.intentCategory] ?? [];

  return [
    ...domainKeywords,
    course.title,
    module.title,
    lesson.title,
    "tutorial",
    "explained",
  ].join(" ");
}
