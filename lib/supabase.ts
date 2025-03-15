import { createClient } from "@supabase/supabase-js"

// These environment variables need to be set in your Vercel project
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type GameData = {
  id?: string
  user_id: string
  board_state: string // JSON stringified board
  current_player: "white" | "black"
  captured_pieces: string // JSON stringified captured pieces
  white_time_left: number
  black_time_left: number
  game_state: string
  created_at?: string
  updated_at?: string
  opponent_id?: string
  is_multiplayer: boolean
}

export type UserStats = {
  id?: string
  user_id: string
  games_played: number
  games_won: number
  games_lost: number
  games_drawn: number
  created_at?: string
  updated_at?: string
}

