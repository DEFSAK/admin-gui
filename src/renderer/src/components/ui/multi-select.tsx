"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";

export type CommandTypeValue = Command extends { type: infer T } ? T : never;
export type CommandType = {
    value: CommandTypeValue;
    label: string;
}

export const CMD_TYPES = [
    {
        value: 'ban',
        label: 'Ban',
    },
    {
        value: 'kick',
        label: 'Kick',
    },
    {
        value: 'unban',
        label: 'Unban',
    },
    {
        value: 'admin',
        label: 'Admin',
    },
    {
        value: 'list_players',
        label: 'List Players',
    },
    {
        value: 'server',
        label: 'Server',
    },
] satisfies CommandType[];

interface CommandMultiSelectProps {
    className?: string;
    setSelectedTypes?: React.Dispatch<React.SetStateAction<CommandTypeValue[]>>;
}

export function CommandMultiSelect({ className, setSelectedTypes }: CommandMultiSelectProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [selected, setSelected] = React.useState<CommandType[]>([CMD_TYPES[0], CMD_TYPES[1], CMD_TYPES[2]]);
    const [inputValue, setInputValue] = React.useState("");

    const handleUnselect = React.useCallback((cmdtype: CommandType) => {
        setSelected((prev) => prev.filter((s) => s.value !== cmdtype.value));
        setSelectedTypes?.((prev) => prev.filter((s) => s !== cmdtype.value));
    }, []);

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            const input = inputRef.current;
            if (input) {
                if (e.key === "Delete" || e.key === "Backspace") {
                    if (input.value === "") {
                        setSelected((prev) => {
                            const newSelected = [...prev];
                            newSelected.pop();
                            return newSelected;
                        });
                        setSelectedTypes?.((prev) => {
                            const newSelected = [...prev];
                            newSelected.pop();
                            return newSelected;
                        });
                    }
                }
                // This is not a default behaviour of the <input /> field
                if (e.key === "Escape") {
                    input.blur();
                }
            }
        },
        []
    );

    const selectables = CMD_TYPES.filter(
        (framework) => !selected.includes(framework)
    );

    return (
        <Command
            onKeyDown={handleKeyDown}
            className="overflow-visible bg-transparent"
        >
            <div className={cn("group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}>
                <div className="flex flex-wrap gap-1">
                    {selected.map((framework) => {
                        return (
                            <Badge key={framework.value} variant="secondary">
                                {framework.label}
                                <button
                                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleUnselect(framework);
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onClick={() => handleUnselect(framework)}
                                >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </button>
                            </Badge>
                        );
                    })}
                    {/* Avoid having the "Search" Icon */}
                    <CommandPrimitive.Input
                        ref={inputRef}
                        value={inputValue}
                        onValueChange={setInputValue}
                        onBlur={() => setOpen(false)}
                        onFocus={() => setOpen(true)}
                        placeholder="Select command types..."
                        className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                </div>
            </div>
            <div className="relative mt-2">
                <CommandList>
                    {open && selectables.length > 0 ? (
                        <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                            <CommandGroup className="h-full overflow-auto">
                                {selectables.map((framework) => {
                                    return (
                                        <CommandItem
                                            key={framework.value}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onSelect={() => {
                                                setInputValue("");
                                                setSelected((prev) => [...prev, framework]);
                                                setSelectedTypes?.((prev) => [...prev, framework.value]);
                                            }}
                                            className={"cursor-pointer"}
                                        >
                                            {framework.label}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </div>
                    ) : null}
                </CommandList>
            </div>
        </Command>
    );
}