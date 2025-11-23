import React, { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Sphere, Graticule, ZoomableGroup } from 'react-simple-maps';
import { Tooltip } from 'react-tooltip';
import { ProjectionType } from '../types';

interface MapProps {
    projection: ProjectionType;
    onCountryClick: (geo: any) => void;
    highlightedCountry?: { code: string; id: string } | null;
    focusLocation?: { coordinates: [number, number], zoom: number } | null;
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

const Map: React.FC<MapProps> = ({ projection, onCountryClick, highlightedCountry, focusLocation }) => {
    const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
    const [tooltipContent, setTooltipContent] = useState("");

    useEffect(() => {
        if (focusLocation) {
            // react-simple-maps uses [lng, lat] for center, but our data is [lat, lng]
            setPosition({
                coordinates: [focusLocation.coordinates[1], focusLocation.coordinates[0]],
                zoom: focusLocation.zoom
            });
        } else {
            setPosition({ coordinates: [0, 0], zoom: 1 });
        }
    }, [focusLocation]);

    const projectionConfig = useMemo(() => {
        switch (projection) {
            case 'geoOrthographic':
                return {
                    rotate: [0, 0, 0],
                    scale: 100
                };
            case 'geoEqualEarth':
                return {
                    scale: 160,
                    rotate: [-10, 0, 0],
                };
            case 'geoMercator':
            default:
                return {
                    scale: 100,
                    rotate: [0, 0, 0],
                };
        }
    }, [projection]);

    return (
        <div className="map-wrapper" style={{ width: '100%', height: '100%', position: 'relative' }}>
            <ComposableMap
                projection={projection}
                projectionConfig={projectionConfig as any}
                width={800}
                height={600}
                style={{ width: "100%", height: "100%" }}
            >
                <ZoomableGroup
                    zoom={position.zoom}
                    center={position.coordinates as [number, number]}
                    onMoveEnd={(position) => setPosition(position)}
                    maxZoom={10}
                >
                    <Sphere stroke="#1a1b26" strokeWidth={2} id="sphere" fill="transparent" />
                    <Graticule stroke="#24283b" strokeWidth={0.5} />
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                // Robust matching: check ISO code or ID
                                const geoId = geo.id; // usually numeric string or number
                                const geoIso = geo.properties.iso_a3 || geo.properties.ISO_A3 || geo.properties.ADM0_A3;

                                const isHighlighted = highlightedCountry && (
                                    (geoIso && geoIso === highlightedCountry.code) ||
                                    (geoId && String(geoId) === String(highlightedCountry.id)) ||
                                    (geoId && String(geoId).padStart(3, '0') === String(highlightedCountry.id))
                                );

                                // Determine fill color:
                                // If highlighted AND focused (Show Me mode), use light green.
                                // If just highlighted (Win/Loss result), use success green.
                                const fillColor = isHighlighted
                                    ? (focusLocation ? "var(--map-highlight-focused)" : "var(--success)")
                                    : "var(--map-fill)";

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        onMouseEnter={() => {
                                            setTooltipContent(geo.properties.name);
                                        }}
                                        onMouseLeave={() => {
                                            setTooltipContent("");
                                        }}
                                        onClick={() => onCountryClick(geo)}
                                        style={{
                                            default: {
                                                fill: fillColor,
                                                stroke: "var(--map-stroke)",
                                                strokeWidth: 0.5 / position.zoom,
                                                outline: "none",
                                                transition: "all 0.2s"
                                            },
                                            hover: {
                                                fill: "var(--map-hover)",
                                                stroke: "var(--text-primary)",
                                                strokeWidth: 0.75 / position.zoom,
                                                outline: "none",
                                                cursor: "pointer"
                                            },
                                            pressed: {
                                                fill: "var(--accent)",
                                                stroke: "var(--text-primary)",
                                                outline: "none"
                                            }
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>
            <Tooltip id="my-tooltip" content={tooltipContent} />
        </div>
    );
};

export default Map;
