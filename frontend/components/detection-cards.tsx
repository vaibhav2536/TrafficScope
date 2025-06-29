'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function DetectionCards({ detections, activeModel }: any) {
  if (!detections[activeModel]?.length) {
    return <p className="text-center text-muted-foreground">No detections found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {detections[activeModel].map((detection: any) => {
        const detectedDate = new Date(detection.detectedAt);
        const formattedDate = detectedDate.toLocaleString();

        return (
          <Card key={detection.id} className="shadow-md hover:shadow-lg transition">
            <CardContent className="p-4 flex flex-col items-center space-y-4">
              <img
                className="w-full max-w-md rounded object-cover"
                src={`data:image/jpg;base64,${detection.imgSrc}`}
                alt="Detection"
              />
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">{formattedDate}</p>
                <Badge variant="default" className="text-sm px-2 py-1 rounded-full">
                  {detection.className}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
