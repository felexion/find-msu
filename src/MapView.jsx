import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import logo from './images/find_styled.png';
import findIcon from './images/find-icon.png';
import leftIcon from './images/left.png';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Custom marker icon using find-icon.png
const customIcon = L.icon({
  iconUrl: findIcon,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
  shadowSize: [0, 0]
});

// MSU General Santos Colleges - Fatima Campus
const MOCK_ROOMS = [
  { id: 1, name: 'College of Agriculture', coords: [6.0680, 125.1250], status: 'Open', type: 'College' },
  { id: 2, name: 'College of Engineering', coords: [6.0670, 125.1275], status: 'Open', type: 'College' },
  { id: 3, name: 'College of Education', coords: [6.0660, 125.1245], status: 'Open', type: 'College' },
  { id: 4, name: 'College of Fisheries and Aquatic Sciences', coords: [6.0690, 125.1240], status: 'Open', type: 'College' },
  { id: 5, name: 'College of Business Administration & Accountancy', coords: [6.0655, 125.1260], status: 'Open', type: 'College' },
  { id: 6, name: 'College of Natural Sciences and Mathematics', coords: [6.0665, 125.1290], status: 'Open', type: 'College' },
  { id: 7, name: 'College of Social Sciences and Humanities', coords: [6.0675, 125.1265], status: 'Open', type: 'College' },
  { id: 8, name: 'Institute of Islamic, Arabic, & International Studies', coords: [6.0645, 125.1270], status: 'Open', type: 'Institute' },
  { id: 9, name: 'College of Health Sciences', coords: [6.0685, 125.1285], status: 'Open', type: 'College' },
  { id: 10, name: 'College of Medicine (City Campus)', coords: [6.1162, 125.1717], status: 'Open', type: 'College' },
];

export default function MapView({ onClose, selectedFeature }) {
  const zoomPortalRef = useRef(null);

  useEffect(() => {
    // Ensure Leaflet CSS is loaded
    const style = document.createElement('link');
    style.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    style.rel = 'stylesheet';
    document.head.appendChild(style);
  }, []);

  // Rendered inside MapContainer (for useMap access), but portalled into the header slot
  function ZoomButtons() {
    const map = useMap();
    if (!zoomPortalRef.current) return null;

    return ReactDOM.createPortal(
      <div className="flex gap-2">
        <button
          onClick={() => map.zoomIn()}
          className="w-10 h-10 rounded-full bg-white hover:bg-white/90 active:scale-95 transition-all duration-200 shadow-lg flex items-center justify-center font-bold text-lg select-none"
          style={{ color: '#7e125b' }}
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => map.zoomOut()}
          className="w-10 h-10 rounded-full bg-white hover:bg-white/90 active:scale-95 transition-all duration-200 shadow-lg flex items-center justify-center font-bold text-lg select-none"
          style={{ color: '#7e125b' }}
          title="Zoom out"
        >
          −
        </button>
      </div>,
      zoomPortalRef.current
    );
  }

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden flex flex-col">
      {/* Top Header with Logo, Search, Zoom, and Back Button */}
      <div className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between">
        {/* Left side: Logo and Search */}
        <div className="flex items-center gap-4">
          {/* Find Logo */}
          <img 
            src={logo} 
            alt="Find Logo" 
            className="h-14 w-auto object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
          />
          
          {/* Search Bar and Zoom Controls */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative shadow-lg">
              <span className="absolute inset-y-0 left-4 flex items-center pr-2">
                <svg className="w-5 h-5 text-purple-900/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                type="text" 
                placeholder="Search Campus..." 
                className="py-3 pl-12 pr-6 bg-white text-purple-950 font-light placeholder-purple-900/60 rounded-full text-sm focus:outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] w-64"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Zoom buttons portal target — buttons are rendered here via MapContainer */}
            <div ref={zoomPortalRef} className="flex gap-2" />
          </div>
        </div>

        {/* Right side: Back Button */}
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:opacity-90"
          style={{ backgroundColor: '#7e125b' }}
          title="Go back"
        >
          <img 
            src={leftIcon} 
            alt="Back" 
            className="w-6 h-6 object-contain invert brightness-200"
          />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-50 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-white text-sm space-y-2">
        <h3 className="text-xs font-semibold tracking-wide mb-3">MSU General Santos</h3>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
          <span className="text-xs">Colleges</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-500 rounded-full border-2 border-white"></div>
          <span className="text-xs">Institutes</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 w-full h-full">
        <MapContainer
          center={[6.0665, 125.1261]}
          zoom={15}
          style={{ width: '100%', height: '100%' }}
          className="z-10"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* ZoomButtons must live inside MapContainer to access the map context */}
          <ZoomButtons />
          
          {/* Render college markers */}
          {MOCK_ROOMS.map((college) => {
            return (
              <Marker key={college.id} position={college.coords} icon={customIcon}>
                <Popup>
                  <div style={{ fontFamily: "'Aventa', sans-serif", minWidth: '200px' }}>
                    <strong>{college.name}</strong>
                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#10b981' }}>
                      ✓ {college.status}
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#666' }}>
                      Type: {college.type}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Leaflet popup styling */}
      <style>{`
        .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.95) !important;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          padding: 12px;
        }
        .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.95) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          font-family: 'Aventa', sans-serif;
        }
        .leaflet-container {
          font-family: 'Aventa', sans-serif;
          background: #0a0a0a;
        }
        .leaflet-control-attribution {
          background: rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          font-size: 10px;
        }
      `}</style>
    </div>
  );
}