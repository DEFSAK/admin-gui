import { ScrollArea } from "../ui/scroll-area";
import { convertUnicode } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";
import { useAPI } from "../api-provider";
import { Button } from "../ui/button";
import Container from "../container";
import { Input } from "../ui/input";
import unidecode from "unidecode";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import PlayerDialog from "../dialogs/player";

interface DashboardProps {
    players: Player[];
}

function Dashboard({ players }: DashboardProps) {
    const [search, setSearch] = useState("");
    const { api } = useAPI();

    const player_list = players.filter((player) =>
        unidecode(convertUnicode(player.displayName)).toLowerCase().includes(unidecode(search.toLowerCase())) ||
        player.playfabId.toLowerCase().includes(unidecode(search.toLowerCase())) ||
        player.displayName.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <Container>
            <div className="flex gap-1">
                <Button variant="outline" onClick={() => {
                    api.command({ type: 'list_players', server: 'unknown' })
                }}>
                    <RefreshCcw />
                </Button>
                <Input placeholder="Search by Name or ID" className="caret-white" type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="text-sm mb-2">
                {search && `Searching for: ${unidecode(convertUnicode(search))}`}
            </div>
            <ScrollArea className="mx-auto w-full h-[calc(100vh_-_150px)]">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,_1fr))] gap-2">
                    {
                        player_list.length === 0 ? (
                            <div className="text-center col-span-3"></div>
                        ) : (
                            player_list.map((player) => (
                                <Card key={player.playfabId} player={player} />
                            ))
                        )
                    }
                </div>
            </ScrollArea>
        </Container>
    )
}

interface CardProps {
    player: Player;
}

function Card({ player }: CardProps) {
    const [open, setOpen] = useState(false);

    return (
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
    )
}

export default Dashboard;
