import { useEffect, useState } from "react";
import { Globe2 } from "lucide-react";

declare global {
   interface Window {
      googleTranslateElementInit: () => void;
      google: {
         translate: {
            TranslateElement: any;
            InlineLayout: {
               SIMPLE: any;
            };
         };
      };
   }
}

const GoogleTranslate = () => {
   const [isLoaded, setIsLoaded] = useState(false);

   useEffect(() => {
      // Remove any existing Google Translate elements
      const existingScript = document.getElementById("google-translate-script");
      if (existingScript) {
         existingScript.remove();
      }

      const handleScriptLoad = () => {
         if (window.google && window.google.translate) {
            try {
               new window.google.translate.TranslateElement(
                  {
                     pageLanguage: "en",
                     includedLanguages: "hi,bn,ta,te,mr,gu,kn,ml,pa,ur",
                     layout:
                        window.google.translate.TranslateElement.InlineLayout
                           .SIMPLE,
                     multilanguagePage: true,
                     gaTrack: false,
                  },
                  "google_translate_element"
               );
               setIsLoaded(true);
            } catch (error) {
               console.error("Translation widget initialization error:", error);
            }
         }
      };

      const addScript = () => {
         const script = document.createElement("script");
         script.id = "google-translate-script";
         script.src = "https://translate.google.com/translate_a/element.js";
         script.async = true;
         script.onload = () => {
            setTimeout(() => {
               if (!window.google?.translate) {
                  console.error("Google Translate API not loaded");
                  return;
               }
               handleScriptLoad();
            }, 1000);
         };
         document.body.appendChild(script);
      };

      const style = document.createElement("style");
      style.textContent = `
      .goog-te-banner-frame.skiptranslate {
        display: none !important;
      }
      body {
        top: 0px !important;
      }
      .goog-te-gadget-simple {
        background-color: transparent !important;
        border: none !important;
        padding: 4px 8px !important;
        font-size: 14px !important;
        cursor: pointer;
        display: inline-flex !important;
        align-items: center;
        gap: 8px;
        border-radius: 6px;
        transition: all 0.2s;
      }
      .goog-te-gadget-simple:hover {
        background-color: rgba(0, 0, 0, 0.05) !important;
      }
      .goog-te-gadget-simple span {
        text-decoration: none;
        border: none;
        color: #374151 !important;
      }
      .goog-te-gadget img {
        display: none;
      }
      .goog-te-menu-value {
        display: flex !important;
        align-items: center;
        gap: 4px;
        border: none !important;
      }
      .goog-te-menu-value span:first-child {
        font-weight: 500;
      }
      .goog-te-menu-value span[style*="border-left"] {
        display: none !important;
      }
      .goog-te-menu2 {
        max-width: 100%;
        border-radius: 8px !important;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
      }
      .goog-te-menu2-item div,
      .goog-te-menu2-item:link {
        font-size: 14px;
        padding: 6px 12px;
      }
      .translate-widget {
        position: relative;
        display: flex;
        align-items: center;
        height: 40px;
      }
      #google_translate_element {
        min-width: 160px;
      }
      .goog-te-gadget {
        font-family: inherit !important;
        color: transparent !important;
      }
      .VIpgJd-ZVi9od-l4eHX-hSRGPd > img {
         display: none !important;
      }
      table {
         display: none !important;
      }
    `;
      document.head.appendChild(style);

      window.googleTranslateElementInit = handleScriptLoad;

      addScript();

      return () => {
         const script = document.getElementById("google-translate-script");
         if (script) {
            script.remove();
         }
         if (style.parentNode) {
            style.parentNode.removeChild(style);
         }
      };
   }, []);

   return (
      <div className="translate-widget">
         <Globe2 className="text-gray-500 w-4 h-4 absolute left-2" />
         <div id="google_translate_element" className="translate-element" />
      </div>
   );
};

export default GoogleTranslate;
