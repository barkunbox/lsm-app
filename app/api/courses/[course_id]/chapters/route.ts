import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { course_id: string }}
) {
  try {
    const { userId } = await auth();
    const { title } = await req.json();

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

    const lastChapter = await db.chapters.findFirst({
      where: {
        course_id: params.course_id,
      },
      orderBy: {
        position: "desc"
      },
    });

    const newPosition  = lastChapter ? lastChapter.position + 1 : 1;

    const chapter = await db.chapters.create({
      data: {
        title,
        course_id: params.course_id,
        position: newPosition,
      }
    });
    
    return NextResponse.json(chapter);    

  } catch (error) {
    console.log("[CHAPTERS] ", error);
    return new NextResponse("Internal Error ", { status: 500 });
  }
};