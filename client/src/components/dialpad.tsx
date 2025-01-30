import { useEffect, useRef, useState } from "react";
import { CallInterface } from "./call-interface";
import { Keypad } from "./keypad";
import { GeminiResponse, IVRState } from "@/lib/types";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import * as Tone from "tone";

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
      context: [], // Add conversation history
   });

   const synthRef = useRef<SpeechSynthesis | null>(null);
   const recognitionRef = useRef<SpeechRecognition | null>(null);
   const [voicesLoaded, setVoicesLoaded] = useState(false);
   const intervalRef = useRef<number | null>(null);

   const [isCalling, setIsCalling] = useState(true);
   const [isKeypadOpen, setIsKeypadOpen] = useState(false);
   const [isMuted, setIsMuted] = useState(false);
   const [isSpeakerOn, setIsSpeakerOn] = useState(false);

   // Create audio context and oscillators for DTMF tones
   const audioContextRef = useRef<AudioContext | null>(null);
   const oscillatorsRef = useRef<{ [key: string]: OscillatorNode[] }>({});

   const DTMF_FREQUENCIES: { [key: string]: number[] } = {
      '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
      '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
      '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
      '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
   };

   // Initialize audio context
   useEffect(() => {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      return () => {
         audioContextRef.current?.close();
      };
   }, []);

   // Play DTMF tone
   const playDTMFTone = (key: string, duration: number = 100) => {
      if (!audioContextRef.current) return;

      const frequencies = DTMF_FREQUENCIES[key];
      if (!frequencies) return;

      const oscillators = frequencies.map(freq => {
         const osc = audioContextRef.current!.createOscillator();
         const gainNode = audioContextRef.current!.createGain();
         
         osc.frequency.value = freq;
         gainNode.gain.value = 0.1;
         
         osc.connect(gainNode);
         gainNode.connect(audioContextRef.current!.destination);
         
         osc.start();
         setTimeout(() => {
            gainNode.gain.setValueAtTime(0, audioContextRef.current!.currentTime);
            osc.stop(audioContextRef.current!.currentTime + 0.1);
         }, duration);
         
         return osc;
      });

      oscillatorsRef.current[key] = oscillators;
   };

   // Timer setup
   useEffect(() => {
      if (isCalling) {
         intervalRef.current = window.setInterval(() => {
            setState(prev => ({
               ...prev,
               callDuration: prev.callDuration + 1,
            }));
         }, 1000);
      }

      return () => {
         if (intervalRef.current) {
            clearInterval(intervalRef.current);
         }
      };
   }, [isCalling]);

   // Speech synthesis setup
   useEffect(() => {
      const initializeSpeech = async () => {
         synthRef.current = window.speechSynthesis;

         const checkVoices = () => {
            const voices = synthRef.current?.getVoices() || [];
            if (voices.length > 0) {
               setVoicesLoaded(true);
               return true;
            }
            return false;
         };

         if (!checkVoices()) {
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

      return () => {
         if (synthRef.current?.speaking) {
            synthRef.current.cancel();
         }
      };
   }, []);

   const speak = (text: string) => {
      if (!synthRef.current || isMuted || !voicesLoaded) return;

      if (synthRef.current.speaking) {
         synthRef.current.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = state.language === "en" ? "en-IN" : "hi-IN";
      utterance.rate = 0.9; // Slightly slower for better clarity
      utterance.pitch = 1.1; // Slightly higher pitch for better engagement

      const voices = synthRef.current.getVoices();
      const voice = voices.find(v => v.lang.startsWith(utterance.lang));

      if (voice) {
         utterance.voice = voice;
      }

      utterance.onstart = () => setState(prev => ({ ...prev, isSpeaking: true }));
      utterance.onend = () => setState(prev => ({ ...prev, isSpeaking: false }));

      synthRef.current.speak(utterance);
   };

   const getGeminiResponse = async (input: string, path: string[]): Promise<GeminiResponse> => {
      try {
         // Create a more detailed prompt structure
         const prompt = {
            input,
            context: {
               currentPath: path,
               language: state.language,
               conversationHistory: state.context,
               level: state.currentLevel,
               systemPrompt: `You are Legal Saathi, an expert legal assistant specializing in Indian law. 
                  Your responses should be:
                  1. Concise but informative (2-3 sentences maximum)
                  2. Focused on the specific legal topic at hand
                  3. In ${state.language === 'en' ? 'simple English' : 'simple Hindi'}
                  4. Include clear next steps or options when applicable
                  5. Avoid technical jargon unless absolutely necessary
                  
                  If you don't understand the query or it's outside legal scope, politely ask for clarification.
                  
                  Current navigation path: ${path.join(' > ')}`
            }
         };

         const response = await api.post("/api/gemini", prompt);
         return response.data;
      } catch (error) {
         console.error("Gemini API error:", error);
         const fallbackMsg = state.language === "en" 
            ? "I apologize, but I'm having trouble understanding. Could you please rephrase your question?"
            : "क्षमा करें, मुझे समझने में परेशानी हो रही है। क्या आप अपना प्रश्न दोबारा पूछ सकते हैं?";
         return { text: fallbackMsg };
      }
   };

   const handleInput = async (input: string) => {
      // Play DTMF tone for numerical inputs
      if (/^\d$/.test(input)) {
         playDTMFTone(input);
      }

      const numberInput = input.match(/\d+/)?.[0] || input;
      const newPath = [...state.currentPath, numberInput];

      setState(prev => ({
         ...prev,
         currentPath: newPath,
         currentLevel: prev.currentLevel + 1,
      }));

      const response = await getGeminiResponse(input, newPath);
      
      // Update context with the new interaction
      setState(prev => ({
         ...prev,
         lastResponse: response.text,
         context: [...prev.context, { input, response: response.text }],
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
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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