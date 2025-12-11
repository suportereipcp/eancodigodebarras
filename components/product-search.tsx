"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Package, Loader2, AlertCircle, Maximize2, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BarcodeDisplay } from "@/components/barcode-display"
import { supabase, type Product } from "@/lib/supabase/client"

export function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const clearSearch = () => {
    setSearchTerm("")
    setProducts([])
    setHasSearched(false)
    setError(null)
  }

  const searchProducts = async (term: string) => {
    if (!term.trim()) {
      setProducts([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    setError(null)
    setHasSearched(true)

    try {
      const { data, error } = await supabase
        .from("eancodigodebarras_produtos")
        .select("*")
        .or(`sku.ilike.%${term}%,descricao.ilike.%${term}%,codigo_barras.ilike.%${term}%`)
        .order("sku")

      if (error) throw error

      setProducts(data || [])
    } catch (err) {
      setError("Erro ao buscar produtos. Tente novamente.")
      console.error("Search error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchProducts(searchTerm)
  }

  // Real-time search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchProducts(searchTerm)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card className="shadow-lg border-0 bg-card">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Digite o SKU ou nome do produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 h-12 text-lg border-border"
                style={{ "--tw-ring-color": "#16537E" } as React.CSSProperties}
                onFocus={(e) => (e.target.style.borderColor = "#16537E")}
              />
              {searchTerm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-12 px-6 text-white font-medium"
              style={{ backgroundColor: "#16537E" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0f3a5f")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#16537E")}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buscar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: "#16537E" }} />
            <p className="text-muted-foreground">Carregando resultados...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {!loading && hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground font-sans">Resultados da Busca</h3>
            <Badge variant="secondary" className="text-sm">
              {products.length} {products.length === 1 ? "produto encontrado" : "produtos encontrados"}
            </Badge>
          </div>

          {products.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium text-foreground mb-2">Nenhum produto encontrado</h4>
                <p className="text-muted-foreground">Tente buscar por um SKU ou nome de produto diferente.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card
                  key={product.sku}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  style={{ "--tw-border-opacity": "0.5" } as React.CSSProperties}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#16537E")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors"
                          style={{ backgroundColor: "#e6f2ff" }}
                        >
                          <Package className="w-4 h-4" style={{ color: "#16537E" }} />
                        </div>
                        <Badge variant="outline" className="text-xs font-mono">
                          {product.sku}
                        </Badge>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Código de Barras - {product.sku}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="text-center">
                              <BarcodeDisplay
                                value={product.codigo_barras}
                                width={4}
                                height={120}
                                displayValue={true}
                              />
                            </div>
                            <div className="text-sm text-muted-foreground text-center space-y-2">
                              <p className="font-medium text-lg">{product.descricao}</p>
                              <p className="font-mono text-base">{product.codigo_barras}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <h4 className="font-medium text-foreground mb-3 line-clamp-2">{product.descricao}</h4>

                    <div className="mb-3">
                      <BarcodeDisplay
                        value={product.codigo_barras}
                        width={1.5}
                        height={40}
                        displayValue={false}
                        className="scale-90"
                      />
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="font-medium flex-shrink-0">Código:</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs font-mono break-all">
                          {String(product.codigo_barras)}
                        </code>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
