import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params } : { params: { course_id: string, attachment_id: string }}
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

    const attachment = await db.attachments.delete({
      where: {
        course_id: params.course_id,
        id: params.attachment_id,
      }
    });

    return NextResponse.json(attachment);

  } catch (error) {
    console.log("[ATTACHMENT_ID] ", error);
    return new NextResponse("Internal Error ", { status: 500 });    
  }
};