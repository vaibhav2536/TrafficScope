"use client";

import { useState, useEffect, useMemo } from "react";
import { Car, Clock, LogOut, LayoutDashboard } from "lucide-react";
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
import StreamVideo from "@/components/stream-video";
import { useAppContext } from "@/context/app-provider";
import { CVModel } from "@/types";

export default function TrafficControlPage() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeModel, setActiveModel] = useState<CVModel>("trafficControl");
  const { detections } = useAppContext();

  const latestTrafficControlData = useMemo(() => {
    if (detections.trafficControl.length === 0) return [];

    let latestDetection =
      detections.trafficControl[detections.trafficControl.length - 1];

    return latestDetection.map((data) => {
      const totalVehicle = data.detections.length;
      const cumulativeVehicleElapsedTime = data.detections.reduce(
        (acc, curr) => acc + curr.elapsedTime,
        0
      );

      return {
        video_id: data.video_id,
        totalVehicle,
        avgVehicleElapsedTime: cumulativeVehicleElapsedTime / totalVehicle,
      };
    });
  }, [detections.trafficControl]);

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
            <h1 className="text-xl font-bold md:text-2xl">Traffic Control</h1>
          </div>
          <Tabs defaultValue="monitoring">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>
            <TabsContent value="monitoring" className="space-y-4">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Traffic Monitoring</CardTitle>
                  <CardDescription>
                    Real-time traffic monitoring from all four directions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-8">
                    <StreamVideo activeModel={activeModel} />

                    {/* Traffic Information */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Traffic Density</CardTitle>
                          <CardDescription>
                            Current traffic density by direction
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {latestTrafficControlData.map((data, index) => {
                              // Determine direction based on index order: West (0), East (1), North (2), South (3)
                              const direction =
                                index === 0
                                  ? "West"
                                  : index === 1
                                  ? "East"
                                  : index === 2
                                  ? "North"
                                  : "South";

                              // Calculate percentage (max 20) and parse to 4 decimal places
                              const percentageValue = Math.min(
                                20,
                                data.totalVehicle
                              ); // Cap at 20
                              const percentage = parseFloat(
                                percentageValue.toFixed(4)
                              ); // Ensure 4 decimal places

                              // Determine color: red (≥12), yellow (≥6), green (<6)
                              const color =
                                percentage >= 12
                                  ? "bg-red-500"
                                  : percentage >= 6
                                  ? "bg-yellow-500"
                                  : "bg-green-500";

                              return (
                                <div className="space-y-2" key={data.video_id}>
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">
                                      {direction}
                                    </p>
                                    <p className="text-sm font-medium">
                                      {percentage}%
                                    </p>
                                  </div>
                                  <div className="h-2 w-full rounded-full bg-muted">
                                    <div
                                      className={`h-2 rounded-full ${color}`}
                                      style={{
                                        width: `${(percentage / 20) * 100}%`,
                                      }}
                                    />
                                  </div>
                                  {/* Optional: Display raw data in smaller text */}
                                  <div className="text-xs text-gray-500">
                                    Vehicles: {data.totalVehicle} | Avg Time:{" "}
                                    {parseFloat(
                                      data.avgVehicleElapsedTime.toString()
                                    ).toFixed(4)}
                                    s |{" "}
                                    <span className="text-foreground/80">
                                      Cummulative Delay:{" "}
                                      {(
                                        data.totalVehicle *
                                        data.avgVehicleElapsedTime
                                      ).toFixed(0)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="flex items-center justify-center p-6">
                        <h2 className="text-2xl text-foreground text-center">
                          Cummulative Delay = Avg. waiting Time of Vehicle *
                          Total Vehicles
                        </h2>
                        {/* <TrafficFlowChart latestTrafficControlData={latestTrafficControlData} /> */}
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="statistics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Flow Statistics</CardTitle>
                  <CardDescription>
                    Detailed traffic flow data over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <TrafficFlowChart
                      latestTrafficControlData={latestTrafficControlData}
                    />
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

function TrafficFlowChart(latestTrafficControlData: any) {
  console.log(latestTrafficControlData);
  return (
    <div className="w-full h-full flex items-center justify-center p-7">
      <div className="w-full h-full">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Traffic Flow</div>
              <div className="text-2xl font-bold">Vehicles per Hour</div>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs">North</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs">East</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs">South</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs">West</span>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            {/* Simulated chart with lines */}
            <div className="absolute inset-0">
              <svg
                className="w-full h-full"
                viewBox="0 0 1000 400"
                preserveAspectRatio="none"
              >
                {/* North line */}
                <path
                  d="M0,300 C100,280 200,150 300,180 C400,210 500,100 600,120 C700,140 800,200 900,150 L1000,150"
                  fill="none"
                  stroke="rgb(239, 68, 68)"
                  strokeWidth="3"
                />
                {/* East line */}
                <path
                  d="M0,250 C100,230 200,200 300,220 C400,240 500,180 600,160 C700,140 800,180 900,200 L1000,180"
                  fill="none"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="3"
                />
                {/* South line */}
                <path
                  d="M0,200 C100,220 200,240 300,200 C400,160 500,180 600,220 C700,260 800,240 900,180 L1000,200"
                  fill="none"
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="3"
                />
                {/* West line */}
                <path
                  d="M0,180 C100,200 200,220 300,240 C400,260 500,220 600,180 C700,140 800,160 900,220 L1000,240"
                  fill="none"
                  stroke="rgb(234, 179, 8)"
                  strokeWidth="3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
