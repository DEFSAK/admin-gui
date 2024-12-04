import { Command, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ComboBoxProps {
    options: string[];
    onChange?: (value: string) => void;
    className?: string;
}

function capitalize(str: string | undefined) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : undefined;
}

function ComboBox({ options, className, onChange }: ComboBoxProps) {
    const [value, setValue] = useState(options[0]);
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-fit justify-between", className || "")}
                >
                    {value
                        ? capitalize(options.find((o) => o === value))
                        : "Select an option..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[150px] p-0">
                <Command>
                    <CommandList className="max-h-[200px]">
                        <CommandEmpty>No options found :(</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option}
                                    value={option}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? options[0] : currentValue);
                                        onChange?.(currentValue === value ? options[0] : currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {capitalize(option)}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default ComboBox;