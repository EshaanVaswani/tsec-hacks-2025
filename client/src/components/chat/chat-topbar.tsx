import { useState, useEffect } from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Info, Phone, Video } from "lucide-react";
import { Socket } from "socket.io-client";
import { Link } from "react-router-dom";
import { User } from "@/data";

interface ChatTopbarProps {
  selectedUser: User
  socket: Socket;
}

export default function ChatTopbar({ selectedUser, socket }: ChatTopbarProps) {
  const [isTyping, setIsTyping] = useState(false);

  console.log(selectedUser)

  useEffect(() => {
    // Listen for typing events
    socket.on("user_typing", (data) => {
      if (data.userId === selectedUser._id) {
        setIsTyping(true);
      }
    });

    socket.on("user_stopped_typing", (data) => {
      if (data.userId === selectedUser._id) {
        setIsTyping(false);
      }
    });

    // Cleanup listeners on component unmount
    return () => {
      socket.off("user_typing");
      socket.off("user_stopped_typing");
    };
  }, [socket, selectedUser._id]);

  return (
    <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
        </Avatar>
        <div>
          <h3 className="font-bold">{selectedUser.name}</h3>
          <p className="text-sm text-gray-500">
            {isTyping ? "Typing..."  : selectedUser.isOnline ? "Online" : `Last active ${new Date(selectedUser?.lastOnline!).toLocaleTimeString()}`}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {[Phone, Video, Info].map((Icon, idx) => (
          <Link to="#" key={idx}>
            <Icon className="text-gray-600 hover:text-gray-900" />
          </Link>
        ))}
      </div>
    </div>
  );
}
