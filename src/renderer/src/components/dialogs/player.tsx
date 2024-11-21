import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../ui/dialog";
import { Ban, FileUser, UserRoundMinus } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useEffect, useState } from "react";
import ExtraStatDialog from "./extra-stats";
import { useAPI } from "../api-provider";
import PlayerName from "../player-name";
import { Button } from "../ui/button";
import RateLimit from "../rate-limit";
import PunishDialog from "./punish";
import APIRate from "../api-rate";

interface PlayerDialogProps {
    player: Player;
    setOpen?: (open: boolean) => void;
}

function PlayerDialog({ player, setOpen }: PlayerDialogProps) {
    const [playFabData, setplayFabData] = useState<PlayFabDetails | null>(null);
    const [failedRequest, setFailedRequest] = useState(false);
    const [requestStatus, setRequestStatus] = useState<number>(0);
    const { api, rate_remaining } = useAPI();

    useEffect(() => {
        if (rate_remaining > 0) {
            api.fetchPlayFabData(player.playfabId).then((res) => {
                if (res) {
                    if (res.status === 200) {
                        setplayFabData(res.data);
                        setFailedRequest(false);
                    } else {
                        setFailedRequest(true);
                    }

                    setRequestStatus(res.status);
                } else {
                    setFailedRequest(true);
                    setRequestStatus(-1);
                }
            })
        }
    }, []);

    return (
        <>
            <DialogHeader className="flex mx-auto">
                <DialogTitle className="text-center">
                    <PlayerName name={player.displayName} />
                </DialogTitle>
                <DialogDescription className="mx-auto select-all">{player.playfabId}</DialogDescription>
            </DialogHeader >
            <DialogFooter className="flex mx-auto">
                <div className="flex flex-col">
                    <div className="flex mx-auto gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Ban className="mr-2 h-4 w-4" />
                                    Ban
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <PunishDialog type="ban" player={player} setOpen={setOpen} />
                            </DialogContent>
                        </Dialog>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <UserRoundMinus className="mr-2 h-4 w-4" />
                                    Kick
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <PunishDialog type="kick" player={player} setOpen={setOpen} />
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="flex justify-center flex-col py-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <FileUser className="mr-2 h-4 w-4" />
                                    View Additional Information
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <ExtraStatDialog player={player} />
                            </DialogContent>
                        </Dialog>
                        <APIRate condition={playFabData} requestFailed={failedRequest} requestStatus={requestStatus} component={playFabData && (
                            <div>
                                <div className="h-4 w-full" />
                                <p className="flex justify-center text-center text-foreground">
                                    Alias History
                                </p>
                                <ScrollArea className="h-32 p-2 border border-border rounded-lg">
                                    {playFabData.aliasHistory}
                                </ScrollArea>
                                <p className="flex justify-center gap-1 text-sm text-muted">
                                    from
                                    <a target="_blank" href="https://chivalry2stats.com" className="text-green-400 underline">chivalry2stats</a>
                                </p>
                            </div>
                        )} />
                        <div className="flex justify-center mt-4">
                            <RateLimit />
                        </div>
                    </div>
                </div>
            </DialogFooter >
        </>
    )
}

export default PlayerDialog;