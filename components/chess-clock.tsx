"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import type { Player } from "@/lib/types"
import { Clock, Pause, Play, RotateCcw } from "lucide-react"

interface ChessClockProps {
  currentPlayer: Player
  isRunning: boolean
  hasGameStarted: boolean
  whiteTimeLeft: number
  blackTimeLeft: number
  onTimeExpired: (player: Player) => void
  onPauseClock: () => void
  onResumeClock: () => void
  onResetClock: () => void
  onTimeUpdate: (player: Player, time: number) => void
}

export default function ChessClock({
  currentPlayer,
  isRunning,
  hasGameStarted,
  whiteTimeLeft,
  blackTimeLeft,
  onTimeExpired,
  onPauseClock,
  onResumeClock,
  onResetClock,
  onTimeUpdate,
}: ChessClockProps) {
  // Format time as mm:ss
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60000)
    const seconds = Math.floor((time % 60000) / 1000)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Update the clock every 100ms
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      if (currentPlayer === "white") {
        onTimeUpdate("white", Math.max(0, whiteTimeLeft - 100))

        if (whiteTimeLeft <= 100) {
          clearInterval(interval)
          onTimeExpired("white")
        }
      } else {
        onTimeUpdate("black", Math.max(0, blackTimeLeft - 100))

        if (blackTimeLeft <= 100) {
          clearInterval(interval)
          onTimeExpired("black")
        }
      }
    }, 100)

    return () => clearInterval(interval)
  }, [currentPlayer, isRunning, whiteTimeLeft, blackTimeLeft, onTimeUpdate, onTimeExpired])

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Chess Clock</h2>
        <Clock className="h-5 w-5 text-gray-500" />
      </div>

      <div className="space-y-4">
        <div className={`p-3 rounded-lg ${currentPlayer === "white" && isRunning ? "bg-blue-100" : "bg-gray-100"}`}>
          <div className="flex justify-between items-center">
            <span className="font-medium">White</span>
            <span className={`text-xl font-mono ${whiteTimeLeft < 60000 ? "text-red-600" : ""}`}>
              {formatTime(whiteTimeLeft)}
            </span>
          </div>
        </div>

        <div className={`p-3 rounded-lg ${currentPlayer === "black" && isRunning ? "bg-blue-100" : "bg-gray-100"}`}>
          <div className="flex justify-between items-center">
            <span className="font-medium">Black</span>
            <span className={`text-xl font-mono ${blackTimeLeft < 60000 ? "text-red-600" : ""}`}>
              {formatTime(blackTimeLeft)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {hasGameStarted &&
            (isRunning ? (
              <Button onClick={onPauseClock} className="flex-1 bg-amber-600 hover:bg-amber-700">
                <Pause className="h-4 w-4 mr-2" /> Pause
              </Button>
            ) : (
              <Button onClick={onResumeClock} className="flex-1 bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" /> Resume
              </Button>
            ))}
          <Button onClick={onResetClock} variant="outline" className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
        </div>

        {!hasGameStarted && (
          <p className="text-sm text-gray-500 text-center mt-2">
            Clock will start automatically after White's first move
          </p>
        )}
      </div>
    </div>
  )
}

