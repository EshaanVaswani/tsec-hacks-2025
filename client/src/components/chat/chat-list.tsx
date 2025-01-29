import { Message, UserData,  } from "@/data";
import { useRef, useEffect } from "react";
import ChatBottombar from "./chat-bottombar";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
  ChatBubble,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
} from "../ui/chat/chat-bubble";
import { ChatMessageList } from "../ui/chat/chat-message-list";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { Forward, Heart } from "lucide-react";
import { Socket } from "socket.io-client";
import useChatStore from "@/hooks/useChatStore";
import { useAuth } from "@/hooks/useAuth";
import { generateAvatarUrl } from "@/lib/dicebar";

interface ChatListProps {
  selectedUser: UserData;
  isMobile: boolean;
  socket: Socket;
}

const getMessageVariant = (messageName: string, selectedUserName: string) =>
  messageName !== selectedUserName ? "sent" : "received";

export function ChatList({ selectedUser, socket }: ChatListProps) {
  const messagesState = useChatStore((state) => state.messages);
  const setMessagesState = useChatStore((state) => state.setMessages);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();

  // Automatically scroll to the bottom of the chat when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messagesState]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage : any) => {
      // Update state only if the message isn't already in the list
      setMessagesState((state) => {
        const isDuplicate = state.some(
          (message) => message.timestamp === newMessage.timestamp
        );

        const isMe = newMessage.sender === user?._id;

        const updatedMessage : Message = {
          avatar : generateAvatarUrl(isMe ? user?.name! : selectedUser?.name!),
          name : selectedUser?.name!,
          message : newMessage.content,
          timestamp : new Date(newMessage.timestamp).toLocaleDateString(),
          isLoading : false,
          role : newMessage.sender === user?._id ? "receiver" : "sender",
        }

        return isDuplicate ? state : [...state, updatedMessage];
      });
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      // Clean up the listener to prevent re-registering
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, setMessagesState]);

  const sendMessage = (messageContent: string) => {
    const newMessage: Message = {
      name: user?.name || "You", // Replace with the sender's name
      message: messageContent,
      timestamp: new Date().toISOString(),
      avatar: generateAvatarUrl(user?.name!), // Replace with actual avatar URL
      isLoading: false,
    };

    // Emit the message to the backend
    socket.emit("send_message", {
      sender: user?._id, // Replace with actual sender ID
      receiver: selectedUser._id,
      content: messageContent,
    });

    // Update state locally
    setMessagesState((state) => [...state, newMessage]);
  };

  const actionIcons = [
    { icon: DotsVerticalIcon, type: "More" },
    { icon: Forward, type: "Like" },
    { icon: Heart, type: "Share" },
  ];

  return (
    <div className="w-full overflow-y-auto h-full flex flex-col">
      <ChatMessageList ref={messagesContainerRef}>
        <AnimatePresence>
          {messagesState.map((message, index) => {
            const variant = getMessageVariant(message.name, selectedUser.name);
            return (
              <motion.div
                key={message.timestamp || index} // Use timestamp as a unique key if available
                layout
                initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
                transition={{
                  opacity: { duration: 0.1 },
                  layout: {
                    type: "spring",
                    bounce: 0.3,
                    duration: index * 0.05 + 0.2,
                  },
                }}
                style={{ originX: 0.5, originY: 0.5 }}
                className="flex flex-col gap-2 p-4"
              >
                <ChatBubble variant={variant}>
                  <ChatBubbleAvatar src={message.avatar} />
                  <ChatBubbleMessage isLoading={message.isLoading}>
                    {message.message}
                    {message.timestamp && (
                      <ChatBubbleTimestamp timestamp={message.timestamp} />
                    )}
                  </ChatBubbleMessage>
                  <ChatBubbleActionWrapper>
                    {actionIcons.map(({ icon: Icon, type }) => (
                      <ChatBubbleAction
                        className="size-7"
                        key={type}
                        icon={<Icon className="size-4" />}
                        onClick={() =>{}}
                      />
                    ))}
                  </ChatBubbleActionWrapper>
                </ChatBubble>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </ChatMessageList>
      <ChatBottombar
        onSendMessage={sendMessage} // Pass the sendMessage function
        selectedUser={selectedUser}
        socket={socket}
        user={user!}
      />
    </div>
  );
}
