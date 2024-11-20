import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { PunishmentSelector } from "../ui/punishment-selector";
import { Separator } from "../ui/separator";
import { useEffect, useState } from "react";
import { createForm } from "@/lib/utils";
import { useAPI } from "../api-provider";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Input } from "../ui/input";
import { z } from "zod";

interface PunishDialogProps {
    type: | 'kick' | 'ban';
    player: Player;
    setOpen?: (open: boolean) => void;
}

const PunishmentSchema = z.object({
    reason: z.string().min(1, {
        message: "Reason is required",
    }),
    duration: z.coerce.number().int().min(1, {
        message: "Duration is required",
    }).max(999999, {
        message: "Duration is too long",
    })
})

function PunishDialog({ type, player, setOpen }: PunishDialogProps) {
    const [selectedPunishments, setSelectedPunishments] = useState<Punishment[]>([]);
    const [maxDuration, setMaxDuration] = useState(1);
    const [minDuration, setMinDuration] = useState(1);
    const [duration, setDuration] = useState(1);
    const [reason, setReason] = useState('');
    const { api } = useAPI();

    const form = createForm(PunishmentSchema);

    function onSubmit(data: z.infer<typeof PunishmentSchema>) {
        api.command({ type, player, ...data, server: api.server() })
        setOpen?.(false);
    }

    useEffect(() => {
        form.setValue('duration', duration);
        form.setValue('reason', reason);
    }, [reason, duration, minDuration, maxDuration])

    return (
        <>
            <DialogHeader className="flex justify-center">
                <DialogTitle className="text-center capitalize">
                    {type} {player.displayName}
                </DialogTitle>
                <DialogDescription className="text-center">You are about to {type} {player.displayName} ({player.playfabId})</DialogDescription>
            </DialogHeader>

            <PunishmentSelector className="w-full" setSelectedPunishments={setSelectedPunishments} setDuration={setDuration} setMaxDuration={setMaxDuration} setMinDuration={setMinDuration} setReason={setReason} />

            {(type === 'ban' && selectedPunishments.length > 0) && (<>{
                maxDuration !== minDuration ? (
                    <Slider min={minDuration} max={maxDuration} value={[duration]} step={1} className="p-4" onValueChange={(value) => setDuration(value[0])} />
                ) : (
                    <div className="text-xs p-2 text-center bg-background/50 border border-border/50 rounded-lg flex flex-col">
                        <span>
                            One or more of the selected punishments do not allow for a custom duration. (min: {minDuration} hours, max: {maxDuration} hours)
                        </span>
                    </div>
                )}
            </>)}

            <Separator />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {['reason', 'duration'].map((_key) => {
                        if (_key === 'duration' && type === 'kick') return;

                        const key = _key as 'reason' | 'duration';
                        const displayKey = key === 'reason' ? 'Reason' : 'Duration';

                        return (
                            <FormField key={key} control={form.control} name={key} render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="capitalize">{key}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={displayKey} {...field} type={key === "duration" ? "number" : "text"} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )
                    })}
                    <Button type="submit" variant="outline" className="w-full">
                        {type === 'ban' ? '🔨' : '🥾'}
                    </Button>
                </form>
            </Form>
        </>
    )
}

export default PunishDialog;