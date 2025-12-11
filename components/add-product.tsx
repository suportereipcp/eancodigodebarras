"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Loader2, CheckCircle, AlertCircle, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"

export function AddProduct() {
  const [formData, setFormData] = useState({
    sku: "",
    descricao: "",
    codigo_barras: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(false)
  }

  const clearField = (field: string) => {
    setFormData((prev) => ({ ...prev, [field]: "" }))
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação básica
    if (!formData.sku.trim() || !formData.descricao.trim() || !formData.codigo_barras.trim()) {
      setError("Todos os campos são obrigatórios")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase.from("produtos").insert([
        {
          sku: formData.sku.trim(),
          descricao: formData.descricao.trim(),
          codigo_barras: formData.codigo_barras.trim(),
        },
      ])

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error("SKU já existe no banco de dados")
        }
        throw insertError
      }

      setSuccess(true)
      setFormData({ sku: "", descricao: "", codigo_barras: "" })

      // Remove success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar produto. Tente novamente.")
      console.error("Insert error:", err)
    } finally {
      setLoading(false)
    }
  }

  const clearForm = () => {
    setFormData({ sku: "", descricao: "", codigo_barras: "" })
    setError(null)
    setSuccess(false)
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Plus className="w-5 h-5" style={{ color: "#16537E" }} />
            Adicionar Novo Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Success Alert */}
          {success && (
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="w-4 h-4" style={{ color: "#16537E" }} />
              <AlertDescription style={{ color: "#16537E" }}>Produto adicionado com sucesso!</AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert className="border-destructive/50 bg-destructive/5">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* SKU Field */}
            <div className="space-y-2">
              <Label htmlFor="sku" className="text-sm font-medium">
                SKU *
              </Label>
              <div className="relative">
                <Input
                  id="sku"
                  type="text"
                  placeholder="Ex: R-477"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  className="h-11 border-border pr-10"
                  style={{ "--tw-ring-color": "#16537E" } as React.CSSProperties}
                  onFocus={(e) => (e.target.style.borderColor = "#16537E")}
                  disabled={loading}
                />
                {formData.sku && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => clearField("sku")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                    disabled={loading}
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </Button>
                )}
              </div>
            </div>

            {/* Descrição Field */}
            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-sm font-medium">
                Descrição *
              </Label>
              <div className="relative">
                <Input
                  id="descricao"
                  type="text"
                  placeholder="Ex: BUCHA BIPARTIDA DO OLHAL DA BARRA"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange("descricao", e.target.value)}
                  className="h-11 border-border pr-10"
                  style={{ "--tw-ring-color": "#16537E" } as React.CSSProperties}
                  onFocus={(e) => (e.target.style.borderColor = "#16537E")}
                  disabled={loading}
                />
                {formData.descricao && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => clearField("descricao")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                    disabled={loading}
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </Button>
                )}
              </div>
            </div>

            {/* Código de Barras Field */}
            <div className="space-y-2">
              <Label htmlFor="codigo_barras" className="text-sm font-medium">
                Código de Barras *
              </Label>
              <div className="relative">
                <Input
                  id="codigo_barras"
                  type="text"
                  placeholder="Ex: 7899143613016"
                  value={formData.codigo_barras}
                  onChange={(e) => handleInputChange("codigo_barras", e.target.value)}
                  className="h-11 border-border font-mono pr-10"
                  style={{ "--tw-ring-color": "#16537E" } as React.CSSProperties}
                  onFocus={(e) => (e.target.style.borderColor = "#16537E")}
                  disabled={loading}
                />
                {formData.codigo_barras && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => clearField("codigo_barras")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                    disabled={loading}
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </Button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 text-white font-medium"
                style={{ backgroundColor: "#16537E" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0f3a5f")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#16537E")}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Produto
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={clearForm}
                disabled={loading}
                className="h-11 px-6 bg-transparent"
              >
                Limpar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
