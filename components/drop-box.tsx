"use client"

import type { ChessPiece, Player, GameState, CapturedPieces } from "@/lib/types"
import ChessPieceComponent from "./chess-piece"
import { Button } from "@/components/ui/button"

interface DropBoxProps {
  currentPlayer: Player
  capturedPieces: CapturedPieces
  onCapturedPieceClick: (piece: ChessPiece) => void
  dropMode: boolean
  onDropModeToggle: () => void
  hasSelfCapturedPieces: boolean
  gameState: GameState
}

export default function DropBox({
  currentPlayer,
  capturedPieces,
  onCapturedPieceClick,
  dropMode,
  onDropModeToggle,
  hasSelfCapturedPieces,
  gameState,
}: DropBoxProps) {
  const renderSelfCapturedPieces = (player: Player) => {
    const key = player === "white" ? "whiteSelf" : "blackSelf"
    const pieces = capturedPieces[key]

    if (pieces.length === 0) return <p className="text-sm text-gray-500">None</p>

    return (
      <div className="flex flex-wrap gap-1">
        {pieces.map((piece, index) => (
          <div
            key={`${piece.type}-${index}`}
            className={`w-8 h-8 border rounded ${currentPlayer === player ? "cursor-pointer hover:bg-gray-200" : ""}`}
            onClick={() => currentPlayer === player && onCapturedPieceClick(piece)}
          >
            <ChessPieceComponent piece={piece} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow">
      <h2 className="text-lg font-bold mb-2 text-center">Drop Box</h2>

      <div className="mb-4">
        <h3 className="font-medium">White's pieces:</h3>
        {renderSelfCapturedPieces("white")}
      </div>

      <div className="mb-4">
        <h3 className="font-medium">Black's pieces:</h3>
        {renderSelfCapturedPieces("black")}
      </div>

      {hasSelfCapturedPieces && gameState === "playing" && (
        <Button
          onClick={onDropModeToggle}
          className={`w-full ${dropMode ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
          size="sm"
        >
          {dropMode ? "Cancel Drop" : "Drop a Piece"}
        </Button>
      )}

      {dropMode && (
        <div className="p-2 bg-green-100 text-green-800 rounded mt-2 text-sm">
          Select a piece, then select a square to place it
        </div>
      )}
    </div>
  )
}

