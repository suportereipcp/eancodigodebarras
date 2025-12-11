"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import * as XLSX from "xlsx"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ImportResult {
  success: number
  errors: string[]
  total: number
}

export function ExcelImportButton() {
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [isHidden, setIsHidden] = useState(false)
  const supabase = createClient()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportResult(null)

    try {
      // Read Excel file
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      // Skip header row and process data
      const rows = jsonData.slice(1) as any[]
      const products = rows
        .filter((row) => row[0] && row[1] && row[2]) // Filter out empty rows
        .map((row) => ({
          sku: String(row[0]).trim(),
          descricao: String(row[1]).trim(),
          codigo_barras: String(row[2]).trim(),
        }))

      if (products.length === 0) {
        throw new Error("Nenhum produto válido encontrado no arquivo")
      }

      // Insert products in batches
      const batchSize = 100
      let successCount = 0
      const errors: string[] = []

      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize)

        const { data, error } = await supabase.from("produtos").upsert(batch, {
          onConflict: "sku",
          ignoreDuplicates: false,
        })

        if (error) {
          errors.push(`Erro no lote ${Math.floor(i / batchSize) + 1}: ${error.message}`)
        } else {
          successCount += batch.length
        }
      }

      setImportResult({
        success: successCount,
        errors,
        total: products.length,
      })

      // Hide button after successful import
      if (successCount > 0) {
        setTimeout(() => setIsHidden(true), 3000)
      }
    } catch (error) {
      setImportResult({
        success: 0,
        errors: [error instanceof Error ? error.message : "Erro desconhecido"],
        total: 0,
      })
    } finally {
      setIsImporting(false)
      // Reset file input
      event.target.value = ""
    }
  }

  if (isHidden) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          disabled={isImporting}
          className="hidden"
          id="excel-upload"
        />
        <label htmlFor="excel-upload">
          <Button asChild disabled={isImporting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <span className="flex items-center gap-2 cursor-pointer">
              {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isImporting ? "Importando..." : "Importar Excel"}
            </span>
          </Button>
        </label>
      </div>

      {importResult && (
        <div className="space-y-2">
          {importResult.success > 0 && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                ✅ {importResult.success} produtos importados com sucesso!
              </AlertDescription>
            </Alert>
          )}

          {importResult.errors.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="space-y-1">
                  <div>❌ Erros encontrados:</div>
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-sm">
                      • {error}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}
