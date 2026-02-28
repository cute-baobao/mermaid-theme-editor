"use client"

import { GripVerticalIcon, GripHorizontalIcon } from "lucide-react"
import { Group, Panel, Separator } from "react-resizable-panels"
import type { GroupProps, PanelProps, SeparatorProps } from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  orientation = "horizontal",
  ...props
}: GroupProps) {
  return (
    <Group
      data-slot="resizable-panel-group"
      orientation={orientation}
      className={cn(
        "flex h-full w-full",
        orientation === "vertical" ? "flex-col" : "flex-row",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: PanelProps) {
  return <Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  orientation,
  ...props
}: SeparatorProps & {
  withHandle?: boolean
  orientation?: "horizontal" | "vertical"
}) {
  const isHorizontal = orientation === "horizontal"

  return (
    <Separator
      data-slot="resizable-handle"
      className={cn(
        // Base styles
        "relative flex shrink-0 items-center justify-center bg-border",
        "transition-colors hover:bg-primary/20 active:bg-primary/30",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        // data-resize-handle-active state (v4 sets this attribute when dragging)
        "data-[resize-handle-active]:bg-primary/30",
        // Orientation sizing
        isHorizontal
          ? "h-full w-px cursor-col-resize"
          : "h-px w-full cursor-row-resize",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-6 w-4 items-center justify-center rounded-sm border bg-border shadow-sm">
          {isHorizontal ? (
            <GripVerticalIcon className="size-3 text-muted-foreground" />
          ) : (
            <GripHorizontalIcon className="size-3 text-muted-foreground" />
          )}
        </div>
      )}
    </Separator>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }

