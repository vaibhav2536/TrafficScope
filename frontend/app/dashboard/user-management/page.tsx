"use client"

import { useState, useEffect } from "react"
import {
  Clock,
  LogOut,
  LayoutDashboard,
  User,
  UserPlus,
  UserX,
  Shield,
  Settings,
  Search,
  Filter,
  AlertTriangle,
  FileText,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sidebar } from "@/components/sidebar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export default function UserManagementPage() {
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
            <h1 className="text-xl font-bold md:text-2xl">User Management</h1>
          </div>
          <Tabs defaultValue="users">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">System Users</h2>
                  <p className="text-sm text-muted-foreground">Manage users with access to the RoadLens system</p>
                </div>
                <div className="flex gap-2">
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>User List</CardTitle>
                      <CardDescription>All users with system access</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search users..." className="pl-8 w-[200px]" />
                      </div>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <div className="grid grid-cols-6 p-4 font-medium border-b">
                        <div>Name</div>
                        <div>Email</div>
                        <div>Role</div>
                        <div>Status</div>
                        <div>Last Login</div>
                        <div className="text-right">Actions</div>
                      </div>
                      {users.map((user, index) => (
                        <div key={index} className="grid grid-cols-6 p-4 items-center border-b last:border-0">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-4 w-4" />
                            </div>
                            <span>{user.name}</span>
                          </div>
                          <div className="text-muted-foreground">{user.email}</div>
                          <div>
                            <Badge className={getRoleBadgeClass(user.role)}>{user.role}</Badge>
                          </div>
                          <div>
                            <Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge>
                          </div>
                          <div className="text-muted-foreground">{user.lastLogin}</div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="roles" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Roles & Permissions</CardTitle>
                  <CardDescription>Manage user roles and their associated permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h3 className="font-medium">System Roles</h3>
                        <p className="text-sm text-muted-foreground">Define access levels for different user types</p>
                      </div>
                      <Button>Add Role</Button>
                    </div>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-4 p-4 font-medium border-b">
                        <div>Role Name</div>
                        <div>Description</div>
                        <div>Users</div>
                        <div className="text-right">Actions</div>
                      </div>
                      {roles.map((role, index) => (
                        <div key={index} className="grid grid-cols-4 p-4 items-center border-b last:border-0">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <Shield className="h-4 w-4" />
                            </div>
                            <span>{role.name}</span>
                          </div>
                          <div className="text-muted-foreground">{role.description}</div>
                          <div>{role.users}</div>
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Permissions
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Permission Matrix</CardTitle>
                  <CardDescription>Detailed permissions for each role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4">Permission</th>
                          {roles.map((role, index) => (
                            <th key={index} className="text-center p-4">
                              {role.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {permissions.map((permission, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="p-4">{permission.name}</td>
                            {permission.access.map((hasAccess, roleIndex) => (
                              <td key={roleIndex} className="text-center p-4">
                                {hasAccess ? (
                                  <div className="h-4 w-4 rounded-full bg-green-500 mx-auto" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full bg-muted mx-auto" />
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity Log</CardTitle>
                  <CardDescription>Track user actions within the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Filter className="mr-2 h-4 w-4" />
                          Filter
                        </Button>
                        <select className="rounded-md border p-1 text-sm">
                          <option>All Users</option>
                          <option>Administrators</option>
                          <option>Operators</option>
                          <option>Viewers</option>
                        </select>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search activities..." className="pl-8 w-[200px]" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {activityLog.map((activity, index) => (
                        <div key={index} className="flex items-start gap-4 rounded-lg border p-4">
                          <div className={`rounded-full bg-${activity.color}-500/20 p-2`}>
                            <activity.icon className={`h-5 w-5 text-${activity.color}-500`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{activity.action}</p>
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">User: {activity.user}</p>
                            <p className="mt-1 text-sm">{activity.description}</p>
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

function getRoleBadgeClass(role) {
  switch (role) {
    case "Administrator":
      return "bg-red-500 hover:bg-red-600"
    case "Operator":
      return "bg-blue-500 hover:bg-blue-600"
    case "Analyst":
      return "bg-purple-500 hover:bg-purple-600"
    case "Viewer":
      return "bg-green-500 hover:bg-green-600"
    default:
      return "bg-gray-500 hover:bg-gray-600"
  }
}

// Sample users data
const users = [
  {
    name: "John Smith",
    email: "john.smith@roadlens.com",
    role: "Administrator",
    status: "Active",
    lastLogin: "Today, 9:45 AM",
  },
  {
    name: "Sarah Johnson",
    email: "sarah.johnson@roadlens.com",
    role: "Operator",
    status: "Active",
    lastLogin: "Today, 10:15 AM",
  },
  {
    name: "Michael Brown",
    email: "michael.brown@roadlens.com",
    role: "Analyst",
    status: "Active",
    lastLogin: "Yesterday, 4:30 PM",
  },
  {
    name: "Emily Davis",
    email: "emily.davis@roadlens.com",
    role: "Viewer",
    status: "Inactive",
    lastLogin: "Oct 10, 2023",
  },
  {
    name: "Robert Wilson",
    email: "robert.wilson@roadlens.com",
    role: "Operator",
    status: "Active",
    lastLogin: "Today, 8:20 AM",
  },
]

// Sample roles data
const roles = [
  {
    name: "Administrator",
    description: "Full system access with all permissions",
    users: 1,
  },
  {
    name: "Operator",
    description: "Can manage traffic signals and respond to incidents",
    users: 2,
  },
  {
    name: "Analyst",
    description: "Can view and analyze data but cannot make changes",
    users: 1,
  },
  {
    name: "Viewer",
    description: "Read-only access to dashboards and reports",
    users: 1,
  },
]

// Sample permissions data
const permissions = [
  {
    name: "View Dashboard",
    access: [true, true, true, true],
  },
  {
    name: "Manage Traffic Signals",
    access: [true, true, false, false],
  },
  {
    name: "Respond to Incidents",
    access: [true, true, false, false],
  },
  {
    name: "View Analytics",
    access: [true, true, true, true],
  },
  {
    name: "Export Reports",
    access: [true, true, true, false],
  },
  {
    name: "Manage Users",
    access: [true, false, false, false],
  },
  {
    name: "System Configuration",
    access: [true, false, false, false],
  },
]

// Sample activity log data
const activityLog = [
  {
    action: "User Login",
    description: "User logged into the system",
    user: "John Smith",
    time: "Today, 9:45 AM",
    color: "green",
    icon: User,
  },
  {
    action: "Traffic Signal Modified",
    description: "Changed North Junction signal timing from 30s to 45s",
    user: "Sarah Johnson",
    time: "Today, 10:20 AM",
    color: "blue",
    icon: Settings,
  },
  {
    action: "Incident Response",
    description: "Responded to vehicle collision at East Junction",
    user: "Sarah Johnson",
    time: "Today, 10:30 AM",
    color: "red",
    icon: AlertTriangle,
  },
  {
    action: "Report Generated",
    description: "Generated monthly traffic analysis report",
    user: "Michael Brown",
    time: "Yesterday, 4:15 PM",
    color: "purple",
    icon: FileText,
  },
  {
    action: "User Added",
    description: "Added new user: Emily Davis with Viewer role",
    user: "John Smith",
    time: "Oct 10, 2023",
    color: "green",
    icon: UserPlus,
  },
]
