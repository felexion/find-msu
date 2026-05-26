import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import logo from './images/find_styled.png';
import findIcon from './images/find-icon.png';
import leftIcon from './images/left.png';
import escBtn from './images/esc-btn.png';

import cnsmLogo from './images/cnsm.png';
import 'leaflet/dist/leaflet.css';

const COLLEGE_COLOR = '#79095b';
const FACILITY_COLOR = '#f0ad3e';
const NAV_LINE_COLOR = '#f0ad3e';

const LOGOS = {
  7: cnsmLogo,
};
//TEST GITHUB
// "You Are Here" pin — glowing amber
const youAreHereIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:48px;height:48px;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;width:48px;height:48px;border-radius:50%;background:rgba(240,173,62,0.25);animation:pulse-ring 1.6s ease-out infinite;"></div>
      <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:rgba(240,173,62,0.4);animation:pulse-ring 1.6s ease-out 0.4s infinite;"></div>
      <div style="width:18px;height:18px;border-radius:50%;background:#f0ad3e;border:3px solid #fff;box-shadow:0 2px 8px rgba(240,173,62,0.7);z-index:2;"></div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24],
});

const customIcon = L.divIcon({
  className: '',
  html: `<img src="${findIcon}" style="width:40px;height:40px;filter:invert(11%) sepia(90%) saturate(3000%) hue-rotate(300deg) brightness(80%);" />`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const amberIcon = L.divIcon({
  className: '',
  html: `<img src="${findIcon}" style="width:40px;height:40px;filter:invert(75%) sepia(80%) saturate(600%) hue-rotate(5deg) brightness(105%);" />`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Gate marker — deep red/maroon
const gateIcon = L.divIcon({
  className: '',
  html: `<img src="${findIcon}" style="width:40px;height:40px;filter:invert(15%) sepia(90%) saturate(4000%) hue-rotate(340deg) brightness(70%);" />`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// "You Are Here" mock location — main kiosk spot (Gemma West area)
const YOU_ARE_HERE = {
  id: 'you',
  name: 'You Are Here',
  coords: [6.068957605147049,  125.12587310793943],
};

const MOCK_ROOMS = [
  { id: 1,  name: 'College of Agriculture',                              coords: [6.070376245893397,  125.1258615776752],  status: 'Open', type: 'College' },
  { id: 2,  name: 'College of Engineering',                              coords: [6.0641902024993,    125.12677351285932], status: 'Open', type: 'College' },
  { id: 3,  name: 'College of Education',                                coords: [6.067858278201935,  125.1283526750339],  status: 'Open', type: 'College' },
  { id: 4,  name: 'College of Fisheries and Aquatic Sciences',           coords: [6.064504407925031,  125.13015684059019], status: 'Open', type: 'College' },
  { id: 5,  name: 'College of Business Administration & Accountancy',    coords: [6.064212841714116,  125.12843366241404], status: 'Open', type: 'College' },
  { id: 6,  name: 'College of Natural Sciences and Mathematics',         coords: [6.068957605147049,  125.12587310793943], status: 'Open', type: 'College' },
  { id: 7,  name: 'College of Social Sciences and Humanities',           coords: [6.067656228549597,  125.12601418089012], status: 'Open', type: 'College' },
  { id: 8,  name: 'Institute of Islamic, Arabic, & International Studies', coords: [6.070908146976309, 125.12745455283785], status: 'Open', type: 'Institute' },
  { id: 9,  name: 'Senior High School Department',                       coords: [6.0685,             125.1285],           status: 'Open', type: 'College' },
  { id: 10, name: 'Main Gate',                                           coords: [6.0657072972022075, 125.13180336952652], status: 'Open', type: 'Entrance/Exit' },
  { id: 15, name: 'ICT Building',                                        coords: [6.065338721556866,  125.12767722597256], status: 'Open', type: 'Building' },
  { id: 19, name: 'Regional Science Research Center (RSRC)',             coords: [6.069800666160386,  125.125835670486],   status: 'Open', type: 'Building' },
  { id: 24, name: 'SSC Building',                                        coords: [6.068957784834432,  125.12482383583192], status: 'Open', type: 'Building' },
  { id: 25, name: 'ROTC Headquarters',                                   coords: [6.063157819644279,  125.12783270375334], status: 'Open', type: 'Building' },
  { id: 26, name: 'Back Gate',                                           coords: [6.065494286706529,  125.12212504400082], status: 'Open', type: 'Entrance/Exit' },
];

const FACILITIES = [
  { id: 101, name: 'Gymnasium',                       coords: [6.066762686141641,  125.12442231852978], status: 'Open', type: 'Facility' },
  { id: 102, name: "Registrar's Office (Y Building)", coords: [6.065414460468946,  125.12833952730729], status: 'Open', type: 'Facility' },
  { id: 103, name: 'Library',                         coords: [6.066741408516854,  125.1280344570879],  status: 'Open', type: 'Facility' },
  { id: 104, name: 'Office of Student Affairs',       coords: [6.0697524175180515, 125.12418549237167], status: 'Open', type: 'Facility' },
  { id: 105, name: 'Laktanan',                        coords: [6.066342545843633,  125.12857083037396], status: 'Open', type: 'Facility' },
  { id: 106, name: 'VLS (Virtual Learning Studio)',   coords: [6.067230901171646,  125.12761004569558], status: 'Open', type: 'Facility' },
  { id: 107, name: 'University Infirmary',            coords: [6.065174012112744,  125.12328029288801], status: 'Open', type: 'Facility' },
  { id: 108, name: 'Alumni Park',                     coords: [6.067744143076113,  125.12394121823431], status: 'Open', type: 'Facility' },
  { id: 109, name: 'Boys Dorm Main',                  coords: [6.070705025510415,  125.12419236220188], status: 'Open', type: 'Dormitory' },
  { id: 110, name: 'Girls Dorm Main',                 coords: [6.068778264559637,  125.12436874823007], status: 'Open', type: 'Dormitory' },
  { id: 111, name: 'Girls Dorm Annex',                coords: [6.064380888138415,  125.12424491023336], status: 'Open', type: 'Dormitory' },
  { id: 112, name: 'Boys Dorm Annex',                 coords: [6.063938009607605,  125.12485131290474], status: 'Open', type: 'Dormitory' },
  { id: 113, name: 'Alumni Pavilion',                 coords: [6.066760016344999,  125.12845911413804], status: 'Open', type: 'Building' },
  { id: 114, name: 'Mosque',                          coords: [6.06668695352738,   125.1226887754368],  status: 'Open', type: 'Building' },
  { id: 115, name: 'Open Court',                      coords: [6.066232412609107,  125.12380032630378], status: 'Open', type: 'Building' },
  { id: 116, name: 'Quadrangle',                      coords: [6.0658170898974895, 125.12626962490214], status: 'Open', type: 'Field' },
];

const ALL_LOCATIONS = [...MOCK_ROOMS, ...FACILITIES];

const CAMPUS_BOUNDS = L.latLngBounds(
  L.latLng(6.0620, 125.1210),
  L.latLng(6.0725, 125.1330)
);

// Fetch real walking route from OSRM public API
async function fetchRoute(from, to) {
  const url = `https://router.project-osrm.org/route/v1/foot/${from[1]},${from[0]};${to[1]},${to[0]}?steps=true&geometries=geojson&overview=full`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.routes || data.routes.length === 0) throw new Error('No route found');

  const route = data.routes[0];
  const totalDist = Math.round(route.distance);
  const routeCoords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

  const steps = [];
  for (const leg of route.legs) {
    for (const step of leg.steps) {
      if (!step.maneuver || step.distance < 1) continue;
      const type = step.maneuver.type;
      const modifier = step.maneuver.modifier || '';
      const name = step.name || 'the path';
      const dist = Math.round(step.distance);
      let text = '';
      if (type === 'depart') text = `Head ${modifier || 'forward'} along ${name || 'the path'}`;
      else if (type === 'arrive') text = `Arrive at your destination`;
      else if (type === 'turn') text = `Turn ${modifier} onto ${name}`;
      else if (type === 'continue' || type === 'new name') text = `Continue onto ${name}`;
      else if (type === 'roundabout' || type === 'rotary') text = `Take exit ${step.maneuver.exit || ''} at the roundabout`;
      else text = `${type.charAt(0).toUpperCase() + type.slice(1)} ${modifier} — ${name}`.trim();
      steps.push({ text: text.trim(), dist });
    }
  }
  return { steps, totalDist, routeCoords };
}

function BoundsEnforcer() {
// Glow CSS injected once
const GLOW_STYLE = `
  @keyframes markerGlow {
    0%, 100% { filter: drop-shadow(0 0 6px rgba(255,210,0,1)) drop-shadow(0 0 14px rgba(255,160,0,0.9)); }
    50%       { filter: drop-shadow(0 0 12px rgba(255,230,0,1)) drop-shadow(0 0 24px rgba(255,160,0,1)); }
  }
  .marker-glow img { animation: markerGlow 1.2s ease-in-out infinite !important; }
`;

function injectGlowStyle() {
  if (!document.getElementById('marker-glow-css')) {
    const s = document.createElement('style');
    s.id = 'marker-glow-css';
    s.textContent = GLOW_STYLE;
    document.head.appendChild(s);
  }
}

// ── Inner component: has access to the Leaflet map instance ──────────────────
function MapInner({ markerRefs, glowId, openDetail, zoomPortalRef }) {
  const map = useMap();

  // Enforce bounds
  useEffect(() => {
    map.setMaxBounds(CAMPUS_BOUNDS);
    map.on('drag', () => map.panInsideBounds(CAMPUS_BOUNDS, { animate: false }));
  }, [map]);

function MapFlyTo({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyToBounds(
      [YOU_ARE_HERE.coords, coords],
      { padding: [80, 80], maxZoom: 17, duration: 1.2 }
    );
  }, [coords, map]);
  return null;
}

export default function MapView({ onClose, selectedFeature }) {
  const zoomPortalRef = useRef(null);
  const [detailItem, setDetailItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Navigation state
  const isNavMode = selectedFeature === 'Campus Navigation';
  const [navTarget, setNavTarget] = useState(null);       // destination item
  const [navData, setNavData] = useState(null);           // { steps, totalDist }
  const [navPanelVisible, setNavPanelVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const openDetail = (item) => {
    setDetailItem(item);
    setTimeout(() => setModalVisible(true), 10);
  };
  const closeDetail = () => {
    setModalVisible(false);
    setTimeout(() => setDetailItem(null), 350);
  };

  const [navLoading, setNavLoading] = useState(false);
  const [navError, setNavError] = useState(null);

  const startNavTo = async (item) => {
    closeDetail();
    setNavTarget(item);
    setNavData(null);
    setNavError(null);
    setNavLoading(true);
    setActiveStep(0);
    setTimeout(() => setNavPanelVisible(true), 50);
    try {
      const data = await fetchRoute(YOU_ARE_HERE.coords, item.coords);
      setNavData(data);
    } catch (e) {
      setNavError('Could not load route. Check your connection.');
    } finally {
      setNavLoading(false);
    }
  };

  const clearNav = () => {
    setNavPanelVisible(false);
    setTimeout(() => { setNavTarget(null); setNavData(null); }, 400);
  };

  useEffect(() => {
    const style = document.createElement('link');
    style.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    style.rel = 'stylesheet';
    document.head.appendChild(style);
  }, []);
  // Fly to + glow + open popup when glowId changes
  useEffect(() => {
    if (!glowId) return;

    // Clear any previous glow
    document.querySelectorAll('.marker-glow').forEach(el => el.classList.remove('marker-glow'));

    const ref = markerRefs.current[glowId];
    if (!ref) return;

    const item = ALL_ITEMS.find(i => i.id === glowId);
    if (!item) return;

    map.flyTo(item.coords, 17, { duration: 0.8 });

    setTimeout(() => {
      // Open the popup
      ref.openPopup();
      // Add glow to the marker's DOM element
      const markerEl = ref.getElement();
      if (markerEl) {
        markerEl.classList.add('marker-glow');
        // Remove glow after 5s
        setTimeout(() => markerEl.classList.remove('marker-glow'), 5000);
      }
    }, 900);
  }, [glowId, map, markerRefs]);

  // Portal zoom buttons into the header slot
  function ZoomButtons() {
    if (!zoomPortalRef.current) return null;
    return ReactDOM.createPortal(
      <div className="flex gap-2">
        <button onClick={() => map.zoomIn()}
          className="w-10 h-10 rounded-full bg-white hover:bg-white/90 active:scale-95 transition-all duration-200 shadow-lg flex items-center justify-center font-bold text-lg select-none"
          style={{ color: COLLEGE_COLOR }}>+</button>
        <button onClick={() => map.zoomOut()}
          className="w-10 h-10 rounded-full bg-white hover:bg-white/90 active:scale-95 transition-all duration-200 shadow-lg flex items-center justify-center font-bold text-lg select-none"
          style={{ color: COLLEGE_COLOR }}>−</button>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => map.zoomIn()}
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: '#fff', border: '1.5px solid rgba(121,9,91,0.15)',
            color: COLLEGE_COLOR, fontSize: '20px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            transition: 'background 0.15s, transform 0.1s', userSelect: 'none',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#faf5f9'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.93)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          title="Zoom in"
        >+</button>
        <button
          onClick={() => map.zoomOut()}
          style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: '#fff', border: '1.5px solid rgba(121,9,91,0.15)',
            color: COLLEGE_COLOR, fontSize: '20px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            transition: 'background 0.15s, transform 0.1s', userSelect: 'none',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#faf5f9'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.93)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          title="Zoom out"
        >−</button>
      </div>,
      zoomPortalRef.current
    );
  }

  function collegePopup(item) {
    return (
      <div style={{ fontFamily: "'Aventa', sans-serif", minWidth: '200px', margin: 0 }}>
        <div style={{ background: COLLEGE_COLOR, padding: '14px 36px 14px 14px', position: 'relative' }}>
          <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em' }}>
            {item.type.toUpperCase()}
          </p>
          <strong style={{ color: '#fff', fontSize: '13px', lineHeight: 1.3, display: 'block' }}>
            {isNavMode ? `Navigate to ${item.name}?` : `View ${item.name}?`}
          </strong>
        </div>
        <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          {isNavMode ? (
            <button onClick={() => startNavTo(item)}
              style={{ background: FACILITY_COLOR, color: '#000', border: 'none', borderRadius: '6px', padding: '6px 18px', fontSize: '12px', fontFamily: "'Aventa', sans-serif", cursor: 'pointer', fontWeight: 700, letterSpacing: '0.04em' }}>
              Navigate Here
            </button>
          ) : (
            <button onClick={() => openDetail(item)}
              style={{ background: COLLEGE_COLOR, color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 18px', fontSize: '12px', fontFamily: "'Aventa', sans-serif", cursor: 'pointer', fontWeight: 600, letterSpacing: '0.04em' }}>
              View
            </button>
          )}
        <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button
            onClick={() => openDetail(item)}
            style={{
              background: COLLEGE_COLOR, color: '#fff', border: 'none', borderRadius: '6px',
              padding: '6px 18px', fontSize: '12px', fontFamily: "'Aventa', sans-serif",
              cursor: 'pointer', fontWeight: 600, letterSpacing: '0.04em',
            }}
          >View</button>
        </div>
      </div>
    );
  }

  function facilityPopup(item) {
    return (
      <div style={{ fontFamily: "'Aventa', sans-serif", minWidth: '200px', margin: 0 }}>
        <div style={{ background: FACILITY_COLOR, padding: '14px 36px 14px 14px', position: 'relative' }}>
          <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'rgba(0,0,0,0.5)', letterSpacing: '0.08em' }}>
            {item.type.toUpperCase()}
          </p>
          <strong style={{ color: '#000', fontSize: '13px', lineHeight: 1.3, display: 'block' }}>
            {isNavMode ? `Navigate to ${item.name}?` : `View ${item.name}?`}
          </strong>
        </div>
        <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          {isNavMode ? (
            <button onClick={() => startNavTo(item)}
              style={{ background: COLLEGE_COLOR, color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 18px', fontSize: '12px', fontFamily: "'Aventa', sans-serif", cursor: 'pointer', fontWeight: 700, letterSpacing: '0.04em' }}>
              Navigate Here
            </button>
          ) : (
            <button onClick={() => openDetail(item)}
              style={{ background: FACILITY_COLOR, color: '#000', border: 'none', borderRadius: '6px', padding: '6px 18px', fontSize: '12px', fontFamily: "'Aventa', sans-serif", cursor: 'pointer', fontWeight: 600, letterSpacing: '0.04em' }}>
              View
            </button>
          )}
        <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button
            onClick={() => openDetail(item)}
            style={{
              background: FACILITY_COLOR, color: '#000', border: 'none', borderRadius: '6px',
              padding: '6px 18px', fontSize: '12px', fontFamily: "'Aventa', sans-serif",
              cursor: 'pointer', fontWeight: 600, letterSpacing: '0.04em',
            }}
          >View</button>
        </div>
      </div>
    );
  }

  const routePoints = navData?.routeCoords || null;

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden flex flex-col">
      {/* Pulse keyframes */}
      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          background: #fff !important;
          border-radius: 10px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.22) !important;
          padding: 0 !important;
          overflow: hidden;
        }
        .leaflet-popup-tip { background: #fff !important; }
        .leaflet-popup-content { margin: 0 !important; font-family: 'Aventa', sans-serif; }
        .leaflet-popup-close-button {
          color: rgba(255,255,255,0.8) !important;
          font-size: 18px !important;
          top: 10px !important; right: 10px !important;
          width: 22px !important; height: 22px !important;
          line-height: 22px !important; text-align: center; font-weight: 400 !important;
        }
        .leaflet-popup-close-button:hover { color: #fff !important; }
        .leaflet-container { font-family: 'Aventa', sans-serif; background: #0a0a0a; }
        .leaflet-control-attribution { background: rgba(255,255,255,0.1) !important; color: white !important; font-size: 10px; }

        /* Nav panel step animation */
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .step-card { animation: stepIn 0.3s ease forwards; }

        @keyframes spin { to { transform: rotate(360deg); } }
        /* Dashed animated route line */
        .nav-route-line {
          stroke-dasharray: 10 6;
          animation: dash-move 1.2s linear infinite;
        }
        @keyframes dash-move {
          to { stroke-dashoffset: -32; }
        }
      `}</style>

      {/* Top Header */}
      <div className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Find Logo" className="h-14 w-auto object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]" />
          <div className="flex items-center gap-3">
            {/* Nav mode badge */}
            {isNavMode && (
              <div style={{ background: FACILITY_COLOR, color: '#000', borderRadius: '999px', padding: '6px 16px', fontSize: '12px', fontWeight: 700, fontFamily: "'Aventa',sans-serif", letterSpacing: '0.06em', boxShadow: '0 2px 12px rgba(240,173,62,0.4)' }}>
                NAVIGATE CAMPUS
              </div>
            )}
            <div className="relative shadow-lg">
              <span className="absolute inset-y-0 left-4 flex items-center pr-2">
                <svg className="w-5 h-5 text-purple-900/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input type="text" placeholder="Search Campus..."
                className="py-3 pl-12 pr-6 bg-white text-purple-950 font-light placeholder-purple-900/60 rounded-full text-sm focus:outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] w-64"
                onClick={(e) => e.stopPropagation()} />
  const collegeIcon = L.divIcon({
    className: '',
    html: `<img src="${findIcon}" style="width:40px;height:40px;filter:invert(11%) sepia(90%) saturate(3000%) hue-rotate(300deg) brightness(80%);" />`,
    iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40],
  });

  const amberIcon = L.divIcon({
    className: '',
    html: `<img src="${findIcon}" style="width:40px;height:40px;filter:invert(75%) sepia(80%) saturate(600%) hue-rotate(5deg) brightness(105%);" />`,
    iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40],
  });

  return (
    <>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <ZoomButtons />

      {COLLEGES.map(item => (
        <Marker
          key={item.id}
          position={item.coords}
          icon={collegeIcon}
          ref={el => { if (el) markerRefs.current[item.id] = el; }}
        >
          <Popup>{collegePopup(item)}</Popup>
        </Marker>
      ))}

      {FACILITIES.map(item => (
        <Marker
          key={item.id}
          position={item.coords}
          icon={amberIcon}
          ref={el => { if (el) markerRefs.current[item.id] = el; }}
        >
          <Popup
            eventHandlers={{
              add: (e) => { const btn = e.target._closeButton; if (btn) btn.classList.add('dark-close'); }
            }}
          >{facilityPopup(item)}</Popup>
        </Marker>
      ))}
    </>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function MapView({ onClose, targetId = null }) {
  const zoomPortalRef = useRef(null);
  const markerRefs = useRef({});

  const [detailItem, setDetailItem]       = useState(null);
  const [modalVisible, setModalVisible]   = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [glowId, setGlowId]               = useState(null);

  useEffect(() => { injectGlowStyle(); }, []);

  // If opened from homepage search, trigger glow after map has mounted
  useEffect(() => {
    if (targetId) {
      // Delay to allow MapContainer + markers to mount first
      const t = setTimeout(() => setGlowId(targetId), 600);
      return () => clearTimeout(t);
    }
  }, [targetId]);

  const openDetail = (item) => {
    setDetailItem(item);
    setTimeout(() => setModalVisible(true), 10);
  };

  const closeDetail = () => {
    setModalVisible(false);
    setTimeout(() => setDetailItem(null), 350);
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const lower = q.toLowerCase();
    setSearchResults(
      ALL_ITEMS.filter(i => i.name.toLowerCase().includes(lower) || i.type.toLowerCase().includes(lower))
    );
  };

  const handleResultClick = (item) => {
    setSearchQuery('');
    setSearchResults([]);
    setGlowId(null);
    // Small tick so glowId change is detected even if same item clicked twice
    setTimeout(() => setGlowId(item.id), 20);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#e8e4dc' }}>

      {/* ── Floating Header — hovers over the map ── */}
      <div className="absolute top-5 left-5 right-5 z-[500] flex items-center gap-4">

        {/* Logo */}
        <img
          src={logo}
          alt="Find Logo"
          className="h-16 w-auto object-contain flex-shrink-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]"
        />

        {/* Search bar — grows to fill all available space */}
        <div className="relative flex-1 shadow-xl">
          <span className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-purple-900/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search Campus..."
            onClick={e => e.stopPropagation()}
            className="w-full py-4 pl-14 pr-6 bg-white text-purple-950 font-light placeholder-purple-900/50 rounded-full text-base focus:outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
          />

          {/* Dropdown results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-[600] border border-gray-100">
              {searchResults.map(item => (
                <button
                  key={item.id}
                  onClick={e => { e.stopPropagation(); handleResultClick(item); }}
                  className="w-full px-5 py-3.5 text-left hover:bg-purple-50 active:bg-purple-100 transition-colors duration-150 border-b border-gray-100 last:border-b-0 focus:outline-none flex items-center gap-3"
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.type === 'Facility' ? FACILITY_COLOR : COLLEGE_COLOR }} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 leading-tight">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.type}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={onClose}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:opacity-90"
          style={{ backgroundColor: COLLEGE_COLOR }} title="Go back">

        {/* Zoom portal target */}
        <div ref={zoomPortalRef} className="flex gap-2 flex-shrink-0" />

        {/* Back button */}
        <button
          onClick={onClose}
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg hover:opacity-90 active:scale-95 transition-all duration-150"
          style={{ backgroundColor: COLLEGE_COLOR }}
          title="Go back"
        >
          <img src={leftIcon} alt="Back" className="w-6 h-6 object-contain invert brightness-200" />
        </button>
      </div>

      {/* Legend */}
      {!navTarget && (
        <div className="absolute bottom-6 left-6 z-50 bg-white border border-gray-200 rounded-xl p-4 shadow-xl text-sm space-y-2.5">
          <h3 className="text-xs font-semibold tracking-wide text-gray-800 mb-3">MSU General Santos</h3>
          <div className="flex items-center space-x-2.5">
            <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLLEGE_COLOR }} />
            <span className="text-xs text-gray-700">Colleges &amp; Departments</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: FACILITY_COLOR }} />
            <span className="text-xs text-gray-700">Offices &amp; Facilities</span>
          </div>
          {isNavMode && (
            <div className="flex items-center space-x-2.5 pt-1 border-t border-gray-100">
              <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 border-2 border-white" style={{ backgroundColor: FACILITY_COLOR, boxShadow: '0 0 0 2px rgba(240,173,62,0.4)' }} />
              <span className="text-xs text-gray-700">You Are Here</span>
            </div>
          )}
      {/* ── Legend ── */}
      <div className="absolute bottom-6 left-6 z-[500] bg-white border border-gray-200 rounded-xl p-4 shadow-xl text-sm space-y-2.5">
        <h3 className="text-xs font-semibold tracking-wide text-gray-800 mb-3">MSU General Santos</h3>
        <div className="flex items-center space-x-2.5">
          <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLLEGE_COLOR }} />
          <span className="text-xs text-gray-700">Colleges &amp; Departments</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: FACILITY_COLOR }} />
          <span className="text-xs text-gray-700">Offices &amp; Facilities</span>
        </div>
      )}

      {/* Map */}
      <div className="relative flex-1 w-full h-full">
      {/* ── Map — fills the entire screen, everything floats on top ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        <MapContainer
          center={[6.0672, 125.1270]}
          zoom={16} minZoom={15} maxZoom={18}
          maxBounds={CAMPUS_BOUNDS} maxBoundsViscosity={1.0}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          />
          <BoundsEnforcer />
          <ZoomButtons />

          {/* You Are Here marker — only in nav mode */}
          {isNavMode && (
            <Marker position={YOU_ARE_HERE.coords} icon={youAreHereIcon}>
              <Popup>
                <div style={{ fontFamily: "'Aventa',sans-serif", padding: '10px 14px', minWidth: '140px' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#888', letterSpacing: '0.08em' }}>YOUR LOCATION</p>
                  <strong style={{ fontSize: '13px', color: '#000' }}>You Are Here</strong>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route polyline */}
          {routePoints && (
            <Polyline
              positions={routePoints}
              pathOptions={{ color: NAV_LINE_COLOR, weight: 5, opacity: 0.95, dashArray: '10 6', lineCap: 'round', lineJoin: 'round' }}
              className="nav-route-line"
            />
          )}

          {/* Campus markers */}
          {MOCK_ROOMS.map((item) => (
            <Marker key={item.id} position={item.coords} icon={item.type === 'Entrance/Exit' ? gateIcon : customIcon}>
              <Popup>{collegePopup(item)}</Popup>
            </Marker>
          ))}
          {FACILITIES.map((item) => (
            <Marker key={item.id} position={item.coords} icon={amberIcon}>
              <Popup>{facilityPopup(item)}</Popup>
            </Marker>
          ))}

          {/* Fly to fit route */}
          {navTarget && <MapFlyTo coords={navTarget.coords} />}
        </MapContainer>
      </div>

      {/* ── NAVIGATION PANEL (right side) ── */}
      {navTarget && navData && (
        <div style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0,
          width: '380px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          transform: navPanelVisible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.45s cubic-bezier(0.34,1.2,0.64,1)',
          background: 'rgba(10,4,20,0.92)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderLeft: `2px solid ${COLLEGE_COLOR}40`,
          boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
          fontFamily: "'Aventa',sans-serif",
        }}>
          {/* Panel header */}
          <div style={{ padding: '88px 24px 20px', borderBottom: `1px solid ${COLLEGE_COLOR}30` }}>
            {/* Total distance pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: FACILITY_COLOR, borderRadius: '999px',
              padding: '5px 14px', marginBottom: '14px',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#000', letterSpacing: '0.04em' }}>
                {navData.totalDist}m total
              </span>
            </div>

            <p style={{ margin: '0 0 2px', fontSize: '10px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Navigating to
            </p>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
              {navTarget.name}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: `${FACILITY_COLOR}99`, letterSpacing: '0.06em' }}>
              From: {YOU_ARE_HERE.name}
            </p>
          </div>

          {/* Steps */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0' }}>
            {navLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', border: `3px solid ${FACILITY_COLOR}30`, borderTop: `3px solid ${FACILITY_COLOR}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>Finding route...</p>
              </div>
            )}
            {navError && (
              <div style={{ margin: '16px', padding: '14px', background: 'rgba(255,60,60,0.1)', border: '1px solid rgba(255,60,60,0.3)', borderRadius: '12px', color: '#ff6060', fontSize: '13px' }}>
                {navError}
              </div>
            )}
            {navData && (() => {
              const remaining = navData.steps.map((_, i) =>
                navData.steps.slice(i).reduce((sum, s) => sum + s.dist, 0)
              );
              return navData.steps.map((step, i) => (
              <div
                key={i}
                className="step-card"
                onClick={() => setActiveStep(i)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  padding: '14px 16px',
                  marginBottom: '10px',
                  borderRadius: '14px',
                  background: activeStep === i
                    ? `linear-gradient(135deg, ${COLLEGE_COLOR}, ${COLLEGE_COLOR}cc)`
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeStep === i ? COLLEGE_COLOR : 'rgba(255,255,255,0.07)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  animationDelay: `${i * 0.07}s`,
                }}
              >
                {/* Step number bubble */}
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  background: activeStep === i ? FACILITY_COLOR : `${FACILITY_COLOR}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '13px',
                  color: activeStep === i ? '#000' : FACILITY_COLOR,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 3px', fontSize: '13px', color: '#fff', fontWeight: 600, lineHeight: 1.35 }}>
                    {step.text}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: activeStep === i ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>
                    {i === navData.steps.length - 1 ? 'Arrived' : `${remaining[i + 1]}m remaining`}
                  </p>
                </div>
              </div>
              ));
            })()}
          </div>

          {/* Bottom action */}
          <div style={{ padding: '16px' }}>
          <MapInner
            markerRefs={markerRefs}
            glowId={glowId}
            openDetail={openDetail}
            zoomPortalRef={zoomPortalRef}
          />
        </MapContainer>
      </div>

      {/* ── Popup CSS ── */}
      <style>{`
        .leaflet-popup-content-wrapper {
          background: #fff !important; border-radius: 10px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.22) !important;
          padding: 0 !important; overflow: hidden;
        }
        .leaflet-popup-tip { background: #fff !important; }
        .leaflet-popup-content { margin: 0 !important; font-family: 'Aventa', sans-serif; }
        .leaflet-popup-close-button {
          color: rgba(255,255,255,0.8) !important; font-size: 18px !important;
          top: 10px !important; right: 10px !important;
          width: 22px !important; height: 22px !important; line-height: 22px !important;
          text-align: center; font-weight: 400 !important;
        }
        .leaflet-popup-close-button:hover { color: #fff !important; }
        .leaflet-popup-close-button.dark-close { color: rgba(0,0,0,0.5) !important; }
        .leaflet-popup-close-button.dark-close:hover { color: #000 !important; }
        .leaflet-container { font-family: 'Aventa', sans-serif; background: #0a0a0a; }
        .leaflet-control-attribution {
          background: rgba(255,255,255,0.1) !important; color: white !important; font-size: 10px;
        }
      `}</style>

      {/* ── Detail Modal ── */}
      {detailItem && (
        <div
          onClick={closeDetail}
          style={{
            position: 'absolute', inset: 0, zIndex: 200,
            backdropFilter: modalVisible ? 'blur(12px)' : 'blur(0px)',
            WebkitBackdropFilter: modalVisible ? 'blur(12px)' : 'blur(0px)',
            background: modalVisible ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.35s ease',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: 'calc(100% - 48px)', maxWidth: '560px',
              height: 'calc(100% - 80px)', maxHeight: '820px',
              background: '#ebe8e1', borderRadius: '28px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.2)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '48px 32px 40px',
              transform: modalVisible ? 'scale(1) translateY(0)' : 'scale(0.93) translateY(24px)',
              opacity: modalVisible ? 1 : 0,
              transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              overflow: 'visible',
            }}
          >
            <button
              onClick={clearNav}
              style={{
                width: '100%', padding: '16px',
                background: `linear-gradient(135deg, ${FACILITY_COLOR}, #e09a2a)`,
                border: 'none', borderRadius: '14px',
                fontSize: '14px', fontWeight: 800,
                color: '#000', letterSpacing: '0.06em',
                cursor: 'pointer', fontFamily: "'Aventa',sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: `0 4px 20px ${FACILITY_COLOR}50`,
                transition: 'transform 0.15s ease',
                position: 'absolute', top: '-22px', right: '-22px',
                width: '56px', height: '56px', background: 'none', border: 'none',
                cursor: 'pointer', padding: 0, zIndex: 10,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Clear Route
            </button>
          </div>
        </div>
      )}

      {/* Instruction toast — nav mode, no target yet */}
      {isNavMode && !navTarget && (
        <div style={{
          position: 'absolute', bottom: '32px', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          background: 'rgba(10,4,20,0.88)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${FACILITY_COLOR}50`,
          borderRadius: '999px',
          padding: '10px 22px',
          color: '#fff',
          fontSize: '13px',
          fontFamily: "'Aventa',sans-serif",
          letterSpacing: '0.04em',
          boxShadow: `0 4px 24px rgba(0,0,0,0.4)`,
          whiteSpace: 'nowrap',
        }}>
          <span style={{ color: FACILITY_COLOR, fontWeight: 700 }}>Tap any pin</span> to navigate there
        </div>
      )}

      {/* ── DETAIL MODAL (non-nav mode) ── */}
      {detailItem && (
        <div onClick={closeDetail} style={{
          position: 'absolute', inset: 0, zIndex: 200,
          backdropFilter: modalVisible ? 'blur(12px)' : 'blur(0px)',
          WebkitBackdropFilter: modalVisible ? 'blur(12px)' : 'blur(0px)',
          background: modalVisible ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.35s ease',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            position: 'relative', width: 'calc(100% - 48px)', maxWidth: '560px',
            height: 'calc(100% - 80px)', maxHeight: '820px',
            background: '#ebe8e1', borderRadius: '28px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '48px 32px 40px',
            transform: modalVisible ? 'scale(1) translateY(0)' : 'scale(0.93) translateY(24px)',
            opacity: modalVisible ? 1 : 0,
            transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            overflow: 'visible',
          }}>
            <button onClick={closeDetail} style={{
              position: 'absolute', top: '-22px', right: '-22px',
              width: '56px', height: '56px',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, zIndex: 10,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            }}>
              <img src={escBtn} alt="Close" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </button>

            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', marginBottom: '20px' }}>
              {LOGOS[detailItem.id] ? (
                <img src={LOGOS[detailItem.id]} alt={`${detailItem.name} logo`}
                  style={{ maxHeight: '200px', maxWidth: '80%', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }} />
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', marginBottom: '20px' }}>
              {LOGOS[detailItem.id] ? (
                <img
                  src={LOGOS[detailItem.id]}
                  alt={`${detailItem.name} logo`}
                  style={{ maxHeight: '200px', maxWidth: '80%', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }}
                />
              ) : (
                <div style={{
                  width: '120px', height: '120px', borderRadius: '50%',
                  background: detailItem.type === 'Facility' ? FACILITY_COLOR : COLLEGE_COLOR,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '36px', fontWeight: 700, color: '#fff',
                  fontFamily: "'Aventa', sans-serif", letterSpacing: '-1px',
                }}>
                  {detailItem.name.split(' ').filter(w => w.length > 2).map(w => w[0]).join('').slice(0, 4)}
                </div>
              )}
            </div>

            <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', color: detailItem.type === 'Facility' ? FACILITY_COLOR : COLLEGE_COLOR, textAlign: 'center', fontFamily: "'Aventa', sans-serif", textTransform: 'uppercase' }}>
              {detailItem.name}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#888', fontFamily: "'Aventa', sans-serif", textAlign: 'center', letterSpacing: '0.04em' }}>
              ✓ {detailItem.status}&nbsp;&nbsp;|&nbsp;&nbsp;{detailItem.coords[0].toFixed(6)}, {detailItem.coords[1].toFixed(6)}
            </p>
            <div style={{ width: '40px', height: '2px', borderRadius: '2px', background: detailItem.type === 'Facility' ? FACILITY_COLOR : COLLEGE_COLOR, margin: '20px auto 0', opacity: 0.4 }} />
            <p style={{
              margin: '0 0 6px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em',
              color: detailItem.type === 'Facility' ? FACILITY_COLOR : COLLEGE_COLOR,
              textAlign: 'center', fontFamily: "'Aventa', sans-serif", textTransform: 'uppercase',
            }}>
              {detailItem.name}
            </p>

            <p style={{ margin: 0, fontSize: '12px', color: '#888', fontFamily: "'Aventa', sans-serif", textAlign: 'center', letterSpacing: '0.04em' }}>
              ✓ {detailItem.status}&nbsp;&nbsp;|&nbsp;&nbsp;{detailItem.coords[0].toFixed(6)}, {detailItem.coords[1].toFixed(6)}
            </p>

            <div style={{
              width: '40px', height: '2px', borderRadius: '2px',
              background: detailItem.type === 'Facility' ? FACILITY_COLOR : COLLEGE_COLOR,
              margin: '20px auto 0', opacity: 0.4,
            }} />

            <div style={{ flex: 1, width: '100%', marginTop: '24px' }} />
          </div>
        </div>
      )}
    </div>
  );
}
