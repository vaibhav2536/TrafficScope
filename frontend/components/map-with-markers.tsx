// components/map-with-markers.tsx
"use client"

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api"
import { useMemo } from "react"

const containerStyle = {
  width: "100%",
  height: "400px",
}

interface MapProps {
  potholes: { id: string; coordinate: { lat: number; long: number } }[]
}

export default function MapWithMarkers({ potholes }: MapProps) {
  const center = useMemo(() => potholes.length > 0
    ? { lat: potholes[0].coordinate.lat, lng: potholes[0].coordinate.long }
    : { lat: 20.5937, lng: 78.9629 }, // Default: India
  [potholes])

  const { isLoaded } = useJsApiLoader({
    // googleMapsApiKey: "AIzaSyAbMfem268_U8kIr4At-QpqFVW8_2Y4diI&map_ids=3e66a97b95b17f86",
    // googleMapsApiKey: "AIzaSyAbMfem268_U8kIr4At-QpqFVW8_2Y4diI",
    googleMapsApiKey: "",
  })

  if (!isLoaded) return <div>Loading Map...</div>

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
      {potholes.map((d) => (
        <Marker
          key={d.id}
          position={{ lat: d.coordinate.lat, lng: d.coordinate.long }}
          label="🕳️"
          title="Pothole Detected"
        />
      ))}
    </GoogleMap>
  )
}
