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

    const chapter = await db.chapters.findUnique({
      where: {
        id: params.chapter_id,
        course_id: params.course_id,
      },
    });

    const muxData = await db.mux_datas.findUnique({
      where: {
        chapter_id: params.chapter_id,
      },
    });

    if (!chapter || !muxData || !chapter.title || !chapter.description || !chapter.video_url) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const publishedChapter = await db.chapters.update({
      where: {
        id: params.chapter_id,
        course_id: params.course_id,
      },
      data: {
        is_published: true,
      },
    });

    return NextResponse.json(publishedChapter);

  } catch (error) {
    console.log("[CHAPTER_PUBLISH] ", error);
    return new NextResponse("Internal Error ", { status: 500 });
  }
};