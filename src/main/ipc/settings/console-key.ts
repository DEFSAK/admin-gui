import { GlobalKeyboardListener, IGlobalKeyEvent } from 'node-global-key-listener'
import { BrowserWindow, IpcMain } from 'electron'
import settings from 'electron-settings'

const KeyboardListener = new GlobalKeyboardListener()

export function IntializeConsoleKeyHandlers(mainWindow: BrowserWindow, ipcMain: IpcMain) {
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
}
