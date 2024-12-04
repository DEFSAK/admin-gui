import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormField, FormItem, FormControl, FormMessage } from "./form";
import { Check, ChevronsUpDown, Edit2 } from "lucide-react";
import { createForm, getBaseObject } from "@/lib/forms";
import { FloatingLabelInput } from "./floating-input";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAPI } from "../api-provider";
import { cn } from "@/lib/utils";
import * as React from "react";
import { z } from "zod";

interface PunishmentSelectorProps {
    onChange?: (punishments: Punishment[]) => void;
    className?: string;
}

export function PunishmentSelector({ className, onChange }: PunishmentSelectorProps) {
    const [selectedValues, setSelectedValues] = React.useState<Punishment[]>([]);
    const [punishments, setPunishments] = React.useState<Punishment[]>([]);
    const [inputValue, setInputValue] = React.useState<string>("");
    const [openCombobox, setOpenCombobox] = React.useState(false);
    const [openDialog, setOpenDialog] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const { api } = useAPI();

    React.useEffect(() => {
        api.call<Punishment[]>('fetch_punishments').then((newPunishments) => {
            newPunishments && setPunishments(newPunishments);
        })
    }, [])

    React.useEffect(() => {
        if (selectedValues.length > 0) {
            onChange?.(selectedValues);
        }
    }, [selectedValues])

    const createPunishment = (label: string) => {
        const newPunishment = {
            min_duration: 1,
            max_duration: 1,
            reason: label,
            label,
        };

        if (inputRef && inputRef.current) {
            inputRef.current.value = "";
        }

        setSelectedValues((prev) => [...prev, newPunishment]);
        setPunishments((prev) => [...prev, newPunishment]);

        api.call('update_punishments', newPunishment);
    };

    const togglePunishment = (punishment: Punishment) => {
        setSelectedValues((currentPunishments) =>
            !currentPunishments.includes(punishment)
                ? [...currentPunishments, punishment]
                : currentPunishments.filter((l) => l.label !== punishment.label)
        );
        inputRef?.current?.focus();
    };

    const updatePunishment = (punishment: Punishment, newPunishment: Punishment) => {
        setPunishments((prev) =>
            prev.map((f) => (f.label === punishment.label ? newPunishment : f))
        );
        setSelectedValues((prev) =>
            prev.map((f) => (f.label === punishment.label ? newPunishment : f))
        );

        api.call('update_punishments', newPunishment);
    };

    const deletePunishment = (punishment: Punishment) => {
        setPunishments((prev) => prev.filter((f) => f.label !== punishment.label));
        setSelectedValues((prev) =>
            prev.filter((f) => f.label !== punishment.label)
        );

        api.call('delete_punishment', punishment.label);
    };

    const onComboboxOpenChange = (value: boolean) => {
        inputRef.current?.blur();
        setOpenCombobox(value);
    };

    return (
        <div>
            <Popover open={openCombobox} onOpenChange={onComboboxOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCombobox}
                        className={cn("text-foreground", className)}
                    >
                        <span className="truncate">
                            {selectedValues.length === 0 && "Select Punishments"}
                            {selectedValues.length === 1 && selectedValues[0].label}
                            {selectedValues.length === 2 &&
                                selectedValues.map(({ label }) => label).join(", ")}
                            {selectedValues.length > 2 &&
                                `${selectedValues.length} Punishments selected`}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                    <Command loop>
                        <CommandInput
                            ref={inputRef}
                            placeholder="Search Punishments..."
                            value={inputValue}
                            onValueChange={setInputValue}
                        />
                        <CommandList>
                            <CommandGroup className="max-h-[145px] overflow-auto">
                                {punishments.map((punishment) => {
                                    const isActive = selectedValues.includes(punishment);
                                    return (
                                        <CommandItem
                                            key={punishment.label}
                                            value={punishment.label}
                                            onSelect={() => togglePunishment(punishment)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    isActive ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex-1">{punishment.label}</div>
                                            <div className="flex-1">{punishment.min_duration}-{punishment.max_duration} hour(s)</div>
                                        </CommandItem>
                                    );
                                })}
                                <CommandItemCreate
                                    onSelect={() => createPunishment(inputValue)}
                                    {...{ inputValue, punishments }}
                                />
                            </CommandGroup>
                            <CommandSeparator alwaysRender />
                            <CommandGroup>
                                <CommandItem
                                    value={`:${inputValue}:`}
                                    className="text-xs text-muted-foreground"
                                    onSelect={() => setOpenDialog(true)}
                                >
                                    <div className={cn("mr-2 h-4 w-4")} />
                                    <Edit2 className="mr-2 h-2.5 w-2.5" />
                                    Edit Punishments
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <Dialog
                open={openDialog}
                onOpenChange={(open) => {
                    if (!open) {
                        setOpenCombobox(true);
                    }
                    setOpenDialog(open);
                }}
            >
                <DialogContent className="flex max-h-[90vh] flex-col">
                    <DialogHeader>
                        <DialogTitle>Edit Punishments</DialogTitle>
                        <DialogDescription>
                            Change the Punishment reason/label/duration or delete them. Create a Punishment through the combobox though.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="-mx-6 flex-1 overflow-auto px-6 py-2">
                        {punishments.map((punishment) => {
                            return (
                                <DialogListItem
                                    key={punishment.label}
                                    onDelete={() => deletePunishment(punishment)}
                                    onSubmit={(data: Punishment) => updatePunishment(punishment, data)}
                                    {...punishment}
                                />
                            );
                        })}
                    </div>
                    <DialogFooter className="bg-opacity-40">
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

const CommandItemCreate = ({
    inputValue,
    punishments,
    onSelect,
}: {
    inputValue: string;
    punishments: Punishment[];
    onSelect: () => void;
}) => {
    const hasNoPunishment = !punishments
        .map(({ label }) => label.toLowerCase())
        .includes(`${inputValue.toLowerCase()}`);

    const render = inputValue !== "" && hasNoPunishment;

    if (!render) return null;

    // BUG: whenever a space is appended, the Create-Button will not be shown.
    // PARTIAL FIX: key={`${inputValue.trim().replace(" ", "-")}`}
    return (
        <CommandItem
            key={`${inputValue}`}
            value={`${inputValue}`}
            className="text-xs text-muted-foreground"
            onSelect={onSelect}
        >
            <div className={cn("mr-2 h-4 w-4")} />
            Create new Punishment &quot;{inputValue}&quot;
        </CommandItem>
    );
};

const PunishmentSchema = z.object({
    label: z.string().min(1, {
        message: "Label must be at least 1 character long",
    }),
    reason: z.string().min(1, {
        message: "Reason must be at least 1 character long",
    }),
    min_duration: z.coerce.number().min(1, {
        message: "Min. Duration must be at least 1 hour",
    }).max(999999, {
        message: "Min. Duration must be at most 999999 hours",
    }),
    max_duration: z.coerce.number().min(1, {
        message: "Max. Duration must be at least 1 hour",
    }).max(999999, {
        message: "Max. Duration must be at most 999999 hours",
    }),
}).refine(data => data.min_duration <= data.max_duration, {
    message: "Min. Duration must be less than or equal to Max. Duration",
    path: ["min_duration"],
}).refine(data => data.max_duration >= data.min_duration, {
    message: "Max. Duration must be greater than or equal to Min. Duration",
    path: ["max_duration"],
})

const DialogListItem = ({
    reason,
    label,
    min_duration,
    max_duration,
    onSubmit,
    onDelete,
}: Punishment & {
    onSubmit: (data: z.infer<typeof PunishmentSchema>) => void;
    onDelete: () => void;
}) => {
    const [accordionValue, setAccordionValue] = React.useState("");

    const form = createForm(getBaseObject(PunishmentSchema), {
        label, reason, min_duration, max_duration
    });

    return (
        <Accordion
            key={label}
            type="single"
            collapsible
            value={accordionValue}
            onValueChange={setAccordionValue}
        >
            <AccordionItem value={label}>
                <div className="flex items-center justify-between">
                    <div>
                        <Badge variant="outline">
                            {label}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <AccordionTrigger>Edit</AccordionTrigger>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="xs">
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You are about to delete the Punishment{" "}
                                        <Badge variant="outline">
                                            {label}
                                        </Badge>{" "}
                                        .
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={onDelete}>
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
                <AccordionContent className="p-2">

                    <Form {...form}>
                        <form
                            className="flex flex-col gap-4 overflow-auto"
                            onSubmit={form.handleSubmit((data) => {
                                onSubmit(data);
                                setAccordionValue("");
                            })}
                        >
                            <FormField control={form.control} name="label" render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <FloatingLabelInput label="Label name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="reason" render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <FloatingLabelInput {...field} label="Reason" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="min_duration" render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <FloatingLabelInput type="number" label="Min. Duration" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="max_duration" render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <FloatingLabelInput type="number" label="Max. Duration" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Button type="submit" variant="outline" size="xs" className="mt-2">Save</Button>
                        </form>
                    </Form>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};