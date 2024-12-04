interface Command_Ban {
  type: 'ban'
  player: Player
  reason: string
  duration: number
  server: string
}

interface Command_Unban {
  type: 'unban'
  id: string
  server: string
}

interface Command_Kick {
  type: 'kick'
  player: Player
  server: string
  reason: string
}

interface Command_ListPlayers {
  type: 'list_players'
  server: string
}

interface Command_Say {
  type: 'admin' | 'server'
  message: string
  server: string
}

type Command = Command_Ban | Command_Unban | Command_Kick | Command_ListPlayers | Command_Say

interface CommandEvent {
  command: Command
  event: Electron.IpcMainEvent
  error?: string
}

interface SavedCommand {
  command: Command
  timestamp: number
}
