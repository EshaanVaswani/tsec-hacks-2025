import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Play, File } from "lucide-react";
import { base64ToFile, cn } from "@/lib/utils";
import { sampleImages } from "@/lib/data";
import { MediaFile } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { FileUpload } from "./file-upload";
import { useCapsule } from "./hooks/use-capsule";

interface MediaPickerProps {
   onPhotosSelected?: (photos: MediaFile[]) => void;
}

const MEDIA_STORAGE_KEY = "timeCapsule_media";
const SELECTED_FILES_KEY = "timeCapsule_selectedFiles";

export const MediaPicker = ({ onPhotosSelected }: MediaPickerProps) => {
   const navigate = useNavigate();

   const { capsule, setCapsule } = useCapsule();

   const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(() => {
      const savedMedia = sessionStorage.getItem(MEDIA_STORAGE_KEY);
      return savedMedia ? JSON.parse(savedMedia) : sampleImages;
   });
   const [selectedFiles, setSelectedFiles] = useState<Set<MediaFile>>(() => {
      const savedSelection = sessionStorage.getItem(SELECTED_FILES_KEY);

      return savedSelection ? new Set(JSON.parse(savedSelection)) : new Set();
   });
   useEffect(() => {
      sessionStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(mediaFiles));
   }, [mediaFiles]);
   useEffect(() => {
      sessionStorage.setItem(
         SELECTED_FILES_KEY,
         JSON.stringify(Array.from(selectedFiles))
      );
   }, [selectedFiles]);
   const toggleSelection = (file: MediaFile) => {
      setSelectedFiles((prev) => {
         const next = new Set(prev);
         if (next.has(file)) {
            next.delete(file);
         } else {
            next.add(file);
         }
         return next;
      });
   };

   const handleAddPhotos = () => {
      const selectedMedia = mediaFiles.filter((file) =>
         selectedFiles.has(file)
      );
      if (onPhotosSelected) {
         onPhotosSelected(selectedMedia);

         setCapsule({
            ...capsule,
            media: selectedMedia.map((file) =>
               file.type === "image" ||
               file.type === "audio" ||
               file.type === "video"
                  ? base64ToFile(file.url, `media_${file.id}`)
                  : file.url
            ) as File[],
         });
      }
      navigate("/dashboard/editor");
   };

   const MediaPreview = ({ file }: { file: MediaFile }) => {
      const isSelected = selectedFiles.has(file);

      return (
         <div
            className="group relative aspect-square cursor-pointer"
            onClick={() => toggleSelection(file)}
         >
            {file.type === "image" && (
               <img
                  src={file.url}
                  alt={file.alt || ""}
                  className={cn(
                     "object-cover w-full h-full transition-opacity rounded-md",
                     isSelected ? "opacity-75" : "group-hover:opacity-75"
                  )}
               />
            )}

            {file.type === "video" && (
               <div className="relative w-full h-full bg-muted rounded-md">
                  <video
                     src={file.url}
                     className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Play className="w-8 h-8 text-primary" />
                  </div>
               </div>
            )}

            {file.type === "audio" && (
               <div className="relative w-full h-full bg-muted rounded-md flex items-center justify-center">
                  <File className="w-12 h-12 text-primary" />
                  <div className="absolute bottom-2 left-2 right-2 text-xs text-center">
                     Audio Recording
                  </div>
               </div>
            )}

            <div
               className={cn(
                  "absolute inset-0 flex items-center justify-center transition-colors rounded-md",
                  isSelected
                     ? "bg-black/20"
                     : "bg-transparent group-hover:bg-black/10"
               )}
            >
               {isSelected && (
                  <div className="bg-primary text-primary-foreground rounded-full p-1">
                     <Check className="w-4 h-4" />
                  </div>
               )}
            </div>
         </div>
      );
   };

   return (
      <div className="w-full max-w-4xl mx-auto p-2 space-y-6 flex flex-col">
         <h2 className="text-2xl font-bold">Select Media</h2>
         <FileUpload setMediaItems={setMediaFiles} />
         <hr className="py-1"/>
         <h2 className="text-2xl font-bold">Your Media</h2>
         <ScrollArea className="h-[600px] rounded-lg border">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-1 p-1">
               {mediaFiles.map((file) => (
                  <MediaPreview key={file.alt} file={file} />
               ))}
            </div>
         </ScrollArea>
         <Button
            disabled={selectedFiles.size === 0}
            onClick={handleAddPhotos}
            className="gap-2"
         >
            Edit Selected ({selectedFiles.size})
         </Button>
      </div>
   );
};
