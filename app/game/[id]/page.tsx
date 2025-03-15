"use client"

import { AuthProvider } from "@/contexts/auth-context"
import ChessGame from "@/components/chess-game"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface GamePageProps {
  params: {
    id: string
  }
}

function GameContent({ gameId }: { gameId: string }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
      </div>
    )
  }

  return <ChessGame gameId={gameId} />
}

export default function GamePage({ params }: GamePageProps) {
  return (
    <AuthProvider>
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Chess Game</h1>
        <GameContent gameId={params.id} />
      </main>
    </AuthProvider>
  )
}

