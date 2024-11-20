import { Command, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ComboBoxProps {
    options: { value: string, label: string }[];
    className?: string;
    setLabel?: (label: string) => void;
    setExtValue?: (value: string) => void;
    extLabel?: string;
}

function ComboBox({ options, className, setLabel, setExtValue }: ComboBoxProps) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(options[0].value);


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
                        ? options.find((o) => o.value === value)?.label
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
                                    key={option.value}
                                    value={option.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "name" : currentValue);
                                        setExtValue?.(currentValue);
                                        setLabel?.(option.label);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
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