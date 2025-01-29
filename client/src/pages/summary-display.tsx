"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

interface SummaryItem {
  summary: string
  original: string[]
}

interface SummaryDisplayProps {
  summary: SummaryItem[]
}

export default function SummaryDisplay({ summary }: SummaryDisplayProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      {summary.map((item, index) => (
        <Card
          key={index}
          className="cursor-pointer transition-shadow hover:shadow-lg"
          onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
        >
          <CardContent className="p-4">
            <motion.p
              className="font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {item.summary}
            </motion.p>
            <AnimatePresence>
              {expandedIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 text-sm text-gray-600"
                >
                  <h4 className="font-semibold mb-1">Original Text:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {item.original.map((line, lineIndex) => (
                      <motion.li
                        key={lineIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: lineIndex * 0.1 }}
                      >
                        {line}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

