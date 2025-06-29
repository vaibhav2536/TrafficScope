"use client"

import { useState, useEffect } from "react"
import { Clock, LogOut, LayoutDashboard, AlertTriangle, Car, Phone, MapPin, FileText, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar"
import { Badge } from "@/components/ui/badge"
import { VideoFeed } from "@/components/video-feed"

export default function IncidentsPage() {
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
            <h1 className="text-xl font-bold md:text-2xl">Incidents</h1>
          </div>
          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Active Incidents</TabsTrigger>
              <TabsTrigger value="detection">Accident Detection</TabsTrigger>
              <TabsTrigger value="history">Incident History</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Active Incidents</h2>
                  <p className="text-sm text-muted-foreground">Currently ongoing incidents requiring attention</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <MapPin className="mr-2 h-4 w-4" />
                    View Map
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="mr-2 h-4 w-4" />
                    Emergency Contacts
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {activeIncidents.map((incident, index) => (
                  <Card key={index} className={incident.severity === "Critical" ? "border-red-500" : ""}>
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">
                          <div className="flex items-center gap-2">
                            <AlertTriangle
                              className={`h-5 w-5 ${incident.severity === "Critical" ? "text-red-500" : "text-yellow-500"}`}
                            />
                            {incident.type}
                          </div>
                        </CardTitle>
                        <Badge className={incident.severity === "Critical" ? "bg-red-500" : "bg-yellow-500"}>
                          {incident.severity}
                        </Badge>
                      </div>
                      <CardDescription>{incident.location}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <VideoFeed id={`incident-${index}`} label={incident.location} />
                      <div className="p-4 space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Reported:</span>
                            <span>{incident.time}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <span>{incident.status}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Response:</span>
                            <span>{incident.response}</span>
                          </div>
                        </div>
                        <p className="text-sm">{incident.description}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            Details
                          </Button>
                          <Button size="sm" className="flex-1">
                            Respond
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="detection" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Accident Detection</CardTitle>
                  <CardDescription>AI-powered accident detection and response system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h3 className="font-medium">Detection Settings</h3>
                        <p className="text-sm text-muted-foreground">Configure accident detection parameters</p>
                      </div>
                      <Button>Save Settings</Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Detection Sensitivity</label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">Low</span>
                          <input type="range" min="1" max="10" defaultValue="8" className="flex-1" />
                          <span className="text-xs">High</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Response Time Threshold</label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">5s</span>
                          <input type="range" min="5" max="30" defaultValue="10" className="flex-1" />
                          <span className="text-xs">30s</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Accident Types</label>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="collision" defaultChecked />
                            <label htmlFor="collision" className="text-sm">
                              Vehicle Collision
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="pedestrian" defaultChecked />
                            <label htmlFor="pedestrian" className="text-sm">
                              Pedestrian Accident
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="rollover" defaultChecked />
                            <label htmlFor="rollover" className="text-sm">
                              Vehicle Rollover
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Alert Methods</label>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="dashboard-alert" defaultChecked />
                            <label htmlFor="dashboard-alert" className="text-sm">
                              Dashboard
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="email-alert" defaultChecked />
                            <label htmlFor="email-alert" className="text-sm">
                              Email
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="sms-alert" defaultChecked />
                            <label htmlFor="sms-alert" className="text-sm">
                              SMS
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Response Actions</label>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="emergency" defaultChecked />
                            <label htmlFor="emergency" className="text-sm">
                              Notify Emergency Services
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="traffic" defaultChecked />
                            <label htmlFor="traffic" className="text-sm">
                              Adjust Traffic Signals
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="record" defaultChecked />
                            <label htmlFor="record" className="text-sm">
                              Record Footage
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Accident Statistics</CardTitle>
                  <CardDescription>Historical data on accidents by type and location</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <AccidentStatisticsChart />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Incident History</CardTitle>
                  <CardDescription>Complete history of all incidents</CardDescription>
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
                          Export Report
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Show:</span>
                        <select className="rounded-md border p-1 text-sm">
                          <option>All Incidents</option>
                          <option>Accidents</option>
                          <option>Traffic Jams</option>
                          <option>Hazards</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {incidentHistory.map((incident, index) => (
                        <div key={index} className="flex items-start gap-4 rounded-lg border p-4">
                          <div className={`rounded-full bg-${incident.color}-500/20 p-2`}>
                            <incident.icon className={`h-5 w-5 text-${incident.color}-500`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{incident.type}</p>
                              <Badge className={getBadgeClass(incident.severity)}>{incident.severity}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{incident.location}</p>
                            <div className="mt-2 flex items-center gap-4">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Reported: </span>
                                {incident.time}
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">Status: </span>
                                {incident.status}
                              </div>
                            </div>
                            <p className="mt-1 text-sm">{incident.description}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </div>
                      ))}
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
    case "critical":
      return "bg-red-500 hover:bg-red-600"
    case "high":
      return "bg-orange-500 hover:bg-orange-600"
    case "medium":
      return "bg-yellow-500 hover:bg-yellow-600"
    case "low":
      return "bg-blue-500 hover:bg-blue-600"
    case "resolved":
      return "bg-green-500 hover:bg-green-600"
    default:
      return "bg-gray-500 hover:bg-gray-600"
  }
}

function AccidentStatisticsChart() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Accident Statistics</div>
              <div className="text-2xl font-bold">Last 30 Days</div>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs">Vehicle Collision</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs">Pedestrian</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs">Other</span>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            {/* Simulated chart with stacked bars */}
            <div className="absolute inset-0 flex items-end justify-between px-2">
              {[
                { location: "North", collision: 3, pedestrian: 1, other: 1 },
                { location: "East", collision: 2, pedestrian: 0, other: 1 },
                { location: "South", collision: 4, pedestrian: 2, other: 0 },
                { location: "West", collision: 1, pedestrian: 1, other: 2 },
                { location: "Central", collision: 5, pedestrian: 3, other: 1 },
              ].map((data, i) => (
                <div key={i} className="flex flex-col items-center gap-1 w-full">
                  <div className="w-full flex flex-col items-center">
                    <div
                      className="w-full max-w-[40px] bg-red-500 rounded-t-sm"
                      style={{ height: `${data.collision * 30}px` }}
                    ></div>
                    <div
                      className="w-full max-w-[40px] bg-yellow-500"
                      style={{ height: `${data.pedestrian * 30}px` }}
                    ></div>
                    <div className="w-full max-w-[40px] bg-blue-500" style={{ height: `${data.other * 30}px` }}></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">{data.location}</div>
                </div>
              ))}
            </div>
            {/* Y-axis labels */}
            <div className="absolute left-0 inset-y-0 flex flex-col justify-between py-6">
              <div className="text-xs text-muted-foreground">10</div>
              <div className="text-xs text-muted-foreground">8</div>
              <div className="text-xs text-muted-foreground">6</div>
              <div className="text-xs text-muted-foreground">4</div>
              <div className="text-xs text-muted-foreground">2</div>
              <div className="text-xs text-muted-foreground">0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sample active incidents data
const activeIncidents = [
  {
    type: "Vehicle Collision",
    description: "Two-vehicle collision with minor injuries. Traffic partially blocked.",
    location: "East Junction",
    time: "Today, 10:25 AM",
    severity: "Critical",
    status: "Emergency Services Dispatched",
    response: "Police and Ambulance on scene",
  },
  {
    type: "Traffic Hazard",
    description: "Fallen debris on roadway causing traffic slowdown.",
    location: "South Lane",
    time: "Today, 11:05 AM",
    severity: "Medium",
    status: "Maintenance Team Dispatched",
    response: "ETA 10 minutes",
  },
]

// Sample incident history data
const incidentHistory = [
  {
    type: "Vehicle Collision",
    description: "Two-vehicle collision with minor injuries. Traffic partially blocked.",
    location: "East Junction",
    time: "Today, 10:25 AM",
    severity: "Critical",
    status: "Resolved",
    color: "red",
    icon: Car,
  },
  {
    type: "Traffic Hazard",
    description: "Fallen debris on roadway causing traffic slowdown.",
    location: "South Lane",
    time: "Today, 11:05 AM",
    severity: "Medium",
    status: "Resolved",
    color: "yellow",
    icon: AlertTriangle,
  },
  {
    type: "Vehicle Breakdown",
    description: "Vehicle broken down in right lane causing traffic congestion.",
    location: "North Lane",
    time: "Yesterday, 3:45 PM",
    severity: "Medium",
    status: "Resolved",
    color: "yellow",
    icon: Car,
  },
  {
    type: "Pedestrian Accident",
    description: "Pedestrian struck by vehicle at crossing. Serious injuries reported.",
    location: "Central Intersection",
    time: "Yesterday, 5:20 PM",
    severity: "Critical",
    status: "Resolved",
    color: "red",
    icon: AlertTriangle,
  },
  {
    type: "Multi-Vehicle Collision",
    description: "Three-vehicle collision causing major traffic disruption.",
    location: "West Junction",
    time: "Oct 12, 2023",
    severity: "High",
    status: "Resolved",
    color: "orange",
    icon: Car,
  },
]
