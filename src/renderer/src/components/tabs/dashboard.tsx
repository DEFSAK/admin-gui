import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollArea } from "../ui/scroll-area";
import { convertUnicode } from "@/lib/unicode";
import PlayerDialog from "../dialogs/player";
import { RefreshCcw } from "lucide-react";
import { useAPI } from "../api-provider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import unidecode from "unidecode";
import { useEffect, useRef, useState } from "react";
import { players } from "@/main";

function Dashboard() {
    const [search, setSearch] = useState("");
    const { api } = useAPI();

    const player_filter = (player: Player) => {
        return unidecode(convertUnicode(player.displayName)).toLowerCase().includes(unidecode(search.trim().toLowerCase())) ||
            player.playfabId.toLowerCase().includes(unidecode(search.trim().toLowerCase())) ||
            player.displayName.toLowerCase().includes(search.trim().toLowerCase())
    }

    const player_sort = (a: Player, b: Player) => {
        return unidecode(convertUnicode(a.displayName)).localeCompare(unidecode(convertUnicode(b.displayName)))
    }

    const player_list = players.value.filter(player_filter).sort(player_sort)

    const showPopup = unidecode(convertUnicode(search.trim())) !== search.trim()
    const [animateRefresh, setAnimateRefresh] = useState(false);

    const containerHeight = window.innerHeight - 90;
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                containerRef.current.style.height = `${window.innerHeight - 125}px`;
            }
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [])

    return (
        <div className="mx-10 h-screen">
            <div className="flex gap-1">
                <Button variant="outline" className="group" onClick={() => {
                    api.command({ type: 'list_players', server: 'unknown' })
                    setAnimateRefresh(true)
                    setTimeout(() => setAnimateRefresh(false), 1000)
                }}>
                    <RefreshCcw className={`animate-ease-in-out ${animateRefresh && "animate-spin"}`} />
                </Button>
                <div className="grow">
                    <Input placeholder="Search by Name or ID" className="caret-white" type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>
            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.1 }}
                        className="p-2 mt-2 bg-chart-1/10 border-2 border-dashed rounded-sm border-chart-1/50">
                        <div className="flex items-center justify-center">
                            <span className="text-3xl animate-wiggle-more animate-twice animate-delay-500 animate-ease-in-out animate-alternate-reverse animate-fill-both">👋</span>
                            <span className="text-xs text-muted-foreground">Looks like your search contains some 🤔 characters</span>
                        </div>
                        <div className="flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">so we've went ahead and decoded it for you:</span>
                        </div>
                        <div className="flex items-center justify-center">
                            <span className="pl-1 text-xs">{unidecode(convertUnicode(search.trim()))}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <ScrollArea className="overflow-auto mt-2" ref={containerRef} style={{ height: containerHeight }}>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,_1fr))] gap-2">
                    <AnimatePresence mode="wait">
                        {
                            player_list.length === 0 ? (
                                <div className="text-center col-span-3"></div>
                            ) : (
                                player_list.map((player, index) => (
                                    <Card key={`player-${player.playfabId}-${index}`} player={player} />
                                ))
                            )
                        }
                    </AnimatePresence>
                </div>
            </ScrollArea>
        </div>
    )
}

interface CardProps {
    player: Player;
}

function Card({ player }: CardProps) {
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <div className="p-1 rounded-lg cursor-pointer border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                        <div className="text-sm text-center">{player.displayName}</div>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <PlayerDialog player={player} setOpen={setOpen} />
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}

export default Dashboard;
