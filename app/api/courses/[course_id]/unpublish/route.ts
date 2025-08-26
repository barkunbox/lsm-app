import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
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
        user_id: userId
      },
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const unpublishedCourse = await db.courses.update({
      where: {
        id: params.course_id,
        user_id: userId,
      },
      data: {
        is_published: false,
      },
    });
    
    return NextResponse.json(unpublishedCourse);    

  } catch (error) {
    console.log("[CHAPTERS_ID_UNPUBLISH] ", error);
    return new NextResponse("Internal Error ", { status: 500 });
  }  
};