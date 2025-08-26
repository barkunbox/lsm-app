"use client";

import * as z from "zod";
import axios from "axios";
import MuxPlayer from "@mux/mux-player-react";
import { ImageIcon, Pencil, PlusCircle, Video } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { chapters, mux_datas } from "@prisma/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";

interface ChapterVideoFormProps {
  initialData: chapters & { mux_data?: mux_datas | null };
  courseId: string;
  chapterId: string;
};

const formSchema = z.object({
  video_url: z.string().min(1),
})

export const ChapterVideoForm = ({
  initialData,
  courseId,
  chapterId,
}: ChapterVideoFormProps) => {

  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values);
      toast.success("Chapter Video updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Chapter video
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && (
            <>Cancel</>
          )}
          {!isEditing && !initialData?.video_url && (
            <>
              <PlusCircle className="h-4 w-4 mr-2"/>
              Add a video
            </>
          )}
          {!isEditing && initialData.video_url && (
            <>
              <Pencil className="h-4 w-4 mr-2"/>
              Edit
            </>            
          )}
        </Button>
      </div>
      {!isEditing && (
        !initialData.video_url ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
            <Video className="h-10 w-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            <MuxPlayer 
              playbackId={initialData.mux_data?.playback_id || ""}
            />
          </div>
        )
      )}
      {isEditing && (
        <div>
          <FileUpload
            endpoint="chapterVideo"
            onChange={(url) => {
              if (url) {
                onSubmit({ video_url: url })
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            Upload this chapter&apos;s video
          </div>
        </div>
      )}
      {initialData.video_url && !isEditing && (
        <div className="text-xs text-muted-foreground mt-2">
          Videos can take a few minutes to process. Refresh the page if video does not appear.
        </div>
      )}
    </div>
  );
};