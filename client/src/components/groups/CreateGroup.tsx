import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { SearchUsers } from "./searchUser";
import { toast } from "sonner";
import axios from "axios";
import { useUser } from "../hooks/use-user";

export default function CreateGroupPage() {
   const [groupName, setGroupName] = useState("");
   const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

   const handleUserSelect = (userId: string) => {
      // Prevent duplicate selections
      if (!selectedMembers.includes(userId)) {
         setSelectedMembers([...selectedMembers, userId]);
      }
   };

   const handleRemoveMember = (userId: string) => {
      setSelectedMembers(
         selectedMembers.filter((memberId) => memberId !== userId)
      );
   };

   const { user } = useUser();

   const handleCreateGroup = async () => {
      if (!groupName) {
         toast.error("Group name is required");
         return;
      }

      if (selectedMembers.length === 0) {
         toast.error("Please select at least one member");
         return;
      }

      try {
         const response = await axios.post(
            "http://localhost:3000/api/group/create",
            {
               name: groupName,
               ownerId: user?._id,
               membersId: selectedMembers,
            }
         );

         const data = response?.data;
         console.log(data);

         if (response.status === 200) {
            toast.success("Group created successfully");

            // Reset form
            setGroupName("");
            setSelectedMembers([]);
         } else {
            toast.error(data.message);
         }
      } catch (error) {
         toast.error("Error creating group");
      }
   };

   return (
      <Card className="w-full max-w-xl mx-auto mt-10">
         <CardHeader>
            <CardTitle>Create New Group</CardTitle>
         </CardHeader>
         <CardContent>
            <div className="space-y-4">
               <Input
                  placeholder="Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
               />

               <div className="flex flex-wrap gap-2 mb-4">
                  {selectedMembers.map((memberId) => (
                     <Badge
                        key={memberId}
                        variant="secondary"
                        className="flex items-center"
                     >
                        {memberId}
                        <button
                           onClick={() => handleRemoveMember(memberId)}
                           className="ml-2 text-red-500"
                        >
                           x
                        </button>
                     </Badge>
                  ))}
               </div>

               <SearchUsers
                  title="Add Members"
                  onUserSelect={(userId) => handleUserSelect(userId)}
               />

               <Button onClick={handleCreateGroup} className="w-full">
                  Create Group
               </Button>
            </div>
         </CardContent>
      </Card>
   );
}
