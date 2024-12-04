interface Player {
  displayName: string
  playfabId: string
  cache?: {
    details?: PlayerDetails & { fetchTimestamp: number }
    playfab_details?: PlayFabDetails & { fetchTimestamp: number }
  }
}

interface String {
  format(...args: any[]): string
}

interface Punishment {
  label: string
  reason: string
  max_duration: number
  min_duration: number
}

interface ParsedPlayerData {
  server: string
  players: Player[]
}

interface Contributor {
  login: string
  avatar_url: string
  html_url: string
  contributions: number
}

interface Announcement {
  label: string
  type: 'admin' | 'server'
  message: string
}
