import { supabase, type GameData, type UserStats } from "./supabase"
import type { ChessPiece, CapturedPieces, GameState } from "@/lib/types"

export async function saveGame(
  userId: string,
  board: ChessPiece[][],
  currentPlayer: "white" | "black",
  capturedPieces: CapturedPieces,
  whiteTimeLeft: number,
  blackTimeLeft: number,
  gameState: GameState,
  gameId?: string,
  isMultiplayer = false,
  opponentId?: string,
): Promise<{ data: GameData | null; error: any }> {
  const gameData: GameData = {
    user_id: userId,
    board_state: JSON.stringify(board),
    current_player: currentPlayer,
    captured_pieces: JSON.stringify(capturedPieces),
    white_time_left: whiteTimeLeft,
    black_time_left: blackTimeLeft,
    game_state: gameState,
    is_multiplayer: isMultiplayer,
    opponent_id: opponentId,
    updated_at: new Date().toISOString(),
  }

  if (gameId) {
    // Update existing game
    const { data, error } = await supabase.from("games").update(gameData).eq("id", gameId).select().single()

    return { data, error }
  } else {
    // Create new game
    const { data, error } = await supabase
      .from("games")
      .insert({ ...gameData, created_at: new Date().toISOString() })
      .select()
      .single()

    return { data, error }
  }
}

export async function loadGame(gameId: string): Promise<{ data: GameData | null; error: any }> {
  const { data, error } = await supabase.from("games").select("*").eq("id", gameId).single()

  return { data, error }
}

export async function getUserGames(userId: string): Promise<{ data: GameData[] | null; error: any }> {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  return { data, error }
}

export async function deleteGame(gameId: string): Promise<{ error: any }> {
  const { error } = await supabase.from("games").delete().eq("id", gameId)

  return { error }
}

export async function updateUserStats(
  userId: string,
  result: "win" | "loss" | "draw",
): Promise<{ data: UserStats | null; error: any }> {
  // First, check if user stats exist
  const { data: existingStats, error: fetchError } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    return { data: null, error: fetchError }
  }

  let statsData: Partial<UserStats> = {
    user_id: userId,
    games_played: 1,
    games_won: result === "win" ? 1 : 0,
    games_lost: result === "loss" ? 1 : 0,
    games_drawn: result === "draw" ? 1 : 0,
    updated_at: new Date().toISOString(),
  }

  if (existingStats) {
    // Update existing stats
    statsData = {
      games_played: existingStats.games_played + 1,
      games_won: existingStats.games_won + (result === "win" ? 1 : 0),
      games_lost: existingStats.games_lost + (result === "loss" ? 1 : 0),
      games_drawn: existingStats.games_drawn + (result === "draw" ? 1 : 0),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("user_stats").update(statsData).eq("user_id", userId).select().single()

    return { data, error }
  } else {
    // Create new stats
    const { data, error } = await supabase
      .from("user_stats")
      .insert({ ...statsData, created_at: new Date().toISOString() })
      .select()
      .single()

    return { data, error }
  }
}

export async function getUserStats(userId: string): Promise<{ data: UserStats | null; error: any }> {
  const { data, error } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

  return { data, error }
}

