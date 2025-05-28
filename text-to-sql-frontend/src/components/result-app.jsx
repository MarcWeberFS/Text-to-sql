"use client";

import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function ResultMap({ data }) {
  useEffect(() => {
    if (!data || data.length === 0) return;

    const map = L.map("map").setView([47.3769, 8.5417], 13);
    let bounds = [];

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

    data.forEach((item) => {
      if (!item.geometry) return;

      try {
        if (item.geometry.startsWith("POINT(")) {
          const coords = item.geometry
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
          }
        } else {
          const shapes = parseWKT(item.geometry);

          if (!shapes) throw new Error("Invalid geometry parsed");

          if (item.geometry.startsWith("POLYGON") || item.geometry.startsWith("MULTIPOLYGON")) {
            const poly = L.polygon(shapes, {
              color: "blue",
              weight: 2,
              fillOpacity: 0.3,
            })
              .addTo(map)
              .bindPopup(item.name || "Polygon");

            bounds = bounds.concat(poly.getLatLngs().flat());
          } else if (item.geometry.startsWith("LINESTRING")) {
            const line = L.polyline(shapes, {
              color: "green",
              weight: 3,
            })
              .addTo(map)
              .bindPopup(item.name || "Line");

            bounds = bounds.concat(line.getLatLngs());
          } else if (item.geometry.startsWith("MULTILINESTRING")) {
            shapes.forEach((lineCoords) => {
              const line = L.polyline(lineCoords, {
                color: "purple",
                weight: 3,
              })
                .addTo(map)
                .bindPopup(item.name || "Multi-line part");

              bounds = bounds.concat(line.getLatLngs());
            });
          }
        }
      } catch (error) {
        console.error("Skipping invalid geometry:", item.geometry, error.message);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      map.off();
      map.remove();
    };
  }, [data]);

  return <div id="map" style={{ height: "500px", width: "100%", marginTop: "1rem", borderRadius: "8px" }} />;
}

function parseWKT(wkt) {
  if (!wkt) return null;

  try {
    if (wkt.startsWith("POLYGON((")) {
      const raw = wkt.replace("POLYGON((", "").replace("))", "");
      const points = raw.split(",").map((p) => safeParsePoint(p));
      if (points.length < 3) throw new Error("Not enough points for polygon");
      return [points];
    }

    if (wkt.startsWith("MULTIPOLYGON(((")) {
      const raw = wkt.replace("MULTIPOLYGON(((", "").replace(")))", "");
      const polygons = raw.split(")),((");
      return polygons.map((polygon) => {
        const points = polygon.split(",").map((p) => safeParsePoint(p));
        if (points.length < 3) throw new Error("Not enough points for multipolygon part");
        return points;
      });
    }

    if (wkt.startsWith("LINESTRING(")) {
      const raw = wkt.replace("LINESTRING(", "").replace(")", "");
      const points = raw.split(",").map((p) => safeParsePoint(p));
      if (points.length < 2) throw new Error("Not enough points for line");
      return points;
    }

    if (wkt.startsWith("MULTILINESTRING((")) {
      const raw = wkt.replace("MULTILINESTRING((", "").replace("))", "");
      const lines = raw.split("),(");
      return lines.map((line) => {
        const points = line.split(",").map((p) => safeParsePoint(p));
        if (points.length < 2) throw new Error("Not enough points for multiline part");
        return points;
      });
    }

    return null;
  } catch (error) {
    console.error("Error parsing WKT:", wkt, error.message);
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
