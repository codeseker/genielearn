import { CourseGenerator } from "@/components/course-generator";

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-full items-center justify-center p-6 pt-20 lg:pt-6 gap-6">
      <CourseGenerator />
    </main>
  );
}
