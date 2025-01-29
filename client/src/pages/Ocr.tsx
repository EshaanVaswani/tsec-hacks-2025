import React, { useState } from "react";
import { createWorker } from "tesseract.js";
import { FileText, Upload, Loader2 } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";

function Ocr() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOcrText("");
    }
  };

  const performOCR = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      // First perform OCR
      const worker = await createWorker("eng");
      const { data } = await worker.recognize(selectedFile);
      await worker.terminate();

      // Then send the text for summarization
      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: data.text }),
      });

      if (!response.ok) {
        throw new Error("Failed to get summary");
      }

      const result = await response.json();
      console.log(result);
      setOcrText(
        `Original Text:\n\n${result.original_text}\n\n` +
        `Summary:\n\n${result.summary}\n\n` +
        `Suggestions:\n\n${result.legal_analysis.analysis}\n\n` +
        `References:\n\n${result.legal_analysis.cases_referenced.map((legalCase:any) => 
          `• ${legalCase.source} (${legalCase.category}) - PDF: ${legalCase.pdf_path}`
        ).join('\n')}`
      );
      
      
      
    } catch (error) {
      console.error("Error:", error);
      setOcrText("Error processing image. Please try again.");
    }
    setIsProcessing(false);
  };
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <FileText className="mx-auto h-12 w-12 text-indigo-600" />
          <h1 className="mt-3 text-3xl font-bold text-gray-900">
            Image to Text OCR
          </h1>
          <p className="mt-2 text-gray-600">
            Upload an image and extract text using OCR
          </p>
        </div>

        <div className="bg-white shadow sm:rounded-lg p-6">
          <div className="space-y-6">
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>

            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg shadow-lg"
                />
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={performOCR}
                disabled={!selectedFile || isProcessing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Processing...
                  </>
                ) : (
                  "Extract Text"
                )}
              </button>
            </div>

            {ocrText && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extracted Text
                </label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">
                  <MarkdownRenderer content={ocrText} />
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ocr;

// import React, { useState } from "react";
// import { FileText, Upload, Loader2 } from "lucide-react";

// function Ocr() {
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [ocrText, setOcrText] = useState<string>("");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [previewUrl, setPreviewUrl] = useState<string>("");
//   const [error, setError] = useState<string>("");

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setSelectedFile(file);
//       setPreviewUrl(URL.createObjectURL(file));
//       setOcrText("");
//       setError("");
//     }
//   };

//   const performOCR = async () => {
//     if (!selectedFile) return;

//     setIsProcessing(true);
//     setError("");

//     try {
//       const formData = new FormData();
//       formData.append("image", selectedFile);

//       const response = await fetch("http://localhost:5000/api/ocr", {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Failed to process image");
//       }

//       const data = await response.json();
//       setOcrText(data.text);
//     } catch (error) {
//       console.error("OCR Error:", error);
//       setError(
//         error instanceof Error
//           ? error.message
//           : "Error processing image. Please try again."
//       );
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-3xl mx-auto">
//         <div className="text-center mb-8">
//           <FileText className="mx-auto h-12 w-12 text-indigo-600" />
//           <h1 className="mt-3 text-3xl font-bold text-gray-900">
//             Image to Text OCR
//           </h1>
//           <p className="mt-2 text-gray-600">
//             Upload an image and extract text using EasyOCR
//           </p>
//         </div>

//         <div className="bg-white shadow sm:rounded-lg p-6">
//           <div className="space-y-6">
//             <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
//               <div className="space-y-1 text-center">
//                 <Upload className="mx-auto h-12 w-12 text-gray-400" />
//                 <div className="flex text-sm text-gray-600">
//                   <label
//                     htmlFor="file-upload"
//                     className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
//                   >
//                     <span>Upload a file</span>
//                     <input
//                       id="file-upload"
//                       name="file-upload"
//                       type="file"
//                       className="sr-only"
//                       accept="image/*"
//                       onChange={handleFileChange}
//                     />
//                   </label>
//                   <p className="pl-1">or drag and drop</p>
//                 </div>
//                 <p className="text-xs text-gray-500">
//                   PNG, JPG, GIF up to 10MB
//                 </p>
//               </div>
//             </div>

//             {previewUrl && (
//               <div className="mt-4">
//                 <img
//                   src={previewUrl}
//                   alt="Preview"
//                   className="max-h-64 mx-auto rounded-lg shadow-lg"
//                 />
//               </div>
//             )}

//             <div className="flex justify-center">
//               <button
//                 onClick={performOCR}
//                 disabled={!selectedFile || isProcessing}
//                 className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isProcessing ? (
//                   <>
//                     <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
//                     Processing...
//                   </>
//                 ) : (
//                   "Extract Text"
//                 )}
//               </button>
//             </div>

//             {error && (
//               <div className="mt-4 p-4 bg-red-50 rounded-md">
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             )}

//             {ocrText && (
//               <div className="mt-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Extracted Text
//                 </label>
//                 <div className="bg-gray-50 rounded-lg p-4">
//                   <pre className="whitespace-pre-wrap text-sm text-gray-800">
//                     {ocrText}
//                   </pre>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Ocr;
