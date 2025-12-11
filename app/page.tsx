"use client"

import { ProductSearch } from "@/components/product-search"
import { AddProduct } from "@/components/add-product"
import { ProductsTable } from "@/components/products-table"
import { ProtectedRoute } from "@/components/protected-route"
import { Package, Search, Plus, Table, LogOut } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export default function Home() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    window.location.href = "/login"
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{ backgroundColor: "#16537E" }}
                >
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground font-sans">Sistema de Produtos</h1>
                  <p className="text-sm text-muted-foreground">Busca rápida por SKU e código de barras</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Bem-vindo, {user?.nome || user?.username}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Navigation Tabs */}
            <Tabs defaultValue="search" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Buscar Produtos
                </TabsTrigger>
                <TabsTrigger value="add" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar Produto
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center gap-2">
                  <Table className="w-4 h-4" />
                  Gerenciar Produtos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-6">
                {/* Search Component */}
                <ProductSearch />
              </TabsContent>

              <TabsContent value="add" className="space-y-6">
                {/* Add Product Component */}
                <AddProduct />
              </TabsContent>

              <TabsContent value="table" className="space-y-6">
                {/* Products Table Component */}
                <ProductsTable />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
