import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Car,
  Shield,
  AlertTriangle,
  RouteIcon as Road,
  Camera,
  Gauge,
  Clock,
  FileText,
  ArrowLeft,
  User,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">
              <span className="text-primary">Road</span>
              <span className="text-green-500">Lens</span>
            </span>
          </div>
          <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#benefits" className="text-sm font-medium hover:underline underline-offset-4">
              Benefits
            </Link>
            <Link href="#technology" className="text-sm font-medium hover:underline underline-offset-4">
              Technology
            </Link>
            <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
              Login
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-background/80">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    <span className="text-primary">Road</span>
                    <span className="text-green-500">Lens</span>
                  </h1>
                  <p className="text-xl font-semibold text-green-500 md:text-2xl">
                    Real-Time Road Intelligence, Redefined.
                  </p>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Intelligent traffic monitoring system that adapts to real-time conditions, enhancing safety and
                    efficiency on our roads through advanced AI and computer vision.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button className="bg-primary hover:bg-primary/90">
                      Admin Login
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="outline">Learn More</Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[600px] aspect-video rounded-xl overflow-hidden border bg-muted/50 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-background/10 via-background/5 to-background/30 backdrop-blur-sm">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4 p-6">
                        <h2 className="text-2xl md:text-3xl font-bold">
                          <span className="text-primary">Smart</span> Traffic Monitoring
                        </h2>
                        <p className="text-muted-foreground max-w-[400px] mx-auto">
                          Comprehensive AI-powered system with 8 advanced features for safer, more efficient roads
                        </p>
                        <div className="flex justify-center">
                          <Link href="#features">
                            <Button variant="outline" className="mt-2">
                              Explore Features
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Intelligent Traffic Monitoring</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our comprehensive system uses advanced AI and computer vision to create safer, more efficient roads.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              <div className="flex flex-col items-center gap-2 rounded-lg bg-background p-6 shadow-lg">
                <div className="rounded-full bg-green-500/10 p-3">
                  <Car className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-bold text-center">Dynamic Traffic Light</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Adaptive traffic signals that respond to real-time traffic conditions for optimal flow
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 rounded-lg bg-background p-6 shadow-lg">
                <div className="rounded-full bg-blue-500/10 p-3">
                  <ArrowLeft className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-center">Wrong Way Detection</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Instantly identifies vehicles traveling in the wrong direction to prevent accidents
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 rounded-lg bg-background p-6 shadow-lg">
                <div className="rounded-full bg-red-500/10 p-3">
                  <Camera className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-center">Red Light Jumping</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Detects and records vehicles that run red lights to improve intersection safety
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 rounded-lg bg-background p-6 shadow-lg">
                <div className="rounded-full bg-amber-500/10 p-3">
                  <Road className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-center">Pothole Detection</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Automatically identifies and reports road damage for quick repairs and maintenance
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 rounded-lg bg-background p-6 shadow-lg">
                <div className="rounded-full bg-purple-500/10 p-3">
                  <Gauge className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-bold text-center">Over-speeding Detection</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Identifies vehicles exceeding speed limits with automatic license plate recognition
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 rounded-lg bg-background p-6 shadow-lg">
                <div className="rounded-full bg-indigo-500/10 p-3">
                  <Car className="h-8 w-8 text-indigo-500" />
                </div>
                <h3 className="text-lg font-bold text-center">Vehicle Detection</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Identifies vehicles with records by matching license plates with database
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 rounded-lg bg-background p-6 shadow-lg">
                <div className="rounded-full bg-orange-500/10 p-3">
                  <User className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-center">Face Recognition</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Advanced facial recognition to identify persons of interest in real-time video feeds
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 rounded-lg bg-background p-6 shadow-lg">
                <div className="rounded-full bg-yellow-500/10 p-3">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
                <h3 className="text-lg font-bold text-center">No Helmet Violation</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Detects motorcyclists riding without helmets to improve road safety compliance
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Benefits</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Why Choose RoadLens?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our intelligent system offers numerous advantages for traffic management and road safety.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg bg-background p-6 shadow-lg">
                <div className="rounded-full bg-primary/10 p-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Reduced Traffic Congestion</h3>
                <p className="text-center text-muted-foreground">
                  Smart traffic management reduces wait times and improves flow
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg bg-background p-6 shadow-lg">
                <div className="rounded-full bg-green-500/10 p-4">
                  <Shield className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="text-xl font-bold">Enhanced Safety</h3>
                <p className="text-center text-muted-foreground">Rapid incident detection and response saves lives</p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg bg-background p-6 shadow-lg">
                <div className="rounded-full bg-blue-500/10 p-4">
                  <Road className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold">Better Road Maintenance</h3>
                <p className="text-center text-muted-foreground">
                  Proactive detection of road issues before they cause accidents
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg bg-background p-6 shadow-lg">
                <div className="rounded-full bg-amber-500/10 p-4">
                  <Camera className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold">Advanced Surveillance</h3>
                <p className="text-center text-muted-foreground">
                  AI-powered monitoring for enhanced security and crime prevention
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg bg-background p-6 shadow-lg">
                <div className="rounded-full bg-purple-500/10 p-4">
                  <Gauge className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold">Speed Enforcement</h3>
                <p className="text-center text-muted-foreground">
                  Automatic detection of speeding vehicles with license plate recognition
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg bg-background p-6 shadow-lg">
                <div className="rounded-full bg-red-500/10 p-4">
                  <FileText className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold">Data-Driven Decisions</h3>
                <p className="text-center text-muted-foreground">
                  Comprehensive analytics for better traffic planning and management
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="technology" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Technology</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Cutting-Edge Innovation</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  RoadLens leverages the latest in AI, computer vision, and IoT technologies.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2">
              <div className="flex flex-col space-y-4 rounded-lg bg-background p-6 shadow-lg">
                <h3 className="text-xl font-bold">Advanced Computer Vision</h3>
                <p className="text-muted-foreground">
                  Our system uses state-of-the-art computer vision algorithms to detect vehicles, pedestrians, road
                  conditions, and incidents in real-time with exceptional accuracy.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                    Object detection and tracking
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                    License plate recognition
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                    Anomaly detection
                  </li>
                </ul>
              </div>
              <div className="flex flex-col space-y-4 rounded-lg bg-background p-6 shadow-lg">
                <h3 className="text-xl font-bold">Artificial Intelligence</h3>
                <p className="text-muted-foreground">
                  Machine learning models continuously improve system performance by learning from traffic patterns and
                  adapting to changing conditions.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                    Deep learning neural networks
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                    Predictive analytics
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                    Adaptive algorithms
                  </li>
                </ul>
              </div>
              <div className="flex flex-col space-y-4 rounded-lg bg-background p-6 shadow-lg">
                <h3 className="text-xl font-bold">IoT Integration</h3>
                <p className="text-muted-foreground">
                  Connected devices and sensors form a comprehensive network for monitoring and controlling traffic
                  infrastructure.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                    Smart traffic signals
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                    Mobile camera units
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                    Environmental sensors
                  </li>
                </ul>
              </div>
              <div className="flex flex-col space-y-4 rounded-lg bg-background p-6 shadow-lg">
                <h3 className="text-xl font-bold">Real-Time Analytics</h3>
                <p className="text-muted-foreground">
                  Powerful data processing capabilities provide instant insights and automated responses to changing
                  traffic conditions.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                    Traffic flow optimization
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                    Incident detection and response
                  </li>
                  <li className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                    Historical data analysis
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Ready to Transform Road Safety?</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join the future of intelligent traffic management with RoadLens.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/login">
                  <Button className="bg-primary hover:bg-primary/90">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline">Contact Sales</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                <span className="text-primary">Road</span>
                <span className="text-green-500">Lens</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Real-Time Road Intelligence, Redefined.</p>
          </div>
          <div className="ml-auto grid gap-8 sm:grid-cols-3">
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Features</h3>
              <ul className="grid gap-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:underline">
                    Traffic Control
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Road Maintenance
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Incident Detection
                  </Link>
                </li>
              </ul>
            </div>
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Resources</h3>
              <ul className="grid gap-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:underline">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Case Studies
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Company</h3>
              <ul className="grid gap-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:underline">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:underline">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t">
          <div className="container flex flex-col gap-4 py-6 md:flex-row md:items-center">
            <p className="text-sm text-muted-foreground">© 2023 RoadLens. All rights reserved.</p>
            <div className="ml-auto flex gap-4">
              <Link href="#" className="text-sm text-muted-foreground hover:underline">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
