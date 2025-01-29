import { useState, useEffect } from "react"
import { FileText, Image } from "lucide-react"

interface FilePreviewProps {
  file: File
}

export default function FilePreview({ file }: FilePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }, [file])

  return (
    <div className="mt-4 flex items-center">
      {preview ? (
        <img src={preview || "/placeholder.svg"} alt="File preview" className="w-16 h-16 object-cover rounded" />
      ) : file.type === "application/pdf" ? (
        <FileText className="w-16 h-16 text-red-500" />
      ) : (
        <Image className="w-16 h-16 text-blue-500" />
      )}
      <div className="ml-4">
        <p className="font-medium">{file.name}</p>
        <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
      </div>
    </div>
  )
}

