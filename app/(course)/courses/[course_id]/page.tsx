import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const CourseIdPage = async ({
  params
} : {
  params: { course_id: string; }
}) => {

  const course = await db.courses.findUnique({
    where: {
      id: params.course_id,
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