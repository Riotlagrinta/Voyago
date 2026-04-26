'use client';

import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, Layer, Source, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Canvas } from '@react-three/fiber';
import { BusModel } from './Bus3D';
import { Camera, Compass } from 'lucide-react';

interface Map3DProps {
  position: [number, number];
  busName?: string;
}

export default function Map3D({ position, busName }: Map3DProps) {
  const mapRef = useRef<MapRef>(null);
  const [followMode, setFollowMode] = useState(true);

  const [viewState, setViewState] = useState({
    longitude: position[0],
    latitude: position[1],
    zoom: 17, // Plus proche pour l'immersion
    pitch: 70, // Angle très incliné pour voir les bâtiments
    bearing: 0
  });

  const [busRotation, setBusRotation] = useState(0);
  const prevPos = useRef(position);

  const calculateBearing = (start: [number, number], end: [number, number]) => {
    const startLat = (start[1] * Math.PI) / 180;
    const startLng = (start[0] * Math.PI) / 180;
    const endLat = (end[1] * Math.PI) / 180;
    const endLng = (end[0] * Math.PI) / 180;
    const y = Math.sin(endLng - startLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
    return (Math.atan2(y, x) * 180) / Math.PI;
  };

  useEffect(() => {
    if (prevPos.current[0] !== position[0] || prevPos.current[1] !== position[1]) {
      const bearing = calculateBearing(prevPos.current, position);
      setBusRotation(bearing);

      // Mode follow cinématique : la caméra suit le bus avec fluidité
      if (followMode && mapRef.current) {
        mapRef.current.easeTo({
          center: position,
          bearing: bearing, // La carte tourne dans le sens du bus !
          duration: 2000,
          easing: (t) => t * (2 - t) // Easing fluide
        });
      }
      prevPos.current = position;
    }
  }, [position, followMode]);

  const lightStyle = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

  // Configuration des bâtiments 3D (couche d'extrusion)
  const buildingLayer: any = {
    id: '3d-buildings',
    source: 'openmaptiles',
    'source-layer': 'building',
    type: 'fill-extrusion',
    minzoom: 15,
    paint: {
      'fill-extrusion-color': '#ffffff',
      'fill-extrusion-height': ['get', 'render_height'],
      'fill-extrusion-base': ['get', 'render_min_height'],
      'fill-extrusion-opacity': 0.8,
    }
  };

  return (
    <div className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white transition-all duration-1000">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={lightStyle}
        style={{ width: '100%', height: '100%' }}
        maxPitch={85}
      >
        {/* Effet de ciel (atmosphère) */}
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000 bg-gradient-to-b from-sky-400/20 to-transparent" />

        <Source id="openmaptiles" type="vector" url="https://api.maptiler.com/tiles/v3/tiles.json?key=get_your_own_key">
            <Layer {...buildingLayer} />
        </Source>

        {/* Contrôles personnalisés */}
        <div className="absolute bottom-10 left-10 z-10 flex flex-col gap-4">
          <button
            onClick={() => setFollowMode(!followMode)}
            className={`p-4 rounded-2xl backdrop-blur-xl border transition-all ${followMode ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white/20 text-white border-white/40'}`}
          >
            <Camera className={`w-6 h-6 ${followMode ? 'animate-pulse' : ''}`} />
          </button>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white">
            <Compass className="w-6 h-6" style={{ transform: `rotate(${-viewState.bearing}deg)` }} />
          </div>
        </div>

        {/* Bus 3D cinématique */}
        <Marker longitude={position[0]} latitude={position[1]} anchor="center">
          <div style={{
            width: '140px',
            height: '140px',
            transform: `rotate(${-busRotation + viewState.bearing}deg)`, // Ajustement par rapport à la rotation de la carte
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <Canvas camera={{ position: [5, 5, 5], fov: 35 }}>
              <BusModel />
            </Canvas>
          </div>

          <div className="absolute -top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl shadow-2xl text-[10px] font-black tracking-widest border-2 transition-all duration-700 bg-white text-slate-900 border-slate-100 shadow-xl">
            {busName?.toUpperCase() || "VOYAGO BUS"}
          </div>
        </Marker>
      </Map>
    </div>
  );
}
