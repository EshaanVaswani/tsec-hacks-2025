import { BottomNav } from "@/components/bottom-navbar";
import Navbar from "@/components/Navbar";
import { Outlet } from "react-router";

export default function Dashboard() {
   return (
      <div className="pb-14 ">
         <Navbar />
         <Outlet />
         <BottomNav />
      </div>
   );
}
