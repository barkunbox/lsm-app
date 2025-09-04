import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const CourseIdPage = async ({
  params
} : {
  params: Promise<{ course_id: string; }>
}) => {
  const { course_id } = await params;
  const course = await db.courses.findUnique({
    where: {
      id: course_id,
    },
    include: {
      chapters: {
        where: {
          is_published: true,
        },
        orderBy: {
          position: "asc"
        },
      },
    },
  });

  if (!course) {
    return redirect("/");
  }

  return redirect(`/courses/${course.id}/chapters/${course.chapters[0].id}`);
}
 
export default CourseIdPage;