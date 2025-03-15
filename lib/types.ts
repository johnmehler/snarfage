export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn"
export type Player = "white" | "black"
export type GameState = "playing" | "check" | "checkmate" | "stalemate" | "draw" | "timeout"

export interface ChessPiece {
  type: PieceType
  player: Player
  hasMoved?: boolean
}

export interface Position {
  row: number
  col: number
}

export interface CapturedPieces {
  // Pieces captured from opponent
  white: ChessPiece[]
  black: ChessPiece[]
  // Self-captured pieces (can be dropped later)
  whiteSelf: ChessPiece[]
  blackSelf: ChessPiece[]
}

