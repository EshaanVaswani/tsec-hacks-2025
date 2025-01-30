import { useState, useEffect } from "react";
import { Phone, PhoneOff, Volume2, MicOff, Video, Plus, Grid, Bluetooth } from "lucide-react";
import { motion } from "framer-motion";
import * as Tone from "tone";

const Dialer = () => {
  const [input, setInput] = useState("");
  const [calling, setCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const dtmfSynth = new Tone.PolySynth(Tone.Synth).toDestination();
  dtmfSynth.volume.value = -10; // Adjust volume as needed

  const dtmfTones = {
    '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
    '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
    '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
    '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
  };

  useEffect(() => {
    let interval: number;
    if (calling) {
      interval = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [calling]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playDTMFTone = (key: string) => {
    if (dtmfTones[key as keyof typeof dtmfTones]) {
      const [freq1, freq2] = dtmfTones[key as keyof typeof dtmfTones];
      dtmfSynth.triggerAttackRelease([freq1, freq2], "0.1");
    }
  };

  const handleKeyPress = (value: string) => {
    playDTMFTone(value);
    setInput((prev) => prev + value);
  };

  const handleCall = () => {
    if (input) {
      setCalling(true);
      setCallDuration(0);
    }
  };

  const handleEndCall = () => {
    setCalling(false);
    setInput("");
    setCallDuration(0);
  };

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
          <p className="text-lg text-gray-400 mt-2">{formatDuration(callDuration)}</p>
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