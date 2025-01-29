"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function LawComparison() {
  const [law1, setLaw1] = useState("")
  const [law2, setLaw2] = useState("")
  const [comparison, setComparison] = useState<string[][]>([])

  useEffect(() => {
    if (law1 && law2) {
      const lines1 = law1.split("\n")
      const lines2 = law2.split("\n")
      const maxLines = Math.max(lines1.length, lines2.length)
      const newComparison = []

      for (let i = 0; i < maxLines; i++) {
        newComparison.push([lines1[i] || "", lines2[i] || ""])
      }

      setComparison(newComparison)
    }
  }, [law1, law2])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Law Comparison Tool</h1>
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Law 1</h2>
          <Textarea
            value={law1}
            onChange={(e) => setLaw1(e.target.value)}
            placeholder="Enter the text of the first law here..."
            className="w-full h-40"
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Law 2</h2>
          <Textarea
            value={law2}
            onChange={(e) => setLaw2(e.target.value)}
            placeholder="Enter the text of the second law here..."
            className="w-full h-40"
          />
        </div>
      </div>
      <Button onClick={() => setComparison([])} className="mb-4">
        Clear Comparison
      </Button>
      <div className="grid md:grid-cols-2 gap-4 border rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-4">
          <h3 className="font-semibold mb-2">Law 1</h3>
          {comparison.map((line, index) => (
            <p key={`law1-${index}`} className={line[0] !== line[1] ? "bg-yellow-200" : ""}>
              {line[0] || "\u00A0"}
            </p>
          ))}
        </div>
        <div className="bg-gray-100 p-4">
          <h3 className="font-semibold mb-2">Law 2</h3>
          {comparison.map((line, index) => (
            <p key={`law2-${index}`} className={line[0] !== line[1] ? "bg-yellow-200" : ""}>
              {line[1] || "\u00A0"}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

