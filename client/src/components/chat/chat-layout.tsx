"use client";
import React, { useCallback, useEffect, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { Sidebar } from "../sidebar";
import { Chat } from "./chat";
import useChatStore from "@/hooks/useChatStore";
import { useSocket } from "@/hooks/useSocket";
import { Socket } from "socket.io-client";
import axios from "axios";
import {Message as BackendMessage} from "@/types";

interface ChatLayoutProps {
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

export function ChatLayout({
  defaultLayout = [320, 480],
  defaultCollapsed = false,
  navCollapsedSize,
}: ChatLayoutProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const {selectedUser} = useChatStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenWidth = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkScreenWidth();

    // Event listener for screen width changes
    window.addEventListener("resize", checkScreenWidth);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkScreenWidth);
    };
  }, []);

  const socket = useSocket();

  const [recentChats, setRecentChats] = useState<{
    _id: string;
    username: string;
    isOnline: boolean;
    lastMessage: BackendMessage;
    lastMessageTime: string;
    name : string
  }[]>([]);

  const {messages} = useChatStore();

  const handleRecentChats = useCallback(async()=>{
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/messages/recent-chats`,{
        withCredentials : true
      })
      console.log(res.data)
      setRecentChats(res.data)
    } catch (error) {
      console.log(error)
    }
  },[])

  useEffect(()=>{
    handleRecentChats()
  },[messages.length])


  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={(sizes: number[]) => {
        document.cookie = `react-resizable-panels:layout=${JSON.stringify(
          sizes,
        )}`;
      }}
      className="h-full items-stretch"
    >
      <ResizablePanel
        defaultSize={defaultLayout[0]}
        collapsedSize={navCollapsedSize}
        collapsible={true}
        minSize={isMobile ? 0 : 24}
        maxSize={isMobile ? 8 : 30}
        onCollapse={() => {
          setIsCollapsed(true);
          document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
            true,
          )}`;
        }}
        onExpand={() => {
          setIsCollapsed(false);
          document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
            false,
          )}`;
        }}
        className={cn(
          isCollapsed &&
            "min-w-[50px] md:min-w-[70px] transition-all duration-300 ease-in-out",
        )}
      >
        <Sidebar
          isCollapsed={isCollapsed || isMobile}
          chats={recentChats.map((user) => ({
            name: user?.name,
            _id: user._id,
            isOnline: user.isOnline,
            lastMessage: user.lastMessage.content,
            lastMessageTime: user.lastMessageTime,
            username: user.username,
            variant: selectedUser?._id === user._id ? "secondary" : "ghost",
          })) as []}

          isMobile={isMobile}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
        {selectedUser ? <Chat
          socket={socket as Socket}
          messages={selectedUser?.messages!}
          selectedUser={selectedUser}
          isMobile={isMobile}
        /> : <div className="w-full h-full flex flex-col justify-center items-center gap-6">
              <img src="/empty-chat.jpg"  alt="empty-chat" className="w-1/2 mx-auto opacity-90 rounded-full"/>
              <h1 className="text-center text-2xl font-semibold text-gray-500">Select a chat to start messaging</h1>
          </div>}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
