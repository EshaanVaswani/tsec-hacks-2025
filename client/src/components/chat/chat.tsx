import { Message, User,  } from "@/data";
import ChatTopbar from "./chat-topbar";
import { ChatList } from "./chat-list";
import useChatStore from "@/hooks/useChatStore";
import { Socket } from "socket.io-client";
import { useEffect } from "react";
import axios from "axios";
import { generateAvatarUrl } from "@/lib/dicebar";
import { Message as BackendMessage } from '@/types'
import { useAuth } from "@/hooks/useAuth";

interface ChatProps {
  selectedUser: User;
  isMobile: boolean;
  socket: Socket;
  messages: Message[];
}

export function Chat({ selectedUser, isMobile, socket }: ChatProps) {

  const {user} = useAuth();
  // Initial fetch or store subscription for messages

  useEffect(() => {
    // Perform any initialization for fetching messages from backend
    // This is a placeholder for actual API calls
    const fetchMessages = async () => {
      const response = await axios(`${import.meta.env.VITE_BACKEND_URL}/api/messages/m/${selectedUser._id}`,{
        withCredentials: true,
      });

      const messages : BackendMessage[]  = response.data.messages;
      const data:Message[] = messages.map((message)=>{
        return({
        name: user?._id === message.sender ? user?.name! : selectedUser.name,
        message: message.content as string,
        timestamp:new Date(message.timestamp).toLocaleTimeString() as string,
        avatar: generateAvatarUrl(message.sender === user?._id ? user?.name! : selectedUser.name),
        isLoading: false,
        role: message.sender?._id === selectedUser._id ? "sender" : "receiver",
      })})
      useChatStore.setState({ messages: data });
    };

    fetchMessages();
  }, [selectedUser]);

  return (
    <div className="flex flex-col justify-between w-full h-full">
      <ChatTopbar socket={socket}   selectedUser={selectedUser} />
      <ChatList
        selectedUser={selectedUser}
        isMobile={isMobile}
        socket={socket}
      />
    </div>
  );
}
