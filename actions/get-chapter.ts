import { db } from "@/lib/db";
import { courses, attachments, chapters, purchases } from "@prisma/client";

interface GetChapterProps {
  userId: string;
  courseId: string;
  chapterId: string;
};

export const getChapter = async({
  userId,
  courseId,
  chapterId,
}: GetChapterProps) => {

  try {
    const purchase = await db.purchases.findUnique({
      where: {
        user_id_course_id: {
          user_id: userId,
          course_id: courseId,
        }
      }
    });

    const course = await db.courses.findUnique({
      where: {
        is_published: true,
        id: courseId,
      },
      select: {
        price: true,
      }
    });

    const chapter = await db.chapters.findUnique({
      where: {
        id: chapterId,
        is_published: true,
      }
    });

    if (!chapter || !course) {
      throw new Error("Chapter or course not found");
    }

    let muxData = null;
    let attachments: attachments[] = [];
    let nextChapter: chapters | null = null;

    if (purchase) {
      attachments = await db.attachments.findMany({
        where: {
          course_id: courseId,
        }
      });      
    }

    if (chapter.is_free || purchase) {
      muxData = await db.mux_datas.findUnique({
        where: {
          chapter_id: chapterId,
        }
      });
      nextChapter = await db.chapters.findFirst({
        where: {
          course_id: courseId,
          is_published: true,
          position: {
            gt: chapter?.position,
          }
        },
        orderBy: {
          position: "asc",
        }
      })
    }

    const userProgress = await db.user_progress.findUnique({
      where: {
        user_id_chapter_id: {
          user_id: userId,
          chapter_id: chapterId,
        }
      }
    });

    return {
      chapter,
      course,
      muxData,
      attachments,
      nextChapter,
      userProgress,
      purchase,
    };

  } catch (error) {
    console.log("[GET_CHAPTER] ", error);
    return {
      chapter: null,
      course: null,
      muxData: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      purchase: null,
    }
  }
}