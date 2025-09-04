import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ course_id: string }>}
) {
  try {
    const { course_id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const courseOwner = await db.courses.findUnique({
      where: {
        id: course_id,
        user_id: userId
      }
    });

    if (!courseOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { list } = await req.json();

    for (const item of list) {
      await db.chapters.update({
        where: { id: item.id },
        data: { position: item.position }
      });
    }

    return new NextResponse("Success", { status: 200 });

  } catch (error) {
    console.log("[REORDER] ", error);
    return new NextResponse("Internal Error ", { status: 500 });
  }
};