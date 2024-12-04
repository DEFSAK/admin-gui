import { FloatingLabelInput } from "../ui/floating-input";
import { PresetSelector } from "../ui/preset-selector";
import { SendHorizonal, Shield } from "lucide-react";
import { AnnouncementSchema } from "@/lib/forms";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { useAPI } from "../api-provider";
import { Button } from "../ui/button";
import ComboBox from "../ui/combobox";
import { useState } from "react";
import { server } from "@/main";

function Misc() {
    const [type, setType] = useState<"admin" | "server">("admin");
    const [presets, setPresets] = useState<Announcement[]>([]);
    const [message, setMessage] = useState<string>("");
    const [unbanId, setUnbanId] = useState<string>("");
    const { api } = useAPI();

    function sendMessage(type: 'admin' | 'server', message: string) {
        api.command({ type, message, server: server.value });
    }

    function sendPresets() {
        if (presets.length === 0) return

        presets.forEach((preset, index) => {
            setTimeout(() => {
                api.command({ type: preset.type, message: preset.message, server: server.value });
            }, index * 1000);
        });
    }

    function unbanPlayer(id: string) {
        api.command({ type: 'unban', id, server: server.value });
    }

    return (
        <div className="mx-10">
            <div className="flex mb-2">
                <div className="w-full">
                    <PresetSelector onChange={(selected) => setPresets(selected as Announcement[])} presetKey="announcements" schema={AnnouncementSchema} className="rounded-r-none w-full" />
                </div>
                <Button variant="outline" className="rounded-l-none group px-16" onClick={() => sendPresets()}>
                    Send
                    <SendHorizonal className="ml-1 animate-ease-in-out animate-infinite animate-duration-1000 group-hover:animate-pulse" />
                </Button>
            </div>

            <Separator
                label={<div className="border px-4 py-1 rounded-full text-muted-foreground">OR</div>}
                gradient
            />

            <div className="my-2">
                <Textarea placeholder="Type your message here" className="max-h-96 rounded-b-none border-b-0" value={message} onChange={(e) => setMessage(e.target.value)} />
                <div className="flex">
                    <ComboBox className="w-full rounded-t-none rounded-r-none" options={['admin', 'server']} onChange={(value) => setType(value as ('admin' | 'server'))} />
                    <Button variant="outline" className="w-full group rounded-l-none rounded-t-none" onClick={() => sendMessage(type, message)}>
                        Send
                        <SendHorizonal className="ml-1 animate-ease-in-out animate-infinite animate-duration-1000 group-hover:animate-pulse" />
                    </Button>
                </div>
            </div>

            <Separator gradient className="my-6" />

            <div className="flex my-2">
                <div className="grow">
                    <FloatingLabelInput label="PlayFab ID" className="rounded-r-none" value={unbanId} onChange={(e) => setUnbanId(e.target.value)} />
                </div>
                <Button variant="outline" className="rounded-l-none group px-16" onClick={() => unbanPlayer(unbanId)}>
                    Unban
                    <Shield className="ml-1 animate-ease-in-out animate-infinite animate-duration-1000 group-hover:animate-pulse" />
                </Button>
            </div>
        </div>
    )
}

export default Misc;