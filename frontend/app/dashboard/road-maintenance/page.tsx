"use client"

import { useState, useEffect } from "react"
import {
  Clock,
  LogOut,
  LayoutDashboard,
  RouteIcon as Road,
  AlertTriangle,
  PenToolIcon as Tool,
  Map,
  FileText,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar"
import { Badge } from "@/components/ui/badge"

export default function RoadMaintenancePage() {
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
            <h1 className="text-xl font-bold md:text-2xl">Road Maintenance</h1>
          </div>
          <Tabs defaultValue="potholes">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="potholes">Pothole Detection</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance Schedule</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="potholes" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Pothole Detection</h2>
                  <p className="text-sm text-muted-foreground">
                    Automatically detected road damage requiring maintenance
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Map className="mr-2 h-4 w-4" />
                    View Map
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Pothole Distribution</CardTitle>
                  <CardDescription>Number of potholes detected by severity and location</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <PotholeDistributionChart />
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {potholes.map((pothole, index) => (
                  <Card key={index}>
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">Pothole #{pothole.id}</CardTitle>
                        <Badge className={getBadgeClass(pothole.severity)}>{pothole.severity}</Badge>
                      </div>
                      <CardDescription>{pothole.location}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground">Pothole Image</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Size:</span>
                          <span>{pothole.size}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Detected:</span>
                          <span>{pothole.detected}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <span>{pothole.status}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          Details
                        </Button>
                        <Button size="sm" className="flex-1">
                          <Tool className="mr-2 h-4 w-4" />
                          Repair
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="maintenance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Schedule</CardTitle>
                  <CardDescription>Upcoming and ongoing road maintenance activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {maintenanceSchedule.map((item, index) => (
                      <div key={index} className="flex items-start gap-4 rounded-lg border p-4">
                        <div className={`rounded-full bg-${item.color}-500/20 p-2`}>
                          <item.icon className={`h-5 w-5 text-${item.color}-500`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{item.title}</p>
                            <Badge className={getBadgeClass(item.status)}>{item.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.location}</p>
                          <div className="mt-2 flex items-center gap-4">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Start: </span>
                              {item.startDate}
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">End: </span>
                              {item.endDate}
                            </div>
                          </div>
                          <p className="mt-1 text-sm">{item.description}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                          <Button variant="outline" size="sm">
                            Update
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Reports</CardTitle>
                  <CardDescription>Historical data on road maintenance activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h3 className="font-medium">Monthly Repair Statistics</h3>
                        <p className="text-sm text-muted-foreground">Number of repairs completed by month</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm">
                          <Tool className="mr-2 h-4 w-4" />
                          Filter
                        </Button>
                      </div>
                    </div>
                    <div className="h-[300px]">
                      <MaintenanceReportChart />
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

function getBadgeClass(severity) {
  switch (severity.toLowerCase()) {
    case "high":
    case "critical":
      return "bg-red-500 hover:bg-red-600"
    case "medium":
    case "in progress":
      return "bg-yellow-500 hover:bg-yellow-600"
    case "low":
    case "scheduled":
      return "bg-blue-500 hover:bg-blue-600"
    case "completed":
      return "bg-green-500 hover:bg-green-600"
    default:
      return "bg-gray-500 hover:bg-gray-600"
  }
}

function PotholeDistributionChart() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Pothole Distribution</div>
              <div className="text-2xl font-bold">7 Active Potholes</div>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs">High</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs">Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs">Low</span>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            {/* Simulated chart with bars */}
            <div className="absolute inset-0 flex items-end justify-between px-2">
              {[
                { location: "North", high: 1, medium: 1, low: 0 },
                { location: "East", high: 0, medium: 1, low: 1 },
                { location: "South", high: 1, medium: 0, low: 0 },
                { location: "West", high: 0, medium: 1, low: 1 },
              ].map((data, i) => (
                <div key={i} className="flex flex-col items-center gap-1 w-full">
                  <div className="w-full flex flex-col items-center">
                    <div
                      className="w-full max-w-[40px] bg-red-500 rounded-t-sm"
                      style={{ height: `${data.high * 60}px` }}
                    ></div>
                    <div
                      className="w-full max-w-[40px] bg-yellow-500"
                      style={{ height: `${data.medium * 60}px` }}
                    ></div>
                    <div className="w-full max-w-[40px] bg-blue-500" style={{ height: `${data.low * 60}px` }}></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">{data.location}</div>
                </div>
              ))}
            </div>
            {/* Y-axis labels */}
            <div className="absolute left-0 inset-y-0 flex flex-col justify-between py-6">
              <div className="text-xs text-muted-foreground">3</div>
              <div className="text-xs text-muted-foreground">2</div>
              <div className="text-xs text-muted-foreground">1</div>
              <div className="text-xs text-muted-foreground">0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MaintenanceReportChart() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const data = [12, 15, 10, 8, 14, 18, 20, 15, 10, 12, 8, 5]

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-end">
          {data.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-4/5 bg-gradient-to-t from-green-500 to-blue-500 rounded-t-sm"
                style={{ height: `${value * 10}px` }}
              ></div>
              <div className="text-xs text-muted-foreground mt-2">{months[index]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Sample pothole data
const potholes = [
  {
    id: "P-1024",
    location: "North Lane, 200m from junction",
    severity: "High",
    size: "Large (30cm)",
    detected: "Today, 8:15 AM",
    status: "Pending Repair",
  },
  {
    id: "P-1023",
    location: "East Junction, right lane",
    severity: "Medium",
    size: "Medium (15cm)",
    detected: "Yesterday, 4:30 PM",
    status: "Scheduled",
  },
  {
    id: "P-1022",
    location: "South Lane, near pedestrian crossing",
    severity: "Low",
    size: "Small (8cm)",
    detected: "Yesterday, 2:15 PM",
    status: "Monitoring",
  },
  {
    id: "P-1021",
    location: "West Junction, center lane",
    severity: "Medium",
    size: "Medium (18cm)",
    detected: "2 days ago",
    status: "Scheduled",
  },
  {
    id: "P-1020",
    location: "Central Intersection, turning lane",
    severity: "High",
    size: "Large (25cm)",
    detected: "2 days ago",
    status: "In Progress",
  },
  {
    id: "P-1019",
    location: "North Lane, left side",
    severity: "Low",
    size: "Small (10cm)",
    detected: "3 days ago",
    status: "Monitoring",
  },
]

// Sample maintenance schedule data
const maintenanceSchedule = [
  {
    title: "Pothole Repair",
    description: "Repair of multiple potholes detected in the North Lane area.",
    location: "North Lane",
    startDate: "Oct 15, 2023",
    endDate: "Oct 16, 2023",
    status: "In Progress",
    color: "yellow",
    icon: Tool,
  },
  {
    title: "Road Resurfacing",
    description: "Complete resurfacing of the East Junction due to extensive wear.",
    location: "East Junction",
    startDate: "Oct 18, 2023",
    endDate: "Oct 25, 2023",
    status: "Scheduled",
    color: "blue",
    icon: Road,
  },
  {
    title: "Drainage System Maintenance",
    description: "Cleaning and repair of drainage systems to prevent water accumulation.",
    location: "South Lane",
    startDate: "Oct 10, 2023",
    endDate: "Oct 12, 2023",
    status: "Completed",
    color: "green",
    icon: Tool,
  },
  {
    title: "Emergency Repair",
    description: "Emergency repair of large pothole causing traffic disruption.",
    location: "Central Intersection",
    startDate: "Oct 14, 2023",
    endDate: "Oct 14, 2023",
    status: "Completed",
    color: "green",
    icon: AlertTriangle,
  },
  {
    title: "Lane Marking",
    description: "Repainting of lane markings for improved visibility.",
    location: "All Junctions",
    startDate: "Oct 20, 2023",
    endDate: "Oct 22, 2023",
    status: "Scheduled",
    color: "blue",
    icon: Road,
  },
]
