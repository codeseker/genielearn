import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { useAsyncHandler } from "@/utils/async-handler";
import { createCourse, type CreateCourseResponse } from "@/actions/course";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import type { ApiResponse } from "@/types/api-response";
import { useState } from "react";
import { successToast } from "@/utils/toaster";
import { addCourse } from "@/store/slices/course";


const courseSchema = z.object({
    userQuery: z
        .string()
        .min(10, "User query must be at least 10 characters long"),
    level: z.string().min(3, "Level must be at least 3 characters long"),
    targetAudience: z
        .string()
        .min(3, "Target audience must be at least 3 characters long"),
    duration: z.string().min(1, "Duration must be at least 1 hour"),
    topicType: z.string().min(3, "Topic type must be at least 3 characters long"),
});

type CourseFormData = z.infer<typeof courseSchema>;

export default function Home() {
    const asyncHandler = useAsyncHandler();

    const user = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();

    const [loading, setLoading] = useState<boolean>(false);

    const safeCourseCreation = asyncHandler(createCourse);
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema),
    });


    const onSubmit = async (data: CourseFormData) => {
        if (!user.token) {
            return;
        }
        setLoading(true);
        const res = await safeCourseCreation(user.token, data);
        setLoading(false);

        if (!res || !res.data) {
            return;
        }
        successToast("Course created successfully");
        dispatch(addCourse({
            id: res.data.courseId,
            title: res.data.title
        }))
    };

    return (
        <div className="w-full flex justify-center py-20 px-4">
            <div className="max-w-3xl w-full space-y-12">

                {/* Hero Section */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-extrabold bg-linear-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                        Create Your AI-Powered Course
                    </h1>

                    <p className="text-neutral-300 text-lg max-w-xl mx-auto">
                        Generate a complete, structured course instantly using AI.
                        Just fill the details below and let AI do the magic.
                    </p>

                    <Button size="lg" className="mt-2 px-8 text-md">
                        Create Course with AI
                    </Button>
                </div>

                <Separator className="bg-neutral-700" />

                {/* Form Card */}
                <Card className="bg-neutral-900/80 border-neutral-700 backdrop-blur-md shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl">Course Details</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

                            {/* userQuery */}
                            <div className="space-y-2">
                                <Label htmlFor="userQuery">Course Prompt</Label>
                                <Textarea
                                    id="userQuery"
                                    placeholder="Describe what course you want to generate..."
                                    className="min-h-32 resize-none"
                                    {...register("userQuery")}
                                />
                                {errors.userQuery && (
                                    <p className="text-red-500 text-sm">
                                        {errors.userQuery.message}
                                    </p>
                                )}
                            </div>

                            {/* level (select) */}
                            <div className="space-y-2">
                                <Label>Level</Label>
                                <Select
                                    onValueChange={(value) => setValue("level", value)}
                                >
                                    <SelectTrigger className="w-full bg-neutral-800 border-neutral-700">
                                        <SelectValue placeholder="Select course level" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>

                                {errors.level && (
                                    <p className="text-red-500 text-sm">
                                        {errors.level.message}
                                    </p>
                                )}
                            </div>

                            {/* targetAudience */}
                            <div className="space-y-2">
                                <Label htmlFor="targetAudience">Target Audience</Label>
                                <Textarea
                                    id="targetAudience"
                                    placeholder="Who is this course meant for?"
                                    className="resize-none"
                                    {...register("targetAudience")}
                                />
                                {errors.targetAudience && (
                                    <p className="text-red-500 text-sm">
                                        {errors.targetAudience.message}
                                    </p>
                                )}
                            </div>

                            {/* duration */}
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration</Label>
                                <Input
                                    id="duration"
                                    placeholder="e.g. 2 weeks, 10 hours, etc."
                                    className="bg-neutral-800 border-neutral-700"
                                    {...register("duration")}
                                />
                                {errors.duration && (
                                    <p className="text-red-500 text-sm">
                                        {errors.duration.message}
                                    </p>
                                )}
                            </div>

                            {/* topicType */}
                            <div className="space-y-2">
                                <Label htmlFor="topicType">Topic Type</Label>
                                <Input
                                    id="topicType"
                                    placeholder="e.g. coding, marketing, design..."
                                    className="bg-neutral-800 border-neutral-700"
                                    {...register("topicType")}
                                />
                                {errors.topicType && (
                                    <p className="text-red-500 text-sm">
                                        {errors.topicType.message}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <Button disabled={loading} size="lg" className="w-full mt-4" type="submit">
                                {loading ? "Generating..." : "Generate Course"}
                            </Button>

                        </form>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
