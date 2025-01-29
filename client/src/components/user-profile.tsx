import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {  SettingsIcon } from "lucide-react";
import SettingsModal from "./settings";
import { useUser } from "./hooks/use-user";

export default function UserProfile() {
   const [isSettingsModalOpen,setIsSettingsModalOpen]=useState(false)
   const { user } = useUser();

   return (
      <div className="container mx-auto px-4 py-8">
         <div className="flex items-center mb-8 space-x-4">
            {/* Avatar */}
            <Avatar className="w-24 h-24">
               <AvatarImage
                  src="/placeholder.svg?height=128&width=128"
                  alt="User"
               />
               <AvatarFallback className="text-xl font-bold">
                  {user?.name[0]?.toUpperCase() || "U"}
               </AvatarFallback>
            </Avatar>

            {/* Name and Username */}
            <div>
               <h1 className="text-xl font-bold">{user?.name || "Name"}</h1>
               <p className="text-gray-600">@{user?.username || "username"}</p>
            </div>
         </div>

         {/* Buttons */}
         <div className="flex space-x-4 mb-8">
         <Button
               onClick={() => setIsSettingsModalOpen(true)}
               variant="outline"
               className="flex items-center w-full"
            >
               <SettingsIcon className="mr-2 h-4 w-4" />
               Settings
            </Button>

           
         </div>

        

         <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
         />
        
      </div>
   );
}
