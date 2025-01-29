import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, Upload, FileText, Image, FileUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import SummaryDisplay from "./summary-display"
import FilePreview from "./file-preview"

// Dummy data
const dummySummary = [
  {
    summary: "The quick brown fox jumps over the lazy dog.",
    original: [
      "The quick brown fox is known for its agility.",
      "It often jumps over obstacles in its path.",
      "The lazy dog is a common subject in this sentence.",
    ],
  },
  {
    summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    original: [
      "Lorem ipsum is placeholder text commonly used in design.",
      "It doesn't have any real meaning and is used for layout purposes.",
      "The text is derived from Cicero's 'De Finibus Bonorum et Malorum'.",
    ],
  },
]

export default function DocumentSummarizer() {
  const [activeTab, setActiveTab] = useState("text")
  const [inputText, setInputText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [summary, setSummary] = useState(dummySummary)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = () => {
    // In a real application, you would process the input here
    console.log("Processing input:", inputText || file || "voice input")
    // For now, we'll just use the dummy data
    setSummary(dummySummary)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Document Summarizer</h1>
      <Card className="mb-6">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="file">File Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="text">
              <Textarea
                placeholder="Enter your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px] mb-4"
              />
            </TabsContent>
            <TabsContent value="file">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF, TXT, DOC or DOCX (MAX. 10MB)</p>
                  </div>
                  <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.txt,.doc,.docx"
                  />
                </label>
              </div>
              {file && <FilePreview file={file} />}
            </TabsContent>
          </Tabs>
          <Button onClick={handleSubmit} className="w-full mt-4">
            Summarize
          </Button>
        </CardContent>
      </Card>
      <AnimatePresence>
        {summary.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold mb-4">Summary</h2>
            <SummaryDisplay summary={summary} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

