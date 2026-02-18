"use client";

import * as React from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/* -------------------------------- Context -------------------------------- */

type SelectionPopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedText: string;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  virtualRef: React.RefObject<{ getBoundingClientRect: () => DOMRect }>;
  disabled: boolean;
};

const SelectionPopoverContext =
  React.createContext<SelectionPopoverContextValue | null>(null);

function useSelectionPopoverContext() {
  const ctx = React.useContext(SelectionPopoverContext);
  if (!ctx)
    throw new Error(
      "SelectionPopover.* components must be used within <SelectionPopover>",
    );
  return ctx;
}

/* --------------------------------- Hook ---------------------------------- */

/**
 * Returns the currently selected text inside the selection popover trigger.
 */
function useSelectedText() {
  return useSelectionPopoverContext().selectedText;
}

/**
 * Returns a function to programmatically close the selection popover
 * and clear the browser text selection.
 */
function useSelectionPopoverClose() {
  const { setOpen } = useSelectionPopoverContext();
  return React.useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setOpen(false);
  }, [setOpen]);
}

/* --------------------------------- Root ---------------------------------- */

interface SelectionPopoverProps {
  children: React.ReactNode;
  /** Prevent the popover from opening on text selection. */
  disabled?: boolean;
  /**
   * The delay in ms from when the mouse is released until the popover opens.
   * @default 0
   */
  openDelay?: number;
}

function SelectionPopover({
  children,
  disabled = false,
  openDelay = 0,
}: SelectionPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedText, setSelectedText] = React.useState("");
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const virtualRef = React.useRef({
    getBoundingClientRect: () => new DOMRect(),
  });
  const openTimerRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  // Listen to pointer events to detect text selection inside the trigger.
  React.useEffect(() => {
    if (disabled) return;

    const trigger = triggerRef.current;
    if (!trigger) return;

    let pointerDownInsideTrigger = false;

    const isInsidePopoverContent = (target: Node) => {
      const content = document.querySelector(
        "[data-slot='selection-popover-content']",
      );
      return content?.contains(target) ?? false;
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Ignore clicks inside the popover content (e.g. color swatches)
      if (isInsidePopoverContent(e.target as Node)) return;

      pointerDownInsideTrigger = trigger.contains(e.target as Node);

      // Always close the previous popover when starting a new selection
      clearTimeout(openTimerRef.current);
      setOpen(false);
    };

    const handlePointerUp = () => {
      if (!pointerDownInsideTrigger) return;
      pointerDownInsideTrigger = false;

      const show = () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.rangeCount)
          return;

        const range = selection.getRangeAt(0);
        const text = selection.toString().trim();

        if (!text || !trigger.contains(range.commonAncestorContainer)) return;

        // Keep a live reference to the range so that
        // getBoundingClientRect returns the current position on every
        // call (floating-ui's autoUpdate polls this on scroll/resize).
        virtualRef.current = {
          getBoundingClientRect: () => range.getBoundingClientRect(),
        };

        setSelectedText(text);
        setOpen(true);
      };

      // requestAnimationFrame ensures the browser has finished updating the
      // selection before we read it.
      requestAnimationFrame(() => {
        if (openDelay > 0) {
          openTimerRef.current = setTimeout(show, openDelay);
        } else {
          show();
        }
      });
    };

    const handleSelectionChange = () => {
      // If the selection collapses (e.g. user clicks elsewhere), close.
      // But ignore if the focus is inside the popover content (e.g. clicking a button).
      const active = document.activeElement;
      if (active && isInsidePopoverContent(active)) return;

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        clearTimeout(openTimerRef.current);
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      clearTimeout(openTimerRef.current);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [disabled, openDelay]);

  // Radix Popover manages focus‑trapping, escape key, and portal for us.
  return (
    <SelectionPopoverContext.Provider
      value={{ open, setOpen, selectedText, triggerRef, virtualRef, disabled }}
    >
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        {/* Virtual anchor positioned at the text selection */}
        <PopoverPrimitive.Anchor
          virtualRef={
            virtualRef as React.RefObject<{
              getBoundingClientRect: () => DOMRect;
            }>
          }
        />
        {children}
      </PopoverPrimitive.Root>
    </SelectionPopoverContext.Provider>
  );
}

/* -------------------------------- Trigger -------------------------------- */

interface SelectionPopoverTriggerProps extends React.ComponentProps<"div"> {}

function SelectionPopoverTrigger({
  className,
  ...props
}: SelectionPopoverTriggerProps) {
  const { triggerRef } = useSelectionPopoverContext();

  return (
    <div
      ref={triggerRef}
      data-slot="selection-popover-trigger"
      className={className}
      {...props}
    />
  );
}

/* -------------------------------- Content -------------------------------- */

interface SelectionPopoverContentProps extends React.ComponentProps<
  typeof PopoverPrimitive.Content
> {}

function SelectionPopoverContent({
  className,
  side = "top",
  sideOffset = 8,
  align = "center",
  onOpenAutoFocus,
  ...props
}: SelectionPopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="selection-popover-content"
        side={side}
        sideOffset={sideOffset}
        align={align}
        // Prevent any click inside the popover from moving focus, which
        // would collapse the user's text selection.
        onPointerDown={(e) => e.preventDefault()}
        // Prevent the popover from stealing focus (which would collapse the
        // user's text selection).
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          onOpenAutoFocus?.(e);
        }}
        className={cn(
          "bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 flex items-center gap-1 rounded-lg p-1 shadow-md ring-1 ring-foreground/10 origin-(--radix-popover-content-transform-origin) outline-hidden",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

/* -------------------------------- Arrow --------------------------------- */

interface SelectionPopoverArrowProps extends React.ComponentProps<
  typeof PopoverPrimitive.Arrow
> {}

function SelectionPopoverArrow({
  className,
  ...props
}: SelectionPopoverArrowProps) {
  return (
    <PopoverPrimitive.Arrow
      data-slot="selection-popover-arrow"
      className={cn("fill-popover", className)}
      {...props}
    />
  );
}

/* ------------------------------- Exports -------------------------------- */

export {
  SelectionPopover,
  SelectionPopoverTrigger,
  SelectionPopoverContent,
  SelectionPopoverArrow,
  useSelectedText,
  useSelectionPopoverClose,
};
