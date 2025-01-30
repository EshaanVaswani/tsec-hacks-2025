import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Speaker, Mic } from "lucide-react";

const categories = [
  { id: 1, label: "Labour Law", hindiLabel: "श्रम कानून" },
  { id: 2, label: "Copyright", hindiLabel: "कॉपीराइट" },
  { id: 3, label: "Real Estate Regulation & Development Act", hindiLabel: "रियल एस्टेट अधिनियम" },
  { id: 4, label: "GDPR", hindiLabel: "जीडीपीआर" },
  { id: 5, label: "Foreign Trade & Customs Act", hindiLabel: "विदेश व्यापार अधिनियम" },
];

const IVRChatbot = () => {
  const [language, setLanguage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Speak welcome message on load
    speak("Welcome! Choose language. Bhasha chuniyai. 1 for English, 2 for Hindi. Ek angrezi ke liye, do hindi ke liye.");
  }, []);

  const speak = (text) => {
    if (!text) return;
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "hindi" ? "hi-IN" : "en-IN";
    utterance.onend = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  const handleLanguageSelection = (lang) => {
    setLanguage(lang);
    const langMessage = lang === "hindi"
      ? "आपने हिंदी चुना है। श्रेणी चुनें।"
      : "You have selected English. Choose a category.";
    speak(langMessage);
  };

  const handleCategorySelection = (category) => {
    setSelectedCategory(category);
    sendRequestToBackend(category);
  };

  const sendRequestToBackend = (category) => {
    const requestData = {
      language,
      category: category.label
    };

    // Dummy backend response simulation
    setTimeout(() => {
      const dummyResponse = language === "hindi"
        ? `आपने ${category.hindiLabel} चुना है। यहाँ डमी सलाह है।`
        : `You selected ${category.label}. Here is a dummy legal advice.`;
      setResponseText(dummyResponse);
      speak(dummyResponse);
    }, 1000);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = language === "hindi" ? "hi-IN" : "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => console.error('Recognition error:', event);
    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      handleSpokenCommand(spokenText);
    };
    recognition.start();
  };

  const handleSpokenCommand = (command) => {
    if (!language) {
      if (command.toLowerCase().includes("english")) handleLanguageSelection("english");
      if (command.toLowerCase().includes("hindi")) handleLanguageSelection("hindi");
    } else {
      const category = categories.find(cat =>
        command.toLowerCase().includes(cat.label.toLowerCase()) ||
        (language === "hindi" && command.includes(cat.hindiLabel))
      );
      if (category) handleCategorySelection(category);
    }
  };

  return (
    <div className="p-4">
      <Card className="max-w-md mx-auto">
        <CardContent>
          <div className="text-center">
            <h1 className="text-xl font-bold mb-4">Legal Advisor IVR Chatbot</h1>
            {responseText && <p className="text-sm mb-4">{responseText}</p>}
            <div className="grid grid-cols-3 gap-2">
              {!language ? (
                [1, 2].map((num) => (
                  <Button key={num} onClick={() => handleLanguageSelection(num === 1 ? "english" : "hindi")}> 
                    {num === 1 ? "English" : "हिंदी"}
                  </Button>
                ))
              ) : (
                categories.map((cat) => (
                  <Button key={cat.id} onClick={() => handleCategorySelection(cat)}>
                    {language === "hindi" ? cat.hindiLabel : cat.label}
                  </Button>
                ))
              )}
              <Button className="col-span-3 bg-gray-200 mt-4" onClick={() => speak(responseText)} disabled={!responseText || isSpeaking}>
                <Speaker className="w-4 h-4 inline-block mr-2" /> Repeat Response
              </Button>
              <Button className="col-span-3 bg-blue-200 mt-4" onClick={startListening} disabled={isListening}>
                <Mic className="w-4 h-4 inline-block mr-2" /> {isListening ? "Listening..." : "Start Listening"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IVRChatbot;
