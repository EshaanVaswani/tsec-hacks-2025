import { ChatLayout } from "@/components/chat/chat-layout";
import { useUser } from "@/components/hooks/use-user";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const chat = () => {
  const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const layoutCookie = getCookie("react-resizable-panels:layout");
  const defaultLayout = layoutCookie ? JSON.parse(layoutCookie) : undefined;

  const { user } = useAuth();
  console.log(user);

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <div className="w-full h-screen">
      <ChatLayout defaultLayout={defaultLayout} navCollapsedSize={8} />
    </div>
  );
};

export default chat;
