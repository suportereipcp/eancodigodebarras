"use client"
import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react"
import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Loader2, Search, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Product {
  sku: string
  descricao: string
  codigo_barras: string
}

const ProductRow = memo(
  ({
    product,
    onEdit,
    onDelete,
    isDeleting,
    isSaving,
  }: {
    product: Product
    onEdit: (product: Product) => void
    onDelete: (sku: string) => void
    isDeleting: boolean
    isSaving: boolean
  }) => (
    <tr className="hover:bg-muted/30 transition-colors border-b">
      <td className="p-3 border-r">
        <Badge variant="outline" className="font-mono text-xs">
          {product.sku}
        </Badge>
      </td>
      <td className="p-3 border-r">
        <p className="text-xs text-foreground break-words">{product.descricao}</p>
      </td>
      <td className="p-3 border-r">
        <p className="text-xs font-mono text-foreground break-all">{String(product.codigo_barras)}</p>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-1 justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(product)}
            disabled={isSaving || isDeleting}
            className="h-7 w-7 p-0"
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(product.sku)}
            disabled={isDeleting || isSaving}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
          >
            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          </Button>
        </div>
      </td>
    </tr>
  ),
)

ProductRow.displayName = "ProductRow"

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searching, setSearching] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState({ descricao: "", codigo_barras: "" })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = useMemo(() => createClient(), [])

  const debouncedSearchTerm = useDebounce(searchTerm, 800) // Increased debounce to 800ms

  const searchProducts = useCallback(
    async (searchQuery: string, page = 0) => {
      try {
        if (page === 0) setSearching(true)

        let query = supabase.from("eancodigodebarras_produtos").select("*", { count: "exact" }).order("sku", { ascending: true })

        if (searchQuery.trim()) {
          query = query.ilike("sku", `%${searchQuery.trim()}%`)
        }

        const { data, error, count } = await query.range(page * 200, (page + 1) * 200 - 1) // Reduced batch size to 200

        if (error) throw error

        setTotalCount(count || 0)

        if (page === 0) {
          setProducts(data || [])
        } else {
          setProducts((prev) => [...prev, ...(data || [])])
        }

        setHasMore((data?.length || 0) >= 200 && (page + 1) * 200 < (count || 0))
        setCurrentPage(page)
      } catch (error) {
        console.error("Erro ao buscar produtos:", error)
        setMessage({ type: "error", text: "Erro ao buscar produtos" })
      } finally {
        if (page === 0) setSearching(false)
      }
    },
    [supabase],
  )

  const loadInitialProducts = useCallback(async () => {
    try {
      setLoading(true)
      await searchProducts("", 0)
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
      setMessage({ type: "error", text: "Erro ao carregar produtos" })
    } finally {
      setLoading(false)
    }
  }, [searchProducts])

  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore || searching) return

    try {
      setLoadingMore(true)
      await searchProducts(debouncedSearchTerm, currentPage + 1)
    } catch (error) {
      console.error("Erro ao carregar mais produtos:", error)
    } finally {
      setLoadingMore(false)
    }
  }, [searchProducts, debouncedSearchTerm, currentPage, hasMore, loadingMore, searching])

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget

      if (scrollHeight - scrollTop <= clientHeight * 1.3 && hasMore && !loadingMore && !searching) {
        loadMoreProducts()
      }
    },
    [hasMore, loadingMore, searching, loadMoreProducts],
  )

  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return

    setCurrentPage(0)
    searchProducts(debouncedSearchTerm, 0)
  }, [debouncedSearchTerm, searchProducts, searchTerm])

  useEffect(() => {
    loadInitialProducts()
  }, [loadInitialProducts])

  const clearSearch = useCallback(() => {
    setSearchTerm("")
  }, [])

  const startEdit = useCallback((product: Product) => {
    setEditingProduct(product)
    setEditForm({
      descricao: product.descricao,
      codigo_barras: product.codigo_barras,
    })
    setShowEditDialog(true)
    setMessage(null)
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingProduct(null)
    setEditForm({ descricao: "", codigo_barras: "" })
    setShowEditDialog(false)
  }, [])

  const saveEdit = useCallback(async () => {
    if (!editingProduct) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from("eancodigodebarras_produtos")
        .update({
          descricao: editForm.descricao.trim(),
          codigo_barras: editForm.codigo_barras.trim(),
        })
        .eq("sku", editingProduct.sku)

      if (error) throw error

      setProducts((prev) =>
        prev.map((p) =>
          p.sku === editingProduct.sku
            ? { ...p, descricao: editForm.descricao.trim(), codigo_barras: editForm.codigo_barras.trim() }
            : p,
        ),
      )

      setShowEditDialog(false)
      setEditingProduct(null)
      setMessage({ type: "success", text: "Produto atualizado com sucesso!" })
    } catch (error) {
      console.error("Erro ao salvar:", error)
      setMessage({ type: "error", text: "Erro ao salvar alterações" })
    } finally {
      setSaving(false)
    }
  }, [editingProduct, editForm, supabase])

  const confirmDelete = useCallback((sku: string) => {
    setShowDeleteDialog(sku)
  }, [])

  const deleteProduct = useCallback(
    async (sku: string) => {
      try {
        setDeleting(sku)
        const { error } = await supabase.from("eancodigodebarras_produtos").delete().eq("sku", sku)

        if (error) throw error

        setProducts((prev) => prev.filter((p) => p.sku !== sku))
        setTotalCount((prev) => prev - 1)
        setMessage({ type: "success", text: "Produto excluído com sucesso!" })
        setShowDeleteDialog(null)
      } catch (error) {
        console.error("Erro ao excluir:", error)
        setMessage({ type: "error", text: "Erro ao excluir produto" })
      } finally {
        setDeleting(null)
      }
    },
    [supabase],
  )

  const handleDescricaoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm((prev) => ({ ...prev, descricao: e.target.value }))
  }, [])

  const handleCodigoBarrasChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm((prev) => ({ ...prev, codigo_barras: e.target.value }))
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const isFormValid = useMemo(() => {
    return editForm.descricao.trim() && editForm.codigo_barras.trim()
  }, [editForm.descricao, editForm.codigo_barras])

  const statusText = useMemo(() => {
    if (searchTerm) {
      return `${products.length.toLocaleString()} de ${totalCount.toLocaleString()} produtos encontrados`
    }
    return `${products.length.toLocaleString()} de ${totalCount.toLocaleString()} produtos carregados${hasMore ? " (role para carregar mais)" : ""}`
  }, [products.length, totalCount, searchTerm, hasMore])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#16537E" }} />
          <span className="ml-2 text-sm text-muted-foreground">Carregando produtos...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3 h-full flex flex-col">
      {message && (
        <Alert className={message.type === "error" ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}>
          <AlertDescription className={message.type === "error" ? "text-red-800" : "text-emerald-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Pesquisar por SKU..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10 pr-10 h-9"
          disabled={searching}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
            disabled={searching}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
        {searching && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-3 h-3 animate-spin" style={{ color: "#16537E" }} />
          </div>
        )}
      </div>

      <div className="flex-1 border rounded-md">
        <div ref={scrollRef} className="h-96 overflow-auto" onScroll={handleScroll}>
          <table className="w-full">
            <thead className="bg-muted/95 sticky top-0 z-10 border-b">
              <tr>
                <th className="text-left p-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide border-r">
                  SKU
                </th>
                <th className="text-left p-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide border-r">
                  Descrição
                </th>
                <th className="text-left p-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide border-r">
                  Código de Barras
                </th>
                <th className="text-center p-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && !searching ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground text-sm">
                    {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                  </td>
                </tr>
              ) : (
                <>
                  {products.map((product) => (
                    <ProductRow
                      key={product.sku}
                      product={product}
                      onEdit={startEdit}
                      onDelete={confirmDelete}
                      isDeleting={deleting === product.sku}
                      isSaving={saving}
                    />
                  ))}
                  {loadingMore && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center">
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" style={{ color: "#16537E" }} />
                          <span className="text-xs text-muted-foreground">Carregando mais produtos...</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center py-2 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground">{statusText}</p>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU (não editável)</Label>
              <Input id="sku" value={editingProduct?.sku || ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={editForm.descricao}
                onChange={handleDescricaoChange}
                placeholder="Descrição do produto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo_barras">Código de Barras</Label>
              <Input
                id="codigo_barras"
                value={editForm.codigo_barras}
                onChange={handleCodigoBarrasChange}
                placeholder="Código de barras"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelEdit} disabled={saving}>
              Cancelar
            </Button>
            <Button
              onClick={saveEdit}
              disabled={saving || !isFormValid}
              className="text-white"
              style={{ backgroundColor: "#16537E" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0f3a5f")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#16537E")}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog !== null} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir o produto <strong>{showDeleteDialog}</strong>?
            </p>
            <p className="text-sm text-red-600 mt-2">Esta ação não pode ser desfeita.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)} disabled={deleting !== null}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteDialog && deleteProduct(showDeleteDialog)}
              disabled={deleting !== null}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
