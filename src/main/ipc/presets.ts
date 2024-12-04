import { existsSync, readFileSync, writeFileSync } from 'fs'
import { app, IpcMainInvokeEvent } from 'electron'
import { join } from 'path'

type IPCHandler = {
  channel: string
  listener: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<any> | any
}

export function InitializePreset<T>(key: string, defaultData?: T): IPCHandler[] {
  const userData = app.getPath('userData')
  const presetPath = join(userData, `${key}.json`)

  if (!existsSync(presetPath)) {
    writeFileSync(
      presetPath,
      JSON.stringify({
        [key]: defaultData
      })
    )
  }

  return [
    {
      channel: `fetch_${key}`,
      listener: () => {
        const data = readFileSync(presetPath, 'utf-8')
        return JSON.parse(data)[key]
      }
    },
    {
      channel: `update_${key}`,
      listener: (_, data) => {
        const preset = JSON.parse(readFileSync(presetPath, 'utf-8'))

        const index = preset[key].findIndex((item: any) => item.label === data.label)
        if (index === -1) {
          preset[key].push(data)
        } else {
          preset[key][index] = data
        }

        writeFileSync(presetPath, JSON.stringify(preset))
      }
    },
    {
      channel: `delete_${key}`,
      listener: (_, label) => {
        const data = JSON.parse(readFileSync(presetPath, 'utf-8'))
        const preset = data[key].filter((item: any) => item.label !== label)
        writeFileSync(presetPath, JSON.stringify({ [key]: preset }))
      }
    }
  ]
}

export function forEachPreset(f: Function, handlers: IPCHandler[]) {
  handlers.forEach((handler) => f(handler.channel, handler.listener))
}
