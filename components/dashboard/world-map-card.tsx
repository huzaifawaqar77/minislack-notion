"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorldMap } from "@/components/ui/world-map";

interface WorldMapCardProps {
  className?: string;
}

export function WorldMapCard({ className }: WorldMapCardProps) {
  // Custom locations for your application
  const locations = [
    { id: "usa", name: "USA", lat: 37.0902, lng: -95.7129, color: "#a855f7", size: 8 },
    { id: "uk", name: "UK", lat: 55.3781, lng: -3.4360, color: "#a855f7", size: 6 },
    { id: "india", name: "India", lat: 20.5937, lng: 78.9629, color: "#4ade80", size: 7 },
    { id: "pakistan", name: "Pakistan", lat: 30.3753, lng: 69.3451, color: "#4ade80", size: 8 },
    { id: "australia", name: "Australia", lat: -25.2744, lng: 133.7751, color: "#a855f7", size: 6 },
    { id: "japan", name: "Japan", lat: 36.2048, lng: 138.2529, color: "#4ade80", size: 5 },
    { id: "brazil", name: "Brazil", lat: -14.2350, lng: -51.9253, color: "#a855f7", size: 6 },
    { id: "germany", name: "Germany", lat: 51.1657, lng: 10.4515, color: "#a855f7", size: 5 },
    { id: "china", name: "China", lat: 35.8617, lng: 104.1954, color: "#4ade80", size: 7 },
    { id: "canada", name: "Canada", lat: 56.1304, lng: -106.3468, color: "#a855f7", size: 6 },
  ];

  // Custom connections between locations
  const connections = [
    { id: "usa-uk", source: "usa", target: "uk", color: "#a855f7", animated: true },
    { id: "india-pakistan", source: "india", target: "pakistan", color: "#4ade80", dashed: true },
    { id: "usa-canada", source: "usa", target: "canada", color: "#a855f7" },
    { id: "uk-germany", source: "uk", target: "germany", color: "#a855f7" },
    { id: "japan-china", source: "japan", target: "china", color: "#4ade80", dashed: true },
    { id: "australia-japan", source: "australia", target: "japan", color: "#4ade80", animated: true },
    { id: "usa-brazil", source: "usa", target: "brazil", color: "#a855f7" },
    { id: "india-china", source: "india", target: "china", color: "#4ade80", dashed: true },
    { id: "uk-australia", source: "uk", target: "australia", color: "#a855f7", animated: true },
  ];

  return (
    <Card className="bg-[#1e1e2f] border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-purple-500">Global User Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px] flex items-center justify-center">
          <WorldMap 
            width={800} 
            height={400}
            locations={locations}
            connections={connections}
            backgroundColor="#1e1e2f"
            gridColor="#6b21a8"
            pulseLocations={true}
            animateConnections={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}
