import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormField, FormItem, FormControl, FormMessage } from "./form";
import { createForm, getBaseObject, getDefaults } from "@/lib/forms";
import { Check, ChevronsUpDown, Edit2 } from "lucide-react";
import { FloatingLabelInput } from "./floating-input";
import { DialogClose } from "@radix-ui/react-dialog";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAPI } from "../api-provider";
import { cn } from "@/lib/utils";
import { z } from "zod";

type Preset<T> = { label: string } & T;
type Schema = z.ZodEffects<z.ZodEffects<z.AnyZodObject>> | z.AnyZodObject;

interface PresetSelectorProps<T> {
    onChange?: (selected: T[]) => void;
    className?: string;
    presetKey: string;
    schema: Schema;
}

export function PresetSelector<T>({ presetKey, schema, className, onChange }: PresetSelectorProps<Preset<T>>) {
    const [selected, setSelected] = useState<Preset<T>[]>([]);
    const [values, setValues] = useState<Preset<T>[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [comboOpen, setComboOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { api } = useAPI();

    useEffect(() => {
        api.call<Preset<T>[]>(`fetch_${presetKey}`).then((newValues) => {
            newValues && setValues(newValues);
        });
    }, [])

    useEffect(() => {
        onChange?.(selected);
    }, [selected])

    const createValue = (label: string) => {
        const newValue = {
            ...getDefaults(getBaseObject(schema)),
            label
        } as Preset<T>;

        if (inputRef && inputRef.current) {
            inputRef.current.value = '';
        }

        setSelected((prev) => [...prev, newValue]);
        setValues((prev) => [...prev, newValue]);

        api.call(`update_${presetKey}`, newValue);
    }

    const toggleValue = (value: Preset<T>) => {
        setSelected((curr) => !curr.includes(value)
            ? [...curr, value]
            : curr.filter((l) => l.label !== value.label)
        );
        inputRef?.current?.focus();
    }

    const updateValue = (value: Preset<T>, newValue: Preset<T>) => {
        setValues((prev) => prev.map((v) => (v.label === value.label ? newValue : v)));
        setSelected((prev) => prev.map((v) => (v.label === value.label ? newValue : v)));

        api.call(`update_${presetKey}`, newValue);
    }

    const deleteValue = (value: Preset<T>) => {
        setValues((prev) => prev.filter((v) => v.label !== value.label));
        setSelected((prev) => prev.filter((v) => v.label !== value.label));

        api.call(`delete_${presetKey}`, value.label);
    }

    const onOpenChange = (value: boolean) => {
        inputRef?.current?.blur();
        setComboOpen(value);
    }

    return (
        <div>
            <Popover open={comboOpen} onOpenChange={onOpenChange}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={comboOpen}
                        className={cn("text-foreground", className)}
                    >
                        <span className="truncate">
                            {selected.length === 0 && "Select Presets"}
                            {selected.length === 1 && selected[0].label}
                            {selected.length === 2 &&
                                selected.map(({ label }) => label).join(", ")}
                            {selected.length > 2 &&
                                `${selected.length} Presets selected`}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                    <Command loop>
                        <CommandInput
                            ref={inputRef}
                            placeholder="Search Presets..."
                            value={inputValue}
                            onValueChange={setInputValue}
                        />
                        <CommandList>
                            <CommandGroup className="max-h-[145px] overflow-auto">
                                {values.map((value) => {
                                    const isActive = selected.includes(value);
                                    return (
                                        <CommandItem
                                            key={`command-${value.label}`}
                                            value={value.label}
                                            onSelect={() => toggleValue(value)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    isActive ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex-1">{value.label}</div>
                                            {/* TODO: custom display somewhere */}
                                        </CommandItem>
                                    );
                                })}
                                <CommandItemCreate<T>
                                    onSelect={() => createValue(inputValue)}
                                    inputValue={inputValue}
                                    values={values}
                                />
                            </CommandGroup>
                            <CommandSeparator alwaysRender />
                            <CommandGroup>
                                <CommandItem
                                    value={`:${inputValue}:`}
                                    className="text-xs text-muted-foreground"
                                    onSelect={() => setDialogOpen(true)}
                                >
                                    <span className={cn("mr-2 h-4 w-4")} />
                                    <Edit2 className="mr-2 h-2.5 w-2.5" />
                                    Edit Presets
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setComboOpen(true);
                    }
                    setDialogOpen(open);
                }}
            >
                <DialogContent className="flex max-h-[90vh] flex-col">
                    <DialogHeader>
                        <DialogTitle>Edit Presets</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Manage your Presets here. You can edit or delete them.
                    </DialogDescription>
                    <div className="-mx-6 flex-1 overflow-auto px-6 py-2">
                        {values.map((value) => {
                            return (
                                <DialogListItem<T>
                                    schema={schema}
                                    key={`dialog-list-${value.label}`}
                                    onDelete={() => deleteValue(value)}
                                    onSubmit={(data: Preset<T>) => updateValue(value, data)}
                                    value={value}
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

interface CommandItemCreateProps<T> {
    inputValue: string;
    values: T[];
    onSelect: () => void;
}

function CommandItemCreate<T>({ inputValue, values, onSelect }: CommandItemCreateProps<Preset<T>>) {
    const hasNoValue = !values.map((value) => { if (value && value.label) { return value.label.toLowerCase() } else return "" })
        .includes(inputValue.toLowerCase());
    const render = inputValue !== "" && hasNoValue;
    if (!render) return null;

    return (
        <CommandItem
            key={`command-item-create-${inputValue}`}
            value={`${inputValue}`}
            className="text-xs text-muted-foreground"
            onSelect={onSelect}
        >
            <div className={cn("mr-2 h-4 w-4")} />
            Create new Preset &quot;{inputValue}&quot;
        </CommandItem>
    );
}

interface DialogListItemProps<T> {
    schema: Schema;
    onDelete: () => void;
    onSubmit: (data: T) => void;
    value: T;
}

function DialogListItem<T>({ schema, value, onDelete, onSubmit }: DialogListItemProps<Preset<T>>) {
    const [accordionValue, setAccordionValue] = useState("");

    const form = createForm<any>(getBaseObject(schema), value);

    const value_keys = Object.keys(value);
    const labels = value_keys.map((key) => {
        return key.split(/[_-]/).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    });

    return (
        <Accordion
            key={`accordion-${value.label}`}
            type="single"
            collapsible
            value={accordionValue}
            onValueChange={setAccordionValue}
        >
            <AccordionItem value={value.label}>
                <div className="flex items-center justify-between">
                    <div>
                        <Badge variant="outline">
                            {value.label}
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
                                        You are about to delete the Preset{" "}
                                        <Badge variant="outline">
                                            {value.label}
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
                            {value_keys.map((key, index) => {
                                return (
                                    <FormField control={form.control} name={key} render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <FloatingLabelInput label={labels[index]} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                );
                            })}
                            <Button type="submit" variant="outline" size="xs" className="mt-2">Save</Button>
                        </form>
                    </Form>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}