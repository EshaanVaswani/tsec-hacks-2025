
import React, { useState } from "react";
import { Phone, PhoneOff, Volume2, MicOff, Video, Plus, Grid, Bluetooth } from "lucide-react";
import { motion } from "framer-motion";

const Dialer = () => {
  const [input, setInput] = useState("");
  const [calling, setCalling] = useState(false);

  const keys = [
    { label: "1", sub: "" },
    { label: "2", sub: "ABC" },
    { label: "3", sub: "DEF" },
    { label: "4", sub: "GHI" },
    { label: "5", sub: "JKL" },
    { label: "6", sub: "MNO" },
    { label: "7", sub: "PQRS" },
    { label: "8", sub: "TUV" },
    { label: "9", sub: "WXYZ" },
    { label: "*", sub: "" },
    { label: "0", sub: "+" },
    { label: "#", sub: "" },
  ];

  interface Key {
    label: string;
    sub: string;
  }

  const handleKeyPress = (value: string) => {
    setInput((prev: string) => prev + value);
  };

  const handleCall = () => {
    if (input) setCalling(true);
  };

  const handleEndCall = () => {
    setCalling(false);
    setInput("");
  };

  return (
    <div className="h-screen flex flex-col justify-end items-center bg-black text-white p-4">
      {!calling ? (
        <>
          <div className="text-3xl font-semibold mb-4">{input}</div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {keys.map((key, index) => (
              <button
                key={index}
                onClick={() => handleKeyPress(key.label)}
                className="flex flex-col items-center justify-center text-3xl font-semibold w-20 h-20 rounded-full border border-gray-500"
              >
                {key.label}
                <span className="text-sm text-gray-400">{key.sub}</span>
              </button>
            ))}
          </div>
          <button
            onClick={handleCall}
            className="bg-green-500 w-16 h-16 flex items-center justify-center rounded-full"
          >
            <Phone className="text-white text-2xl" />
          </button>
          {/* <div className="flex justify-between w-64 mt-4 text-gray-400">
            <span className="border-b-2 border-white">Keypad</span>
            <span>Recents</span>
            <span>Contacts</span>
          </div> */}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="flex flex-col items-center w-full h-full justify-center bg-black"
        >
          <p className="text-lg text-gray-400">Calling...</p>
          <h2 className="text-3xl font-bold mt-2">{input}</h2>
          <div className="mt-12 grid grid-cols-3 gap-6 p-4 bg-gray-800 rounded-2xl">
            <button className="flex flex-col items-center text-white">
              <Plus size={24} />
              <span className="text-sm">Add call</span>
            </button>
            <button className="flex flex-col items-center text-gray-500">
              <Video size={24} />
              <span className="text-sm">Video call</span>
            </button>
            <button className="flex flex-col items-center text-white">
              <Bluetooth size={24} />
              <span className="text-sm">Bluetooth</span>
            </button>
            <button className="flex flex-col items-center text-white">
              <Volume2 size={24} />
              <span className="text-sm">Speaker</span>
            </button>
            <button className="flex flex-col items-center text-white">
              <MicOff size={24} />
              <span className="text-sm">Mute</span>
            </button>
            <button className="flex flex-col items-center text-white">
              <Grid size={24} />
              <span className="text-sm">Keypad</span>
            </button>
          </div>
          <button
            onClick={handleEndCall}
            className="bg-red-500 w-16 h-16 flex items-center justify-center rounded-full mt-6"
          >
            <PhoneOff className="text-white text-2xl" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Dialer;
