import { db } from "@/lib/db";
import { categories, chapters, courses } from "@prisma/client";
import { getProgress } from "@/actions/get-progress";

type CourseWithProgressWithCategory = courses & {
  category: categories;
  chapters: chapters[];
  progress: number | null;
}

type DashboardCourses = {
  completedCourses: CourseWithProgressWithCategory[];
  coursesInProgress: CourseWithProgressWithCategory[];
}

export const getDashboardCourses = async (userId: string): Promise<DashboardCourses> => {
  try {

    const purchasedCourses = await db.purchases.findMany({
      where: {
        user_id: userId,
      },
      select: {
        course: {
          include: {
            category: true,
            chapters: {
              where: {
                is_published: true,
              }
            }
          }
        }
      }
    });

    const courses = purchasedCourses.map((purchase) => purchase.course) as CourseWithProgressWithCategory[];

    for (const course of courses) {
      const progress = await getProgress(userId, course.id);
      course["progress"] = progress;
    }

    const completedCourses = courses.filter((course) => course.progress === 100);
    const coursesInProgress = courses.filter((course) => (course.progress ?? 0) < 100 );

    return {
      completedCourses,
      coursesInProgress,
    }

  } catch (error) {
    console.log("[GET_DASHBOARD_COURSES] ", error);
    return {
      completedCourses: [],
      coursesInProgress: [],
    }
  }
}