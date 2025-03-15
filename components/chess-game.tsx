"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { saveGame, loadGame } from "@/lib/game-service"
import ChessBoard from "./chess-board"
import ChessClock from "./chess-clock"
import DropBox from "./drop-box"
import CapturedPiecesDisplay from "./captured-pieces-display"
import type { ChessPiece, Position, Player, GameState, CapturedPieces } from "@/lib/types"
import { initialBoardSetup, isValidMove, movePiece } from "@/lib/game-logic"
import { Button } from "@/components/ui/button"
import { Save, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ChessGameProps {
  gameId?: string
}

export default function ChessGame({ gameId }: ChessGameProps) {
  const { user } = useAuth()
  const router = useRouter()

  const [board, setBoard] = useState<ChessPiece[][]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player>("white")
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null)
  const [capturedPieces, setCapturedPieces] = useState<CapturedPieces>({
    white: [],
    black: [],
    whiteSelf: [],
    blackSelf: [],
  })
  const [gameState, setGameState] = useState<GameState>("playing")
  const [dropMode, setDropMode] = useState<boolean>(false)
  const [pieceToPlace, setPieceToPlace] = useState<ChessPiece | null>(null)

  // Clock state
  const [clockRunning, setClockRunning] = useState<boolean>(false)
  const [hasGameStarted, setHasGameStarted] = useState<boolean>(false)
  const [whiteTimeLeft, setWhiteTimeLeft] = useState<number>(10 * 60 * 1000) // 10 minutes
  const [blackTimeLeft, setBlackTimeLeft] = useState<number>(10 * 60 * 1000) // 10 minutes

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  useEffect(() => {
    if (gameId) {
      loadGameData(gameId)
    } else {
      resetGame()
    }
  }, [gameId])

  const loadGameData = async (id: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to load a game",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await loadGame(id)

      if (error) {
        toast({
          title: "Error Loading Game",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      if (data) {
        // Parse the board state and captured pieces
        const boardState = JSON.parse(data.board_state)
        const capturedPiecesState = JSON.parse(data.captured_pieces)

        setBoard(boardState)
        setCurrentPlayer(data.current_player)
        setCapturedPieces(capturedPiecesState)
        setWhiteTimeLeft(data.white_time_left)
        setBlackTimeLeft(data.black_time_left)
        setGameState(data.game_state as GameState)
        setHasGameStarted(true)

        // Don't start the clock automatically for loaded games
        setClockRunning(false)
      }
    } catch (err: any) {
      toast({
        title: "Error Loading Game",
        description: err.message || "An error occurred while loading the game",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveGame = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save a game",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const { data, error } = await saveGame(
        user.id,
        board,
        currentPlayer,
        capturedPieces,
        whiteTimeLeft,
        blackTimeLeft,
        gameState,
        gameId,
      )

      if (error) {
        toast({
          title: "Error Saving Game",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Game Saved",
        description: "Your game has been saved successfully",
      })

      // If this is a new game, update the URL
      if (!gameId && data?.id) {
        router.push(`/game/${data.id}`)
      }
    } catch (err: any) {
      toast({
        title: "Error Saving Game",
        description: err.message || "An error occurred while saving the game",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const resetGame = () => {
    setBoard(initialBoardSetup())
    setCurrentPlayer("white")
    setSelectedPiece(null)
    setCapturedPieces({ white: [], black: [], whiteSelf: [], blackSelf: [] })
    setGameState("playing")
    setDropMode(false)
    setPieceToPlace(null)
    setClockRunning(false)
    setHasGameStarted(false)
    setWhiteTimeLeft(10 * 60 * 1000)
    setBlackTimeLeft(10 * 60 * 1000)
  }

  const handleSquareClick = (row: number, col: number) => {
    if (gameState !== "playing") return

    // If in drop mode, handle placing a captured piece
    if (dropMode && pieceToPlace) {
      if (!board[row][col]) {
        const newBoard = [...board]
        newBoard[row][col] = { ...pieceToPlace }
        setBoard(newBoard)

        // Remove the piece from self-captured pieces
        const newCapturedPieces = { ...capturedPieces }
        const selfCapturedKey = currentPlayer === "white" ? "whiteSelf" : "blackSelf"
        const index = newCapturedPieces[selfCapturedKey].findIndex((p) => p.type === pieceToPlace.type)
        if (index !== -1) {
          newCapturedPieces[selfCapturedKey].splice(index, 1)
        }
        setCapturedPieces(newCapturedPieces)

        // End drop mode and switch players
        setDropMode(false)
        setPieceToPlace(null)
        setCurrentPlayer(currentPlayer === "white" ? "black" : "white")
        return
      }
      return
    }

    const clickedPiece = board[row][col]

    // If no piece is selected, select a piece if it belongs to the current player
    if (!selectedPiece) {
      if (clickedPiece && clickedPiece.player === currentPlayer) {
        setSelectedPiece({ row, col })
      }
      return
    }

    // If a piece is already selected
    const fromRow = selectedPiece.row
    const fromCol = selectedPiece.col
    const selectedPieceObj = board[fromRow][fromCol]

    // Check if the move is valid according to our custom rules
    if (isValidMove(board, fromRow, fromCol, row, col, currentPlayer, selectedPieceObj)) {
      // This is a valid move, process it
      const result = movePiece(board, fromRow, fromCol, row, col, capturedPieces, currentPlayer)

      setBoard(result.newBoard)
      setCapturedPieces(result.newCapturedPieces)

      // Start the clock after white's first move
      if (currentPlayer === "white" && !hasGameStarted) {
        setHasGameStarted(true)
        setClockRunning(true)
      }

      // Switch players after any move (no immediate drop)
      setCurrentPlayer(currentPlayer === "white" ? "black" : "white")

      // Check for checkmate or other game states
      if (result.isCheckmate) {
        setGameState("checkmate")
        setClockRunning(false)
      } else if (result.isStalemate) {
        setGameState("stalemate")
        setClockRunning(false)
      }

      setSelectedPiece(null)
      return
    }

    // If we get here, either the move was invalid or we're selecting a new piece
    // If clicking on another piece of the same player, select that piece instead
    if (clickedPiece && clickedPiece.player === currentPlayer) {
      setSelectedPiece({ row, col })
      return
    }

    // Invalid move, deselect the piece
    setSelectedPiece(null)
  }

  const handleCapturedPieceClick = (piece: ChessPiece) => {
    if (gameState !== "playing" || currentPlayer !== piece.player) return

    setDropMode(true)
    setPieceToPlace(piece)
  }

  const handleDropModeToggle = () => {
    // Toggle drop mode as a move
    if (!dropMode) {
      setDropMode(true)
    } else {
      setDropMode(false)
      setPieceToPlace(null)
    }
  }

  const handleTimeExpired = (player: Player) => {
    setGameState("timeout")
    setClockRunning(false)
  }

  const updateClockTime = (player: Player, time: number) => {
    if (player === "white") {
      setWhiteTimeLeft(time)
    } else {
      setBlackTimeLeft(time)
    }
  }

  // Check if current player has self-captured pieces
  const hasSelfCapturedPieces =
    currentPlayer === "white" ? capturedPieces.whiteSelf.length > 0 : capturedPieces.blackSelf.length > 0

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-gray-500 mb-4" />
        <p className="text-gray-500">Loading game...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      {renderGameStatus()}

      <div className="flex flex-wrap justify-center gap-4">
        {/* Left side - Drop Box */}
        <div className="w-48">
          <DropBox
            currentPlayer={currentPlayer}
            capturedPieces={capturedPieces}
            onCapturedPieceClick={handleCapturedPieceClick}
            dropMode={dropMode}
            onDropModeToggle={handleDropModeToggle}
            hasSelfCapturedPieces={hasSelfCapturedPieces}
            gameState={gameState}
          />

          <div className="mt-4 space-y-2">
            <Button onClick={resetGame} className="w-full">
              Reset Game
            </Button>

            {user && (
              <Button onClick={handleSaveGame} className="w-full bg-green-600 hover:bg-green-700" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Game
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="mt-6 text-sm bg-white p-3 rounded shadow">
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

        {/* Center - Chess Board */}
        <div>
          <ChessBoard
            board={board}
            selectedPiece={selectedPiece}
            onSquareClick={handleSquareClick}
            currentPlayer={currentPlayer}
            dropMode={dropMode}
          />
        </div>

        {/* Right side - Clock and Captured Pieces */}
        <div className="w-48">
          <ChessClock
            currentPlayer={currentPlayer}
            isRunning={clockRunning}
            onTimeExpired={handleTimeExpired}
            onPauseClock={() => setClockRunning(false)}
            onResumeClock={() => setClockRunning(true)}
            onResetClock={() => {
              setClockRunning(false)
              setHasGameStarted(false)
              setWhiteTimeLeft(10 * 60 * 1000)
              setBlackTimeLeft(10 * 60 * 1000)
            }}
            hasGameStarted={hasGameStarted}
            whiteTimeLeft={whiteTimeLeft}
            blackTimeLeft={blackTimeLeft}
            onTimeUpdate={updateClockTime}
          />

          <CapturedPiecesDisplay capturedPieces={capturedPieces} />
        </div>
      </div>
    </div>
  )
}

