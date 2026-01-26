export interface Course {
  title: string;
  topic: string;
  description: string;
  tags: string[];
  level: string;
  slug: string;
  targetAudience: string;
  estimatedDuration: string;
  primaryGoal: string;
  modules: Module[];
  intentCategory: string;
  prerequisites: string[];
}

export interface Module {
  id: string;
  title: string;
  order: number;
  slug: string;
  description: string;
  estimatedDurationHours: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  order: number;
  slug: string;
  description: string;
  estimatedMinutes: number;
}
