"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { PriorityBadge } from "@/components/ui/StatusBadge";
import { Badge } from "@/components/ui/Badge";

export interface LiveMapMarker {
  id: string;
  lng: number;
  lat: number;
  type: "order" | "technician" | "hub";
  label: string;
  priority?: Priority;
  status?: string;
  details?: string;
}

interface LiveMapProps {
  markers?: LiveMapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  accessToken?: string;
  className?: string;
  showLegend?: boolean;
  onMarkerClick?: (marker: LiveMapMarker) => void;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const markerColors: Record<LiveMapMarker["type"], string> = {
  order:      "#EF4444",
  technician: "#3B82F6",
  hub:        "#0F172A",
};

export function LiveMap({
  markers = [],
  center = [-112.074, 33.4484],
  zoom = 11,
  height = "h-96",
  accessToken = MAPBOX_TOKEN,
  className,
  showLegend = true,
  onMarkerClick,
}: LiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const [ready, setReady] = useState(false);
  const [noToken, setNoToken] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<LiveMapMarker | null>(null);

  useEffect(() => {
    if (!accessToken) { setNoToken(true); return; }
    if (!containerRef.current) return;
    if (mapRef.current) return;

    let map: unknown;
    let cancelled = false;

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !containerRef.current) return;

      const Mapbox = mapboxgl.default ?? mapboxgl;
      (Mapbox as { accessToken: string }).accessToken = accessToken;

      map = new (Mapbox as { Map: new (opts: unknown) => unknown }).Map({
        container: containerRef.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center,
        zoom,
        attributionControl: false,
      });

      mapRef.current = map;

      (map as { on: (e: string, cb: () => void) => void }).on("load", () => {
        if (cancelled) return;
        setReady(true);
      });
    }).catch(() => setNoToken(true));

    return () => {
      cancelled = true;
      if (map) (map as { remove: () => void }).remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // Add / update markers whenever ready or markers change
  useEffect(() => {
    if (!ready || !mapRef.current) return;

    import("mapbox-gl").then((mapboxgl) => {
      const Mapbox = mapboxgl.default ?? mapboxgl;

      // Remove old markers
      markersRef.current.forEach((m) => (m as { remove: () => void }).remove());
      markersRef.current = [];

      markers.forEach((m) => {
        const el = document.createElement("div");
        el.className = "relative cursor-pointer";

        const dot = document.createElement("div");
        dot.style.cssText = `
          width: 14px; height: 14px; border-radius: 50%;
          background: ${markerColors[m.type]};
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        `;
        if (m.priority === "stat") {
          dot.style.animation = "map-pulse 2s infinite";
          dot.style.boxShadow = "0 0 0 0 rgba(239,68,68,0.7)";
        }
        el.appendChild(dot);

        const label = document.createElement("div");
        label.style.cssText = `
          position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
          background: #0F172A; color: white; font-size: 10px; font-weight: 700;
          padding: 2px 6px; border-radius: 4px; white-space: nowrap;
          font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.05em;
          pointer-events: none;
        `;
        label.textContent = m.label;
        el.appendChild(label);

        el.addEventListener("click", () => {
          setSelectedMarker(m);
          onMarkerClick?.(m);
        });

        type MapboxMarkerCtor = new (opts: unknown) => {
          setLngLat: (c: [number, number]) => { addTo: (m: unknown) => unknown };
        };
        const MarkerClass = (Mapbox as { Marker: MapboxMarkerCtor }).Marker;
        const marker = new MarkerClass({ element: el })
          .setLngLat([m.lng, m.lat])
          .addTo(mapRef.current!);

        markersRef.current.push(marker);
      });
    });
  }, [ready, markers, onMarkerClick]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live Fleet Map
        </CardTitle>
        {showLegend && (
          <div className="flex items-center gap-3">
            <Badge variant="stat" size="sm">STAT</Badge>
            <span className="flex items-center gap-1 text-xs text-on-surface-variant">
              <span className="h-2.5 w-2.5 rounded-full bg-medical-blue" />Tech
            </span>
            <span className="flex items-center gap-1 text-xs text-on-surface-variant">
              <span className="h-2.5 w-2.5 rounded-full bg-midnight-navy border border-outline-variant" />Hub
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0 relative">
        {/* Mapbox container */}
        <div ref={containerRef} className={cn("w-full", height)} />

        {/* No token fallback */}
        {noToken && (
          <div className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-3",
            "bg-gradient-to-br from-midnight-navy to-slate-800 text-white"
          )}>
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            {/* Simulated markers on fallback */}
            {markers.slice(0, 6).map((m, i) => (
              <div
                key={m.id}
                onClick={() => { setSelectedMarker(m); onMarkerClick?.(m); }}
                className="absolute flex flex-col items-center gap-0.5 cursor-pointer group"
                style={{ left: `${15 + (i * 15) % 70}%`, top: `${20 + (i * 17) % 55}%` }}
              >
                <div
                  className={cn(
                    "h-4 w-4 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-125",
                    m.priority === "stat" ? "bg-emergency-red animate-pulse"
                    : m.type === "technician" ? "bg-medical-blue"
                    : "bg-midnight-navy"
                  )}
                />
                <span className="text-[9px] font-bold bg-midnight-navy/80 rounded px-1.5 py-0.5 text-white whitespace-nowrap">
                  {m.label}
                </span>
              </div>
            ))}
            <div className="relative z-10 text-center mt-auto mb-4 bg-midnight-navy/60 backdrop-blur rounded-xl px-4 py-2">
              <p className="text-xs text-white/60 font-label font-semibold uppercase tracking-wider">
                Set NEXT_PUBLIC_MAPBOX_TOKEN for live map
              </p>
            </div>
          </div>
        )}

        {/* Selected marker popup */}
        {selectedMarker && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-64 bg-midnight-navy text-white rounded-xl p-3 shadow-card-lg animate-fade-in z-10">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{selectedMarker.label}</p>
                {selectedMarker.details && (
                  <p className="text-xs text-white/60 mt-0.5">{selectedMarker.details}</p>
                )}
              </div>
              {selectedMarker.priority && (
                <PriorityBadge priority={selectedMarker.priority} size="sm" animate />
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] font-label font-semibold uppercase tracking-wider text-white/40">
                {selectedMarker.type.toUpperCase()} · {selectedMarker.status ?? "Active"}
              </span>
              <button
                onClick={() => setSelectedMarker(null)}
                className="text-white/40 hover:text-white text-xs transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Pulse keyframes injected inline for markers */}
      <style>{`
        @keyframes map-pulse {
          0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
      `}</style>
    </Card>
  );
}
