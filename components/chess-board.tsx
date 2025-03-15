"use client"

import type { ChessPiece, Position, Player } from "@/lib/types"
import ChessPieceComponent from "./chess-piece"
import { isValidMove } from "@/lib/game-logic"

interface ChessBoardProps {
  board: ChessPiece[][]
  selectedPiece: Position | null
  onSquareClick: (row: number, col: number) => void
  currentPlayer: Player
  dropMode: boolean
}

export default function ChessBoard({ board, selectedPiece, onSquareClick, currentPlayer, dropMode }: ChessBoardProps) {
  const getLegalMoves = (row: number, col: number): boolean[][] => {
    const legalMoves: boolean[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(false))
    const piece = board[row][col]

    if (!piece || piece.player !== currentPlayer) return legalMoves

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (isValidMove(board, row, col, i, j, currentPlayer, piece)) {
          legalMoves[i][j] = true
        }
      }
    }

    return legalMoves
  }

  const legalMoves = selectedPiece ? getLegalMoves(selectedPiece.row, selectedPiece.col) : null

  const renderSquare = (row: number, col: number) => {
    const piece = board[row][col]
    const isSelected = selectedPiece?.row === row && selectedPiece?.col === col
    const isLegalMove = legalMoves && legalMoves[row][col]
    const isLight = (row + col) % 2 === 0

    return (
      <div
        key={`${row}-${col}`}
        className={`w-full aspect-square flex items-center justify-center cursor-pointer relative
          ${isLight ? "bg-amber-100" : "bg-amber-800"}
          ${isSelected ? "ring-4 ring-blue-500" : ""}
          ${dropMode && !piece ? "ring-2 ring-green-500" : ""}
        `}
        onClick={() => onSquareClick(row, col)}
      >
        {piece && <ChessPieceComponent piece={piece} />}
        {isLegalMove && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-3 h-3 rounded-full bg-blue-500 opacity-50"></div>
          </div>
        )}
      </div>
    )
  }

  const renderBoardLabels = () => {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"]
    const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"]

    return (
      <>
        {/* Board with rank labels */}
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            <div className="w-6 flex items-center justify-center text-xs font-medium">{ranks[rowIndex]}</div>
            <div className="flex-1 grid grid-cols-8">{row.map((_, colIndex) => renderSquare(rowIndex, colIndex))}</div>
          </div>
        ))}

        {/* File labels (columns) at the bottom */}
        <div className="flex">
          <div className="w-6"></div>
          {files.map((file) => (
            <div key={file} className="w-full text-center text-xs font-medium">
              {file}
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <div className="relative">
      <div className="w-full max-w-md border-2 border-gray-800 rounded overflow-hidden">{renderBoardLabels()}</div>
      <div className="mt-2 text-center font-medium">
        {dropMode ? (
          <p className="text-green-600">Select a square to place your captured piece</p>
        ) : (
          <p>{currentPlayer === "white" ? "White" : "Black"}'s turn</p>
        )}
      </div>
    </div>
  )
}

