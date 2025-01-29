"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload, Download, Lock, Unlock } from "lucide-react"

const SteganographyApp = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [message, setMessage] = useState("")
  const [hiddenMessage, setHiddenMessage] = useState("")
  const [imageUploaded, setImageUploaded] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const canvas = canvasRef.current
          if (canvas) {
            const ctx = canvas.getContext("2d")
            canvas.width = img.width
            canvas.height = img.height
            ctx?.drawImage(img, 0, 0)
            setImageUploaded(true)
          }
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const encodeMessage = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        const messageBits = []
        for (let i = 0; i < message.length; i++) {
          const charCode = message.charCodeAt(i)
          messageBits.push(...charCode.toString(2).padStart(8, "0"))
        }
        messageBits.push(..."00000000")

        let bitIndex = 0
        for (let i = 0; i < data.length; i += 4) {
          if (bitIndex < messageBits.length) {
            data[i] = (data[i] & 0xfe) | Number(messageBits[bitIndex++])
          }
        }

        ctx.putImageData(imageData, 0, 0)
        alert("Message encoded successfully!")
      }
    }
  }

  const decodeMessage = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        const messageBits = []
        for (let i = 0; i < data.length; i += 4) {
          messageBits.push(data[i] & 1)
        }

        let message = ""
        for (let i = 0; i < messageBits.length; i += 8) {
          const byte = messageBits.slice(i, i + 8).join("")
          const charCode = Number.parseInt(byte, 2)
          if (charCode === 0) break
          message += String.fromCharCode(charCode)
        }

        setHiddenMessage(message)
      }
    }
  }

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const link = document.createElement("a")
      link.download = "encoded-image.png"
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Steganography Demo</CardTitle>
          <CardDescription className="text-center">Hide secret messages in images using steganography</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <div className="w-full max-w-md aspect-video bg-muted rounded-lg overflow-hidden">
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
            </div>
          </div>

          <Textarea
            placeholder="Enter message to encode"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full"
          />

          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={encodeMessage} disabled={!imageUploaded || !message}>
              <Lock className="mr-2 h-4 w-4" /> Encode Message
            </Button>
            <Button onClick={downloadImage} disabled={!imageUploaded} variant="outline">
              <Download className="mr-2 h-4 w-4" /> Download Encoded Image
            </Button>
            <Button onClick={decodeMessage} disabled={!imageUploaded}>
              <Unlock className="mr-2 h-4 w-4" /> Decode Message
            </Button>
          </div>
        </CardContent>
        {hiddenMessage && (
          <CardFooter>
            <div className="w-full">
              <h3 className="text-lg font-semibold mb-2">Decoded Message:</h3>
              <p className="bg-muted p-4 rounded-md">{hiddenMessage}</p>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

export default SteganographyApp

