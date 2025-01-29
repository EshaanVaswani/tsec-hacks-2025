import React, { useState } from "react";
import { Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { CopyrightNoticePDF } from "../components/templates/Copyright";

interface FormData {
  requesterName: string;
  copyrightOwner: string;
  workTitle: string;
  workDescription: string;
  infringingMaterial: string;
  infringingDescription: string;
  location: string;
  email: string;
  phoneNumber: string;
  postalAddress: string;
  contactPreference: string;
  fullName: string;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    requesterName: "",
    copyrightOwner: "",
    workTitle: "",
    workDescription: "",
    infringingMaterial: "",
    infringingDescription: "",
    location: "",
    email: "",
    phoneNumber: "",
    postalAddress: "",
    contactPreference: "",
    fullName: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const UnderlinedInput = ({
    name,
    value,
    onChange,
    className = "",
  }: {
    name: keyof FormData;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
  }) => (
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className={`border-b border-gray-400 focus:border-gray-600 focus:outline-none bg-transparent px-1 ${className}`}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Notice of Copyright Infringement:
            </h1>
            <h2 className="text-xl text-gray-700 mt-2">
              Request for Removal of Infringing Material
            </h2>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              I,{" "}
              <textarea
                rows={1}
                name="requesterName"
                value={formData.requesterName}
                onChange={handleInputChange}
                className="w-48 border-b"
              />
              , certify that{" "}
              <textarea
                rows={1}
                name="copyrightOwner"
                value={formData.copyrightOwner}
                onChange={handleInputChange}
                className="w-48 border-b"
              />{" "}
              is the owner of the following work(s):{" "}
              <textarea
                rows={1}
                name="workTitle"
                value={formData.workTitle}
                onChange={handleInputChange}
                className="w-full border-b"
              />
            </p>

            <div>
              <p className="mb-2">Description of Work(s):</p>
              <textarea
                name="workDescription"
                value={formData.workDescription}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded min-h-[100px]"
                placeholder="(If the notice covers multiple works, a representative list of works being infringed)"
              />
            </div>

            <p>
              The material{" "}
              <textarea
                rows={1}
                name="infringingMaterial"
                value={formData.infringingMaterial}
                onChange={handleInputChange}
                className="w-64 border-b"
              />
            </p>

            <div>
              <p className="mb-2">Description of Infringing Material(s):</p>
              <textarea
                rows={1}
                name="infringingDescription"
                value={formData.infringingDescription}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded min-h-[100px]"
              />
            </div>

            <p>
              located at{" "}
              <textarea
                rows={1}
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full border-b"
              />
            </p>

            <p>
              I have a good faith belief that the use of the work(s) described
              above in the material(s) listed here is not authorized by the
              copyright owner, an agent of the copyright owner, or the law.
            </p>

            <p>
              I request that you expeditiously remove or disable access to the
              material identified directly above.
            </p>

            <div>
              <p>You may contact me at:</p>
              <div className="ml-4 space-y-2 mt-2">
                <p>
                  Email:{" "}
                  <textarea
                    rows={1}
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-64 border-b"
                  />
                </p>
                <p>
                  Phone:{" "}
                  <textarea
                    rows={1}
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-64 border-b"
                  />
                </p>
                <div>
                  <p className="mb-1">Postal Address:</p>
                  <textarea
                    name="postalAddress"
                    value={formData.postalAddress}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    rows={3}
                  />
                </div>
                <p>
                  preferably by{" "}
                  <textarea
                    rows={1}
                    name="contactPreference"
                    value={formData.contactPreference}
                    onChange={handleInputChange}
                    className="w-48 border-b"
                  />
                </p>
              </div>
            </div>

            <p className="font-medium">
              Under penalty of perjury, I attest that the information in this
              notification is accurate and that I am, or am authorized to act on
              behalf of, the owner of the rights being infringed by the material
              listed above.
            </p>

            <div className="mt-8 space-y-4">
              <div>
                <p className="mb-1">Full Name:</p>
                <textarea
                  rows={1}
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full border-b"
                />
              </div>
              <p className="text-sm text-gray-500">
                Physical or electronic signature
              </p>
            </div>

            <div className="mt-8">
              <PDFDownloadLink
                document={<CopyrightNoticePDF data={formData} />}
                fileName="copyright-notice.pdf"
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <div className="flex gap-2">
                  <Download />
                  Download
                </div>
              </PDFDownloadLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
