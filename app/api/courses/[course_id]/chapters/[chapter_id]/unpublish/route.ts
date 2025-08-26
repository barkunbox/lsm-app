import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { course_id: string; chapter_id: string; }}
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const courseOwner = await db.courses.findUnique({
      where: {
        id: params.course_id,
        user_id: userId
      }
    });
    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const unpublishedChapter = await db.chapters.update({
      where: {
        id: params.chapter_id,
        course_id: params.course_id,
      },
      data: {
        is_published: false,
      },
    });

    const publishedChaptersInCourse = await db.chapters.findMany({
      where: {
        course_id: params.course_id,
        is_published: true,
      }
    });

    if (!publishedChaptersInCourse.length) {
      await db.courses.update({
        where: {
          id: params.course_id,
        },
        data: {
          is_published: false,
        },
      });
    }

    return NextResponse.json(unpublishedChapter);

  } catch (error) {
    console.log("[CHAPTER_PUBLISH] ", error);
    return new NextResponse("Internal Error ", { status: 500 });
  }
};