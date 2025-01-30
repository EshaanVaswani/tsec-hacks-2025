import { useEffect, useRef, useState } from "react";
import { CallInterface } from "./call-interface";
import { Keypad } from "./keypad";
import { GeminiResponse, IVRState } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

function IVR() {
   const navigate = useNavigate();
   const [state, setState] = useState<IVRState>({
      currentLevel: 0,
      language: "en",
      isSpeaking: false,
      isListening: false,
      message: "",
      callDuration: 0,
      currentPath: [],
      lastResponse: "",
   });

   const synthRef = useRef<SpeechSynthesis | null>(null);
   const recognitionRef = useRef<SpeechRecognition | null>(null);
   const [voicesLoaded, setVoicesLoaded] = useState(false);

   const [isCalling, setIsCalling] = useState(true);
   const [isKeypadOpen, setIsKeypadOpen] = useState(false);
   const [isMuted, setIsMuted] = useState(false);
   const [isSpeakerOn, setIsSpeakerOn] = useState(false);

   // Initialize speech synthesis
   useEffect(() => {
      const initializeSpeech = async () => {
         synthRef.current = window.speechSynthesis;

         // Function to check if voices are available
         const checkVoices = () => {
            const voices = synthRef.current?.getVoices() || [];
            if (voices.length > 0) {
               setVoicesLoaded(true);
               return true;
            }
            return false;
         };

         // Initial check for voices
         if (!checkVoices()) {
            // If voices aren't available immediately, set up an event listener
            return new Promise<void>((resolve) => {
               if (synthRef.current) {
                  synthRef.current.onvoiceschanged = () => {
                     if (checkVoices()) {
                        resolve();
                     }
                  };
               }
            });
         }
      };

      initializeSpeech();

      // Initialize speech recognition
      if (
         "SpeechRecognition" in window ||
         "webkitSpeechRecognition" in window
      ) {
         recognitionRef.current = new ((window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition)();
      }

      return () => {
         if (synthRef.current?.speaking) {
            synthRef.current.cancel();
         }
         if (recognitionRef.current) {
            recognitionRef.current.abort();
         }
      };
   }, []);

   const speak = (text: string) => {
      if (!synthRef.current || isMuted || !voicesLoaded) return;

      if (synthRef.current.speaking) {
         synthRef.current.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = state.language === "en" ? "en-US" : "hi-IN";

      const voices = synthRef.current.getVoices();
      const voice = voices.find((v) => v.lang.startsWith(utterance.lang));

      if (voice) {
         utterance.voice = voice;
      }

      utterance.onstart = () =>
         setState((prev) => ({ ...prev, isSpeaking: true }));
      utterance.onend = () =>
         setState((prev) => ({ ...prev, isSpeaking: false }));

      synthRef.current.speak(utterance);
   };

   // Welcome message effect
   useEffect(() => {
      if (!voicesLoaded) return;

      const welcomeMessage =
         state.language === "en"
            ? "Welcome to Legal Saathi. How can I help you today?"
            : "कानूनी साथी में आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूं?";

      // Add a small delay to ensure smooth initialization
      const timer = setTimeout(() => {
         speak(welcomeMessage);
      }, 500);

      return () => clearTimeout(timer);
   }, [voicesLoaded, state.language]);

   const getGeminiResponse = async (
      input: string,
      path: string[]
   ): Promise<GeminiResponse> => {
      try {
         const response = await api.post("/api/gemini", {
            input,
            context: {
               currentPath: path,
               language: state.language,
            },
         });
         console.log(response);

         return response.data;
      } catch (error) {
         console.error("Gemini API error:", error);
         return {
            text: "I apologize, but I'm having trouble processing your request. Please try again.",
         };
      }
   };

   const handleInput = async (input: string) => {
      const numberInput = input.match(/\d+/)?.[0] || input;
      const newPath = [...state.currentPath, numberInput];

      setState((prev) => ({
         ...prev,
         currentPath: newPath,
         currentLevel: prev.currentLevel + 1,
      }));

      const response = await getGeminiResponse(input, newPath);
      setState((prev) => ({
         ...prev,
         lastResponse: response.text,
      }));

      speak(response.text);
   };

   const handleKeypadPress = (number: string) => {
      handleInput(number);
      setIsKeypadOpen(false);
   };

   const handleEndCall = () => {
      synthRef.current?.cancel();
      if (recognitionRef.current) {
         recognitionRef.current.stop();
      }
      setIsCalling(false);
      navigate("/");
   };

   const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs
         .toString()
         .padStart(2, "0")}`;
   };

   return (
      <div className="min-h-screen bg-black">
         {isCalling && (
            <CallInterface
               callerName="Legal Saathi"
               onKeypadOpen={() => setIsKeypadOpen(true)}
               isMuted={isMuted}
               setIsMuted={setIsMuted}
               isSpeaker={isSpeakerOn}
               setIsSpeaker={setIsSpeakerOn}
               onEndCall={handleEndCall}
               duration={formatDuration(state.callDuration)}
            />
         )}
         {isKeypadOpen && (
            <Keypad
               onClose={() => setIsKeypadOpen(false)}
               onKeyPress={handleKeypadPress}
            />
         )}
      </div>
   );
}

export default IVR;
