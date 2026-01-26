export interface Lesson {
  _id: string;
  title: string;
  slug: string;
  module: string;
  content: string;
  isDeleted: boolean;
  isCompleted: boolean;
  order: number;
  description: string;
  estimatedMinutes: number;
}

export interface Module {
  _id: string;
  title: string;
  slug: string;
  description: string;
  course: string;
  isCompleted: boolean;
  lessons: Lesson[];
  id: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  createdBy: string;
  isDeleted: boolean;
  tags: string[];
  targetAudience: string[];
  isCompleted: boolean;
  estimatedDuration: number;
  prerequisites: string[];
  intentCategory: string;
  createdAt: string;
  updatedAt: string;
  modules: Module[];
}

export interface CourseWithStats extends Course {
  stats: {
    totalModules: number;
    totalLessons: number;
    completedLessons: number;
    progress: number;
  };
}
