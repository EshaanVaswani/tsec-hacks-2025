import type React from "react"
import { FileText, Files, Plus, AlertTriangle, FileSignature, MapIcon } from "lucide-react"

export default function DocsTools() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Docs Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card
              icon={<FileText className="w-5 h-5 text-white" />}
              link="/dashboard/document-summarizer"
              iconBg="bg-blue-500"
              title="Agreement summary"
              description="Make simpler your document workflows, modify documents, safely eSign documents, and securely store complete papers"
            />

            <Card
              link="/dashboard/templates"
              icon={<FileSignature className="w-5 h-5 text-white" />}
              iconBg="bg-yellow-500"
              title="Form and Application Filling"
              description="Get AI-powered suggestions for filling out complex forms and applications accurately"
            />
            <Card
              link="/dashboard/compare"
              icon={<Files className="w-5 h-5 text-white" />}
              iconBg="bg-orange-500"
              title="Compare agreements"
              description="AI LAW FIRM trusted by law firms and legal teams to compare documents in Redline PDFs and tracked changes."
            />

            <Card
              link="/news"
              icon={<FileText className="w-5 h-5 text-white" />}
              iconBg="bg-indigo-500"
              title="News Summary Card"
              description="Generate concise summary cards for quick overview of complex documents and agreements"
            />
            <Card
              link="/dashboard/law-comparison"
              icon={<Plus className="w-5 h-5 text-white" />}
              iconBg="bg-emerald-500"
              title="Create Contracts"
              description="Build your own contracts and agreements for clients or lawyers with our AI device"
            />
            <Card
              link="/dashboard/risk-identification"
              icon={<AlertTriangle className="w-5 h-5 text-white" />}
              iconBg="bg-red-500"
              title="Risk Identification"
              description="Identify potential risks and liabilities in legal documents using advanced AI analysis"
            />
            <Card
              link="/dashboard/ai/maps"
              icon={<MapIcon className="w-5 h-5 text-white" />}
              iconBg="bg-sky-500"
              title="Search the lawyer"
              description="Find the lawyers for your legal needs with our AI-powered search engine" />

          </div>
        </section>
      </div>
    </div>
  )
}

interface CardProps {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
  link: string
}

function Card({ icon, iconBg, title, description, link }: CardProps) {
  return (
    <a href={link || ""}>
      <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="space-y-4">
          <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>{icon}</div>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </a>
  )
}

