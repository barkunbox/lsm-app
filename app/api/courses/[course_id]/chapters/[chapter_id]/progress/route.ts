import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { course_id: string; chapter_id: string; }}
) {
  try {
    const { userId } = await auth();
    const { isCompleted } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const userProgress = await db.user_progress.upsert({
      where: {
        user_id_chapter_id: {
          user_id: userId,
          chapter_id: params.chapter_id,
        },
      },
      update: {
        is_completed: isCompleted,
      },
      create: {
        user_id: userId,
        chapter_id: params.chapter_id,
      },
    });

    return NextResponse.json(userProgress);

  } catch (error) {
    console.log("[CHAPTER_ID_PROGRESS] ", error);
    return new NextResponse("Internal Error ", { status: 500 });
  }  
};