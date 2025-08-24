import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  courseImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("🚀 Upload callback hit:", { metadata, file });
      return {
        message: "ok",
        fileUrl: file.ufsUrl,
        uploadedBy: metadata.userId,
      };
    }),
  courseAttachment: f(["text", "image", "video", "audio", "pdf"])
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("📎 Attachment uploaded:", file);
      return { success: true, fileUrl: file.ufsUrl };
    }),
  chapterVideo: f({ video: { maxFileCount: 1, maxFileSize: "1GB" } })
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("🎬 Video uploaded:", file);
      return { success: true, fileUrl: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;