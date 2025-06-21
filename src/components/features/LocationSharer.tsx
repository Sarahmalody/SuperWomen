"use client";

import { useState } from 'react';
import { MapPin, Copy, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast"

export default function LocationSharer() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast()

  const handleGetLocation = () => {
    setLoading(true);
    setError(null);
    setLocation(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(`Error: ${err.message}`);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCopyLink = () => {
    if (location) {
      const url = `https://www.google.com/maps?q=${location.lat},${location.lon}`;
      navigator.clipboard.writeText(url);
      toast({
          title: "Location link copied!",
          description: "Your location has been copied to the clipboard.",
      })
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleGetLocation} disabled={loading} className="w-full">
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="mr-2 h-4 w-4" />
        )}
        Share My Location
      </Button>
      
      {error && (
        <div className="text-destructive text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4"/>
            <p>{error}</p>
        </div>
      )}

      {location && (
        <div className="bg-secondary p-3 rounded-md space-y-3">
            <div>
              <p className="text-sm font-medium text-secondary-foreground">Your current location:</p>
              <p className="text-xs text-muted-foreground">
                Lat: {location.lat.toFixed(5)}, Lon: {location.lon.toFixed(5)}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopyLink} className="w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copy Shareable Link
            </Button>
        </div>
      )}
    </div>
  );
}
