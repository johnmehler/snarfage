import { AuthProvider } from "@/contexts/auth-context"
import ChessGame from "@/components/chess-game"

export default function Home() {
  return (
    <AuthProvider>
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Custom Chess Game</h1>
        <ChessGame />
      </main>
    </AuthProvider>
  )
}

