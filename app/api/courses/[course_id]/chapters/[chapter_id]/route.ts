import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function DELETE(
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

    if (!chapter) {
      return new NextResponse("Not found", { status: 404 });
    }

    if (chapter.video_url) {
      const existingMuxData = await db.mux_datas.findFirst({
        where: {
          chapter_id: params.chapter_id,
        },
      });

      if (existingMuxData) {
        await mux.video.assets.delete(existingMuxData.asset_id);
        await db.mux_datas.delete({
          where: {
            id: existingMuxData.id,
          },
        });
      }
    }

    const deletedChapter = await db.chapters.delete({
      where: {
        id: params.chapter_id,
      }
    });

    const publishedChaptersInCourse = await db.chapters.findMany({
      where: {
        course_id: params.course_id,
        is_published: true,
      },
    });

    if (!publishedChaptersInCourse.length) {
      await db.courses.update({
        where: {
          id: params.course_id,
        },
        data: {
          is_published: false,
        }
      });
    }

    return NextResponse.json(deletedChapter);

  } catch (error) {
    console.log("[CHAPTER_ID_DELETE] ", error);
    return new NextResponse("Internal Error ", { status: 500 });
  }
};

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

    const { is_published, ...values } = await req.json();

    const chapter = await db.chapters.update({
      where: {
        id: params.chapter_id,
        course_id: params.course_id,
      },
      data: {
        ...values,
      }
    });

    if (values.video_url) {

      const existingMuxData = await db.mux_datas.findFirst({
        where: {
          chapter_id: params.chapter_id
        },
      });

      if (existingMuxData) {
        await mux.video.assets.delete(existingMuxData.asset_id);
        await db.mux_datas.delete({
          where: {
            id: existingMuxData.id,
          },
        });
      }

      const asset = await mux.video.assets.create({
        inputs: [{ url: values.video_url }],
        playback_policies: ['public'],
      });

      await db.mux_datas.create({
        data: {
          chapter_id: params.chapter_id,
          asset_id: asset.id,
          playback_id: asset.playback_ids?.[0]?.id,
        }
      });

    }

    return NextResponse.json(chapter);

  } catch (error) {
    console.log("[COURSES_CHAPTER_ID] ", error);
    return new NextResponse("Internal Error ", { status: 500 });
  }
};