import axios from "axios";

export const getMessages = async (receiver_id: string) => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/messages/m/${receiver_id}`,
      {
        withCredentials: true,
      }
    );
    return res.data.messages;
  } catch (error) {
    console.log(error);
    return null;
  }
};
