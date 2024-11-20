import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { ConfettiOptions, ConstructToastMessage } from "./lib/utils"
import { ToastAction } from "./components/ui/toast"
import APIProvider from "./components/api-provider"
import Dashboard from "./components/tabs/dashboard"
import { Toaster } from "./components/ui/toaster"
import Settings from "./components/tabs/settings"
import Background from "./components/background"
import History from "./components/tabs/history"
import Search from "./components/tabs/search"
import { useToast } from "./hooks/use-toast"
import { useEffect, useState } from "react"
import { IPCEvent } from "./lib/events"
import confetti from "canvas-confetti"

interface ApplicationTabs {
  label: string;
  component: React.FC<any>;
}

const AppTabs = [
  { label: "Dashboard", component: Dashboard },
  { label: "Search", component: Search },
  { label: "History", component: History },
  { label: "Settings", component: Settings },
] as ApplicationTabs[]
const TabsDefault = AppTabs[0].label;

function App(): JSX.Element {
  const { toast } = useToast();

  const handleErrorNoConsoleKey = () => {
    toast({
      variant: 'destructive',
      title: "No Console Key",
      description: "You need to set a console key in the settings to use this feature.",
      action: (
        <ToastAction altText="Open Settings" onClick={() => {
          setTab("Settings");
        }} className="border-2 border-black">Open Settings</ToastAction>
      )
    })
  }

  const handleCommandResponse = (_, response: CommandEvent) => {
    toast({
      variant: response.error ? 'destructive' : 'default',
      title: response.error ? "Command Error" : "Command Success",
      description: response.error ? response.error : ConstructToastMessage(response.command),
    })

    const cType = response.command.type
    ConfettiOptions[cType] && confetti(ConfettiOptions[cType]);
  }

  const handlePlayerData = (_, data: ParsedPlayerData) => {
    setPlayers(data.players);
    setServer(data.server);
  }

  useEffect(() => {
    const Events = [
      IPCEvent('error-no-console-key', handleErrorNoConsoleKey),
      IPCEvent('command-response', handleCommandResponse),
      IPCEvent('player-data', handlePlayerData)
    ]

    return () => {
      Events.forEach((RemoveIPCEvent) => {
        RemoveIPCEvent();
      })
    }
  }, [])

  const [players, setPlayers] = useState<Player[]>(window.api.isDev ? [{
    displayName: "Ⱥ Smiggy",
    playfabId: "6F33D568A08FF682"
  }] : []);
  const [server, setServer] = useState<string>("");

  const [tab, setTab] = useState(TabsDefault);

  const onTabChange = (value: string) => {
    setTab(value);
  }

  return (
    <div className="flex flex-col h-screen w-screen">

      <Background>
        <APIProvider server={server}>
          <Tabs value={tab} onValueChange={onTabChange}>
            <TabsList className={`grid grid-flow-col grid-cols-${AppTabs.length}`}>
              {AppTabs.map((tab) => (
                <TabsTrigger key={tab.label} value={tab.label}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex-1 overflow-hidden">
              {AppTabs.map((tab) => (
                <TabsContent key={tab.label} value={tab.label}>
                  <tab.component players={players} />
                </TabsContent>
              ))}
            </div>
          </Tabs>
          <Toaster />
        </APIProvider>
      </Background>
    </div>
  )
}

export default App
