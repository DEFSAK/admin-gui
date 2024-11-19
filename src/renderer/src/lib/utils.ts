import { z, ZodEffects, ZodObject, ZodTypeAny } from 'zod'
import { DefaultValues, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import confetti from 'canvas-confetti'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

const unicode_lookup = {
  к: 'K',
  я: 'R',
  т: 'T',
  Λ: 'A',
  Ƒ: 'F',
  Ҡ: 'K',
  ل: 'J',
  ø: 'O',
  м: 'M',
  κ: 'K',
  Ⱡ: 'L',
  '₳': 'A',
  ᵒ: 'O',
  ᵐ: 'M',
  ᵘ: 'U',
  є: 'E',
  ᴠ: 'V',
  ʟ: 'L',
  Ⱥ: 'A'
}

export const convertUnicode = (str: string) => {
  return str.replace(/./g, (char) => unicode_lookup[char] || char)
}

// #region Credit to Report (chivalry2stats.com)
const XPTable: number[] = [
  0, 200, 470, 875, 1415, 2090, 2900, 3845, 4925, 6140, 7240, 8450, 9770, 11200, 12740, 14390,
  16150, 18020, 20000, 22090, 24290, 26600, 29020, 31550, 34190
]

const MAX_TABLE_LEVEL = XPTable.length - 1
const MAX_XP_IN_TABLE = XPTable[MAX_TABLE_LEVEL]

export function GetLevelFromXP(XP: number): number {
  if (XP <= MAX_XP_IN_TABLE) {
    return XPTable.findIndex((_, index) => XP < XPTable[index + 1]) ?? 0
  }
  return CalculateLevel(XP)
}

export function CalculateLevel(XP: number): number {
  const [a, b, c] = [0.873, 2653.9, -30677 - XP]

  const discrim = b ** 2 - 4 * a * c
  if (discrim < 0) return -1

  return Math.floor((-b + Math.sqrt(discrim)) / (2 * a))
}

export const truncateAliasHistory = (aliasHistory: string, searchTerm: string) => {
  const aliases = aliasHistory.split(',')
  const matchIndex = aliases.findIndex(
    (alias) => alias.localeCompare(searchTerm, undefined, { sensitivity: 'base' }) === 0
  )

  if (matchIndex === -1) {
    return aliasHistory
  }

  const start = Math.max(0, matchIndex - 1)
  const end = Math.min(aliases.length, matchIndex + 2)

  const before = start > 0 ? '...' : ''
  const after = end < aliases.length ? '...' : ''

  return {
    matchedAlias: aliases[matchIndex],
    truncatedAliasHistory: `${before} ${aliases.slice(start, end).join(', ')} ${after}`.trim()
  }
}
// #endregion

export const formatSeconds = (num: number) => {
  return `${Math.floor(num)}s`
}

export function ConstructToastMessage(command: Command) {
  switch (command.type) {
    case 'ban':
      return `Banned ${command.player.playfabId} - ${command.reason} (${command.duration}h)`
    case 'kick':
      return `Kicked ${command.player.playfabId} - ${command.reason}`
    case 'list_players':
      return 'Refreshed List'
    case 'admin':
      return `Admin Say: ${command.message}`
    case 'server':
      return `Server Say: ${command.message}`
    default:
      return 'Unknown Command'
  }
}

const ConfettiOptions = {
  default: {
    particleCount: 100,
    angle: -90,
    spread: 100,
    startVelocity: 25,
    decay: 1,
    gravity: 1,
    drift: 0,
    flat: true,
    ticks: 200,
    origin: {
      x: 0.5,
      y: -1
    },
    scalar: 2
  }
}
ConfettiOptions['ban'] = {
  ...ConfettiOptions.default,
  shapes: [confetti.shapeFromText({ text: '🔨', scalar: 2 })]
}
ConfettiOptions['kick'] = {
  ...ConfettiOptions.default,
  shapes: [confetti.shapeFromText({ text: '🥾', scalar: 2 })]
}

export { ConfettiOptions }

type UnwrapZodEffects<T extends ZodTypeAny> =
  T extends ZodEffects<infer U> ? UnwrapZodEffects<U> : T

// Ensure the final type is a ZodObject
type EnsureZodObject<T> = T extends ZodObject<any> ? T : never

export function getBaseObject<T extends ZodTypeAny>(
  schema: T
): EnsureZodObject<UnwrapZodEffects<T>> {
  let currentSchema = schema

  while (currentSchema instanceof ZodEffects) {
    currentSchema = currentSchema._def.schema
  }

  if (currentSchema instanceof ZodObject) {
    return currentSchema as EnsureZodObject<UnwrapZodEffects<T>>
  } else {
    throw new Error('Base schema is not a ZodObject')
  }
}

function getDefaults<Schema extends z.AnyZodObject>(
  schema: Schema
): DefaultValues<z.infer<Schema>> {
  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, value]) => {
      if (value instanceof z.ZodDefault) {
        return [key, value._def.defaultValue()]
      }
      return [key, undefined]
    })
  ) as DefaultValues<z.infer<Schema>>
}

export function createForm<Schema extends z.AnyZodObject>(
  schema: Schema,
  defaultValues?: DefaultValues<z.infer<Schema>>
) {
  return useForm<z.infer<Schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || getDefaults(schema)
  })
}

function parseDateString(dateString: string): number | null {
  const [day, month, year] = dateString.split('/').map(Number)
  const date = new Date(year, month - 1, day)
  return isNaN(date.getTime()) ? null : date.getTime()
}

export function isTimestampInDayRange(timestamp: number, dateString: string): boolean {
  const dayStart = parseDateString(dateString)
  if (dayStart === null) return false
  const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1
  return timestamp >= dayStart && timestamp <= dayEnd
}

const defaultThemes = {
  light: {
    background: '0 0% 100%',
    foreground: '240 10% 3.9%',
    card: '0 0% 100%',
    'card-foreground': '240 10% 3.9%',
    popover: '0 0% 100%',
    'popover-foreground': '240 10% 3.9%',
    primary: '240 5.9% 10%',
    'primary-foreground': '0 0% 98%',
    secondary: '240 4.8% 95.9%',
    'secondary-foreground': '240 5.9% 10%',
    muted: '240 4.8% 95.9%',
    'muted-foreground': '240 3.8% 46.1%',
    accent: '240 4.8% 95.9%',
    'accent-foreground': '240 5.9% 10%',
    destructive: '0 84.2% 60.2%',
    'destructive-foreground': '0 0% 98%',
    border: '240 5.9% 90%',
    input: '240 5.9% 90%',
    ring: '240 5.9% 10%',
    radius: '0.5rem',
    'chart-1': '12 76% 61%',
    'chart-2': '173 58% 39%',
    'chart-3': '197 37% 24%',
    'chart-4': '43 74% 66%',
    'chart-5': '27 87% 67%'
  },
  dark: {
    background: '240 10% 3.9%;',
    foreground: '0 0% 98%;',
    card: '240 10% 3.9%;',
    'card-foreground': '0 0% 98%;',
    popover: '240 10% 3.9%;',
    'popover-foreground': '0 0% 98%;',
    primary: '0 0% 98%;',
    'primary-foreground': '240 5.9% 10%;',
    secondary: '240 3.7% 15.9%;',
    'secondary-foreground': '0 0% 98%;',
    muted: '240 3.7% 15.9%;',
    'muted-foreground': '240 5% 64.9%;',
    accent: '240 3.7% 15.9%;',
    'accent-foreground': '0 0% 98%;',
    destructive: '0 62.8% 30.6%;',
    'destructive-foreground': '0 0% 98%;',
    border: '240 3.7% 15.9%;',
    input: '240 3.7% 15.9%;',
    ring: '240 4.9% 83.9%;',
    'chart-1': '220 70% 50%;',
    'chart-2': '160 60% 45%;',
    'chart-3': '30 80% 55%;',
    'chart-4': '280 65% 60%;',
    'chart-5': '340 75% 55%;'
  },
  custom: {}
}
defaultThemes.custom = defaultThemes.light
export { defaultThemes }

/*
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
*/
