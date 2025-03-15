import type { ChessPiece, PieceType, Player } from "./types"

export type CapturedPieces = {
  white: ChessPiece[]
  black: ChessPiece[]
  whiteSelf: ChessPiece[]
  blackSelf: ChessPiece[]
}

export function initialBoardSetup(): ChessPiece[][] {
  const board: ChessPiece[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null))

  // Set up pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: "pawn", player: "black", hasMoved: false, movedThisTurn: false }
    board[6][col] = { type: "pawn", player: "white", hasMoved: false, movedThisTurn: false }
  }

  // Set up other pieces
  const backRowPieces: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]

  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRowPieces[col], player: "black", hasMoved: false, movedThisTurn: false }
    board[7][col] = { type: backRowPieces[col], player: "white", hasMoved: false, movedThisTurn: false }
  }

  return board
}

export function isValidMove(
  board: ChessPiece[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  currentPlayer: Player,
  piece: ChessPiece,
): boolean {
  if (!piece) return false;

  // Ensure the piece belongs to the current player
  if (piece.player !== currentPlayer) return false;

  // Check if destination is within board bounds
  if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;

  // Get the target piece
  const targetPiece = board[toRow][toCol];

  // Can't capture your own piece (except for rook/queen special ability)
  if (targetPiece && targetPiece.player === currentPlayer && !(piece.type === "rook" || piece.type === "queen")) {
    return false;
  }

  // Delegate to specific piece movement validation
  switch (piece.type) {
    case "pawn":
      return isValidPawnMove(board, fromRow, fromCol, toRow, toCol, currentPlayer, piece);
    case "knight":
      return isValidKnightMove(board, fromRow, fromCol, toRow, toCol);
    case "bishop":
      return isValidBishopMove(board, fromRow, fromCol, toRow, toCol, currentPlayer);
    case "rook":
      return isValidRookMove(board, fromRow, fromCol, toRow, toCol);
    case "queen":
      return isValidBishopMove(board, fromRow, fromCol, toRow, toCol, currentPlayer) ||
             isValidRookMove(board, fromRow, fromCol, toRow, toCol);
    case "king":
      return isValidKingMove(fromRow, fromCol, toRow, toCol);
    default:
      return false;
  }
}

function isValidPawnMove(
  board: ChessPiece[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  currentPlayer: Player,
  piece: ChessPiece,
): boolean {
  const direction = currentPlayer === "white" ? -1 : 1
  const startRow = currentPlayer === "white" ? 6 : 1

  // Regular forward move (1 square)
  if (fromCol === toCol && toRow === fromRow + direction && !board[toRow][toCol]) {
    return true
  }

  // First move can be 2 squares forward
  if (
    fromRow === startRow &&
    fromCol === toCol &&
    toRow === fromRow + 2 * direction &&
    !board[fromRow + direction][fromCol] &&
    !board[toRow][toCol]
  ) {
    return true
  }

  // Regular capture (diagonal)
  if (
    toRow === fromRow + direction &&
    (toCol === fromCol + 1 || toCol === fromCol - 1) &&
    board[toRow][toCol] &&
    board[toRow][toCol].player !== currentPlayer
  ) {
    return true
  }

  // Special rule: Pawns can move diagonally one square on their first turn
  if (
    !piece.hasMoved &&
    toRow === fromRow + direction &&
    (toCol === fromCol + 1 || toCol === fromCol - 1) &&
    !board[toRow][toCol]
  ) {
    return true
  }

  return false
}

function isValidKnightMove(
  board: ChessPiece[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean {
  // Regular knight move (L-shape)
  const knightMove =
    (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 1) ||
    (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 2)

  if (knightMove) {
    return true // Knight jumps over pieces, so no need to check the path
  }

  // Special rule: Knights can also move like a queen, but can't move through pieces
  const queenMove =
    fromRow === toRow || // horizontal
    fromCol === toCol || // vertical
    Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol) // diagonal

  if (queenMove) {
    // Check if path is clear for horizontal movement
    if (fromRow === toRow) {
      const start = Math.min(fromCol, toCol) + 1
      const end = Math.max(fromCol, toCol)

      for (let col = start; col < end; col++) {
        if (board[fromRow][col]) return false
      }
      return true
    }

    // Check if path is clear for vertical movement
    if (fromCol === toCol) {
      const start = Math.min(fromRow, toRow) + 1
      const end = Math.max(fromRow, toRow)

      for (let row = start; row < end; row++) {
        if (board[row][fromCol]) return false
      }
      return true
    }

    // Check if path is clear for diagonal movement
    if (Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) {
      const rowStep = toRow > fromRow ? 1 : -1
      const colStep = toCol > fromCol ? 1 : -1

      let row = fromRow + rowStep
      let col = fromCol + colStep

      while (row !== toRow && col !== toCol) {
        if (board[row][col]) return false
        row += rowStep
        col += colStep
      }
      return true
    }
  }

  return false
}

function isValidBishopMove(
  board: ChessPiece[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  currentPlayer: Player,
): boolean {
  // Regular diagonal move
  const isDiagonal = Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)

  // Special rule: Bishops can move one square adjacent
  const isAdjacent = Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1

  if (!isDiagonal && !isAdjacent) return false

  // For diagonal moves, check if path is clear (except for own pieces - special rule)
  if (isDiagonal && Math.abs(fromRow - toRow) > 1) {
    const rowStep = toRow > fromRow ? 1 : -1
    const colStep = toCol > fromCol ? 1 : -1

    let row = fromRow + rowStep
    let col = fromCol + colStep

    while (row !== toRow && col !== toCol) {
      if (board[row][col] && board[row][col].player !== currentPlayer) {
        return false
      }
      row += rowStep
      col += colStep
    }
  }

  return true
}

function isValidRookMove(
  board: ChessPiece[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
): boolean {
  // Rook moves horizontally or vertically
  if (fromRow !== toRow && fromCol !== toCol) return false

  // Check if path is clear
  if (fromRow === toRow) {
    // Horizontal move
    const start = Math.min(fromCol, toCol) + 1
    const end = Math.max(fromCol, toCol)

    for (let col = start; col < end; col++) {
      if (board[fromRow][col]) return false
    }
  } else {
    // Vertical move
    const start = Math.min(fromRow, toRow) + 1
    const end = Math.max(fromRow, toRow)

    for (let row = start; row < end; row++) {
      if (board[row][fromCol]) return false
    }
  }

  return true
}

function isValidKingMove(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
  // King moves one square in any direction
  // Special rule: Kings can move up to two squares in any direction
  return Math.abs(fromRow - toRow) <= 2 && Math.abs(fromCol - toCol) <= 2
}

function isValidCastling(
  board: ChessPiece[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  piece: ChessPiece
): boolean {
  // Castling conditions:
  // 1. King has not moved
  // 2. Rook has not moved
  // 3. No pieces between king and rook
  // 4. King is not in check (not implemented for simplicity)
  // 5. King does not pass through a square that is attacked (not implemented for simplicity)

  if (piece.hasMoved) return false;
  
  // Must be same row for castling
  if (fromRow !== toRow) return false;
  
  // Kingside castling (moving 2 squares to the right)
  if (toCol === fromCol + 2) {
    // Check if there's a rook in the correct position
    const rook = board[fromRow][7];
    if (!rook || rook.type !== "rook" || rook.player !== piece.player || rook.hasMoved) {
      return false;
    }
    
    // Check if squares between king and rook are empty
    for (let col = fromCol + 1; col < 7; col++) {
      if (board[fromRow][col]) return false;
    }
    
    return true;
  }
  
  // Queenside castling (moving 2 squares to the left)
  if (toCol === fromCol - 2) {
    // Check if there's a rook in the correct position
    const rook = board[fromRow][0];
    if (!rook || rook.type !== "rook" || rook.player !== piece.player || rook.hasMoved) {
      return false;
    }
    
    // Check if squares between king and rook are empty
    for (let col = fromCol - 1; col > 0; col--) {
      if (board[fromRow][col]) return false;
    }
    
    return true;
  }
  
  return false;
}

export function movePiece(
  board: ChessPiece[][],
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  capturedPieces: CapturedPieces,
  currentPlayer: Player,
) {
  const newBoard = board.map((row) => [...row])
  const piece = newBoard[fromRow][fromCol]
  if (!piece) {
    return {
      newBoard: board,
      newCapturedPieces: capturedPieces,
      capturedOwnPiece: false,
      capturedPiece: null,
      isCheckmate: false,
      isStalemate: false,
      kingMoved: false,
      kingHasMovedThisTurn: false
    }
  }

  const targetPiece = newBoard[toRow][toCol]
  
  // Track if king has already moved this turn
  const kingHasMovedThisTurn = piece.type === "king" && piece.movedThisTurn;

  // Mark the piece as moved
  piece.hasMoved = true;
  
  // For kings, track if they've moved this turn
  if (piece.type === "king") {
    // Allow double move if first move was valid
    if (!kingHasMovedThisTurn && Math.abs(toRow - fromRow) <= 2 && Math.abs(toCol - fromCol) <= 2) {
      piece.movedThisTurn = true;
    } else {
      // Reset after second move or invalid move
      piece.movedThisTurn = false;
    }
  }

  // Handle capturing
  const newCapturedPieces = { ...capturedPieces }
  let capturedOwnPiece = false
  let capturedPiece = null

  if (targetPiece) {
    capturedPiece = { ...targetPiece }

    if (targetPiece.player !== currentPlayer) {
      // Capturing opponent's piece
      newCapturedPieces[currentPlayer] = [...newCapturedPieces[currentPlayer], capturedPiece]
    } else if (piece.type === "rook" || piece.type === "queen") {
      // Capturing own piece (rook/queen special ability)
      capturedOwnPiece = true
      const selfCapturedKey = currentPlayer === "white" ? "whiteSelf" : "blackSelf"
      newCapturedPieces[selfCapturedKey] = [...newCapturedPieces[selfCapturedKey], capturedPiece]
    } else {
      // This shouldn't happen, but just in case
      return {
        newBoard: board,
        newCapturedPieces: capturedPieces,
        capturedOwnPiece: false,
        capturedPiece: null,
        isCheckmate: false,
        isStalemate: false,
        kingMoved: false,
        kingHasMovedThisTurn: false
      }
    }
  }

  // Move the piece
  newBoard[toRow][toCol] = piece
  newBoard[fromRow][fromCol] = null

  // Handle castling
  if (piece.type === "king" && !piece.hasMoved) {
    // Kingside castling
    if (toCol === fromCol + 2 && Math.abs(toRow - fromRow) === 0) {
      // Check if rook hasn't moved
      const rook = newBoard[fromRow][7];
      if (rook && rook.type === "rook" && !rook.hasMoved) {
        // Check if path is clear
        if (!newBoard[fromRow][fromCol + 1] && !newBoard[fromRow][fromCol + 2]) {
          // Move the rook
          newBoard[fromRow][fromCol + 1] = { ...rook, hasMoved: true };
          newBoard[fromRow][7] = null;
        }
      }
    }
    // Queenside castling
    else if (toCol === fromCol - 2 && Math.abs(toRow - fromRow) === 0) {
      // Check if rook hasn't moved
      const rook = newBoard[fromRow][0];
      if (rook && rook.type === "rook" && !rook.hasMoved) {
        // Check if path is clear
        if (!newBoard[fromRow][fromCol - 1] && !newBoard[fromRow][fromCol - 2]) {
          // Move the rook
          newBoard[fromRow][fromCol - 1] = { ...rook, hasMoved: true };
          newBoard[fromRow][0] = null;
        }
      }
    }
  }

  // Reset movedThisTurn flag for all pieces of the opponent's color
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (newBoard[row][col] && newBoard[row][col].player !== currentPlayer) {
        newBoard[row][col].movedThisTurn = false;
      }
    }
  }

  // Check for checkmate or stalemate (simplified)
  const isCheckmate = false // Would need proper implementation
  const isStalemate = false // Would need proper implementation

  return {
    newBoard,
    newCapturedPieces,
    capturedOwnPiece,
    capturedPiece,
    isCheckmate,
    isStalemate,
    kingMoved: piece.type === "king",
    kingHasMovedThisTurn
  }
}
