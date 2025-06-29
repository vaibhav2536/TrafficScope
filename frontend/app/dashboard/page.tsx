"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Car, Clock, Gauge, LayoutDashboard, LogOut, RouteIcon as Road, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar"

export default function DashboardPage() {
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
            <h1 className="text-xl font-bold md:text-2xl">Dashboard Overview</h1>
          </div>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Traffic</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,284</div>
                    <p className="text-xs text-muted-foreground">+12% from last hour</p>
                  </CardContent>
                </Card>
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
                    <CardTitle className="text-sm font-medium">Incidents</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2</div>
                    <p className="text-xs text-muted-foreground">+1 from last hour</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Potholes Detected</CardTitle>
                    <Road className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">7</div>
                    <p className="text-xs text-muted-foreground">+2 from yesterday</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-1 md:col-span-2 lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Recent Alerts</CardTitle>
                    <CardDescription>Latest incidents detected by the system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-red-500/20 p-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Minor Accident</p>
                          <p className="text-xs text-muted-foreground">East Junction - 10 min ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-amber-500/20 p-2">
                          <Gauge className="h-4 w-4 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Overspeed Detection</p>
                          <p className="text-xs text-muted-foreground">North Lane - 15 min ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-blue-500/20 p-2">
                          <Road className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Pothole Detected</p>
                          <p className="text-xs text-muted-foreground">South Lane - 45 min ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Traffic Density</CardTitle>
                    <CardDescription>Current traffic density by direction</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">North</p>
                          <p className="text-sm font-medium">75%</p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div className="h-2 rounded-full bg-green-500" style={{ width: "75%" }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">East</p>
                          <p className="text-sm font-medium">45%</p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div className="h-2 rounded-full bg-yellow-500" style={{ width: "45%" }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">South</p>
                          <p className="text-sm font-medium">90%</p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div className="h-2 rounded-full bg-red-500" style={{ width: "90%" }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">West</p>
                          <p className="text-sm font-medium">30%</p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div className="h-2 rounded-full bg-green-500" style={{ width: "30%" }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>Current status of all monitoring systems</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <p className="text-sm">Traffic Control</p>
                        </div>
                        <p className="text-xs text-muted-foreground">Operational</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <p className="text-sm">Criminal Detection</p>
                        </div>
                        <p className="text-xs text-muted-foreground">Operational</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <p className="text-sm">Pothole Detection</p>
                        </div>
                        <p className="text-xs text-muted-foreground">Operational</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500" />
                          <p className="text-sm">Accident Detection</p>
                        </div>
                        <p className="text-xs text-muted-foreground">Maintenance</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <p className="text-sm">Overspeed Detection</p>
                        </div>
                        <p className="text-xs text-muted-foreground">Operational</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Analytics</CardTitle>
                  <CardDescription>Detailed traffic analytics over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <TrafficAnalyticsChart />
                  </div>
                </CardContent>
              </Card>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Traffic by Vehicle Type</CardTitle>
                    <CardDescription>Distribution of different vehicle types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <VehicleTypeChart />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Peak Hours Analysis</CardTitle>
                    <CardDescription>Traffic density during different hours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <PeakHoursChart />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="alerts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Alert History</CardTitle>
                  <CardDescription>Complete history of system alerts and incidents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alerts.map((alert, index) => (
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
                          Details
                        </Button>
                      </div>
                    ))}
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

// Sample alert data
const alerts = [
  {
    title: "Minor Accident",
    description: "Two vehicles involved in a minor collision. No injuries reported.",
    location: "East Junction",
    time: "Today, 10:25 AM",
    color: "red",
    icon: AlertTriangle,
  },
  {
    title: "Overspeed Detection",
    description: "Vehicle detected traveling at 78 km/h in a 50 km/h zone.",
    location: "North Lane",
    time: "Today, 10:10 AM",
    color: "amber",
    icon: Gauge,
  },
  {
    title: "Pothole Detected",
    description: "Medium-sized pothole detected. Maintenance team notified.",
    location: "South Lane",
    time: "Today, 9:45 AM",
    color: "blue",
    icon: Road,
  },
  {
    title: "Suspicious Activity",
    description: "Suspicious person loitering near traffic signal. Security alerted.",
    location: "West Junction",
    time: "Today, 9:30 AM",
    color: "purple",
    icon: Shield,
  },
  {
    title: "Traffic Signal Malfunction",
    description: "Traffic signal showing inconsistent patterns. Technician dispatched.",
    location: "Central Intersection",
    time: "Today, 8:15 AM",
    color: "orange",
    icon: AlertTriangle,
  },
]

// Chart components
function TrafficAnalyticsChart() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full h-full">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Total Traffic</div>
              <div className="text-2xl font-bold">24,781</div>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs">Today</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs">Yesterday</span>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            {/* Simulated chart with bars */}
            <div className="absolute inset-0 flex items-end justify-between px-2">
              {[35, 58, 80, 65, 75, 90, 82, 75, 70, 55, 60, 70].map((height, i) => (
                <div key={i} className="flex flex-col items-center gap-1 w-full">
                  <div
                    className="w-full max-w-[20px] bg-green-500 rounded-t-sm"
                    style={{ height: `${height * 0.7}%` }}
                  ></div>
                  <div className="text-xs text-muted-foreground">{i + 1}</div>
                </div>
              ))}
            </div>
            {/* Y-axis labels */}
            <div className="absolute left-0 inset-y-0 flex flex-col justify-between py-6">
              <div className="text-xs text-muted-foreground">3000</div>
              <div className="text-xs text-muted-foreground">2000</div>
              <div className="text-xs text-muted-foreground">1000</div>
              <div className="text-xs text-muted-foreground">0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function VehicleTypeChart() {
  const data = [
    { type: "Cars", percentage: 65, color: "bg-blue-500" },
    { type: "Trucks", percentage: 15, color: "bg-green-500" },
    { type: "Motorcycles", percentage: 12, color: "bg-yellow-500" },
    { type: "Buses", percentage: 8, color: "bg-purple-500" },
  ]

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-40 h-40">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {data.map((item, index) => {
              const startAngle = index > 0 ? data.slice(0, index).reduce((sum, d) => sum + d.percentage, 0) * 3.6 : 0
              const endAngle = startAngle + item.percentage * 3.6

              const x1 = 50 + 40 * Math.cos((startAngle - 90) * (Math.PI / 180))
              const y1 = 50 + 40 * Math.sin((startAngle - 90) * (Math.PI / 180))
              const x2 = 50 + 40 * Math.cos((endAngle - 90) * (Math.PI / 180))
              const y2 = 50 + 40 * Math.sin((endAngle - 90) * (Math.PI / 180))

              const largeArcFlag = item.percentage > 50 ? 1 : 0

              return (
                <path
                  key={index}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  className={item.color}
                />
              )
            })}
            <circle cx="50" cy="50" r="25" className="fill-background" />
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
            <div className="text-sm">
              {item.type} <span className="text-muted-foreground">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PeakHoursChart() {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const data = [10, 5, 3, 2, 5, 15, 35, 65, 80, 70, 65, 75, 80, 75, 70, 75, 85, 90, 70, 50, 40, 30, 20, 15]

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        <div className="absolute inset-0 flex items-end">
          {data.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-sm mx-0.5"
              style={{ height: `${value}%` }}
            ></div>
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground overflow-hidden">
        <div>12 AM</div>
        <div>6 AM</div>
        <div>12 PM</div>
        <div>6 PM</div>
        <div>12 AM</div>
      </div>
    </div>
  )
}
