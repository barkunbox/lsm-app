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
  { params }: { params: { course_id: string }}  
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.courses.findUnique({
      where: {
        id: params.course_id,
        user_id: userId,
      },
      include: {
        chapters: {
          include: {
            mux_data: true,
          }
        }
      }
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    for (const chapter of course.chapters) {
      if (chapter.mux_data?.asset_id) {
        await mux.video.assets.delete(chapter.mux_data.asset_id);
      }
    }

    const deletedCourse = await db.courses.delete({
      where: {
        id: params.course_id,
      },
    });

    return NextResponse.json(deletedCourse);

  } catch (error) {
    console.log("[COURSE_ID_DELETE] ", error);
    return new NextResponse("Internal Error", { status: 500 });
  }  
};

export async function PATCH(
  req: Request,
  { params }: { params: { course_id: string }}
) {
  try {
    const { userId } = await auth();
    const { course_id } = await params;
    const values = await req.json();

    console.log("course_id" + course_id);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.courses.update({
      where: {
        id: course_id,
        user_id: userId,
      },
      data: {
        ...values,
      }
    });
    return NextResponse.json(course);

  } catch (error) {
    console.log("[COURSE_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};