import React, { useState } from "react";
import { createWorker } from "tesseract.js";
import { FileText, Upload, Loader2 } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { api } from "@/lib/api";

function Ocr() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [ocrText, setOcrText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setOcrText("");
    }
  };

  const uploadToIPFS = async () => {
    if (!file) {
      setUploadStatus("Please select a file first");
      return;
    }

    try {
      setUploadStatus("Uploading to IPFS...");
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/api/ipfs/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIpfsHash(response.data.ipfsHash);
      setUploadStatus("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("Error uploading file");
    }
  };

  const performOCR = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const worker = await createWorker("eng");
      const { data } = await worker.recognize(file);
      await worker.terminate();

      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: data.text }),
      });

      if (!response.ok) throw new Error("Failed to get summary");
      const result = await response.json();

      setOcrText(`Original Text:\n\n${result.original_text}\n\nSummary:\n\n${result.summary}\n\nRisk Analysis:\n\nOverall Risk Level: ${result.risk_analysis.overall_risk}\n\nClause Analysis:\n${result.risk_analysis.clause_analysis.map((clause: any) => `Clause ${clause.clause_number}:\nRisk Level: ${clause.risk_level}\nText: ${clause.text}\n`).join('\n')}\n\nLegal Analysis:\n\n${result.legal_analysis.analysis}\n\nReferences:\n\n${result.legal_analysis.cases_referenced.map((legalCase: any) => `• ${legalCase.source} (${legalCase.category}) - PDF: ${legalCase.pdf_path}`).join('\n')}`);
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
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Image to Text OCR</h1>
        </div>

        <div className="bg-white shadow sm:rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Select Document</label>
            <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>

          {fileName && <p className="mb-4 text-sm text-gray-600">Selected file: {fileName}</p>}

          <button onClick={uploadToIPFS} className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Upload to IPFS</button>
          {uploadStatus && <p className="mt-4 text-sm text-gray-600">{uploadStatus}</p>}

          {ipfsHash && (
            <div className="mt-4">
              <p className="text-sm font-semibold">IPFS Hash:</p>
              <p className="text-sm break-all text-gray-600">{ipfsHash}</p>
              <a href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 text-sm">View on IPFS</a>
            </div>
          )}
        </div>

        {previewUrl && <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-lg mt-4" />}

        <button onClick={performOCR} disabled={!file || isProcessing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
          {isProcessing ? (<><Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /> Processing...</>) : "Extract Text"}
        </button>

        {ocrText && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Analysis Results</label>
            <div className="bg-gray-50 rounded-lg p-4">
              <MarkdownRenderer content={ocrText} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Ocr;
