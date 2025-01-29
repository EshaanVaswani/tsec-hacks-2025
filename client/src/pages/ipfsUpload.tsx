import { IpfsUpload } from "@/components/ipfs-upload";

const IPFSUpload = () => {
   return (
      <div className="min-h-screen bg-gray-100 py-6">
         <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-center mb-8">
               Legal Document Management
            </h1>
            <IpfsUpload />
         </div>
      </div>
   );
};

export default IPFSUpload;
