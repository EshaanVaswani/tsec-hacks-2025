import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Capsule } from "@/lib/types";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function YouShared() {
   const [capsules, setCapsules] = useState<Capsule[]>([]);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const res = await api.get("/api/capsule/get-all");
            console.log(res);

            if (res.data.success) {
               setCapsules(res.data.data);
            } else {
               toast.error("Error fetching capsules");
            }
         } catch (error) {
            toast.error("An error occurred while fetching capsules");
            console.error(error);
         }
      };

      fetchData();
   }, []);

   console.log(capsules);

   return (
      <div className="grid gap-6">
         {capsules.length > 0 ? (
            capsules.map((item, index) => (
               <div key={item._id || index}>
                  <Link to={`/capsule/${item._id}`}>
                     <Card className="relative overflow-hidden h-64">
                        <img
                           src={
                              item.media && item.media[0]
                                 ? (item.media[0] as any).url
                                 : "/placeholder.svg"
                           }
                           alt={item.title}
                           className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/60 to-primary/90"></div>
                        <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                           <div>
                              <CardTitle className="text-white mb-2 text-lg">
                                 {item.title}
                              </CardTitle>
                              <CardDescription className="text-white/80">
                                 {item.description}
                              </CardDescription>
                           </div>
                           <div className="flex -space-x-2 overflow-hidden">
                              {item?.recipients?.map((user) => (
                                 <Avatar
                                    key={user._id}
                                    className="inline-block border-2 border-background"
                                 >
                                    <AvatarFallback>
                                       {user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                 </Avatar>
                              ))}
                           </div>
                        </div>
                     </Card>
                  </Link>
               </div>
            ))
         ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
               <h2 className="text-lg font-semibold text-gray-700">
                  You haven’t shared anything yet!
               </h2>
               <p className="text-gray-500">
                  Start sharing capsules with others and they’ll show up here.
               </p>
            </div>
         )}
      </div>
   );
}
