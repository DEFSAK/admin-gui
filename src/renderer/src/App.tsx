import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { createElement, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import APIProvider from "./components/api-provider";
import { ToastAction } from "./components/ui/toast";
import { ConstructToastMessage } from "./lib/toast";
import { Toaster } from "./components/ui/toaster";
import AppSidebar from "./components/app-sidebar";
import { ConfettiOptions } from "./lib/confetti";
import Background from "./components/background";
import { setPlayers, setServer } from "./main";
import { useToast } from "./hooks/use-toast";
import { IPCEvent } from "./lib/events";
import confetti from "canvas-confetti";
import { TabMap } from "./lib/tabs";
import { useSignals } from "@preact/signals-react/runtime";

function App() {
    const { toast } = useToast();
    useSignals();

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

    const [tab, setTab] = useState("Dashboard");

    function onTabChange(tab: string) {
        setTab(tab);
    }

    return (
        <APIProvider>
            <Background>
                <div className="bg-background/50 backdrop-blur-[2px]">
                    <SidebarProvider>
                        <AppSidebar onTabChange={onTabChange} />
                        <main className="w-svw h-svh overflow-hidden">
                            <SidebarTrigger />
                            <AnimatePresence>
                                {TabMap[tab] && (
                                    <motion.div
                                        key={tab}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="h-full w-full"
                                    >
                                        {createElement(TabMap[tab])}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </main>
                    </SidebarProvider>
                </div>
            </Background>
            <Toaster />
        </APIProvider>
    )
}

export default App;