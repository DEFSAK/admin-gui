import { createContext, useContext, useEffect, useState } from "react";

interface API {
    fetchPlayFabData: (playfabId: string) => Promise<APIResponse<PlayFabDetails>>;
    fetchPlayerData: (playfabId: string) => Promise<APIResponse<PlayerDetails>>;
    nameLookup: (name: string, page: number) => Promise<APIResponse<NameLookup>>;
    call: <T>(endpoint: string, ...args: any[]) => Promise<T | null>;
    command: (command: Command) => void;
}

interface APIContextProps {
    api: API;
    rate_remaining: number;
    rate_limit: number;
    last_refresh: number;
}

interface APIProviderProps {
    children?: React.ReactNode;
}

function APICallFactory({ rate_remaining, setRateRemaining }) {
    return async function <T>(endpoint: APIEndpoint, ...args: any[]): Promise<APIResponse<T>> {
        const response = await window.api.call<T>(endpoint, ...args);
        setRateRemaining(rate_remaining - 1 < 0 ? 0 : rate_remaining - 1);
        return response;
    }
}

async function NativeAPICall<T>(listener: string, ...args: any[]): Promise<T> {
    return await window.electron.ipcRenderer.invoke(listener, ...args);
}

const APIContext = createContext<APIContextProps | undefined>(undefined);
const APIProvider = ({ children }: APIProviderProps) => {
    const rate_limit = 20;
    const refresh_rate = 60000;

    const [rate_remaining, setRateRemaining] = useState<number>(rate_limit);
    const [last_refresh, setLastRefresh] = useState<number>(Date.now());

    const APICall = APICallFactory({ rate_remaining, setRateRemaining });

    useEffect(() => {
        const intervalId = setInterval(() => {
            setRateRemaining(rate_limit);
            setLastRefresh(Date.now());
        }, refresh_rate);

        return () => clearInterval(intervalId);
    }, [refresh_rate, rate_limit]);

    const api: API = {
        fetchPlayFabData: async (playfabId) => APICall<PlayFabDetails>('fetch_playfab_data', playfabId),
        fetchPlayerData: async (playfabId) => APICall<PlayerDetails>('fetch_player_data', playfabId),
        nameLookup: async (name, page) => APICall<NameLookup>('name_lookup', name, page, 25),
        call: NativeAPICall,
        command: (command: Command) => window.electron.ipcRenderer.send('command', command),
    }

    return (
        <APIContext.Provider value={{ api, rate_remaining, rate_limit, last_refresh }}>
            {children}
        </APIContext.Provider>
    )
}

export const useAPI = (): APIContextProps => {
    const context = useContext(APIContext);
    if (context === undefined) {
        throw new Error("useAPI must be used within a APIProvider");
    }

    return context;
}

export default APIProvider;