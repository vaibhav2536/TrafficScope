"use client"

import { useState, useEffect } from "react"
import { Clock, LogOut, LayoutDashboard, User, FileText, Calendar, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar"
import { VideoFeed } from "@/components/video-feed"
import { Badge } from "@/components/ui/badge"

export default function FaceRecognitionPage() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

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
            <h1 className="text-xl font-bold md:text-2xl">Criminal Face Recognition</h1>
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
                    <CardDescription>Real-time criminal face recognition</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Status:</div>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Today's Statistics:</div>
                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardContent className="p-4 flex flex-col items-center justify-center">
                              <span className="text-3xl font-bold">2</span>
                              <span className="text-xs text-muted-foreground">Matches Found</span>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 flex flex-col items-center justify-center">
                              <span className="text-3xl font-bold">1,245</span>
                              <span className="text-xs text-muted-foreground">Faces Scanned</span>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Database Status:</div>
                        <div className="p-3 rounded-lg border">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">Criminal Database</p>
                              <p className="text-xs text-muted-foreground">Last updated: Today, 8:30 AM</p>
                            </div>
                            <Badge className="bg-blue-500">Connected</Badge>
                          </div>
                          <div className="mt-2 text-xs">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span>Total profiles in database: 25,678</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Latest Detections:</div>
                        <div className="space-y-2">
                          {latestFaceDetections.map((detection, index) => (
                            <div key={index} className="flex items-start gap-2 rounded-lg border p-3">
                              <div className="rounded-full bg-red-500/20 p-1">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">Face Match</p>
                                  <p className="text-xs text-muted-foreground">{detection.time}</p>
                                </div>
                                <p className="text-xs text-muted-foreground">{detection.location}</p>
                                <div className="flex justify-between mt-1">
                                  <p className="text-xs">Name: {detection.name}</p>
                                  <p className="text-xs font-bold text-red-500">Match: {detection.matchConfidence}%</p>
                                </div>
                                <p className="text-xs">Case: {detection.caseNumber}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right side - Video feed */}
                <Card>
                  <CardHeader>
                    <CardTitle>Live Camera Feed</CardTitle>
                    <CardDescription>Monitoring for criminal face matches</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <VideoFeed id="face-recognition-feed" label="Face Recognition Camera" />
                    <div className="p-4">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span>Live Feed</span>
                        </div>
                        <span className="text-muted-foreground">Central Station - Entrance</span>
                      </div>
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">Faces Detected</p>
                            <p className="text-xs text-muted-foreground">3 in current frame</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Processing</p>
                            <div className="h-1 w-24 rounded-full bg-background mt-1">
                              <div className="h-1 rounded-full bg-blue-500 animate-pulse" style={{ width: "65%" }} />
                            </div>
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
                  <CardTitle>Face Recognition History</CardTitle>
                  <CardDescription>Record of criminal face matches detected by the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Export Report
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="mr-2 h-4 w-4" />
                          Filter by Date
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-md border">
                      <div className="grid grid-cols-6 p-4 font-medium border-b">
                        <div>Date & Time</div>
                        <div>Location</div>
                        <div>Name</div>
                        <div>Match %</div>
                        <div>Case Number</div>
                        <div className="text-right">Actions</div>
                      </div>
                      {faceRecognitionHistory.map((detection, index) => (
                        <div key={index} className="grid grid-cols-6 p-4 items-center border-b last:border-0">
                          <div className="text-sm">{detection.time}</div>
                          <div className="text-sm">{detection.location}</div>
                          <div className="text-sm">{detection.name}</div>
                          <div className="text-sm font-bold text-red-500">{detection.matchConfidence}%</div>
                          <div className="text-sm">{detection.caseNumber}</div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Showing 10 of 28 detections</div>
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

// Sample data for latest face detections
const latestFaceDetections = [
  {
    time: "Just now",
    location: "Central Station - Entrance",
    name: "John Doe",
    matchConfidence: "97",
    caseNumber: "CR-2023-0456",
  },
  {
    time: "30 min ago",
    location: "Main Street - ATM",
    name: "Michael Smith",
    matchConfidence: "94",
    caseNumber: "CR-2023-0442",
  },
  {
    time: "2 hours ago",
    location: "Shopping Mall - North Entrance",
    name: "Robert Johnson",
    matchConfidence: "91",
    caseNumber: "CR-2023-0438",
  },
]

// Sample data for face recognition history
const faceRecognitionHistory = [
  {
    time: "Today, 10:25 AM",
    location: "Central Station - Entrance",
    name: "John Doe",
    matchConfidence: "97",
    caseNumber: "CR-2023-0456",
  },
  {
    time: "Today, 9:55 AM",
    location: "Main Street - ATM",
    name: "Michael Smith",
    matchConfidence: "94",
    caseNumber: "CR-2023-0442",
  },
  {
    time: "Today, 8:30 AM",
    location: "Shopping Mall - North Entrance",
    name: "Robert Johnson",
    matchConfidence: "91",
    caseNumber: "CR-2023-0438",
  },
  {
    time: "Yesterday, 4:15 PM",
    location: "Bus Terminal",
    name: "David Williams",
    matchConfidence: "95",
    caseNumber: "CR-2023-0425",
  },
  {
    time: "Yesterday, 2:30 PM",
    location: "Train Station",
    name: "James Brown",
    matchConfidence: "92",
    caseNumber: "CR-2023-0419",
  },
  {
    time: "Yesterday, 11:45 AM",
    location: "City Park",
    name: "Richard Davis",
    matchConfidence: "89",
    caseNumber: "CR-2023-0412",
  },
  {
    time: "Oct 15, 2023",
    location: "Gas Station",
    name: "Thomas Wilson",
    matchConfidence: "93",
    caseNumber: "CR-2023-0398",
  },
  {
    time: "Oct 15, 2023",
    location: "Convenience Store",
    name: "Charles Miller",
    matchConfidence: "90",
    caseNumber: "CR-2023-0392",
  },
  {
    time: "Oct 14, 2023",
    location: "Bank",
    name: "Joseph Taylor",
    matchConfidence: "96",
    caseNumber: "CR-2023-0385",
  },
  {
    time: "Oct 14, 2023",
    location: "Pharmacy",
    name: "Daniel Anderson",
    matchConfidence: "88",
    caseNumber: "CR-2023-0379",
  },
]
