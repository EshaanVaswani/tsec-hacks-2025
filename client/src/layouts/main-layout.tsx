import GoogleTranslate from "@/components/google-translate";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
   return (
      <div>
         <GoogleTranslate />
         <Outlet />
      </div>
   );
};

export default MainLayout;
