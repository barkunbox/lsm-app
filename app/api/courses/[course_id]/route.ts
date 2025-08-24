import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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