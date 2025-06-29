"use client"

import { useState, useEffect } from "react"
import { Clock, LogOut, LayoutDashboard, RouteIcon as Road, FileText, Calendar, MapPin, Camera } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar"
import { Badge } from "@/components/ui/badge"
import { useAppContext } from "@/context/app-provider"
import StreamVideo from "@/components/stream-video"
import DetectionCards from "@/components/detection-cards"
import DetectionTable from "@/components/detection-table"
import MapWithMarkers from "@/components/map-with-markers"

export default function PotholeDetectionPage() {
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const { detections } = useAppContext();
  console.log(detections)

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
            <h1 className="text-xl font-bold md:text-2xl">Pothole Detection</h1>
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
                    <CardDescription>Real-time pothole detection using mobile cameras</CardDescription>
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
                              <span className="text-3xl font-bold">{detections.pothole.length}</span>
                              <span className="text-xs text-muted-foreground">Potholes Detected</span>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Latest Detections:</div>
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 gap-4">
                            {detections.pothole.map((detection: any) => {
                              const detectedDate = new Date(detection.detectedAt);
                              const formattedDate = detectedDate.toLocaleString();
                              return (
                                <Card
                                  key={detection.id}
                                  className="flex flex-col md:flex-row shadow-md hover:shadow-lg transition rounded-xl overflow-hidden"
                                >
                                  <div className="md:w-1/2 bg-muted">
                                    <img
                                      className="w-full h-64 object-cover"
                                      src={`data:image/jpg;base64,${detection.imgSrc}`}
                                      alt="Detection"
                                    />
                                  </div>

                                  <div className="md:w-1/2 flex flex-col justify-between p-4 space-y-4">
                                    <div className="space-y-1">
                                      <p className="text-sm text-muted-foreground">{formattedDate}</p>
                                      <Badge variant="default" className="text-sm px-3 py-1 rounded-full">
                                        {detection.className}
                                      </Badge>
                                    </div>

                                    <div className="rounded overflow-hidden shadow-sm h-40 border">
                                      <iframe
                                        title={`Map-${detection.id}`}
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        style={{ border: 0 }}
                                        src={`https://maps.google.com/maps?q=${detection.coordinate.lat},${detection.coordinate.long}&z=15&output=embed`}
                                        allowFullScreen
                                      ></iframe>
                                    </div>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right side - Video feed */}
                <Card>
                  <CardHeader>
                    <CardTitle>Live Camera Feed</CardTitle>
                    <CardDescription>Mobile camera scanning for potholes</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <StreamVideo activeModel="pothole" />
                    <div className="p-4">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span>Live Feed</span>
                        </div>
                        <span className="text-muted-foreground">East Road - Mobile Unit #3</span>
                      </div>
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">Road Condition</p>
                            <p className="text-xs text-muted-foreground">Moderate wear</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">Scan Progress</p>
                            <div className="h-2 w-24 rounded-full bg-background mt-1">
                              <div className="h-2 rounded-full bg-green-500" style={{ width: "65%" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <MapWithMarkers potholes={detections.pothole} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pothole Detection History</CardTitle>
                  <CardDescription>Record of potholes detected by the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    
                    <DetectionTable detections={detections.pothole} />

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Showing 10 of 42 potholes</div>
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
