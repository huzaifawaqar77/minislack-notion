"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AceternityWorldMap } from "@/components/ui/aceternity-world-map";

interface AceternityWorldMapCardProps {
  className?: string;
}

export function AceternityWorldMapCard({ className }: AceternityWorldMapCardProps) {
  // Custom locations for your application
  const locations = [
    { id: "usa", name: "USA", lat: 37.0902, lng: -95.7129, color: "#3b82f6", size: 6 },
    { id: "uk", name: "UK", lat: 55.3781, lng: -3.4360, color: "#3b82f6", size: 6 },
    { id: "india", name: "India", lat: 20.5937, lng: 78.9629, color: "#3b82f6", size: 6 },
    { id: "australia", name: "Australia", lat: -25.2744, lng: 133.7751, color: "#3b82f6", size: 6 },
    { id: "japan", name: "Japan", lat: 36.2048, lng: 138.2529, color: "#3b82f6", size: 6 },
    { id: "brazil", name: "Brazil", lat: -14.2350, lng: -51.9253, color: "#3b82f6", size: 6 },
    { id: "france", name: "France", lat: 46.2276, lng: 2.2137, color: "#3b82f6", size: 6 },
    { id: "germany", name: "Germany", lat: 51.1657, lng: 10.4515, color: "#3b82f6", size: 6 },
  ];

  // Custom connections between locations
  const connections = [
    { id: "usa-uk", source: "usa", target: "uk", color: "#3b82f6", animated: true },
    { id: "india-japan", source: "india", target: "japan", color: "#3b82f6", animated: true },
    { id: "usa-brazil", source: "usa", target: "brazil", color: "#3b82f6", animated: true },
    { id: "uk-australia", source: "uk", target: "australia", color: "#3b82f6", animated: true },
    { id: "france-germany", source: "france", target: "germany", color: "#3b82f6", animated: true },
  ];

  return (
    <Card className="bg-[#1e1e2f] border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-purple-500">Global User Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px] flex items-center justify-center">
          <AceternityWorldMap 
            width={800} 
            height={400}
            locations={locations}
            connections={connections}
            backgroundColor="#1e1e2f"
            dotColor="#e5e7eb"
            lineColor="#3b82f6"
            pulseLocations={true}
            animateConnections={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}
