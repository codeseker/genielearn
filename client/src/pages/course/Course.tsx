import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { useAsyncHandler } from "@/utils/async-handler";
import { showCourse } from "@/actions/course";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";


export default function CourseDetails() {
    const { id } = useParams();

    const user = useSelector((state: RootState) => state.user);


    const asyncHandler = useAsyncHandler();
    const safeCourseView = asyncHandler(showCourse); // this wraps showCourse which can have error and will protect it

    const [course, setCourse] = useState<any>(null);


    const [expanded, setExpanded] = useState<string | null>(null);

    const getCourse = async () => {
        const res = await safeCourseView(user.token as string, {
            courseId: id as string
        });
        const data = res?.data;
        
        setCourse(data?.course);
    }

    useEffect(() => {
        if (!user.token || !user.user) return;

        getCourse();

    }, [user]);

    const toggleModule = (moduleId: string) => {
        setExpanded((prev) => (prev === moduleId ? null : moduleId));
    };

    if (!course) {
        return <>Invalid Id or Course Not found</>;
    }

    return (
        <div className="space-y-8">
            <Card className="bg-[#151515] border-gray-800">
                <CardHeader>
                    <CardTitle className="text-2xl">{course.title}</CardTitle>
                </CardHeader>
            </Card>

            <div className="space-y-4">
                {course.modules.map((m: any) => (
                    <Card
                        className="bg-[#151515] border-gray-800"
                        key={m.id}
                    >
                        <CardHeader
                            className="cursor-pointer flex flex-row items-center justify-between"
                            onClick={() => toggleModule(m.id)}
                        >
                            <CardTitle className="flex items-center gap-2 text-lg">
                                {expanded === m.id ? (
                                    <ChevronDown className="w-5 h-5" />
                                ) : (
                                    <ChevronRight className="w-5 h-5" />
                                )}
                                {m.title}
                            </CardTitle>
                        </CardHeader>

                        {/* LESSON LIST */}
                        {expanded === m.id && (
                            <CardContent className="space-y-3 animate-in fade-in duration-200">
                                {m.lessons.map((lesson: any) => (
                                    <div
                                        key={lesson.id}
                                        className="flex items-center gap-3 p-3 rounded-md bg-[#1b1b1b] border border-gray-800 hover:bg-[#222] cursor-pointer"
                                    >
                                        <BookOpen className="w-4 h-4 text-blue-400" />
                                        <span>{lesson.title}</span>
                                    </div>
                                ))}
                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
