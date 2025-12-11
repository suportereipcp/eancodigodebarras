"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, Lock, User, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log("Login successful, redirecting...")
        // Force a hard redirect to ensure cookie is recognized
        window.location.href = "/"
      } else {
        setError(data.error || "Credenciais inválidas")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Erro ao conectar com o servidor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Deep Blue Gradient Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at top, #1e3a5f 0%, #16537E 30%, #0f2a44 70%, #0a1929 100%)
          `,
        }}
      />

      {/* Animated Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large Bokeh Particles */}
        <div className="absolute top-[10%] left-[15%] w-16 h-16 rounded-full bg-white/20 blur-md animate-float-slow opacity-60" />
        <div className="absolute top-[25%] right-[20%] w-12 h-12 rounded-full bg-cyan-200/30 blur-lg animate-float-medium opacity-40" />
        <div className="absolute bottom-[30%] left-[25%] w-20 h-20 rounded-full bg-blue-200/15 blur-xl animate-float-slow-reverse opacity-30" />
        <div className="absolute bottom-[15%] right-[15%] w-14 h-14 rounded-full bg-white/25 blur-md animate-float-medium-reverse opacity-50" />
        <div className="absolute top-[60%] left-[10%] w-10 h-10 rounded-full bg-cyan-300/40 blur-lg animate-float-fast opacity-35" />
        <div className="absolute top-[40%] right-[30%] w-18 h-18 rounded-full bg-blue-100/20 blur-xl animate-float-slow opacity-25" />

        {/* Medium Particles */}
        <div className="absolute top-[20%] left-[40%] w-6 h-6 rounded-full bg-white/40 blur-sm animate-float-medium opacity-70" />
        <div className="absolute top-[70%] right-[40%] w-8 h-8 rounded-full bg-cyan-200/35 blur-md animate-float-fast-reverse opacity-45" />
        <div className="absolute bottom-[40%] left-[60%] w-5 h-5 rounded-full bg-white/50 blur-sm animate-float-slow opacity-60" />
        <div className="absolute top-[35%] left-[70%] w-7 h-7 rounded-full bg-blue-200/30 blur-md animate-float-medium-reverse opacity-40" />
        <div className="absolute bottom-[60%] right-[60%] w-4 h-4 rounded-full bg-cyan-300/45 blur-sm animate-float-fast opacity-55" />

        {/* Small Sharp Particles */}
        <div className="absolute top-[15%] left-[30%] w-2 h-2 rounded-full bg-white/80 animate-twinkle opacity-90" />
        <div className="absolute top-[45%] right-[25%] w-1.5 h-1.5 rounded-full bg-cyan-200/70 animate-twinkle-delay opacity-75" />
        <div className="absolute bottom-[25%] left-[45%] w-2.5 h-2.5 rounded-full bg-white/60 animate-twinkle-slow opacity-80" />
        <div className="absolute top-[80%] right-[50%] w-1 h-1 rounded-full bg-blue-200/90 animate-twinkle opacity-95" />
        <div className="absolute top-[55%] left-[80%] w-2 h-2 rounded-full bg-cyan-300/65 animate-twinkle-delay opacity-70" />
        <div className="absolute bottom-[45%] right-[10%] w-1.5 h-1.5 rounded-full bg-white/75 animate-twinkle-slow opacity-85" />
        <div className="absolute top-[30%] left-[55%] w-1 h-1 rounded-full bg-cyan-200/80 animate-twinkle opacity-90" />
        <div className="absolute bottom-[70%] right-[35%] w-2 h-2 rounded-full bg-white/55 animate-twinkle-delay opacity-65" />

        {/* Tiny Scattered Particles */}
        <div className="absolute top-[12%] left-[20%] w-0.5 h-0.5 rounded-full bg-white/60 animate-twinkle-fast" />
        <div className="absolute top-[38%] right-[45%] w-0.5 h-0.5 rounded-full bg-cyan-200/50 animate-twinkle-fast-delay" />
        <div className="absolute bottom-[22%] left-[35%] w-0.5 h-0.5 rounded-full bg-white/70 animate-twinkle-fast" />
        <div className="absolute top-[65%] right-[20%] w-0.5 h-0.5 rounded-full bg-blue-200/60 animate-twinkle-fast-delay" />
        <div className="absolute top-[50%] left-[15%] w-0.5 h-0.5 rounded-full bg-cyan-300/55 animate-twinkle-fast" />
        <div className="absolute bottom-[35%] right-[55%] w-0.5 h-0.5 rounded-full bg-white/65 animate-twinkle-fast-delay" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div
              className="flex items-center justify-center w-20 h-20 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20"
              style={{
                background: "linear-gradient(135deg, #16537E, #4fc3f7)",
                boxShadow: "0 8px 32px rgba(22, 83, 126, 0.3)",
              }}
            >
              <Package className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Bem-vindo de Volta</h1>
          <p className="text-blue-200 text-lg">Faça seu Login</p>
        </div>

        <Card className="shadow-2xl border-0 backdrop-blur-2xl bg-white/10 border border-white/20 overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5"
            style={{ backdropFilter: "blur(20px)" }}
          />
          <CardHeader className="space-y-1 pb-2 relative z-10"></CardHeader>
          <CardContent className="px-8 pb-8 relative z-10">
            <form onSubmit={handleSubmit} className="h-80 flex flex-col">
              {error && (
                <Alert className="border-red-200/50 bg-red-50/80 backdrop-blur-sm mb-4">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex-1 flex flex-col justify-between">
                <div className="flex-1 flex flex-col justify-center">
                  <Label htmlFor="username" className="text-sm font-semibold text-white mb-2">
                    Usuário
                  </Label>
                  <div className="relative mb-6">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-12 h-14 border-0 bg-white/20 backdrop-blur-sm text-base font-medium text-white placeholder-gray-300 transition-all duration-300 focus:bg-white/30 focus:shadow-lg focus:ring-2 focus:ring-white/30"
                      placeholder="Digite seu usuário"
                      required
                    />
                  </div>

                  <Label htmlFor="password" className="text-sm font-semibold text-white mb-2">
                    Senha
                  </Label>
                  <div className="relative mb-6">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-14 border-0 bg-white/20 backdrop-blur-sm text-base font-medium text-white placeholder-gray-300 transition-all duration-300 focus:bg-white/30 focus:shadow-lg focus:ring-2 focus:ring-white/30"
                      placeholder="Digite sua senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-white font-semibold transition-all duration-300 text-base transform hover:scale-[1.02] hover:shadow-2xl border-0 overflow-hidden relative"
                  style={{
                    background: "linear-gradient(135deg, #16537E, #4fc3f7)",
                    boxShadow: "0 8px 32px rgba(22, 83, 126, 0.3)",
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2 relative z-10">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Entrando...
                    </div>
                  ) : (
                    <span className="relative z-10">Entrar</span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-blue-200 backdrop-blur-sm bg-white/10 rounded-lg py-2 px-4">
          <p className="font-medium">Sistema de Produtos v1.0</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { 
            transform: translateY(0px) translateX(0px);
            opacity: 0.6;
          }
          50% { 
            transform: translateY(-20px) translateX(10px);
            opacity: 0.3;
          }
        }
        
        @keyframes float-slow-reverse {
          0%, 100% { 
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(25px) translateX(-15px);
            opacity: 0.6;
          }
        }
        
        @keyframes float-medium {
          0%, 100% { 
            transform: translateY(0px) translateX(0px);
            opacity: 0.4;
          }
          50% { 
            transform: translateY(-15px) translateX(8px);
            opacity: 0.7;
          }
        }
        
        @keyframes float-medium-reverse {
          0%, 100% { 
            transform: translateY(0px) translateX(0px);
            opacity: 0.5;
          }
          50% { 
            transform: translateY(18px) translateX(-12px);
            opacity: 0.2;
          }
        }
        
        @keyframes float-fast {
          0%, 100% { 
            transform: translateY(0px) translateX(0px);
            opacity: 0.35;
          }
          50% { 
            transform: translateY(-10px) translateX(5px);
            opacity: 0.8;
          }
        }
        
        @keyframes float-fast-reverse {
          0%, 100% { 
            transform: translateY(0px) translateX(0px);
            opacity: 0.45;
          }
          50% { 
            transform: translateY(12px) translateX(-8px);
            opacity: 0.1;
          }
        }
        
        @keyframes twinkle {
          0%, 100% { 
            opacity: 0.9;
            transform: scale(1);
          }
          50% { 
            opacity: 0.3;
            transform: scale(0.8);
          }
        }
        
        @keyframes twinkle-delay {
          0%, 100% { 
            opacity: 0.75;
            transform: scale(1);
          }
          50% { 
            opacity: 0.2;
            transform: scale(1.2);
          }
        }
        
        @keyframes twinkle-slow {
          0%, 100% { 
            opacity: 0.8;
            transform: scale(1);
          }
          50% { 
            opacity: 0.1;
            transform: scale(0.6);
          }
        }
        
        @keyframes twinkle-fast {
          0%, 100% { 
            opacity: 0.6;
            transform: scale(1);
          }
          50% { 
            opacity: 0.9;
            transform: scale(1.5);
          }
        }
        
        @keyframes twinkle-fast-delay {
          0%, 100% { 
            opacity: 0.5;
            transform: scale(1);
          }
          50% { 
            opacity: 0.8;
            transform: scale(0.7);
          }
        }
        
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-slow-reverse { animation: float-slow-reverse 10s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
        .animate-float-medium-reverse { animation: float-medium-reverse 7s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        .animate-float-fast-reverse { animation: float-fast-reverse 5s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-twinkle-delay { animation: twinkle-delay 3s ease-in-out infinite 1s; }
        .animate-twinkle-slow { animation: twinkle-slow 4s ease-in-out infinite; }
        .animate-twinkle-fast { animation: twinkle-fast 2s ease-in-out infinite; }
        .animate-twinkle-fast-delay { animation: twinkle-fast-delay 2s ease-in-out infinite 0.5s; }
      `}</style>
    </div>
  )
}
