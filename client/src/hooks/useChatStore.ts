// import { User, Message } from "@/data";
import { getUser } from "@/services/user";
import { create } from "zustand";
import {
  User as BackendUser,
  Message as BackendMessage,
  Message,
  User,
} from "@/types";
import { generateAvatarUrl } from "@/lib/dicebar";
import { getMessages } from "@/services/message";

export interface Example {
  name: string;
  url: string;
}

interface State {
  input: string;
  messages: Message[];
  selectedUser: User | null;
  hasInitialResponse: boolean;
}

interface Actions {
  setSelectedUser: (_id: string) => void;
  setInput: (input: string) => void;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  setMessages: (fn: (messages: Message[]) => Message[]) => void;
  setHasInitialResponse: (hasInitialResponse: boolean) => void;
}

const useChatStore = create<State & Actions>()((set) => ({
  selectedUser: null,
  input: "",
  setInput: (input) => set({ input }),
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => set({ input: e.target.value }),
  messages: [],
  setMessages: (fn) => set(({ messages }) => ({ messages: fn(messages) })),
  hasInitialAIResponse: false,
  hasInitialResponse: false,
  setHasInitialResponse: (hasInitialResponse) => set({ hasInitialResponse }),
  setSelectedUser: async (_id: string) => {
    const user = (await getUser(_id)) as BackendUser | null;
    const messages = (await getMessages(_id)) as BackendMessage[] | null;
    console.log(messages);
    set({
      selectedUser: {
        _id: user?._id as string,
        avatar: generateAvatarUrl(user?.name!),
        name: user?.name as string,
        messages: messages
          ? (messages?.map((message) => ({
              avatar: generateAvatarUrl(message.sender?.name!),
              name: message.sender?.name as string,
              message: message.content as string,
              timestamp: message.timestamp as string,
              role: message.sender?._id === user?._id ? "receiver" : "sender",
              isLiked: false,
              isLoading: false,
            })) as Message[])
          : [],
        isOnline: user?.isOnline as boolean,
        lastOnline: user?.lastOnline as string,
      },
    });
  },
}));

export default useChatStore;
