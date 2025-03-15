import type { CapturedPieces } from "@/lib/types"
import ChessPieceComponent from "./chess-piece"

interface CapturedPiecesDisplayProps {
  capturedPieces: CapturedPieces
}

export default function CapturedPiecesDisplay({ capturedPieces }: CapturedPiecesDisplayProps) {
  const renderCapturedPieces = (player: "white" | "black") => {
    const pieces = capturedPieces[player]

    if (pieces.length === 0) return <p className="text-sm text-gray-500">None</p>

    return (
      <div className="flex flex-wrap gap-1">
        {pieces.map((piece, index) => (
          <div key={`${piece.type}-${index}`} className="w-8 h-8 border rounded">
            <ChessPieceComponent piece={piece} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-4">
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-lg font-bold mb-2">Black Captured</h2>
        {renderCapturedPieces("black")}
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-2">White Captured</h2>
        {renderCapturedPieces("white")}
      </div>
    </div>
  )
}

