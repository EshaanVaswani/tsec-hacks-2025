// import { useState } from "react";
// import { Button } from "@/components/ui/button";

// export default function DialPad() {
//   const [input, setInput] = useState("");

//   const handleButtonClick = (value) => {
//     console.log(value);
//     setInput((prevInput) => prevInput + value);
//   };

//   const buttons = [
//     { value: "1", letters: "" },
//     { value: "2", letters: "ABC" },
//     { value: "3", letters: "DEF" },
//     { value: "4", letters: "GHI" },
//     { value: "5", letters: "JKL" },
//     { value: "6", letters: "MNO" },
//     { value: "7", letters: "PQRS" },
//     { value: "8", letters: "TUV" },
//     { value: "9", letters: "WXYZ" },
//     { value: "*", letters: "" },
//     { value: "0", letters: "+" },
//     { value: "#", letters: "" },
//   ];

//   return (
//     <div className="flex flex-col items-center min-h-screen bg-gray-950 text-white p-4">
//       <p className="mb-10">Calling...</p>
//       <div className="text-4xl mb-4">{input || ""}</div>
//       <div className="grid grid-cols-3 gap-4 mb-6 rounded-2xl bg-slate-600/10 p-4">
//         {buttons.map((button) => (
//           <Button
//             key={button.value}
//             className="bg-gray-800 text-white p-8 rounded-full focus:outline-none hover:bg-gray-700"
//             onClick={() => handleButtonClick(button.value)}
//           >
//             <div className="text-center">
//               <div className="text-3xl font-bold">{button.value}</div>
//               <div className="text-sm text-gray-400">{button.letters}</div>
//             </div>
//           </Button>
//         ))}
//       </div>
//       <div className="flex gap-4">
//         <Button className="bg-red-600 text-white px-4 py-2 rounded-full">
//           End Call
//         </Button>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from 'react';
import { Phone, Mic, MicOff, Volume2, Volume2 as Volume2Off } from 'lucide-react';

interface IVRState {
  currentLevel: number;
  language: 'en' | 'hi';
  isSpeaking: boolean;
  isListening: boolean;
  message: string;
}

function IVR() {
  const [state, setState] = useState<IVRState>({
    currentLevel: 0,
    language: 'en',
    isSpeaking: false,
    isListening: false,
    message: '',
  });

  const synth = window.speechSynthesis;
  let recognition: SpeechRecognition | null = null;

  if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    recognition = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)();
  }

  const menuOptions = {
    0: {
      en: "Welcome to Legal Assistance System. Press 1 for Family Law, 2 for Criminal Law, 3 for Civil Law, 4 for Property Law",
      hi: "कानूनी सहायता प्रणाली में आपका स्वागत है। पारिवारिक कानून के लिए 1, आपराधिक कानून के लिए 2, नागरिक कानून के लिए 3, संपत्ति कानून के लिए 4 दबाएं"
    },
    1: {
      en: {
        title: "Family Law",
        options: "Press 1 for Divorce, 2 for Child Custody, 3 for Maintenance"
      },
      hi: {
        title: "पारिवारिक कानून",
        options: "तलाक के लिए 1, बच्चों की कस्टडी के लिए 2, रखरखाव के लिए 3 दबाएं"
      }
    },
    2: {
      en: {
        title: "Criminal Law",
        options: "Press 1 for Bail, 2 for Criminal Appeals, 3 for Legal Representation"
      },
      hi: {
        title: "आपराधिक कानून",
        options: "जमानत के लिए 1, आपराधिक अपीलों के लिए 2, कानूनी प्रतिनिधित्व के लिए 3 दबाएं"
      }
    }
  };

  const speak = (text: string) => {
    if (synth.speaking) {
      synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = state.language === 'en' ? 'en-US' : 'hi-IN';
    utterance.onstart = () => setState(prev => ({ ...prev, isSpeaking: true }));
    utterance.onend = () => setState(prev => ({ ...prev, isSpeaking: false }));
    synth.speak(utterance);
  };

  const startListening = () => {
    if (!recognition) return;
    
    recognition.lang = state.language === 'en' ? 'en-US' : 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setState(prev => ({ ...prev, isListening: true }));
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      handleInput(transcript);
    };

    recognition.onend = () => {
      setState(prev => ({ ...prev, isListening: false }));
    };

    recognition.start();
  };

  const handleInput = (input: string) => {
    const numberInput = input.match(/\d+/)?.[0] || input;
    
    setState(prev => ({
      ...prev,
      message: `Selected option: ${numberInput}`,
      currentLevel: prev.currentLevel + 1
    }));

    const nextMessage = menuOptions[state.currentLevel + 1]?.[state.language];
    if (nextMessage) {
      speak(typeof nextMessage === 'string' ? nextMessage : nextMessage.options);
    }
  };

  const handleKeypadPress = (number: number) => {
    handleInput(number.toString());
  };

  useEffect(() => {
    speak(menuOptions[0][state.language]);
  }, [state.language]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-100 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="bg-gray-800 p-6 text-white text-center">
          <Phone className="w-8 h-8 mx-auto mb-2" />
          <h1 className="text-xl font-bold">Legal Assistance IVR</h1>
          <div className="flex justify-center gap-4 mt-4">
            <button onClick={() => setState(prev => ({ ...prev, language: 'en' }))} className={`px-3 py-1 rounded ${state.language === 'en' ? 'bg-blue-500' : 'bg-gray-600'}`}>English</button>
            <button onClick={() => setState(prev => ({ ...prev, language: 'hi' }))} className={`px-3 py-1 rounded ${state.language === 'hi' ? 'bg-blue-500' : 'bg-gray-600'}`}>हिंदी</button>
          </div>
        </div>

        <div className="bg-gray-200 p-4 min-h-[100px] text-center">
          <p className="text-gray-800">{state.message || "Please select an option"}</p>
          <div className="flex justify-center gap-2 mt-2">
            {state.isSpeaking ? <Volume2 className="w-6 h-6 text-blue-500 animate-pulse" /> : <Volume2Off className="w-6 h-6 text-gray-500" />}
            {state.isListening ? <Mic className="w-6 h-6 text-red-500 animate-pulse" /> : <MicOff className="w-6 h-6 text-gray-500" />}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 p-4 bg-white">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((num) => (
            <button key={num} onClick={() => handleKeypadPress(Number(num))} className="aspect-square rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-xl font-semibold transition-colors">{num}</button>
          ))}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <button onClick={startListening} className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2">
            <Mic className="w-5 h-5" /> {state.language === 'en' ? 'Speak Now' : 'बोलिए'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default IVR;
