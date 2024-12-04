import { CommandMultiSelect, CommandTypeValue } from "../ui/multi-select";
import { Clock, File, FileText, Server, User } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { useEffect, useRef, useState } from "react";
import { useAPI } from "../api-provider";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";

const CommandTypeMap = {
    ban: "Ban",
    unban: "Unban",
    kick: "Kick",
    list_players: "List Players",
    admin: "Admin",
    server: "Server",
}

function CommandCard({ savedCommand }: { savedCommand: SavedCommand }) {
    const { command, timestamp } = savedCommand;
    const date = new Date(timestamp).toLocaleString();

    const renderData = (icon: React.ReactNode, data: string) => (
        <p className="flex items-center">
            {icon}
            {data}
        </p>
    )

    const type = command.type;
    const renderCommandDetails = () => (
        <>
            <Separator className="my-2" />
            {renderData(<Server className="w-4 h-4 mr-2" />, `${command.server || 'unknown'}`)}
            {'player' in command && renderData(<User className="w-4 h-4 mr-2" />, `${command.player.displayName} (${command.player.playfabId})`)}
            {'reason' in command && renderData(<FileText className="w-4 h-4 mr-2" />, command.reason)}
            {('duration' in command && type !== 'kick') && renderData(<Clock className="w-4 h-4 mr-2" />, `${command.duration} hour${command.duration > 1 ? 's' : ''}`)}
            {'message' in command && renderData(<File className="w-4 h-4 mr-2" />, command.message)}
        </>
    )

    return (
        <div className="bg-background rounded-lg border p-4 my-2">
            <Badge className="select-all">{CommandTypeMap[command.type]} @ {date}</Badge>
            {renderCommandDetails()}
        </div>
    );
};

function History() {
    const [filter, setFilter] = useState<CommandTypeValue[]>(['ban', 'unban', 'kick'])
    const [history, setHistory] = useState<SavedCommand[]>([]);
    const [search, setSearch] = useState<string>('');
    const { api } = useAPI();

    useEffect(() => {
        api.call<SavedCommand[]>('get-command-history').then((history) => {
            history && setHistory(history);
        });
    }, []);

    function filterCommands(): SavedCommand[] {
        const lowerCaseSearch = search.toLowerCase();

        const containsSearch = (value: any): boolean => {
            if (typeof value === 'number') {
                const simpleCheck = value.toString().includes(lowerCaseSearch);
                const dateCheck = new Date(value).toLocaleString().toLowerCase().includes(lowerCaseSearch);
                return simpleCheck || dateCheck;
            }
            if (typeof value === 'string') {
                return value.toLowerCase().includes(lowerCaseSearch);
            }
            if (typeof value === 'object' && value !== null) {
                return Object.values(value).some(containsSearch);
            }
            return false;
        };

        return history.filter(command => {
            if (!filter.includes(command.command.type)) return false;
            if (!search) return true;

            return Object.values(command).some(containsSearch)
        }).reverse();
    }

    const filteredHistory = filterCommands();

    const containerHeight = window.innerHeight - 125;
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
        <div className="mx-10">
            <div className="flex flex-col h-full">
                <div className="flex-1">
                    <Input placeholder="Search" className="rounded-b-none border-b-0" value={search} onChange={(e) => setSearch(e.currentTarget.value)} />
                    <CommandMultiSelect setSelectedTypes={setFilter} className="rounded-t-none border-t-0" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <ScrollArea style={{
                        height: containerHeight,
                    }} ref={containerRef}>
                        {filteredHistory.length > 0 ? (
                            <>
                                <Separator />
                                {
                                    filteredHistory.map((savedCommand, index) => (
                                        <CommandCard key={index} savedCommand={savedCommand} />
                                    ))
                                }
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground">No results :(</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>
        </div>
    )
}

export default History;