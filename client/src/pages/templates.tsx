import React from "react";
import { FileText, ShieldAlert, Copyright } from "lucide-react";
import { useNavigate } from "react-router-dom";

function DocumentCard({
  icon: Icon,
  title,
  description,
  navigation,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  navigation: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center">
      <Icon className="w-12 h-12" style={{ color: "#2563eb" }} />
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h3>
      <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>
      <button
        onClick={() => navigate(navigation)}
        className="bg-[#2563eb] text-white px-8 py-2 rounded-full hover:bg-[#2563eb] transition-colors duration-300"
      >
        Generate
      </button>
    </div>
  );
}

function Templates() {
  const documents = [
    {
      icon: ShieldAlert,
      title: "Non-Disclosure Agreement",
      description:
        "A non-disclosure agreement is a legally binding contract that establishes a confidential relationship.",
      navigate: "/dashboard/templates/nondisclosure",
    },
    {
      icon: FileText,
      title: "Cease and Desist Letter",
      description:
        "The Cease and Desist acts as a formal request that the recipient stop and not continue this behaviour.",
      navigate: "/dashboard/templates/cease",
    },
    {
      icon: Copyright,
      title: "Copyright License Agreement",
      description:
        "A copyright license agreement is a legally enforceable contract that gives a licensee, authorization to use your work for designated purposes, typically in exchange for payment.",
      navigate: "/dashboard/templates/copyright",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span style={{ color: "#2563eb" }}>Hassle-free</span>
            <span className="text-gray-900"> Legal Documents</span>
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
            Looking to register a company or set up a trust fund? Legal शाली
            makes tracking your paper trail both simple and seamless. And that's
            just the beginning. Our services go far beyond registration. Legal
            शाली is here to guide you through a variety of legal structures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {documents.map((doc, index) => (
            <DocumentCard
              key={index}
              icon={doc.icon}
              title={doc.title}
              description={doc.description}
              navigation={doc.navigate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Templates;
