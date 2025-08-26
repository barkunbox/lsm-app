import { db } from "@/lib/db";

export const getProgress = async (userId: string, courseId: string): Promise<number> => {
  try {

    const publishedChapters = await db.chapters.findMany({
      where: {
        course_id: courseId,
        is_published: true,
      },
      select: {
        id: true,
      },
    });

    const publishedChapterIds = publishedChapters.map((chapter) => chapter.id);

    const validCompletedChapters = await db.user_progress.count({
      where: {
        user_id: userId,
        chapter_id: {
          in: publishedChapterIds,
        },
        is_completed: true,
      },
    });

    const progressPercentage = (validCompletedChapters / publishedChapterIds.length) * 100;
    
    return progressPercentage;

  } catch (error) {
    console.log("[GET_PROGRESS] ", error);
    return 0;
  }
}