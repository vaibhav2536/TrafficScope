"use client"

import { useState, useEffect } from "react"
import { Clock, LogOut, LayoutDashboard, Shield, AlertTriangle, User, Search, Camera } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar"
import { VideoFeed } from "@/components/video-feed"
import { Input } from "@/components/ui/input"

export default function SecurityPage() {
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
            <h1 className="text-xl font-bold md:text-2xl">Security</h1>
          </div>
          <Tabs defaultValue="surveillance">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="surveillance">Surveillance</TabsTrigger>
              <TabsTrigger value="detection">Criminal Detection</TabsTrigger>
              <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
            </TabsList>
            <TabsContent value="surveillance" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Live Surveillance</h2>
                  <p className="text-sm text-muted-foreground">Monitor all camera feeds in real-time</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Camera className="mr-2 h-4 w-4" />
                    All Cameras
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="mr-2 h-4 w-4" />
                    Search Footage
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">North Junction</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <VideoFeed id="north-security" label="North Junction" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">East Junction</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <VideoFeed id="east-security" label="East Junction" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">South Junction</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <VideoFeed id="south-security" label="South Junction" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">West Junction</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <VideoFeed id="west-security" label="West Junction" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Central Intersection</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <VideoFeed id="central-security" label="Central Intersection" />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Pedestrian Crossing</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <VideoFeed id="pedestrian-security" label="Pedestrian Crossing" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="detection" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Criminal Detection</CardTitle>
                  <CardDescription>AI-powered surveillance for enhanced security</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h3 className="font-medium">Detection Settings</h3>
                        <p className="text-sm text-muted-foreground">Configure detection parameters</p>
                      </div>
                      <Button>Save Settings</Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Detection Sensitivity</label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">Low</span>
                          <input type="range" min="1" max="10" defaultValue="7" className="flex-1" />
                          <span className="text-xs">High</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Minimum Confidence Threshold</label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">50%</span>
                          <input type="range" min="50" max="95" defaultValue="75" className="flex-1" />
                          <span className="text-xs">95%</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Detection Types</label>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="suspicious-behavior" defaultChecked />
                            <label htmlFor="suspicious-behavior" className="text-sm">
                              Suspicious Behavior
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="wanted-persons" defaultChecked />
                            <label htmlFor="wanted-persons" className="text-sm">
                              Wanted Persons
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="vehicle-theft" defaultChecked />
                            <label htmlFor="vehicle-theft" className="text-sm">
                              Vehicle Theft
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Alert Methods</label>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="dashboard" defaultChecked />
                            <label htmlFor="dashboard" className="text-sm">
                              Dashboard
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="email" defaultChecked />
                            <label htmlFor="email" className="text-sm">
                              Email
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="sms" />
                            <label htmlFor="sms" className="text-sm">
                              SMS
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Response Actions</label>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="record" defaultChecked />
                            <label htmlFor="record" className="text-sm">
                              Record Footage
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="notify-police" defaultChecked />
                            <label htmlFor="notify-police" className="text-sm">
                              Notify Police
                            </label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="lock-down" />
                            <label htmlFor="lock-down" className="text-sm">
                              Lock Down Area
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
                  <CardTitle>Recent Detections</CardTitle>
                  <CardDescription>Suspicious activities detected in the last 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {securityAlerts.map((alert, index) => (
                      <div key={index} className="flex items-start gap-4 rounded-lg border p-4">
                        <div className={`rounded-full bg-${alert.color}-500/20 p-2`}>
                          <alert.icon className={`h-5 w-5 text-${alert.color}-500`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{alert.title}</p>
                            <p className="text-xs text-muted-foreground">{alert.time}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.location}</p>
                          <p className="mt-1 text-sm">{alert.description}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="alerts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Alert History</CardTitle>
                  <CardDescription>Complete history of security alerts and incidents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Input placeholder="Search alerts..." className="max-w-sm" />
                      <Button variant="outline" size="sm">
                        <Search className="mr-2 h-4 w-4" />
                        Search
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {securityAlerts.concat(securityAlerts).map((alert, index) => (
                        <div key={index} className="flex items-start gap-4 rounded-lg border p-4">
                          <div className={`rounded-full bg-${alert.color}-500/20 p-2`}>
                            <alert.icon className={`h-5 w-5 text-${alert.color}-500`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{alert.title}</p>
                              <p className="text-xs text-muted-foreground">{alert.time}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{alert.location}</p>
                            <p className="mt-1 text-sm">{alert.description}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                              Delete
                            </Button>
                          </div>
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

// Sample security alert data
const securityAlerts = [
  {
    title: "Suspicious Person",
    description:
      "Individual loitering near traffic signal for extended period. Matches pattern of known theft activity.",
    location: "East Junction",
    time: "Today, 10:25 AM",
    color: "red",
    icon: AlertTriangle,
  },
  {
    title: "Unauthorized Vehicle",
    description: "Vehicle with reported stolen plates detected. Authorities have been notified.",
    location: "North Lane",
    time: "Today, 9:15 AM",
    color: "amber",
    icon: Shield,
  },
  {
    title: "Facial Recognition Match",
    description: "Individual matching database of persons of interest detected. Confidence level: 87%.",
    location: "Central Intersection",
    time: "Today, 8:45 AM",
    color: "blue",
    icon: User,
  },
  {
    title: "Unusual Behavior",
    description: "Group of individuals exhibiting unusual behavior near pedestrian crossing. Monitoring situation.",
    location: "South Junction",
    time: "Yesterday, 6:30 PM",
    color: "purple",
    icon: AlertTriangle,
  },
]
