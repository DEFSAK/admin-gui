type VerifiedFields =
  | 'ExperienceWeaponQuarterstaff'
  | 'ExperienceWeaponGreatsword'
  | 'ExperienceWeaponKatars'
  | 'ExperienceVanguard'
  | 'ExperienceWeaponDaneAxe'
  | 'ExperienceWeaponSpear'
  | 'ExperienceWeaponWarBow'
  | 'ExperienceWeaponHatchet'
  | 'GlobalXp'
  | 'ExperienceWeaponWarClub'
  | 'ExperienceWeaponFalchion'
  | 'ExperienceWeaponThrowingKnife'
  | 'ExperienceWeaponThrowingMallet'
  | 'ExperienceWeaponWarHammer'
  | 'ExperienceWeaponBow'
  | 'ExperienceWeaponPickAxe'
  | 'ExperienceWeaponHeavyCavalrySword'
  | 'ExperienceWeaponMediumShield'
  | 'ExperienceWeaponGoedendag'
  | 'ExperienceWeaponJavelin'
  | 'ExperienceWeaponKnife'
  | 'ExperienceWeaponMorningStar'
  | 'ExperienceWeaponShovel'
  | 'ExperienceWeaponDagger'
  | 'ExperienceWeaponMesser'
  | 'ExperienceWeaponMace'
  | 'ExperienceWeaponLance'
  | 'ExperienceWeaponGlaive'
  | 'ExperienceWeaponShortSword'
  | 'ExperienceWeaponThrowingAxe'
  | 'ExperienceWeaponWarAxe'
  | 'ExperienceArcher'
  | 'ExperienceWeaponCudgel'
  | 'ExperienceWeaponSledgeHammer'
  | 'ExperienceWeaponHeavyShield'
  | 'ExperienceWeaponHighlandSword'
  | 'ExperienceWeaponPoleHammer'
  | 'ExperienceWeaponRapier'
  | 'ExperienceKnight'
  | 'ExperienceWeaponAxe'
  | 'ExperienceWeaponHeavyCrossbow'
  | 'ExperienceWeaponCrossbow'
  | 'ExperienceFootman'
  | 'ExperienceWeaponSword'
  | 'ExperienceWeaponBastardSword'
  | 'ExperienceWeaponHalberd'
  | 'ExperienceWeaponTwoHandedHammer'
  | 'ExperienceWeaponExecutionersAxe'
  | 'ExperienceWeaponPoleAxe'

type LeaderboardStats = {
  id: number
  playfabId: string
  globalXp: number
  fetchTimestamp: string
} & Record<Lowercase<VerifiedFields>, number> &
  Record<`${Lowercase<VerifiedFields>}Position`, number>

interface PlayerDetails {
  verifiedFields: VerifiedFields[]
  leaderboardStats: LeaderboardStats
}

interface PlayFabDetails {
  playfabId: string
  aliasHistory: string
  lookupCount: number
  lastLookup: string
  previousLookup: string
}

interface Player {
  displayName: string
  playfabId: string
  cache?: {
    details?: PlayerDetails & { fetchTimestamp: number }
    playfab_details?: PlayFabDetails & { fetchTimestamp: number }
  }
}

interface NameLookup {
  players: PlayFabDetails[]
  totalRecords: number
  totalPages: number
}

type APIEndpoint =
  | 'fetch_player_data'
  | 'fetch_playfab_data'
  | 'name_lookup'
  | 'fetch_punishments'
  | 'update_punishments'

interface APIResponse<T> {
  ok: boolean
  data: T
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

interface Command_Ban {
  type: 'ban'
  player: Player
  reason: string
  duration: number
  server: string
}

interface Command_Unban {
  type: 'unban'
  player: Player
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

interface ParsedPlayerData {
  server: string
  players: Player[]
}
