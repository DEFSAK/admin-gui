import axios, { AxiosError, AxiosResponse, Method } from 'axios'

String.prototype.format = function (): string {
  const args = arguments
  return this.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] != 'undefined' ? args[number] : match
  })
}

type APIResponse<T> = {
  status: number
  ok: boolean
  data: T | null
}

class APICommandBuilder<T> {
  private method: Method = 'GET'
  private url: string = ''
  private bodyParams: Record<string, any> = {}

  public setMethod(method: Method) {
    this.method = method
    return this
  }

  public setURL(url: string) {
    this.url = url
    return this
  }

  public setBodyParams(bodyParams: Record<string, any>) {
    this.bodyParams = bodyParams
    return this
  }

  private response(res: AxiosResponse<T>) {
    return {
      status: res.status,
      ok: res.status === 200,
      data: res.status === 200 ? res.data : null
    }
  }

  private error(e: unknown) {
    const error = e as AxiosError
    const status = error.response?.status || -1
    return { status, ok: false, data: null }
  }

  public async execute(args: any[]): Promise<APIResponse<T>> {
    try {
      return this.response(
        await axios({
          method: this.method,
          url: this.url.format(...args),
          data: this.bodyParams
        })
      )
    } catch (e) {
      return this.error(e)
    }
  }
}

const API_URL = 'https://chivalry2stats.com:8443'
const Commands = {
  fetch_playfab_data: (_, args) =>
    new APICommandBuilder<PlayFabDetails>()
      .setMethod('GET')
      .setURL(`${API_URL}/api/player/findByPlayFabId/{0}`)
      .execute(args),

  fetch_player_data: (_, args) =>
    new APICommandBuilder<PlayerDetails>()
      .setMethod('GET')
      .setURL(`${API_URL}/api/player/getLeaderboardAroundPlayer/{0}?distinctId=undefined`)
      .execute(args),
  name_lookup: (_, args) =>
    new APICommandBuilder<NameLookup>()
      .setMethod('POST')
      .setURL(`${API_URL}/api/player/usernameSearch/{0}`)
      .setBodyParams({ page: args[1], pageSize: 10, distinctId: 'undefined' })
      .execute(args)
}

export function InitializeAPIHandlers(handle: Function) {
  for (const [channel, listener] of Object.entries(Commands)) {
    handle(channel, listener)
  }
}
