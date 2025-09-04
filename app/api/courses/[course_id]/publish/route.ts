import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ course_id: string }>}  
) {
  try {
    const { course_id } = await params;
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const course = await db.courses.findUnique({
      where: {
        id: course_id,
        user_id: userId
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

    const hasPublishedChapters = course.chapters.some((chapter) => chapter.is_published);

    if (!course.title || !course.description || !course.image_url || !course.category_id || !hasPublishedChapters) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const publishedCourse = await db.courses.update({
      where: {
        id: course_id,
        user_id: userId,
      },
      data: {
        is_published: true,
      },
    });
    
    return NextResponse.json(publishedCourse);    

  } catch (error) {
    console.log("[CHAPTERS_ID_PUBLISH] ", error);
    return new NextResponse("Internal Error ", { status: 500 });
  }  
};