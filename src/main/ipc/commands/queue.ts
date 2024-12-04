import { Game, GetGameProcess, WriteToConsole } from './macro'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { app, IpcMain, IpcMainEvent } from 'electron'
import { join } from 'path'

class CommandQueue {
  private commands: CommandEvent[] = []
  private processing: boolean = false
  public history: SavedCommand[] = []

  constructor(ipcMain: IpcMain) {
    const filePath = join(app.getPath('userData'), 'history.json')
    if (existsSync(filePath)) {
      this.history = JSON.parse(readFileSync(filePath, 'utf-8')) as SavedCommand[]
    }

    ipcMain.on('command', (event, command) => {
      this.add({ event, command })
    })

    ipcMain.handle('get-command-history', () => {
      return this.history
    })
  }

  public add(command: CommandEvent) {
    this.commands.push(command)
    this.process()
  }

  private _saveCommandToHistory(command: Command) {
    const filePath = join(app.getPath('userData'), 'history.json')
    if (!existsSync(filePath)) {
      writeFileSync(filePath, JSON.stringify([]))
    }

    const history = JSON.parse(readFileSync(filePath, 'utf-8')) as SavedCommand[]
    history.push({
      timestamp: Date.now(),
      command
    })

    this.history = history

    writeFileSync(filePath, JSON.stringify(history))
  }

  private _skip = () => {
    this.processing = false
    this.process()
  }

  private _error_fail = (event: IpcMainEvent, command: Command, error: string) => {
    event.reply('command-response', { error, command })
    this._skip()
  }

  private _process_command = async (game: Game, event: IpcMainEvent, command: Command) => {
    await WriteToConsole(
      game,
      { event, command },
      `${
        command.type === 'ban' || command.type === 'kick'
          ? `${command.type}byid ${command.player.playfabId} ${
              command.type === 'ban' ? command.duration : ''
            } "${command.reason}"`
          : command.type === 'list_players'
            ? 'listplayers'
            : command.type === 'unban'
              ? `unbanbyid ${command.id}`
              : command.type === 'admin' || command.type === 'server'
                ? `${command.type === 'admin' ? 'adminsay' : 'serversay'} "${command.message}"`
                : '🫃'
      }`
    )
    this._saveCommandToHistory(command)
  }

  public async process() {
    if (this.processing || this.commands.length === 0) return
    this.processing = true

    const { event, command } = this.commands.shift() as CommandEvent
    if (!command) {
      this._error_fail(event, command, 'Invalid command')
      return
    }

    const game = GetGameProcess()
    if (!game) {
      this._error_fail(event, command, 'Game not running')
      return
    }

    await this._process_command(game, event, command)

    this.processing = false
    this.process()
  }
}

export function InitializeCommandQueue(ipcMain: IpcMain) {
  new CommandQueue(ipcMain)
}
