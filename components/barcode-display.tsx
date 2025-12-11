"use client"

import { useEffect, useRef } from "react"
import JsBarcode from "jsbarcode"

interface BarcodeDisplayProps {
  value: string
  width?: number
  height?: number
  displayValue?: boolean
  className?: string
}

export function BarcodeDisplay({
  value,
  width = 2,
  height = 60,
  displayValue = true,
  className = "",
}: BarcodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      try {
        JsBarcode(canvasRef.current, value, {
          format: "CODE128",
          width: width,
          height: height,
          displayValue: displayValue,
          fontSize: 12,
          textMargin: 8,
          background: "#ffffff",
          lineColor: "#000000",
          margin: 10,
        })
      } catch (error) {
        console.error("Error generating barcode:", error)
        // If barcode generation fails, we'll show a fallback
      }
    }
  }, [value, width, height, displayValue])

  if (!value) {
    return (
      <div className="flex items-center justify-center h-20 bg-muted rounded border-2 border-dashed border-muted-foreground/25">
        <span className="text-sm text-muted-foreground">Código inválido</span>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <canvas ref={canvasRef} className="border rounded bg-white shadow-sm" style={{ maxWidth: "100%" }} />
    </div>
  )
}
