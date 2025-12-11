"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import * as XLSX from "xlsx"

interface ImportResult {
  success: number
  errors: string[]
  total: number
}

export function ExcelImport() {
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = () => {
    // Create a sample Excel template
    const templateData = [
      {
        SKU: "65041",
        Descricao: "CHAPA USADA NA S-408 / S-416 / SC-10408",
        CodigoBarras: "7898912941459",
      },
      {
        SKU: "65107",
        Descricao: "PARAFUSO 3/8 X 3/4 PARA ABRACADEIRA",
        CodigoBarras: "7899143613016",
      },
      {
        SKU: "65109",
        Descricao: "PARAFUSO M-10 X 20 PARA ABRACADEIRA",
        CodigoBarras: "7898902333363",
      },
    ]

    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Produtos")

    // Set column widths
    ws["!cols"] = [
      { width: 15 }, // SKU
      { width: 50 }, // Descricao
      { width: 20 }, // CodigoBarras
    ]

    XLSX.writeFile(wb, "template-produtos.xlsx")
  }

  const processExcelFile = async (file: File) => {
    setImporting(true)
    setResult(null)
    setProgress(0)

    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: "array" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet)

      if (data.length === 0) {
        throw new Error("O arquivo Excel está vazio ou não contém dados válidos.")
      }

      const errors: string[] = []
      const validProducts: any[] = []

      // Validate and process each row
      data.forEach((row: any, index: number) => {
        const rowNumber = index + 2 // Excel row number (accounting for header)

        // Check required fields
        if (!row.SKU || !row.Descricao || !row.CodigoBarras) {
          errors.push(`Linha ${rowNumber}: Campos obrigatórios faltando (SKU, Descricao, CodigoBarras)`)
          return
        }

        // Validate SKU format
        const sku = String(row.SKU).trim()
        if (sku.length === 0) {
          errors.push(`Linha ${rowNumber}: SKU não pode estar vazio`)
          return
        }

        // Validate barcode format
        const codigoBarras = String(row.CodigoBarras).trim()
        if (codigoBarras.length === 0) {
          errors.push(`Linha ${rowNumber}: Código de barras não pode estar vazio`)
          return
        }

        validProducts.push({
          sku: sku,
          descricao: String(row.Descricao).trim(),
          codigo_barras: codigoBarras,
        })
      })

      if (validProducts.length === 0) {
        throw new Error("Nenhum produto válido encontrado no arquivo.")
      }

      // Import products in batches
      const batchSize = 50
      let successCount = 0

      for (let i = 0; i < validProducts.length; i += batchSize) {
        const batch = validProducts.slice(i, i + batchSize)

        try {
          const { error } = await supabase.from("eancodigodebarras_produtos").upsert(batch, {
            onConflict: "sku",
            ignoreDuplicates: false,
          })

          if (error) {
            errors.push(`Erro no lote ${Math.floor(i / batchSize) + 1}: ${error.message}`)
          } else {
            successCount += batch.length
          }
        } catch (batchError) {
          errors.push(`Erro no lote ${Math.floor(i / batchSize) + 1}: ${batchError}`)
        }

        // Update progress
        const currentProgress = Math.min(((i + batchSize) / validProducts.length) * 100, 100)
        setProgress(currentProgress)
      }

      setResult({
        success: successCount,
        errors: errors,
        total: data.length,
      })
    } catch (error) {
      setResult({
        success: 0,
        errors: [error instanceof Error ? error.message : "Erro desconhecido ao processar arquivo"],
        total: 0,
      })
    } finally {
      setImporting(false)
      setProgress(0)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"]

    if (!validTypes.includes(file.type)) {
      setResult({
        success: 0,
        errors: ["Por favor, selecione um arquivo Excel válido (.xlsx ou .xls)"],
        total: 0,
      })
      return
    }

    processExcelFile(file)
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card className="shadow-lg border-0 bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </div>
          Importar Produtos via Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <h4 className="font-medium text-foreground">Precisa de um modelo?</h4>
            <p className="text-sm text-muted-foreground">Baixe o template Excel com o formato correto</p>
          </div>
          <Button variant="outline" onClick={downloadTemplate} className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Baixar Template
          </Button>
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileSelect} className="hidden" />

          <div
            onClick={triggerFileSelect}
            className="border-2 border-dashed border-border hover:border-emerald-500 rounded-lg p-8 text-center cursor-pointer transition-colors group"
          >
            <Upload className="w-12 h-12 text-muted-foreground group-hover:text-emerald-600 mx-auto mb-4 transition-colors" />
            <h3 className="text-lg font-medium text-foreground mb-2">Clique para selecionar arquivo Excel</h3>
            <p className="text-muted-foreground">Formatos suportados: .xlsx, .xls</p>
            <p className="text-sm text-muted-foreground mt-2">Colunas obrigatórias: SKU, Descricao, CodigoBarras</p>
          </div>
        </div>

        {/* Progress */}
        {importing && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span className="text-sm font-medium">Importando produtos...</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {result.success > 0 && (
              <Alert className="border-emerald-200 bg-emerald-50">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800">
                  <strong>Sucesso!</strong> {result.success} produtos importados com sucesso.
                </AlertDescription>
              </Alert>
            )}

            {result.errors.length > 0 && (
              <Alert className="border-destructive/50 bg-destructive/5">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription>
                  <strong>Erros encontrados:</strong>
                  <ul className="mt-2 space-y-1">
                    {result.errors.slice(0, 5).map((error, index) => (
                      <li key={index} className="text-sm">
                        • {error}
                      </li>
                    ))}
                    {result.errors.length > 5 && (
                      <li className="text-sm text-muted-foreground">... e mais {result.errors.length - 5} erros</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-muted-foreground">Total de linhas processadas: {result.total}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
