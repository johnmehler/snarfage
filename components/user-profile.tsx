"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getUserStats, getUserGames, deleteGame } from "@/lib/game-service"
import { Button } from "@/components/ui/button"
import type { GameData, UserStats } from "@/lib/supabase"
import { Loader2, Trash2 } from "lucide-react"

export default function UserProfile() {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [games, setGames] = useState<GameData[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchUserData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [statsResult, gamesResult] = await Promise.all([getUserStats(user.id), getUserGames(user.id)])

        if (statsResult.error) {
          console.error("Error fetching stats:", statsResult.error)
        } else {
          setStats(statsResult.data)
        }

        if (gamesResult.error) {
          console.error("Error fetching games:", gamesResult.error)
        } else {
          setGames(gamesResult.data)
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching user data")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm("Are you sure you want to delete this game?")) return

    try {
      const { error } = await deleteGame(gameId)
      if (error) {
        console.error("Error deleting game:", error)
        return
      }

      // Update the games list
      setGames((prevGames) => (prevGames ? prevGames.filter((game) => game.id !== gameId) : null))
    } catch (err: any) {
      console.error("Error deleting game:", err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (!user) {
    return (
      <div className="text-center p-6">
        <p>Please sign in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">User Profile</h2>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Account Information</h3>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>User ID:</strong> {user.id}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Game Statistics</h3>
              {stats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Games Played</p>
                    <p className="text-2xl font-bold">{stats.games_played}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-green-600">Wins</p>
                    <p className="text-2xl font-bold text-green-600">{stats.games_won}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-red-600">Losses</p>
                    <p className="text-2xl font-bold text-red-600">{stats.games_lost}</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-amber-600">Draws</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.games_drawn}</p>
                  </div>
                </div>
              ) : (
                <p>No statistics available yet. Play some games!</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Saved Games</h3>
              {games && games.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Game
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {games.map((game) => (
                        <tr key={game.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <a href={`/game/${game.id}`} className="text-blue-600 hover:text-blue-800">
                              Game {game.id?.substring(0, 8)}...
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${
                                game.game_state === "playing"
                                  ? "bg-green-100 text-green-800"
                                  : game.game_state === "checkmate" || game.game_state === "timeout"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {game.game_state.charAt(0).toUpperCase() + game.game_state.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(game.updated_at || "")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGame(game.id || "")}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No saved games found. Start playing to save your games!</p>
              )}
            </div>
          </>
        )}

        {error && <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md">{error}</div>}
      </div>
    </div>
  )
}

