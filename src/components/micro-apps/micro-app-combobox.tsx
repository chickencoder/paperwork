"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-is-mobile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
  onOpenChange?: (open: boolean) => void;
}

export function MicroAppCombobox({
  onSelect,
  hasDocument = false,
  onOpenChange,
}: MicroAppComboboxProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

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

  const triggerButton = (
    <button
      type="button"
      onClick={() => isMobile && handleOpenChange(true)}
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
  );

  const commandContent = (
    <Command className="rounded-2xl">
      <CommandInput placeholder="Search tools..." className="h-12" />
      <CommandList className="max-h-80 md:max-h-80 max-h-[50vh]">
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
                    "flex items-start gap-3 px-3 py-2.5 md:py-2.5 py-3 rounded-xl cursor-pointer",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 md:w-8 md:h-8 w-10 h-10 rounded-lg shrink-0",
                      "bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4 md:w-4 md:h-4 w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-sm text-base font-medium leading-tight">
                      {app.name}
                    </p>
                    <p className="text-xs md:text-xs text-sm text-muted-foreground mt-0.5 leading-tight">
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
  );

  // Mobile: use Drawer
  if (isMobile) {
    return (
      <>
        {triggerButton}
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader className="pb-0">
              <DrawerTitle>Tools</DrawerTitle>
            </DrawerHeader>
            <div className="px-2 pb-8">
              {commandContent}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Desktop: use Popover
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {triggerButton}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={12}
        className="w-72 p-0 rounded-2xl overflow-hidden"
      >
        {commandContent}
      </PopoverContent>
    </Popover>
  );
}
