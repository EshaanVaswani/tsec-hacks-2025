import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { Socket } from "socket.io-client";

interface ChatBottombarProps {
  user: {
    _id: string;
  };
  selectedUser: {
    _id: string;
  };
  socket: Socket;
  onSendMessage: (message: string) => void;
}

export default function ChatBottombar({
  user,
  selectedUser,
  socket,
  onSendMessage,
}: ChatBottombarProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Emit 'typing' event when the user starts typing
  useEffect(() => {
    if (message.length > 0 && !isTyping) {
      setIsTyping(true);
      socket.emit("typing", {
        sender: user._id,
        receiver: selectedUser._id,
      });
    }

    if (message.length === 0 && isTyping) {
      setIsTyping(false);
      socket.emit("stopped_typing", {
        sender: user._id,
        receiver: selectedUser._id,
      });
    }

    const typingTimeout = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket.emit("stopped_typing", {
          sender: user._id,
          receiver: selectedUser._id,
        });
      }
    }, 3000); // Stop typing after 3 seconds of inactivity

    return () => clearTimeout(typingTimeout);
  }, [message, isTyping, socket, user._id, selectedUser._id]);

  // Handle message sending
  const handleSendMessage = () => {
    if (message.trim() === "") return;

    // Emit 'stopped_typing' event when the message is sent
    socket.emit("stopped_typing", {
      sender: user._id,
      receiver: selectedUser._id,
    });

    onSendMessage(message.trim());
    setMessage("");
    setIsTyping(false);
  };

  // Handle "Enter" key press to send the message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 border-t border-gray-200 bg-white">
      <Input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1"
      />
      <Button
        variant="ghost"
        onClick={handleSendMessage}
        className="h-10 w-10 flex justify-center items-center"
      >
        <Send size={20} />
      </Button>
    </div>
  );
}
