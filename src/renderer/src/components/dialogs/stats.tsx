import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import ExtraStatDialog from "./extra-stats";
import { useEffect, useState } from "react";
import { useAPI } from "../api-provider";
import PlayerName from "../player-name";
import { Button } from "../ui/button";
import { parseISO } from "date-fns";
import APIRate from "../api-rate";

interface StatDialogProps {
    player: Player;
    data?: PlayFabDetails;
}

function StatDialog({ player, data }: StatDialogProps) {
    const [playFabData, setPlayFabData] = useState<PlayFabDetails | null>(null);
    const [requestFailed, setRequestFailed] = useState(false);
    const { api, rate_remaining } = useAPI();

    useEffect(() => {
        if (data) {
            setPlayFabData(data);
        }

        if (rate_remaining > 0) {
            api.fetchPlayFabData(player.playfabId).then((data) => {
                data ? setPlayFabData(data) : setRequestFailed(true);
            });
        }
    }, []);

    return (
        <>
            <DialogHeader className="flex mx-auto">
                <DialogTitle className="text-center">
                    <PlayerName name={player.displayName} />
                </DialogTitle>
                <DialogDescription className="mx-auto select-all">{player.playfabId}</DialogDescription>
            </DialogHeader>

            <APIRate condition={playFabData} requestFailed={requestFailed} component={playFabData && (
                <div>
                    <p className="text-foreground">Last Lookup (<a className="text-green-400 underline" target="_blank" href="https://chivalry2stats.com/">C2S</a>): {playFabData.lastLookup ? parseISO(playFabData.lastLookup).toDateString() : "N/A"}</p>
                    <p className="text-foreground">Lookup Count: {playFabData.lookupCount}</p>
                    <div className="h-4 w-full" />
                    <p className="text-foreground">
                        Alias History
                    </p>
                    <ScrollArea className="h-32 p-2 border border-border rounded-lg">
                        {playFabData.aliasHistory}
                    </ScrollArea>

                    <div className="mt-4 flex justify-center">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">Show Extended Information</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <ExtraStatDialog player={player} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            )} />
        </>
    )
}

export default StatDialog;