import { TryCatch } from "../lib/TryCatch";
import { Message } from "../models/message.models";
import { User } from "../models/user.models";
import mongoose from "mongoose";

export const sendMessage = TryCatch(async (req, res, next) => {
  const { receiver, content, type = "text" } = req.body;

  // Validate message type
  if (!["text", "image"].includes(type)) {
    return res.status(400).json({ error: "Invalid message type" });
  }

  const message = await Message.create({
    sender: req.user?._id,
    receiver,
    content,
    type,
    isRead: false,
    timestamp: new Date(),
  });

  res.status(201).json({ success: true, message });
});

export const getMessages = TryCatch(async (req, res, next) => {
  const { receiver } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: req.user?._id, receiver },
      { sender: receiver, receiver: req.user?._id },
    ],
  })
    .select("sender receiver content timestamp isRead type")
    .sort({ timestamp: 1 });

  res.status(200).json({ success: true, messages });
});

export const getRecentChats = TryCatch(async (req, res, next) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Fetch all messages involving the current user
  const messages = await Message.find({
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .select("sender receiver content timestamp isRead type")
    .sort({ timestamp: -1 });

  // Process messages to extract unique users and latest timestamps
  const chatMap: Record<
    string,
    {
      lastMessageTime: Date;
      lastMessage: any;
    }
  > = {};

  messages.forEach((message) => {
    const otherUser =
      message.sender.toString() === userId
        ? message.receiver.toString()
        : message.sender.toString();

    if (
      !chatMap[otherUser] ||
      chatMap[otherUser].lastMessageTime < message.timestamp
    ) {
      chatMap[otherUser] = {
        lastMessageTime: message.timestamp,
        lastMessage: message,
      };
    }
  });

  // Fetch user details for unique users
  const userIds = Object.keys(chatMap);
  const users = await User.find({ _id: { $in: userIds } }).select(
    "avatar username name email phone isVerified"
  );

  // Combine user details with message information
  const final = users.map((user) => ({
    _id: user._id,
    avatar: user.avatar,
    username: user.username,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isVerified: user.isVerified,
    lastMessageTime: chatMap[user._id.toString()].lastMessageTime.toISOString(),
    lastMessage: chatMap[user._id.toString()].lastMessage,
  }));

  // Sort by most recent message
  final.sort(
    (a, b) =>
      new Date(b.lastMessageTime).getTime() -
      new Date(a.lastMessageTime).getTime()
  );

  res.status(200).json(final);
});

// New helper to mark messages as read
export const markMessagesAsRead = TryCatch(async (req, res, next) => {
  const { senderId } = req.params;

  await Message.updateMany(
    {
      sender: senderId,
      receiver: req.user?._id,
      isRead: false,
    },
    {
      $set: { isRead: true },
    }
  );

  res.status(200).json({ success: true });
});
