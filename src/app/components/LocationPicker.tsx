import React, { useEffect, useRef, useState } from "react";
import { MapPin, Search, Navigation, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LocationPickerProps {
  value: string;
  onChange: (url: string) => void;
  village?: string;
  district?: string;
}

export function LocationPicker({ value, onChange, village, district }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputContainerRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Parse latitude and longitude from the location string
  const parseCoords = (val: string): { lat: number; lng: number } | null => {
    if (!val) return null;
    
    // Check if it's a google maps link (e.g. https://www.google.com/maps?q=17.9689,79.5941)
    const googleMapsMatch = val.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/) || val.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (googleMapsMatch) {
      return {
        lat: parseFloat(googleMapsMatch[1]),
        lng: parseFloat(googleMapsMatch[2])
      };
    }
    
    // Check if it's direct coordinates (e.g. 17.9689,79.5941)
    const parts = val.split(",");
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    
    return null;
  };

  const currentCoords = parseCoords(value);

  // Initialize Map
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapContainerRef.current) return;

    // Define standard icons workaround for Leaflet in Vite
    const DefaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    // Default center (Hyderabad/Telangana area)
    const defaultCenter = { lat: 17.385, lng: 78.4867 };
    const initialCenter = currentCoords || defaultCenter;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom: currentCoords ? 14 : 8,
      scrollWheelZoom: true
    });

    mapRef.current = map;

    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Create draggable marker
    const marker = L.marker([initialCenter.lat, initialCenter.lng], {
      draggable: true
    }).addTo(map);

    markerRef.current = marker;

    // Handle marker dragging
    marker.on("dragend", () => {
      const position = marker.getLatLng();
      const mapsUrl = `https://www.google.com/maps?q=${position.lat.toFixed(6)},${position.lng.toFixed(6)}`;
      onChange(mapsUrl);
    });

    // Handle map clicks to position the marker
    map.on("click", (e: any) => {
      const position = e.latlng;
      marker.setLatLng(position);
      const mapsUrl = `https://www.google.com/maps?q=${position.lat.toFixed(6)},${position.lng.toFixed(6)}`;
      onChange(mapsUrl);
    });

    // If there was no initial coordinate set, but we have a village and district, perform an initial geocoding search to center the map
    if (!value && (village || district)) {
      const searchLocation = `${village || ""}, ${district || ""}, Telangana, India`.trim();
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation)}&viewbox=77.15,19.92,81.3,15.83`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const result = data[0];
            const lat = parseFloat(result.lat);
            const lng = parseFloat(result.lon);
            map.setView([lat, lng], 13);
            marker.setLatLng([lat, lng]);
            onChange(`https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`);
            // Set initial search value to the village name
            setSearchQuery(`${village || ""}, ${district || ""}`);
          }
        })
        .catch(err => console.warn("Initial location centering failed:", err));
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update map marker when coordinates value changes from outside (e.g., GPS or search)
  useEffect(() => {
    if (mapRef.current && markerRef.current && currentCoords) {
      const markerLatLng = markerRef.current.getLatLng();
      if (Math.abs(markerLatLng.lat - currentCoords.lat) > 0.0001 || Math.abs(markerLatLng.lng - currentCoords.lng) > 0.0001) {
        markerRef.current.setLatLng([currentCoords.lat, currentCoords.lng]);
        mapRef.current.setView([currentCoords.lat, currentCoords.lng], 14);
      }
    }
  }, [value]);

  // Click outside suggestions container to close it
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchInputContainerRef.current && !searchInputContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Debounced search suggestions query as the user types
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        // Query Nominatim API with a bounding box (viewbox) prioritizing Telangana, India
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&viewbox=77.15,19.92,81.3,15.83&limit=5`;
        const res = await fetch(url, {
          headers: {
            "Accept-Language": "en"
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data || []);
        }
      } catch (err) {
        console.warn("Autocomplete fetch failed:", err);
      }
    }, 450); // 450ms debounce time

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Request user permission and get live location
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
        onChange(mapsUrl);
        
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([latitude, longitude], 15);
          markerRef.current.setLatLng([latitude, longitude]);
        }
        
        // Reverse geocode to find friendly name for search input
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.display_name) {
              setSearchQuery(data.display_name.split(',')[0]);
            }
          })
          .catch(() => {});

        toast.success("Successfully fetched live location!");
        setGpsLoading(false);
      },
      (error) => {
        setGpsLoading(false);
        console.error("GPS error:", error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location permission denied. Please enable it in browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("Request to get user location timed out.");
            break;
          default:
            toast.error("Failed to retrieve live location.");
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Select a location suggestion from list
  const handleSelectSuggestion = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    const mapsUrl = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
    onChange(mapsUrl);
    
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lng], 15);
      markerRef.current.setLatLng([lat, lng]);
    }
    
    // Set input box to the matching name
    setSearchQuery(suggestion.display_name.split(',')[0]);
    setShowSuggestions(false);
  };

  // Manual form search submit handler
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      // Prioritize Telangana search
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&viewbox=77.15,19.92,81.3,15.83&limit=5`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Search request failed");
      const data = await res.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const mapsUrl = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
        onChange(mapsUrl);
        
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([lat, lng], 15);
          markerRef.current.setLatLng([lat, lng]);
        }
        setSearchQuery(result.display_name.split(',')[0]);
        setShowSuggestions(false);
        toast.success(`Centered map on: ${result.display_name.split(',')[0]}`);
      } else {
        // Fallback global search
        const resGlobal = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
        const dataGlobal = await resGlobal.json();
        if (dataGlobal && dataGlobal.length > 0) {
          const result = dataGlobal[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);
          const mapsUrl = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
          onChange(mapsUrl);
          if (mapRef.current && markerRef.current) {
            mapRef.current.setView([lat, lng], 15);
            markerRef.current.setLatLng([lat, lng]);
          }
          setSearchQuery(result.display_name.split(',')[0]);
          setShowSuggestions(false);
          toast.success(`Centered map on: ${result.display_name.split(',')[0]}`);
        } else {
          toast.error("Location not found. Try a different query.");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error searching location. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and GPS controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2 relative">
          <div ref={searchInputContainerRef} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search village, town, or area..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />

            {/* Places autocomplete suggestion list */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto divide-y divide-border">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-4 py-3 hover:bg-muted/60 transition-colors text-xs text-foreground font-medium flex items-start gap-2.5 focus:outline-none focus:bg-muted/60"
                  >
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{s.display_name.split(',')[0]}</p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{s.display_name.split(',').slice(1).join(',').trim()}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={searchLoading}
            className="px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-1.5 shrink-0"
          >
            {searchLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGetLiveLocation}
          disabled={gpsLoading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 text-primary text-sm font-semibold rounded-xl border border-primary/20 hover:bg-primary/20 transition-all shrink-0 active:scale-95"
        >
          {gpsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          Use Live Location
        </button>
      </div>

      {/* Map Element */}
      <div className="relative border border-border rounded-2xl overflow-hidden shadow-inner bg-muted">
        <div ref={mapContainerRef} className="w-full h-[320px] z-10" />
        <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur border border-border rounded-lg p-2 text-[10px] text-foreground font-semibold shadow-sm z-20 pointer-events-none flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-secondary shrink-0" />
          {currentCoords ? (
            <span>
              Lat: {currentCoords.lat.toFixed(5)}, Lng: {currentCoords.lng.toFixed(5)}
            </span>
          ) : (
            <span className="text-destructive">Click on map or search to select location</span>
          )}
        </div>
      </div>
      
      <p className="text-[10px] text-muted-foreground">
        Click anywhere on the map to pin the field, or drag the marker to adjust. GPS coordinates will be captured automatically.
      </p>
    </div>
  );
}
