"use client"

import { Button } from "@/components/ui/button"
import type { ChessPiece, GameState, Player, CapturedPieces } from "@/lib/types"
import ChessPieceComponent from "./chess-piece"

interface GameControlsProps {
  currentPlayer: Player
  gameState: GameState
  capturedPieces: CapturedPieces
  onReset: () => void
  onCapturedPieceClick: (piece: ChessPiece, isSelfCaptured: boolean) => void
  dropMode: boolean
  onDropModeToggle: () => void
}

export default function GameControls({
  currentPlayer,
  gameState,
  capturedPieces,
  onReset,
  onCapturedPieceClick,
  dropMode,
  onDropModeToggle,
}: GameControlsProps) {
  const renderGameStatus = () => {
    switch (gameState) {
      case "checkmate":
        return (
          <div className="p-3 bg-red-100 text-red-800 rounded mb-4">
            Checkmate! {currentPlayer === "white" ? "Black" : "White"} wins!
          </div>
        )
      case "stalemate":
        return <div className="p-3 bg-yellow-100 text-yellow-800 rounded mb-4">Stalemate! The game is a draw.</div>
      case "timeout":
        return (
          <div className="p-3 bg-red-100 text-red-800 rounded mb-4">
            Time's up! {currentPlayer === "white" ? "Black" : "White"} wins!
          </div>
        )
      case "playing":
      default:
        return null
    }
  }

  const renderCapturedPieces = (player: Player, isSelfCaptured: boolean) => {
    const key = isSelfCaptured ? (player === "white" ? "whiteSelf" : "blackSelf") : player

    const pieces = capturedPieces[key]

    if (pieces.length === 0) return <p className="text-sm text-gray-500">None</p>

    return (
      <div className="flex flex-wrap gap-1">
        {pieces.map((piece, index) => (
          <div
            key={`${piece.type}-${index}`}
            className={`w-8 h-8 border rounded ${
              isSelfCaptured && currentPlayer === player ? "cursor-pointer hover:bg-gray-200" : ""
            }`}
            onClick={() => onCapturedPieceClick(piece, isSelfCaptured)}
          >
            <ChessPieceComponent piece={piece} />
          </div>
        ))}
      </div>
    )
  }

  // Check if current player has self-captured pieces
  const hasSelfCapturedPieces =
    currentPlayer === "white" ? capturedPieces.whiteSelf.length > 0 : capturedPieces.blackSelf.length > 0

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {renderGameStatus()}

      <div className="mb-4">
        <h2 className="text-lg font-bold mb-2">Current Turn</h2>
        <div className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full ${
              currentPlayer === "white" ? "bg-white border border-black" : "bg-gray-700"
            }`}
          ></div>
          <p>{currentPlayer === "white" ? "White" : "Black"}</p>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-bold mb-2">Captured Opponent Pieces</h2>

        <div className="mb-2">
          <h3 className="font-medium">White captured:</h3>
          {renderCapturedPieces("white", false)}
        </div>

        <div>
          <h3 className="font-medium">Black captured:</h3>
          {renderCapturedPieces("black", false)}
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-bold mb-2">Self-Captured Pieces</h2>

        <div className="mb-2">
          <h3 className="font-medium">White self-captured:</h3>
          {renderCapturedPieces("white", true)}
        </div>

        <div className="mb-2">
          <h3 className="font-medium">Black self-captured:</h3>
          {renderCapturedPieces("black", true)}
        </div>

        {hasSelfCapturedPieces && gameState === "playing" && (
          <Button
            onClick={onDropModeToggle}
            className={`mt-2 ${dropMode ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
            size="sm"
          >
            {dropMode ? "Cancel Drop" : "Drop a Captured Piece"}
          </Button>
        )}
      </div>

      {dropMode && (
        <div className="p-2 bg-green-100 text-green-800 rounded mb-4">
          Select a self-captured piece, then select a square to place it
        </div>
      )}

      <div className="mt-4">
        <Button onClick={onReset} className="w-full">
          Reset Game
        </Button>
      </div>

      <div className="mt-6 text-sm">
        <h3 className="font-bold mb-1">Special Rules:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Pawns can move diagonally one square on their first turn</li>
          <li>Knights can move like a knight OR a queen</li>
          <li>Bishops can move one square adjacent and through their own pieces</li>
          <li>Rooks can capture your own pieces (except king) and drop them later</li>
          <li>Queens have the additional powers of bishops and rooks</li>
        </ul>
      </div>
    </div>
  )
}

