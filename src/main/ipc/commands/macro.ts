import settings from 'electron-settings'
import * as KeySender from 'keysender'
import { clipboard } from 'electron'

const Hardware = KeySender.Hardware

export function ParsePlayerData(text: string): ParsedPlayerData {
  const lines = text.split('\n')

  let tmp = lines[0].replace('ServerName - ', '')
  const serverName = tmp.slice(0, tmp.lastIndexOf(' ')).trim()

  const playerDataLines = lines.slice(2)
  const parsedData: Player[] = []

  playerDataLines.forEach((line) => {
    const columns = line.split(' - ')
    columns.splice(-4)

    if (columns.length < 2) return
    if (columns.length > 2) {
      columns[0] = columns.slice(0, columns.length - 1).join(' - ')
      columns[1] = columns[columns.length - 1]
      columns.splice(2)
    }

    parsedData.push({ displayName: columns[0], playfabId: columns[1] })
  })

  return { server: serverName, players: parsedData.filter((item) => item.playfabId !== 'NULL') }
}

export type Game = InstanceType<typeof Hardware>

export function GetGameProcess(): Game | null {
  const game = new Hardware('Chivalry 2  ', 'UnrealWindow')
  return game.workwindow.isOpen() ? game : null
}

export function GetConsoleKey() {
  return settings.getSync('console.vKey') as number
}

export async function WriteToConsole(game: Game, event: CommandEvent, text: string) {
  if (text === '🫃') return
  const consoleKey = GetConsoleKey()

  if (!consoleKey) {
    event.event.reply('error-no-console-key')
    return
  }

  setTimeout(async () => {
    clipboard.writeText(text)
    game.workwindow.setForeground()
    await game.keyboard.sendKeys([consoleKey, ['ctrl', 'v'], 'enter'])
    event.event.reply('command-response', { command: event.command })

    event.event.sender.focus()
  }, 100)
}
