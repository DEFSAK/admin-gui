import { GlobalKeyboardListener, IGlobalKeyEvent } from 'node-global-key-listener'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import clipboardWatcher from 'electron-clipboard-watcher'
import { ParsePlayerData } from './commands/macro'
import icon from '../../resources/icon.png?asset'
import CommandQueue from './commands/queue'
import settings from 'electron-settings'
import { join } from 'path'
import axios from 'axios'

const KeyboardListener = new GlobalKeyboardListener()
let mainWindow: BrowserWindow
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  const user_data = app.getPath('userData')
  const punishments_path = join(user_data, 'punishments.json')
  if (!existsSync(punishments_path)) {
    writeFileSync(
      punishments_path,
      JSON.stringify({
        punishments: [
          {
            label: 'FFA',
            reason: 'FFA',
            min_duration: 1,
            max_duration: 12
          }
        ]
      })
    )
  }
}

async function API<T>(url: string): Promise<APIResponse<T | null>> {
  try {
    const { data, status } = await axios.get<T>(url)
    return { ok: status === 200, data: status === 200 ? data : null }
  } catch {
    return { ok: false, data: null }
  }
}

function APIHandler<T>(
  ident: APIEndpoint,
  url: string
): [string, (event: any, args: any[]) => Promise<APIResponse<T | null>>] {
  return [
    ident,
    async (_, args) => {
      return await API<T>(url.format(...args))
    }
  ]
}

String.prototype.format = function (): string {
  const args = arguments
  return this.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] != 'undefined' ? args[number] : match
  })
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  clipboardWatcher({
    onTextChange: (text: string) => {
      if (text.startsWith('ServerName - ')) {
        const data = ParsePlayerData(text)
        mainWindow.webContents.send('player-data', data)
      }
    }
  })

  const API_URL = 'https://chivalry2stats.com:8443'
  ipcMain.handle(...APIHandler<PlayFabDetails>('fetch_playfab_data', `${API_URL}/players/{0}`))
  ipcMain.handle(
    ...APIHandler<PlayerDetails>(
      'fetch_player_data',
      `${API_URL}/players/fetch-all-leaderboards-around-player/{0}?distinctId=undefined`
    )
  )
  ipcMain.handle(
    ...APIHandler<NameLookup>(
      'name_lookup',
      `${API_URL}/players/search?searchTerm={0}&page={1}&pageSize={2}&distinctId=undefined`
    )
  )

  const user_data = app.getPath('userData')
  const punishments_path = join(user_data, 'punishments.json')
  ipcMain.handle('fetch_punishments', () => {
    const data = readFileSync(punishments_path, 'utf-8')
    return JSON.parse(data).punishments
  })

  ipcMain.handle('update_punishments', (_, data) => {
    const punishments = JSON.parse(readFileSync(punishments_path, 'utf-8'))

    const index = punishments.punishments.findIndex(
      (punishment: any) => punishment.label === data.label
    )
    if (index === -1) {
      punishments.punishments.push(data)
    } else {
      punishments.punishments[index] = data
    }

    writeFileSync(punishments_path, JSON.stringify(punishments))
  })

  ipcMain.handle('delete_punishment', (_, label) => {
    const data = JSON.parse(readFileSync(punishments_path, 'utf-8'))
    const punishments = data.punishments.filter((punishment: any) => punishment.label !== label)
    writeFileSync(punishments_path, JSON.stringify({ punishments }))
  })

  const commandQueue = new CommandQueue()
  ipcMain.on('command', (event, command) => {
    commandQueue.add({ event, command })
  })

  ipcMain.on('change-console-key', () => {
    const listener = (event: IGlobalKeyEvent) => {
      settings.setSync('console', event)
      mainWindow.webContents.send('console-key-changed', event)
      KeyboardListener.removeListener(listener)
    }
    KeyboardListener.addListener(listener)
  })

  ipcMain.handle('get-console-key', () => {
    return settings.getSync('console')
  })

  ipcMain.handle('get-command-history', () => {
    return commandQueue.history
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
