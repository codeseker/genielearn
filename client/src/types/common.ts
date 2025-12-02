export interface Lesson {
    _id: string;
    title: string;
    module: string;
    order: number;
    description: string;
    estimatedMinutes: number;
}

export interface Module {
    _id: string;
    title: string;
    description: string;
    course: string;
    lessons: Lesson[];
    id: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    createdBy: string;
    isDeleted: boolean;
    tags: string[];
    level: string;
    targetAudience: string;
    estimatedDurationHours: number;
    createdAt: string;
    updatedAt: string;
    modules: Module[];
}