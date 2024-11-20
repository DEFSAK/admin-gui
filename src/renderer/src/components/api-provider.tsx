import { createContext, useContext, useEffect, useState } from "react";

interface API {
    fetchPlayFabData: (playfabId: string) => Promise<PlayFabDetails | null>;
    fetchPlayerData: (playfabId: string) => Promise<PlayerDetails | null>;
    nameLookup: (name: string, page: number) => Promise<NameLookup | null>;
    call: <T>(endpoint: string, ...args: any[]) => Promise<T | null>;
    command: (command: Command) => void;
    server: () => string;
}

interface APIContextProps {
    api: API;
    rate_remaining: number;
    rate_limit: number;
    last_refresh: number;
}

interface APIProviderProps {
    children?: React.ReactNode;
    server: string;
}

function APICallFactory({ rate_remaining, setRateRemaining }) {
    return async function <T>(endpoint: APIEndpoint, ...args: any[]): Promise<T | null> {
        const response = await window.api.call<T>(endpoint, ...args);
        setRateRemaining(rate_remaining - 1 < 0 ? 0 : rate_remaining - 1);

        if (response.ok) {
            return response.data;
        }

        return null;
    }
}

async function NativeAPICall<T>(listener: string, ...args: any[]): Promise<T> {
    return await window.electron.ipcRenderer.invoke(listener, ...args);
}

const APIContext = createContext<APIContextProps | undefined>(undefined);
const APIProvider = ({ server, children }: APIProviderProps) => {
    const rate_limit = 20;
    const refresh_rate = 60000;

    const [rate_remaining, setRateRemaining] = useState<number>(rate_limit);
    const [last_refresh, setLastRefresh] = useState<number>(Date.now());
    const [curServer, setServer] = useState<string>(server);

    const APICall = APICallFactory({ rate_remaining, setRateRemaining });

    useEffect(() => {
        const intervalId = setInterval(() => {
            setRateRemaining(rate_limit);
            setLastRefresh(Date.now());
        }, refresh_rate);

        return () => clearInterval(intervalId);
    }, [refresh_rate, rate_limit]);

    useEffect(() => {
        setServer(server);
    }, [server]);

    const api: API = {
        fetchPlayFabData: async (playfabId) => APICall<PlayFabDetails>('fetch_playfab_data', playfabId),
        fetchPlayerData: async (playfabId) => APICall<PlayerDetails>('fetch_player_data', playfabId),
        nameLookup: async (name, page) => APICall<NameLookup>('name_lookup', name, page, 25),
        call: NativeAPICall,
        command: (command: Command) => window.electron.ipcRenderer.send('command', command),
        server: () => curServer
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