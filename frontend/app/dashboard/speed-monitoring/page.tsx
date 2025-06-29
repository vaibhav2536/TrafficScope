"use client"

import { useState, useEffect } from "react"
import { Clock, LogOut, LayoutDashboard, Gauge, Car, AlertTriangle, FileText, Filter, Camera } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar"
import { Badge } from "@/components/ui/badge"
import { VideoFeed } from "@/components/video-feed"

export default function SpeedMonitoringPage() {
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
            <h1 className="text-xl font-bold md:text-2xl">Speed Monitoring</h1>
          </div>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="violations">Speed Violations</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Speed Monitoring Overview</h2>
                  <p className="text-sm text-muted-foreground">Real-time speed monitoring across all lanes</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Camera className="mr-2 h-4 w-4" />
                    All Cameras
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Speed</CardTitle>
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">42 km/h</div>
                    <p className="text-xs text-muted-foreground">-3% from last hour</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Speed Violations</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">+2 from last hour</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,284</div>
                    <p className="text-xs text-muted-foreground">+12% from last hour</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Max Speed</CardTitle>
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">78 km/h</div>
                    <p className="text-xs text-muted-foreground">In 50 km/h zone</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Speed Distribution</CardTitle>
                    <CardDescription>Current speed distribution across all lanes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <SpeedDistributionChart />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Live Monitoring</CardTitle>
                    <CardDescription>Real-time speed monitoring feed</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <VideoFeed id="speed-monitoring" label="Speed Monitoring Camera" />
                    <div className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium">Current Speed Limit:</div>
                          <Badge className="bg-blue-500">50 km/h</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Vehicle Type:</span>
                            <span className="font-medium">Sedan</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Current Speed:</span>
                            <span className="font-medium">48 km/h</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Status:</span>
                            <span className="text-green-500 font-medium">Within Limit</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="violations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Speed Violations</CardTitle>
                  <CardDescription>Recent speed limit violations detected by the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Filter className="mr-2 h-4 w-4" />
                          Filter
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Sort by:</span>
                        <select className="rounded-md border p-1 text-sm">
                          <option>Most Recent</option>
                          <option>Highest Speed</option>
                          <option>Location</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {speedViolations.map((violation, index) => (
                        <div key={index} className="flex items-start gap-4 rounded-lg border p-4">
                          <div className="rounded-full bg-red-500/20 p-2">
                            <Gauge className="h-5 w-5 text-red-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">Speed Violation</p>
                              <Badge className="bg-red-500">+{violation.overLimit} km/h</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{violation.location}</p>
                            <div className="mt-2 flex items-center gap-4">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Time: </span>
                                {violation.time}
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Vehicle: </span>
                                {violation.vehicle}
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-4">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Speed: </span>
                                <span className="font-medium">{violation.speed} km/h</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Limit: </span>
                                {violation.limit} km/h
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              Report
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Speed Analytics</CardTitle>
                  <CardDescription>Detailed speed analytics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <SpeedAnalyticsChart />
                  </div>
                </CardContent>
              </Card>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Speed by Time of Day</CardTitle>
                    <CardDescription>Average speed patterns throughout the day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <SpeedByTimeChart />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Speed by Location</CardTitle>
                    <CardDescription>Average speeds at different monitoring points</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <SpeedByLocationChart />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

function SpeedDistributionChart() {
  const speedRanges = ["0-10", "11-20", "21-30", "31-40", "41-50", "51-60", "61-70", "71-80", "81+"]
  const data = [5, 12, 45, 120, 350, 180, 45, 12, 3]

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-end">
          {data.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={`w-4/5 rounded-t-sm ${index < 5 ? "bg-green-500" : index < 7 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ height: `${value / 4}%` }}
              ></div>
              <div className="text-xs text-muted-foreground mt-2">{speedRanges[index]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SpeedAnalyticsChart() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Average Speed</div>
              <div className="text-2xl font-bold">Last 7 Days</div>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs">Average Speed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs">Speed Limit</span>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            {/* Simulated chart with lines */}
            <div className="absolute inset-0">
              <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
                {/* Average speed line */}
                <path
                  d="M0,250 C100,230 200,200 300,220 C400,240 500,180 600,160 C700,140 800,180 900,200 L1000,180"
                  fill="none"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="3"
                />
                {/* Speed limit line */}
                <path
                  d="M0,150 L1000,150"
                  fill="none"
                  stroke="rgb(239, 68, 68)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>
            </div>
            {/* Y-axis labels */}
            <div className="absolute left-0 inset-y-0 flex flex-col justify-between py-6">
              <div className="text-xs text-muted-foreground">80 km/h</div>
              <div className="text-xs text-muted-foreground">60 km/h</div>
              <div className="text-xs text-muted-foreground">40 km/h</div>
              <div className="text-xs text-muted-foreground">20 km/h</div>
              <div className="text-xs text-muted-foreground">0 km/h</div>
            </div>
            {/* X-axis labels */}
            <div className="absolute bottom-0 inset-x-0 flex justify-between px-6">
              <div className="text-xs text-muted-foreground">Mon</div>
              <div className="text-xs text-muted-foreground">Tue</div>
              <div className="text-xs text-muted-foreground">Wed</div>
              <div className="text-xs text-muted-foreground">Thu</div>
              <div className="text-xs text-muted-foreground">Fri</div>
              <div className="text-xs text-muted-foreground">Sat</div>
              <div className="text-xs text-muted-foreground">Sun</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SpeedByTimeChart() {
  const hours = ["6 AM", "9 AM", "12 PM", "3 PM", "6 PM", "9 PM", "12 AM", "3 AM"]
  const data = [35, 45, 40, 38, 48, 42, 30, 25]

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
            {/* Speed by time line */}
            <path
              d="M0,250 C100,200 200,150 300,180 C400,210 500,100 600,120 C700,140 800,250 900,300 L1000,320"
              fill="none"
              stroke="rgb(234, 179, 8)"
              strokeWidth="3"
            />
            {/* Speed limit line */}
            <path d="M0,150 L1000,150" fill="none" stroke="rgb(239, 68, 68)" strokeWidth="2" strokeDasharray="5,5" />
          </svg>
        </div>
        {/* Y-axis labels */}
        <div className="absolute left-0 inset-y-0 flex flex-col justify-between py-6">
          <div className="text-xs text-muted-foreground">60 km/h</div>
          <div className="text-xs text-muted-foreground">45 km/h</div>
          <div className="text-xs text-muted-foreground">30 km/h</div>
          <div className="text-xs text-muted-foreground">15 km/h</div>
          <div className="text-xs text-muted-foreground">0 km/h</div>
        </div>
        {/* X-axis labels */}
        <div className="absolute bottom-0 inset-x-0 flex justify-between px-6">
          {hours.map((hour, index) => (
            <div key={index} className="text-xs text-muted-foreground">
              {hour}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SpeedByLocationChart() {
  const locations = ["North", "East", "South", "West", "Central"]
  const data = [42, 38, 45, 35, 40]

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-end justify-between px-2">
          {locations.map((location, index) => (
            <div key={index} className="flex flex-col items-center gap-1 w-full">
              <div
                className="w-full max-w-[40px] bg-purple-500 rounded-t-sm"
                style={{ height: `${data[index] * 5}px` }}
              ></div>
              <div className="text-xs text-muted-foreground mt-2">{location}</div>
            </div>
          ))}
        </div>
        {/* Y-axis labels */}
        <div className="absolute left-0 inset-y-0 flex flex-col justify-between py-6">
          <div className="text-xs text-muted-foreground">50 km/h</div>
          <div className="text-xs text-muted-foreground">40 km/h</div>
          <div className="text-xs text-muted-foreground">30 km/h</div>
          <div className="text-xs text-muted-foreground">20 km/h</div>
          <div className="text-xs text-muted-foreground">10 km/h</div>
          <div className="text-xs text-muted-foreground">0 km/h</div>
        </div>
      </div>
    </div>
  )
}

// Sample speed violations data
const speedViolations = [
  {
    speed: 78,
    limit: 50,
    overLimit: 28,
    location: "North Lane",
    time: "Today, 10:10 AM",
    vehicle: "Sedan (Blue)",
  },
  {
    speed: 65,
    limit: 50,
    overLimit: 15,
    location: "East Junction",
    time: "Today, 9:45 AM",
    vehicle: "SUV (Black)",
  },
  {
    speed: 82,
    limit: 60,
    overLimit: 22,
    location: "Central Intersection",
    time: "Today, 8:30 AM",
    vehicle: "Sports Car (Red)",
  },
  {
    speed: 70,
    limit: 50,
    overLimit: 20,
    location: "South Lane",
    time: "Yesterday, 5:15 PM",
    vehicle: "Pickup Truck (White)",
  },
  {
    speed: 68,
    limit: 50,
    overLimit: 18,
    location: "West Junction",
    time: "Yesterday, 4:20 PM",
    vehicle: "Sedan (Silver)",
  },
]
