"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Car,
  LayoutDashboard,
  AlertTriangle,
  Gauge,
  RouteIcon as Road,
  User,
  ArrowLeft,
  Camera,
  UserSearch,
} from "lucide-react";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Traffic Control",
      icon: Car,
      path: "/dashboard/traffic-control",
    },
    {
      title: "Red Light Jumping",
      icon: Camera,
      path: "/dashboard/red-light-jumping",
    },
    {
      title: "No Helmet Violation",
      icon: AlertTriangle,
      path: "/dashboard/no-helmet",
    },
    {
      title: "Vehicle Detection",
      icon: Car,
      path: "/dashboard/vehicle-detection",
    },
    {
      title: "Over-speeding Detection",
      icon: Gauge,
      path: "/dashboard/over-speeding",
    },

    // {
    //   title: "Criminal Face Recognition",
    //   icon: User,
    //   path: "/dashboard/face-recognition",
    // },
    {
      title: "Wrong Way Detection",
      icon: ArrowLeft,
      path: "/dashboard/wrong-way",
    },

    {
      title: "Person Finder",
      icon: UserSearch,
      path: "/dashboard/person-finder",
    },

    {
      title: "Pothole Detection",
      icon: Road,
      path: "/dashboard/pothole-detection",
    },
  ];

  return (
    <nav className="grid gap-2">
      {/* <Button
        variant={pathname === "/dashboard" ? "default" : "ghost"}
        className="justify-start"
        onClick={() => router.push("/dashboard")}
      >
        <LayoutDashboard className="mr-2 h-4 w-4" />
        Dashboard
      </Button> */}
      {menuItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Button
            key={item.path}
            variant={isActive ? "default" : "ghost"}
            className="justify-start"
            onClick={() => router.push(item.path)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Button>
        );
      })}
    </nav>
  );
}
