'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, FileText } from "lucide-react"

type Detection = {
  id?: string
  imgSrc: string
  detectedAt: number
  className: string
}

type DetectionTableProps = {
  detections: Detection[]
}

export default function DetectionTable({ detections }: DetectionTableProps) {
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null)

  const formatDate = (ms: number) => {
    const date = new Date(ms)
    return date.toLocaleString()
  }

  const exportToCSV = () => {
    const headers = ['Date & Time', 'Vehicle Type', 'Image Base64']
    const rows = detections.map(d =>
      [`"${formatDate(d.detectedAt)}"`, `"${d.className}"`, `"data:image/jpg;base64,${d.imgSrc}"`]
    )
  
    const csvContent =
      [headers, ...rows].map(e => e.join(',')).join('\n')
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
  
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'detection_report.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }  

  return (
    <div className="rounded-md border shadow-sm">
      <div className="flex justify-between items-center p-6">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <FileText className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-6 p-4 font-semibold border-b bg-muted text-muted-foreground">
        <div className="col-span-2">Image</div>
        <div>Date & Time</div>
        <div>Vehicle</div>
        <div className="col-span-2 text-right">Action</div>
      </div>

      {detections.length > 0 ? (
        detections.map((detection, index) => (
          <div key={index} className="grid grid-cols-6 p-4 items-center border-b hover:bg-muted/50 transition-colors">
            <div className="col-span-2">
              <img
                className="w-40 h-24 object-cover rounded shadow"
                src={`data:image/jpg;base64,${detection.imgSrc}`}
                alt="Detection"
              />
            </div>
            <div className="text-sm">{formatDate(detection.detectedAt)}</div>
            <div className="text-sm">{detection.className}</div>
            <div className="col-span-2 flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDetection(detection)}
                  >
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Detection Details</DialogTitle>
                    <DialogDescription className="space-y-4">
                      <img
                        className="w-full max-h-64 object-cover rounded"
                        src={`data:image/jpg;base64,${selectedDetection?.imgSrc}`}
                        alt="Detection"
                      />
                      <p><strong>Date & Time:</strong> {formatDate(selectedDetection?.detectedAt || 0)}</p>
                      <p><strong>Vehicle:</strong> {selectedDetection?.className}</p>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))
      ) : (
        <div className="p-4 text-center text-sm text-muted-foreground">No detections available.</div>
      )}
    </div>
  )
}
