import { Button } from "@/components/ui/button";
import {
   Mic,
   MicOff,
   Volume2,
   VolumeX,
   MoreVertical,
   Phone,
   Grid3X3,
} from "lucide-react";
import { useState } from "react";

interface CallInterfaceProps {
   callerName: string;
   onKeypadOpen: () => void;
   isMuted: boolean;
   setIsMuted: (muted: boolean) => void;
   isSpeaker: boolean;
   setIsSpeaker: (speaker: boolean) => void;
   onEndCall: () => void;
   duration: string;
}

export function CallInterface({
   callerName,
   onKeypadOpen,
   isMuted,
   setIsMuted,
   isSpeaker,
   setIsSpeaker,
   onEndCall,
   duration,
}: CallInterfaceProps) {
   return (
      <div className="fixed inset-0 flex flex-col items-center">
         <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-24 w-24 rounded-full flex items-center justify-center mb-4">
               <span className="text-3xl">{callerName[0]}</span>
            </div>
            <h1 className="text-2xl font-semibold mb-2">{callerName}</h1>
            <p className="">{duration}</p>
         </div>

         <div className="w-full max-w-sm px-4 mb-16">
            <div className="grid grid-cols-4 gap-4 justify-items-center mb-8">
               <Button
                  variant="ghost"
                  size="icon"
                  className="h-14 w-14 rounded-full flex flex-col items-center gap-1"
                  onClick={onKeypadOpen}
               >
                  <Grid3X3 className="h-6 w-6" />
                  <span className="text-xs">Keypad</span>
               </Button>

               <Button
                  variant="ghost"
                  size="icon"
                  className="h-14 w-14 rounded-full flex flex-col items-center gap-1"
                  onClick={() => setIsMuted(!isMuted)}
               >
                  {isMuted ? (
                     <MicOff className="h-6 w-6 text-red-500" />
                  ) : (
                     <Mic className="h-6 w-6 text-white" />
                  )}
                  <span className="text-xs text-neutral-400">Mute</span>
               </Button>

               <Button
                  variant="ghost"
                  size="icon"
                  className="h-14 w-14 rounded-full flex flex-col items-center gap-1"
                  onClick={() => setIsSpeaker(!isSpeaker)}
               >
                  {isSpeaker ? (
                     <VolumeX className="h-6 w-6 text-red-500" />
                  ) : (
                     <Volume2 className="h-6 w-6 text-white" />
                  )}
                  <span className="text-xs text-neutral-400">Speaker</span>
               </Button>

               <Button
                  variant="ghost"
                  size="icon"
                  className="h-14 w-14 rounded-full flex flex-col items-center gap-1"
               >
                  <MoreVertical className="h-6 w-6 text-white" />
                  <span className="text-xs text-neutral-400">More</span>
               </Button>
            </div>

            {/* End Call Button */}
            <div className="flex justify-center">
               <Button
                  size="icon"
                  className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600"
                  onClick={onEndCall}
               >
                  <Phone className="h-8 w-8 text-white rotate-225" />
                  <span className="sr-only">End Call</span>
               </Button>
            </div>
         </div>
      </div>
   );
}
