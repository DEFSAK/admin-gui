import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { useEffect, useState } from "react";
import { GetLevelFromXP } from "@/lib/api";
import { useAPI } from "../api-provider";
import PlayerName from "../player-name";
import { Badge } from "../ui/badge";
import APIRate from "../api-rate";

interface ChartData {
    class: string;
    xp: number;
}

const chartConfig = {
    xp: {
        label: 'Level',
        color: "hsl(var(--chart-1))"
    }
} satisfies ChartConfig

const FillChartData = (data: PlayerDetails, setChartData: (data: ChartData[]) => void) => {
    setChartData(["experienceFootman", "experienceArcher", "experienceVanguard", "experienceKnight"].map((key) => {
        const classKey = key.split("experience")[1];
        return {
            class: classKey,
            xp: GetLevelFromXP(data.leaderboardStats[key])
        }
    }));
}

interface ExtraStatDialogProps {
    player: Player;
}

function ExtraStatDialog({ player }: ExtraStatDialogProps) {
    const [chartData, setChartData] = useState<ChartData[] | null>(null);
    const [level, setLevel] = useState<number>(0);
    const [favWeapon, setFavWeapon] = useState<string>("");
    const [requestFailed, setRequestFailed] = useState(false);
    const [requestStatus, setRequestStatus] = useState<number>(0);
    const { api, rate_remaining } = useAPI();

    useEffect(() => {
        if (rate_remaining > 0) {
            api.fetchPlayerData(player.playfabId).then((res) => {
                if (res) {
                    if (res.status === 200) {
                        const data = res.data as PlayerDetails;
                        FillChartData(data, setChartData);
                        setLevel(GetLevelFromXP(data.leaderboardStats.globalXp));

                        const stats = data.leaderboardStats as Record<string, number>;
                        const weapon_stats = Object.entries(stats).filter(([key, _]) => key.startsWith("experienceWeapon") && !key.endsWith("Position"))
                            .sort((a, b) => b[1] - a[1]);
                        if (weapon_stats.length > 0) {
                            setFavWeapon(weapon_stats[0][0].split("experienceWeapon")[1]);
                        }
                        setRequestFailed(false);
                    } else {
                        setRequestFailed(true);
                    }

                    setRequestStatus(res.status);
                } else {
                    setRequestFailed(true);
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
                <DialogDescription className="mx-auto select-all">
                    {player.playfabId}
                </DialogDescription>
            </DialogHeader>

            <APIRate condition={chartData} requestFailed={requestFailed} requestStatus={requestStatus} component={chartData && (
                <div className="flex-1 pb-0">
                    <div className="p-2 mt-2 bg-chart-1/10 border-2 border-dashed rounded-sm border-chart-1/50">
                        <div className="flex flex-row gap-2 items-center">
                            <p className="text-xs text-muted-foreground">Level</p>
                            <Badge className="text-xs bg-blue-500 hover:bg-blue-400 text-foreground font-normal rounded-md">{level}</Badge>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <p className="text-xs text-muted-foreground">Most used Weapon</p>
                            <Badge className="text-xs bg-blue-500 hover:bg-blue-400 text-foreground font-normal rounded-md">{favWeapon}</Badge>
                        </div>
                    </div>

                    <ChartContainer config={chartConfig} className="mx-auto">
                        <RadarChart data={chartData}>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <PolarAngleAxis dataKey="class" />
                            <PolarGrid />
                            <Radar dataKey="xp" fill="var(--color-xp)" fillOpacity={0.6} />
                        </RadarChart>
                    </ChartContainer>
                </div>
            )} />
        </>
    )
}

export default ExtraStatDialog;