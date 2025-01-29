import { useState } from "react";
import { api } from "@/lib/api";

export const IpfsUpload = () => {
   const [file, setFile] = useState<File | null>(null);
   const [fileName, setFileName] = useState("");
   const [uploadStatus, setUploadStatus] = useState("");
   const [ipfsHash, setIpfsHash] = useState("");

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         setFile(file);
         setFileName(file.name);
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
            headers: {
               "Content-Type": "multipart/form-data",
            },
         });

         setIpfsHash(response.data.ipfsHash);
         setUploadStatus("File uploaded successfully!");
      } catch (error) {
         console.error("Error uploading file:", error);
         setUploadStatus("Error uploading file");
      }
   };

   return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
         <h2 className="text-xl font-bold mb-4">Upload Legal Document</h2>

         <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
               Select Document
            </label>
            <input
               type="file"
               onChange={handleFileChange}
               className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
            />
         </div>

         {fileName && (
            <p className="mb-4 text-sm text-gray-600">
               Selected file: {fileName}
            </p>
         )}

         <button
            onClick={uploadToIPFS}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
         >
            Upload to IPFS
         </button>

         {uploadStatus && (
            <p className="mt-4 text-sm text-gray-600">{uploadStatus}</p>
         )}

         {ipfsHash && (
            <div className="mt-4">
               <p className="text-sm font-semibold">IPFS Hash:</p>
               <p className="text-sm break-all text-gray-600">{ipfsHash}</p>
               <a
                  href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 text-sm"
               >
                  View on IPFS
               </a>
            </div>
         )}
      </div>
   );
};
