"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  LogOut,
  LayoutDashboard,
  Car,
  FileText,
  Calendar,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";
import { VideoFeed } from "@/components/video-feed";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/context/app-provider";
import StreamVideo from "@/components/stream-video";
import DetectionTable from "@/components/detection-table";
import DetectionCards from "@/components/detection-cards";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

export default function CriminalVehiclePage() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [plateNumber, setPlateNumber] = useState<string>("");
  const { appData, detections } = useAppContext();
  console.log(detections);

  const handleAddVehicle = () => {
    if (plateNumber.trim()) {
      onAddVehicle(plateNumber);
      setPlateNumber("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddVehicle();
    }
  };

  const onAddVehicle = async () => {
    if (plateNumber) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/add-lookout-vehicle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ lookoutVehicle: plateNumber.trim() }),
        }
      );

      const data = await response.json();
      console.log("Add Vehicle: ", data);
    } else {
      alert("Please enter a valid plate number.");
    }
  };
  const onRemoveVehicle = async (vehiclePlate: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_BASE_URL}/remove-lookout-vehicle`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lookoutVehicle: vehiclePlate }),
      }
    );

    const data = await response.json();
    console.log("Removed Vehicle: ", data);
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    router.push("/");
  };

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
            <span className="text-sm text-muted-foreground">
              {currentTime.toLocaleTimeString()}
            </span>
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
            <h1 className="text-xl font-bold md:text-2xl">
              Criminal Vehicle Detection
            </h1>
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
                    <CardDescription>
                      Real-time criminal vehicle detection
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Status:</div>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>

                      <Card className="w-full max-w-md shadow-md">
                        <CardHeader className=" border-b">
                          <CardTitle className="flex items-center gap-2">
                            <Car size={18} />
                            <span>Vehicle Database</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              placeholder="Enter plate number"
                              value={plateNumber}
                              onChange={(e) => setPlateNumber(e.target.value)}
                              onKeyPress={handleKeyPress}
                              className="flex-1"
                            />
                            <Button
                              onClick={handleAddVehicle}
                              size="sm"
                              className="whitespace-nowrap"
                            >
                              <Plus size={16} className="mr-1" /> Add Vehicle
                            </Button>
                          </div>

                          {appData && appData.lookoutVehicles.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-sm font-medium">
                                Vehicles on lookout (
                                {appData.lookoutVehicles.length})
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {appData.lookoutVehicles.map((vehicle, i) => (
                                  <Badge
                                    key={`vehicle-${i}`}
                                    variant="secondary"
                                    className="flex items-center gap-1 py-1 px-3"
                                  >
                                    {vehicle}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-4 w-4 rounded-full ml-1 p-0"
                                      onClick={() => onRemoveVehicle(vehicle)}
                                    >
                                      <X size={12} />
                                    </Button>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <Alert className=" text-blue-800 ">
                              <AlertTitle className="text-sm font-medium">
                                No vehicles on lookout
                              </AlertTitle>
                              <AlertDescription className="text-xs">
                                Add vehicle plate numbers to monitor
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">
                          Latest Detections:
                        </div>
                        <div className="space-y-2">
                          <DetectionCards
                            detections={detections}
                            activeModel="vehicleFinder"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right side - Video feed */}
                <Card>
                  <CardHeader>
                    <CardTitle>Live Camera Feed</CardTitle>
                    <CardDescription>
                      Monitoring for criminal vehicles
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <StreamVideo activeModel="vehicleFinder" />
                    <div className="p-4">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span>Live Feed</span>
                        </div>
                        <span className="text-muted-foreground">
                          Main Street - North Junction
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Criminal Vehicle Detection History</CardTitle>
                  <CardDescription>
                    Record of criminal vehicles detected by the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <DetectionTable detections={detections.vehicleFinder} />

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Showing 10 of 32 detections
                      </div>
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
  );
}
