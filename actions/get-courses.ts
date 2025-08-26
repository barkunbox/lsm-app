import { categories, courses } from "@prisma/client";

import { getProgress } from "@/actions/get-progress";
import { db } from "@/lib/db";

type CourseWithProgressWithCategory = courses & {
  category: categories | null;
  chapters: { id: string }[];
  progress: number | null;
}

type GetCourses = {
  userId: string;
  title?: string;
  categoryId?: string;
}

export const getCourses = async({
  userId,
  title,
  categoryId,
}: GetCourses): Promise<CourseWithProgressWithCategory[]> => {
  try {
    const courses = await db.courses.findMany({
      where: {
        is_published: true,
        title: {
          contains: title,
        },
        category_id: categoryId,
      },
      include: {
        category: true,
        chapters: {
          where: {
            is_published: true,
          },
          select: {
            id: true,
          },
        },
        purchases: {
          where: {
            user_id: userId,
          },
        },
      },
      orderBy: {
        created_at: "desc"
      },
    });

    const coursesWithProgress: CourseWithProgressWithCategory[] = await Promise.all(
      courses.map(async course => {
        if (course.purchases.length === 0) {
          return {
            ...course,
            progress: null,
          }
        }
        const progressPercentage = await getProgress(userId, course.id);
        return {
          ...course,
          progress: progressPercentage,
        }
      })
    );

    return coursesWithProgress;

  } catch (error) {
    console.log("[GET_COURSES] ", error);
    return [];
  }
}