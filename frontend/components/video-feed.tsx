interface VideoFeedProps {
  id: string
  label: string
}

export function VideoFeed({ id, label }: VideoFeedProps) {
  return (
    <div className="relative overflow-hidden rounded-md border bg-muted">
      <div className="aspect-video w-full bg-black">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse rounded-full bg-muted-foreground/10 px-3 py-1 text-xs text-muted-foreground">
              Live Feed: {label}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-xs backdrop-blur-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span>LIVE</span>
      </div>
    </div>
  )
}
