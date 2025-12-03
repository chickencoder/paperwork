"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { microApps } from "./registry";
import { MicroApp, MicroAppCategory, categoryLabels } from "./types";

interface MicroAppComboboxProps {
  onSelect: (app: MicroApp) => void;
  hasDocument?: boolean;
}

export function MicroAppCombobox({
  onSelect,
  hasDocument = false,
}: MicroAppComboboxProps) {
  const [open, setOpen] = useState(false);

  // Group apps by category
  const appsByCategory = microApps.reduce(
    (acc, app) => {
      if (!acc[app.category]) {
        acc[app.category] = [];
      }
      acc[app.category].push(app);
      return acc;
    },
    {} as Record<MicroAppCategory, MicroApp[]>
  );

  const categories = Object.keys(appsByCategory) as MicroAppCategory[];

  const handleSelect = (app: MicroApp) => {
    setOpen(false);
    onSelect(app);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "text-muted-foreground hover:text-foreground hover:bg-accent",
            "text-sm font-medium",
            open && "bg-accent text-accent-foreground"
          )}
        >
          <Wand2 className="w-4 h-4" />
          Tools
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={12}
        className="w-72 p-0 rounded-2xl overflow-hidden"
      >
        <Command className="rounded-2xl">
          <CommandInput placeholder="Search tools..." className="h-10" />
          <CommandList className="max-h-80">
            <CommandEmpty>No tools found.</CommandEmpty>
            {categories.map((category) => (
              <CommandGroup key={category} heading={categoryLabels[category]}>
                {appsByCategory[category].map((app) => {
                  const Icon = app.icon;
                  const isDisabled = app.requiresDocument && !hasDocument;

                  return (
                    <CommandItem
                      key={app.id}
                      value={`${app.name} ${app.description} ${app.keywords?.join(" ") || ""}`}
                      onSelect={() => !isDisabled && handleSelect(app)}
                      disabled={isDisabled}
                      className={cn(
                        "flex items-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer",
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-lg shrink-0",
                          "bg-muted"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">
                          {app.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                          {app.description}
                        </p>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
