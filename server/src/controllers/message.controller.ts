import { TryCatch } from "../lib/TryCatch";
import { Message } from "../models/message.models";
import { User } from "../models/user.models";

export const sendMessage = TryCatch(async (req, res, next) => {
  const { receiver, content, type = "text" } = req.body;

  const message = await Message.create({
    sender: req.user?._id,
    receiver,
    content,
    type,
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
  }).sort({ timestamp: 1 });

  res.status(200).json({ success: true, messages });
});

export const getRecentChats = TryCatch(async (req, res, next) => {
  const userId = (req as any).user?._id; // Current user's ID
  console.log(userId);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // console.log("User ID:", userId);

  // Step 1: Fetch all messages involving the current user
  const messages = await Message.find({
    $or: [{ sender: userId }, { receiver: userId }],
  }).sort({ timestamp: -1 }); // Sort by latest first

  // console.log("Messages fetched:", messages);

  // Step 2: Process messages to extract unique users and latest timestamps
  const chatMap: Record<string, { lastMessageTime: Date }> = {};

  messages.forEach((message) => {
    const otherUser =
      message.sender.toString() === userId
        ? message.receiver.toString()
        : message.sender.toString();

    // Update the map only if this message is more recent
    if (
      !chatMap[otherUser] ||
      chatMap[otherUser].lastMessageTime < message.timestamp
    ) {
      chatMap[otherUser] = { lastMessageTime: message.timestamp };
    }
  });

  const currentUser = await User.findById(userId);

  if (!currentUser) {
    return res.status(404).json({ error: "User not found" });
  }

  // console.log("Chat Map:", chatMap);

  // Step 3: Fetch user details for unique users
  const userIds = Object.keys(chatMap);

  let users;

  if(currentUser.role === "professional") {
    users = await User.find({ _id: { $in: userIds }, role: "user" });
  } else if(currentUser.role === "user") {
    users = await User.find({ _id: { $in: userIds }, role: "professional" });
  }

  // console.log("Users fetched:", users);

  // Step 4: Combine user details with message information
  const formattedChats = users?.map((user) => ({
    id: user._id,
    username: user.username,
    isOnline: user.isOnline,
    lastMessageTime: chatMap[user._id.toString()].lastMessageTime.toISOString(),
  }));

  // Sort the chats by last message time
  formattedChats?.sort(
    (a, b) =>
      new Date(b.lastMessageTime).getTime() -
      new Date(a.lastMessageTime).getTime()
  );

  const final = users?.map((user) => ({
    _id: user._id,
    username: user.username,
    isOnline: user.isOnline,
    name: user.name,
    lastMessageTime: chatMap[user._id.toString()].lastMessageTime.toISOString(),
    lastMessage: messages.find((m) => {
      const otherUser =
        m.sender.toString() === userId
          ? m.receiver.toString()
          : m.sender.toString();
      return otherUser === user._id.toString();
    }),
  }));

  res.status(200).json(final);
});
