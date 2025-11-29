export interface Course {
  title: string;
  topic: string;
  description: string;
  tags: string[];
  level: string;
  targetAudience: string;
  estimatedDurationHours: number;
  primaryGoal: string;
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  order: number;
  description: string;
  estimatedDurationHours: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  order: number;
    description: string;
  estimatedMinutes: number;
}
