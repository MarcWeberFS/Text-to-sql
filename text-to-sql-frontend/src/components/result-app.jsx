"use client";

import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function ResultMap({ data }) {
  useEffect(() => {
    const mapData = Array.isArray(data) && data.length > 0 ? data : [];

    const existing = document.getElementById("map");
    if (existing?._leaflet_id) existing._leaflet_id = null;

    const map = L.map("map").setView([47.3769, 8.5417], 13);
    window._leafletMap = map;

    let bounds = [];
    let markerCount = 0;
    let polyCount = 0;
    let lineCount = 0;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const customIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -40],
      shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
      shadowSize: [41, 41],
      shadowAnchor: [13, 41],
    });

    mapData.forEach((item) => {
      try {
        const geometryValue = Object.values(item).find(v =>
          typeof v === "string" &&
          /^(POINT|POLYGON|MULTIPOLYGON|LINESTRING|MULTILINESTRING)\(/.test(v)
        );

        if (!geometryValue) return;

        const geometry = String(geometryValue);

        if (geometry.startsWith("POINT(")) {
          const coords = geometry
            .replace("POINT(", "")
            .replace(")", "")
            .split(" ")
            .map((c) => parseFloat(c));

          if (coords.length === 2) {
            let [lng, lat] = coords;
            if (Math.abs(lng) > 1000 || Math.abs(lat) > 1000) {
              [lng, lat] = swissToWGS84(lng, lat);
            }

            L.marker([lat, lng], { icon: customIcon })
              .addTo(map)
              .bindPopup(item.name || "Unnamed location");

            bounds.push([lat, lng]);
            markerCount++;
          }
        } else {
          const shapes = parseWKT(geometry);
          if (!shapes) return;

          if (geometry.startsWith("POLYGON") || geometry.startsWith("MULTIPOLYGON")) {
            const poly = L.polygon(shapes, {
              color: "blue",
              weight: 2,
              fillOpacity: 0.3,
            }).addTo(map).bindPopup(item.name || "Polygon");

            bounds = bounds.concat(poly.getLatLngs().flat());
            polyCount++;
          } else if (geometry.startsWith("LINESTRING")) {
            const line = L.polyline(shapes, {
              color: "green",
              weight: 3,
            }).addTo(map).bindPopup(item.name || "Line");

            bounds = bounds.concat(line.getLatLngs());
            lineCount++;
          } else if (geometry.startsWith("MULTILINESTRING")) {
            shapes.forEach((lineCoords) => {
              const line = L.polyline(lineCoords, {
                color: "purple",
                weight: 3,
              }).addTo(map).bindPopup(item.name || "Multi-line part");

              bounds = bounds.concat(line.getLatLngs());
              lineCount++;
            });
          }
        }
      } catch (_) {
        // Fail silently in production
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Consolidated log to pinpoint issues if no visible data
    if (markerCount + polyCount + lineCount === 0) {
      console.warn("[Map Debug] No visible elements rendered. Data length:", mapData.length);
    }

    window.debugAddMarker = function (lat, lng, label = "Debug Marker") {
      L.marker([lat, lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(label)
        .openPopup();
      map.setView([lat, lng], 15);
    };

    return () => {
      map.off();
      map.remove();
      delete window._leafletMap;
      delete window.debugAddMarker;
    };
  }, [data]);

  return (
    <div
      id="map"
      style={{
        height: "500px",
        width: "100%",
        marginTop: "1rem",
        borderRadius: "8px",
        zIndex: 0,
        position: "relative",
      }}
    />
  );
}

function parseWKT(wkt) {
  if (!wkt) return null;

  try {
    if (wkt.startsWith("POLYGON((")) {
      const raw = wkt.replace("POLYGON((", "").replace("))", "");
      const points = raw.split(",").map((p) => safeParsePoint(p));
      return [points];
    }

    if (wkt.startsWith("MULTIPOLYGON(((")) {
      const raw = wkt.replace("MULTIPOLYGON(((", "").replace(")))", "");
      return raw.split(")),((").map((polygon) =>
        polygon.split(",").map((p) => safeParsePoint(p))
      );
    }

    if (wkt.startsWith("LINESTRING(")) {
      const raw = wkt.replace("LINESTRING(", "").replace(")", "");
      return raw.split(",").map((p) => safeParsePoint(p));
    }

    if (wkt.startsWith("MULTILINESTRING((")) {
      const raw = wkt.replace("MULTILINESTRING((", "").replace("))", "");
      return raw.split("),(").map((line) =>
        line.split(",").map((p) => safeParsePoint(p))
      );
    }

    return null;
  } catch {
    return null;
  }
}

function safeParsePoint(pair) {
  let [lng, lat] = pair.trim().split(" ").map(Number);
  if (isNaN(lng) || isNaN(lat)) throw new Error("Invalid number in point");
  if (Math.abs(lng) > 1000 || Math.abs(lat) > 1000) {
    [lng, lat] = swissToWGS84(lng, lat);
  }
  return [lat, lng];
}

function swissToWGS84(x, y) {
  const e = (x - 2600000) / 1000000;
  const n = (y - 1200000) / 1000000;

  const lat = 16.9023892 +
    3.238272 * n -
    0.270978 * e * e -
    0.002528 * n * n -
    0.0447 * e * e * n -
    0.0140 * n * n * n;

  const lng = 2.6779094 +
    4.728982 * e +
    0.791484 * e * n +
    0.1306 * e * n * n -
    0.0436 * e * e * e;

  return [lng * 100 / 36, lat * 100 / 36];
}
