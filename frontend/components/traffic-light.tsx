import { cn } from "@/lib/utils"

interface TrafficLightProps {
  status: "red" | "yellow" | "green"
  className?: string
}

export function TrafficLight({ status, className }: TrafficLightProps) {
  return (
    <div className={cn("flex flex-col items-center space-y-1 scale-150", className)}>
      <div className={cn("h-4 w-4 rounded-full border", status === "red" ? "bg-red-500" : "bg-red-500/20")} />
      <div className={cn("h-4 w-4 rounded-full border", status === "yellow" ? "bg-yellow-500" : "bg-yellow-500/20")} />
      <div className={cn("h-4 w-4 rounded-full border", status === "green" ? "bg-green-500" : "bg-green-500/20")} />
    </div>
  )
}
