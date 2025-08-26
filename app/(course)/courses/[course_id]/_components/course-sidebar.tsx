import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { chapters, courses, user_progress } from "@prisma/client"
import { redirect } from "next/navigation";
import { CourseSidebarItem } from "./course-sidebar-item";
import { CourseProgress } from "@/components/course-progress";

interface CourseSidebarProps {
  course: courses & { 
    chapters: (chapters & {
      user_progress: user_progress[] | null;
    })[]
  };
  progressCount: number;
}

export const CourseSidebar = async ({
  course,
  progressCount
}: CourseSidebarProps) => {

  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }

  const purchase = await db.purchases.findUnique({
    where: {
      user_id_course_id: {
        user_id: userId,
        course_id: course.id,
      }
    }
  });

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold">
          {course.title}
        </h1>
        {purchase && (
          <div className="mt-10">
            <CourseProgress
              variant="success"
              value={progressCount}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col w-full">
        {course.chapters.map((chapter) => (
          <CourseSidebarItem 
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={!!chapter.user_progress?.[0]?.is_completed}
            courseId={course.id}
            isLocked={!chapter.is_free && !purchase}
          />
        ))}
      </div>
    </div>
  )
}