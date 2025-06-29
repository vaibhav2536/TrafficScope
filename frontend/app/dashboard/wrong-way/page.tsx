"use client"

import { useState, useEffect } from "react"
import { Clock, LogOut, LayoutDashboard, ArrowLeft, FileText, Calendar, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar"
import { VideoFeed } from "@/components/video-feed"
import { Badge } from "@/components/ui/badge"
import { CVModel } from "@/types"
import { useAppContext } from "@/context/app-provider"
import StreamVideo from "@/components/stream-video"
import DetectionTable from "@/components/detection-table"
import DetectionCards from "@/components/detection-cards"

export default function WrongWayPage() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeModel, setActiveModel] = useState<CVModel>("wrongWay");
  const { detections } = useAppContext();
  const handleLogout = () => {
    router.push("/")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6" />
          <span className="text-lg font-bold">
            <span className="text-primary">Road</span>
            <span className="text-green-500">Lens</span>
          </span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{currentTime.toLocaleTimeString()}</span>
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </header>
      <div className="grid flex-1 items-start gap-4 p-4 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr] lg:gap-8 lg:p-8">
        <Sidebar />
        <main className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold md:text-2xl">Wrong Way Detection</h1>
          </div>
          <Tabs defaultValue="detection">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="detection">Live Detection</TabsTrigger>
              <TabsTrigger value="history">Detection History</TabsTrigger>
            </TabsList>
            <TabsContent value="detection" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left side - Detection data */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detection Information</CardTitle>
                    <CardDescription>Real-time wrong way vehicle detection</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Status:</div>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Today's Statistics:</div>
                        <div className="grid grid-cols-1 gap-4">
                          <Card>
                            <CardContent className="p-4 flex flex-col items-center justify-center">
                              <span className="text-3xl font-bold">{detections.wrongWay.length}</span>
                              <span className="text-xs text-muted-foreground">Violations Detected</span>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Monitoring Locations:</div>
                        <div className="p-3 rounded-lg border">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">Active Cameras</p>
                              <p className="text-xs text-muted-foreground">8 locations monitored</p>
                            </div>
                            <Badge className="bg-blue-500">All Online</Badge>
                          </div>
                          <div className="mt-2 text-xs">
                            <div className="flex items-center gap-1">
                              <ArrowLeft className="h-3 w-3 text-muted-foreground" />
                              <span>Current view: Highway 101 - Exit 3 (One-way)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Latest Detections:</div>
                        <div className="space-y-2">
                          <DetectionCards detections={detections} activeModel={activeModel} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right side - Video feed */}
                <Card>
                  <CardHeader>
                    <CardTitle>Live Camera Feed</CardTitle>
                    <CardDescription>Monitoring for wrong way vehicles</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <StreamVideo activeModel="wrongWay" />
                    <div className="p-4">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span>Live Feed</span>
                        </div>
                        <span className="text-muted-foreground">Highway 101 - Exit 3 (One-way)</span>
                      </div>
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">Traffic Flow</p>
                            <p className="text-xs text-muted-foreground">Normal (Southbound only)</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Current Status</p>
                            <p className="text-xs text-green-500 font-medium">No violations</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Wrong Way Detection History</CardTitle>
                  <CardDescription>Record of wrong way violations detected by the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">

                    <DetectionTable detections={detections.wrongWay}/>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Showing 10 of 42 violations</div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" disabled>
                          Previous
                        </Button>
                        <Button variant="outline" size="sm">
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

// Sample data for latest wrong way detections
const latestWrongWayDetections = [
  {
    time: "30 min ago",
    location: "Highway 101 - Exit 3 (One-way)",
    vehicle: "Blue Sedan",
    speed: "45",
    licensePlate: "ABC-1234",
  },
  {
    time: "2 hours ago",
    location: "Main Street - One-way Section",
    vehicle: "Red SUV",
    speed: "32",
    licensePlate: "XYZ-5678",
  },
  {
    time: "3 hours ago",
    location: "Downtown - One-way Loop",
    vehicle: "Black Truck",
    speed: "28",
    licensePlate: "DEF-9012",
  },
]

// Sample data for wrong way history
const wrongWayHistory = [
  {
    time: "Today, 9:30 AM",
    location: "Highway 101 - Exit 3 (One-way)",
    vehicle: "Blue Sedan",
    licensePlate: "ABC-1234",
    speed: "45",
  },
  {
    time: "Today, 8:15 AM",
    location: "Main Street - One-way Section",
    vehicle: "Red SUV",
    licensePlate: "XYZ-5678",
    speed: "32",
  },
  {
    time: "Today, 7:05 AM",
    location: "Downtown - One-way Loop",
    vehicle: "Black Truck",
    licensePlate: "DEF-9012",
    speed: "28",
  },
  {
    time: "Yesterday, 5:45 PM",
    location: "North Avenue - One-way",
    vehicle: "White Van",
    licensePlate: "GHI-3456",
    speed: "38",
  },
  {
    time: "Yesterday, 3:20 PM",
    location: "East Boulevard - One-way",
    vehicle: "Gray Sedan",
    licensePlate: "JKL-7890",
    speed: "42",
  },
  {
    time: "Oct 15, 2023",
    location: "South Street - One-way",
    vehicle: "Silver SUV",
    licensePlate: "MNO-1234",
    speed: "35",
  },
  {
    time: "Oct 15, 2023",
    location: "West Road - One-way",
    vehicle: "Black Sedan",
    licensePlate: "PQR-5678",
    speed: "30",
  },
  {
    time: "Oct 14, 2023",
    location: "Highway 101 - Exit 5 (One-way)",
    vehicle: "Blue Hatchback",
    licensePlate: "STU-9012",
    speed: "48",
  },
  {
    time: "Oct 14, 2023",
    location: "Central Avenue - One-way",
    vehicle: "Red Pickup",
    licensePlate: "VWX-3456",
    speed: "33",
  },
  {
    time: "Oct 13, 2023",
    location: "Downtown - One-way Loop",
    vehicle: "Green SUV",
    licensePlate: "YZA-7890",
    speed: "25",
  },
]
