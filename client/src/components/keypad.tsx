import { Button } from "@/components/ui/button";
import { Phone, Mic, Volume2, MoreVertical, X } from "lucide-react";

interface KeypadButtonProps {
   number: string;
   letters?: string;
   onClick: (value: string) => void;
}

function KeypadButton({ number, letters, onClick }: KeypadButtonProps) {
   return (
      <Button
         variant="ghost"
         className="h-20 w-20 rounded-full flex flex-col items-center justify-center bg-neutral-900 hover:bg-neutral-800"
         onClick={() => onClick(number)}
      >
         <span className="text-2xl font-light">{number}</span>
         {letters && (
            <span className="text-xs text-muted-foreground mt-1">
               {letters}
            </span>
         )}
      </Button>
   );
}

interface KeypadProps {
   onClose: () => void;
   onKeyPress: (value: string) => void;
}

export function Keypad({ onClose, onKeyPress }: KeypadProps) {
   return (
      <div className="fixed inset-0 bg-black/95 flex flex-col items-center pt-12">
         <div className="w-full max-w-sm px-4">
            {/* Header with close button */}
            <div className="flex justify-between items-center mb-8">
               <X
                  className="h-6 w-6 text-neutral-400 cursor-pointer"
                  onClick={onClose}
               />
               <span className="text-2xl text-white">2</span>
               <div className="w-6" /> {/* Spacer for alignment */}
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-4 justify-items-center mb-8">
               <KeypadButton number="1" letters="⠀" onClick={onKeyPress} />
               <KeypadButton number="2" letters="ABC" onClick={onKeyPress} />
               <KeypadButton number="3" letters="DEF" onClick={onKeyPress} />
               <KeypadButton number="4" letters="GHI" onClick={onKeyPress} />
               <KeypadButton number="5" letters="JKL" onClick={onKeyPress} />
               <KeypadButton number="6" letters="MNO" onClick={onKeyPress} />
               <KeypadButton number="7" letters="PQRS" onClick={onKeyPress} />
               <KeypadButton number="8" letters="TUV" onClick={onKeyPress} />
               <KeypadButton number="9" letters="WXYZ" onClick={onKeyPress} />
               <KeypadButton number="*" onClick={onKeyPress} />
               <KeypadButton number="0" letters="+" onClick={onKeyPress} />
               <KeypadButton number="#" onClick={onKeyPress} />
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-between items-center px-8">
               <Button
                  variant="ghost"
                  size="default"
                  className="h-14 w-14 rounded-full"
               >
                  <Mic className="text-neutral-400" />
                  <span className="sr-only">Keypad</span>
               </Button>

               <Button
                  variant="ghost"
                  size="icon"
                  className="h-14 w-14 rounded-full"
               >
                  <Volume2 className="h-6 w-6 text-neutral-400" />
                  <span className="sr-only">Mute</span>
               </Button>

               <Button
                  variant="ghost"
                  size="icon"
                  className="h-14 w-14 rounded-full"
               >
                  <MoreVertical className="h-6 w-6 text-neutral-400" />
                  <span className="sr-only">More</span>
               </Button>
            </div>

            {/* Call Button */}
            <div className="flex justify-center mt-8">
               <Button
                  size="icon"
                  className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600"
               >
                  <Phone className="h-8 w-8 text-white" />
                  <span className="sr-only">Call</span>
               </Button>
            </div>
         </div>
      </div>
   );
}
