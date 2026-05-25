import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import logo from './images/find_styled.png';
import findIcon from './images/find-icon.png';
import leftIcon from './images/left.png';
import escBtn from './images/esc-btn.png';
import cnsmLogo from './images/cnsm.png';
import toiletIcon from './images/toilet.png';
import stairsIcon from './images/stairs.png';
import newScienceImg  from './buildings/new-science.jpg';
import cnsmOldImg     from './buildings/cnsm-old.jpg';
import ictComplexImg  from './buildings/ict-complex.jpg';
import ictPlanImg     from './buildings/ict-plan.png';
import itpDepImg      from './buildings/itp6-dep.jpg';
import mathBuildingImg from './buildings/math-building.jpg';
import 'leaflet/dist/leaflet.css';

const COLLEGE_COLOR = '#79095b';
const FACILITY_COLOR = '#f0ad3e';

const LOGOS = {
  7: cnsmLogo,
};

// ── Schedule data ────────────────────────────────────────────────────────────
const BASE_SCHEDULE = [
  { code: 'STT071',  time: '7:00 – 9:30'   },
  { code: 'CCC101',  time: '10:00 – 12:30' },
  { code: 'GEC118',  time: '1:00 – 2:30'   },
  { code: 'PED015',  time: '2:30 – 4:00'   },
  { code: 'CCC121',  time: '4:00 – 6:00'   },
];

// Rotate the schedule array by n positions so each room has a different order
function rotateSchedule(n) {
  const len = BASE_SCHEDULE.length;
  return BASE_SCHEDULE.map((_, i) => BASE_SCHEDULE[(i + n) % len]);
}

// Buildings per college — keyed by college id
const BUILDINGS = {
  7: [
    {
      id: 'cnsm-3', name: 'ICT Complex', code: 'ICT', rooms: 13, image: ictComplexImg,
      coords: [6.069115927450321, 125.12674627794516],
      floors: [
        {
          label: 'Floor 1',
          rooms: [
            { id: 'wc1-f1',    label: 'WC',  fullName: "Bathroom (Left)",           type: 'wc'    },
            { id: 'cl1',       label: 'CL1', fullName: 'Computer Laboratory 1',      type: 'room',  schedule: rotateSchedule(0) },
            { id: 'ccc',       label: 'CCC', fullName: 'Command and Control Center', type: 'room',  schedule: rotateSchedule(2) },
            { id: 'cl2',       label: 'CL2', fullName: 'Computer Laboratory 2',      type: 'room',  schedule: rotateSchedule(4) },
            { id: 'wc2-f1',    label: 'WC',  fullName: "Bathroom (Right)",           type: 'wc'    },
            { id: 'stair1-f1', label: '↑',   fullName: 'Staircase (Left)',           type: 'stair' },
            { id: 'stair2-f1', label: '↑',   fullName: 'Staircase (Right)',          type: 'stair' },
          ],
        },
        {
          label: 'Floor 2',
          rooms: [
            { id: 'wc1-f2',    label: 'WC',  fullName: "Bathroom (Left)",         type: 'wc'    },
            { id: 'cl3',       label: 'CL3', fullName: 'Computer Laboratory 3',   type: 'room',  schedule: rotateSchedule(1) },
            { id: 'dsl',       label: 'DSL', fullName: 'Database Systems Lab',    type: 'room',  schedule: rotateSchedule(3) },
            { id: 'nsl',       label: 'NSL', fullName: 'Network Systems Lab',     type: 'room',  schedule: rotateSchedule(0) },
            { id: 'ecl',       label: 'ECL', fullName: 'E-Classroom',             type: 'room',  schedule: rotateSchedule(2) },
            { id: 'wc2-f2',    label: 'WC',  fullName: "Bathroom (Right)",        type: 'wc'    },
            { id: 'stair1-f2', label: '↑',   fullName: 'Staircase (Left)',        type: 'stair' },
            { id: 'stair2-f2', label: '↑',   fullName: 'Staircase (Right)',       type: 'stair' },
          ],
        },
      ],
    },
    { id: 'cnsm-1', name: 'New Science Building', rooms: 7,  image: newScienceImg,   coords: null, floors: null },
    { id: 'cnsm-2', name: 'Old Science Building',  rooms: 15, image: cnsmOldImg,      coords: null, floors: null },
    { id: 'cnsm-4', name: 'IT & Physics Dept',     rooms: 3,  image: itpDepImg,       coords: null, floors: null },
    { id: 'cnsm-5', name: 'Math Building',          rooms: 10, image: mathBuildingImg, coords: null, floors: null },
  ],
};

// All searchable items — colleges + facilities merged for search
const COLLEGES = [
  { id: 1,  name: 'College of Agriculture',                           coords: [6.070480988321281,  125.12579094360856], status: 'Open', type: 'College' },
  { id: 2,  name: 'College of Engineering',                           coords: [6.064088002693254,  125.12683859876006], status: 'Open', type: 'College' },
  { id: 3,  name: 'College of Education',                             coords: [6.067896313435069,  125.12825013296172], status: 'Open', type: 'College' },
  { id: 4,  name: 'College of Fisheries and Aquatic Sciences',        coords: [6.0644563163346765, 125.13004240242738], status: 'Open', type: 'College' },
  { id: 5,  name: 'College of Business Administration & Accountancy', coords: [6.06423760601592,   125.12834992857071], status: 'Open', type: 'College' },
  { id: 6,  name: 'College of Social Sciences and Humanities',        coords: [6.06774358929378,   125.12610972165167], status: 'Open', type: 'College' },
  { id: 7,  name: 'College of Natural Sciences and Mathematics',      coords: [6.069067815786466,  125.12589392474057], status: 'Open', type: 'College' },
  { id: 8,  name: 'Senior Highschool Department',                     coords: [6.068557633415351,  125.12830040933797], status: 'Open', type: 'College' },
];

const FACILITIES = [
  { id: 101, name: 'Gymnasium',                      coords: [6.06702148462265,  125.12394614511116], status: 'Open', type: 'Facility' },
  { id: 102, name: "Registrar's Office (Y Building)", coords: [6.065520188853716, 125.12838202769997], status: 'Open', type: 'Facility' },
  { id: 103, name: 'Library',                         coords: [6.066725955964607, 125.12799695772719], status: 'Open', type: 'Facility' },
  { id: 104, name: 'Office of Student Affairs',       coords: [6.069841842030108, 125.12412084582711], status: 'Open', type: 'Facility' },
  { id: 105, name: 'Laktanan',                        coords: [6.066323469760834, 125.12839000321954], status: 'Open', type: 'Facility' },
  { id: 106, name: 'VLS (Virtual Learning Studio)',   coords: [6.067222222222222, 125.12763888888888], status: 'Open', type: 'Facility' },
];

const ALL_ITEMS = [...COLLEGES, ...FACILITIES];

const CAMPUS_BOUNDS = L.latLngBounds(
  L.latLng(6.0620, 125.1210),
  L.latLng(6.0725, 125.1330)
);

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
function MapInner({ markerRefs, glowId, openDetail, zoomPortalRef, buildingMarker, setBuildingMarker, openBuilding }) {
  const map = useMap();
  const buildingMarkerRef = useRef(null);

  // Enforce bounds
  useEffect(() => {
    map.setMaxBounds(CAMPUS_BOUNDS);
    map.on('drag', () => map.panInsideBounds(CAMPUS_BOUNDS, { animate: false }));
  }, [map]);

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

  // Fly to building marker when buildingMarker changes
  useEffect(() => {
    if (!buildingMarker || !buildingMarker.coords) return;
    map.flyTo(buildingMarker.coords, 18, { duration: 0.9 });
    setTimeout(() => {
      if (buildingMarkerRef.current) buildingMarkerRef.current.openPopup();
    }, 1000);
  }, [buildingMarker, map]);

  // Portal zoom buttons into the header slot
  function ZoomButtons() {
    if (!zoomPortalRef.current) return null;
    return ReactDOM.createPortal(
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
            View {item.name}?
          </strong>
        </div>
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
            View {item.name}?
          </strong>
        </div>
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

      {/* ── Temporary building marker (from "View on Map") ── */}
      {buildingMarker && buildingMarker.coords && (
        <Marker
          position={buildingMarker.coords}
          icon={collegeIcon}
          ref={el => { buildingMarkerRef.current = el; }}
        >
          <Popup>
            <div style={{ fontFamily: "'Aventa', sans-serif", minWidth: '200px', margin: 0 }}>
              <div style={{ background: COLLEGE_COLOR, padding: '14px 36px 14px 14px', position: 'relative' }}>
                {buildingMarker.code && (
                  <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em' }}>
                    {buildingMarker.code}
                  </p>
                )}
                <strong style={{ color: '#fff', fontSize: '13px', lineHeight: 1.3, display: 'block' }}>
                  {buildingMarker.name}
                </strong>
              </div>
              <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setBuildingMarker(null); openBuilding(buildingMarker); }}
                  style={{
                    background: COLLEGE_COLOR, color: '#fff', border: 'none', borderRadius: '6px',
                    padding: '6px 18px', fontSize: '12px', fontFamily: "'Aventa', sans-serif",
                    cursor: 'pointer', fontWeight: 600, letterSpacing: '0.04em',
                  }}
                >View</button>
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function MapView({ onClose, targetId = null }) {
  const zoomPortalRef = useRef(null);
  const markerRefs = useRef({});

  const [detailItem, setDetailItem]             = useState(null);
  const [modalVisible, setModalVisible]         = useState(false);
  const [searchQuery, setSearchQuery]           = useState('');
  const [searchResults, setSearchResults]       = useState([]);
  const [glowId, setGlowId]                     = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingVisible, setBuildingVisible]   = useState(false);
  const [buildingTab, setBuildingTab]           = useState('image'); // 'image' | 'plan'
  const [hoveredRoom, setHoveredRoom]           = useState(null);
  const [selectedFloor, setSelectedFloor]       = useState('floor1'); // 'floor1' | 'floor2'
  const [buildingMarker, setBuildingMarker]     = useState(null); // { building, coords }

  const openBuilding = (building) => {
    setBuildingTab('image');
    setSelectedFloor('floor1');
    setHoveredRoom(null);
    // Fade out college modal, then fade in building modal
    setModalVisible(false);
    setTimeout(() => {
      setSelectedBuilding(building);
      setTimeout(() => setBuildingVisible(true), 20);
    }, 300);
  };

  const closeBuilding = () => {
    setBuildingVisible(false);
    setTimeout(() => {
      setSelectedBuilding(null);
      // Fade college modal back in
      setTimeout(() => setModalVisible(true), 20);
    }, 300);
  };

  const viewOnMap = (building) => {
    // Close both modals, then drop a temporary marker on the map
    setBuildingVisible(false);
    setTimeout(() => {
      setSelectedBuilding(null);
      setModalVisible(false);
      setTimeout(() => {
        setDetailItem(null);
        setBuildingMarker(building);
      }, 300);
    }, 300);
  };

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

      {/* ── Everything behind the modal blurs when detail is open ── */}
      <div style={{
        position: 'absolute', inset: 0,
        transition: 'filter 0.35s ease',
        filter: detailItem ? 'blur(6px)' : 'none',
        pointerEvents: detailItem ? 'none' : 'auto',
      }}>

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
      </div>

      {/* ── Map — fills the entire screen, everything floats on top ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
        <MapContainer
          center={[6.0672, 125.1270]}
          zoom={16}
          minZoom={16}
          maxZoom={18}
          maxBounds={CAMPUS_BOUNDS}
          maxBoundsViscosity={1.0}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <MapInner
            markerRefs={markerRefs}
            glowId={glowId}
            openDetail={openDetail}
            zoomPortalRef={zoomPortalRef}
            buildingMarker={buildingMarker}
            setBuildingMarker={setBuildingMarker}
            openBuilding={openBuilding}
          />
        </MapContainer>
      </div>

      </div> {/* end blur wrapper */}

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
              padding: '28px 32px 32px',
              transform: modalVisible ? 'scale(1) translateY(0)' : 'scale(0.93) translateY(24px)',
              opacity: modalVisible ? 1 : 0,
              transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              overflow: 'visible',
            }}
          >
            <button
              onClick={closeDetail}
              style={{
                position: 'absolute', top: '-22px', right: '-22px',
                width: '56px', height: '56px', background: 'none', border: 'none',
                cursor: 'pointer', padding: 0, zIndex: 10,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              }}
            >
              <img src={escBtn} alt="Close" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </button>

            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', marginBottom: '10px' }}>
              {LOGOS[detailItem.id] ? (
                <img
                  src={LOGOS[detailItem.id]}
                  alt={`${detailItem.name} logo`}
                  style={{ maxHeight: '140px', maxWidth: '80%', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }}
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
              margin: '10px auto 0', opacity: 0.4,
            }} />

            {/* ── Buildings list ── */}
            <div style={{
              flex: 1,
              width: '100%',
              marginTop: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}>
              {(BUILDINGS[detailItem.id] || []).map(building => (
                <div
                  key={building.id}
                  style={{
                    borderRadius: '18px',
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                  onClick={() => openBuilding(building)}
                >
                  <button
                    style={{
                      width: '100%',
                      height: '110px',
                      borderRadius: '18px',
                      border: `1.5px solid ${COLLEGE_COLOR}`,
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      background: '#e9e8e8',
                      padding: 0,
                      display: 'block',
                    }}
                  >
                    {/* Photo — fills entire button, sits at back */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundImage: `url(${building.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }} />

                    {/* Gradient overlay: opaque #e9e8e8 on left, fades to transparent on right */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to right, #e9e8e8 40%, rgba(233,232,232,0.82) 56%, rgba(233,232,232,0) 76%)',
                    }} />

                    {/* Text — left-aligned over the opaque area */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', flexDirection: 'column', justifyContent: 'center',
                      alignItems: 'flex-start',
                      padding: '0 0 0 22px',
                    }}>
                      <p style={{
                        margin: 0, fontSize: '18px', fontWeight: 600,
                        color: COLLEGE_COLOR, fontFamily: "'Aventa', sans-serif",
                        lineHeight: 1.2, letterSpacing: '-0.01em',
                        textAlign: 'left',
                      }}>
                        {building.name}
                      </p>
                      <p style={{
                        margin: '5px 0 0', fontSize: '12px',
                        color: COLLEGE_COLOR, fontFamily: "'Aventa', sans-serif",
                        opacity: 0.7, letterSpacing: '0.02em',
                        textAlign: 'left',
                      }}>
                        Open&nbsp;&nbsp;|&nbsp;&nbsp;{building.rooms} {building.rooms === 1 ? 'Room' : 'Rooms'}
                      </p>
                    </div>
                  </button>
                </div>
              ))}

              {(!BUILDINGS[detailItem.id] || BUILDINGS[detailItem.id].length === 0) && (
                <p style={{
                  textAlign: 'center', color: '#bbb', fontSize: '12px',
                  fontFamily: "'Aventa', sans-serif", marginTop: '16px',
                }}>
                  No buildings listed yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Building Detail Modal ── */}
      {selectedBuilding && (
        <div
          onClick={closeBuilding}
          style={{
            position: 'absolute', inset: 0, zIndex: 300,
            backdropFilter: buildingVisible ? 'blur(12px)' : 'blur(0px)',
            WebkitBackdropFilter: buildingVisible ? 'blur(12px)' : 'blur(0px)',
            background: buildingVisible ? 'rgba(0,0,0,0.40)' : 'rgba(0,0,0,0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease',
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
              display: 'flex', flexDirection: 'column',
              overflow: 'visible',
              opacity: buildingVisible ? 1 : 0,
              transform: buildingVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.3, 0.64, 1)',
            }}
          >
            {/* ── Protruding esc button ── */}
            <button
              onClick={() => { closeBuilding(); setTimeout(closeDetail, 350); }}
              style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '56px', height: '56px', background: 'none', border: 'none',
                cursor: 'pointer', padding: 0, zIndex: 100,
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
              }}
            >
              <img src={escBtn} alt="Close" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </button>

            {/* ── Top half: image / SVG floor plan viewer (40%) ── */}
            <div style={{
              flex: '0 0 40%', position: 'relative', overflow: 'hidden',
              background: buildingTab === 'plan' ? COLLEGE_COLOR : '#1a1a1a',
              transition: 'background 0.3s ease',
              borderRadius: '28px 28px 0 0',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              paddingTop: '16px',
              flexDirection: 'column',
            }}>
              {/* Floor selector — positioned just above the floor plan */}
              {selectedBuilding.floors && selectedBuilding.floors.length > 0 && buildingTab === 'plan' && (
                <div style={{
                  position: 'absolute', bottom: '54px', left: '50%', transform: 'translateX(-50%)',
                  zIndex: 50,
                  display: 'flex', gap: '12px',
                  fontSize: '15px', fontFamily: "'Aventa', sans-serif",
                  color: 'rgba(255,255,255,0.9)',
                  letterSpacing: '0.04em',
                }}>
                  {selectedBuilding.floors.map((floor, idx) => {
                    const floorKey = `floor${idx + 1}`;
                    const isSelected = selectedFloor === floorKey;
                    return (
                      <button
                        key={floorKey}
                        onClick={(e) => { e.stopPropagation(); setSelectedFloor(floorKey); }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: isSelected ? '#fff' : 'rgba(255,255,255,0.6)',
                          fontWeight: isSelected ? 700 : 400,
                          fontSize: '15px', fontFamily: "'Aventa', sans-serif",
                          transition: 'all 0.25s ease',
                          padding: 0,
                          letterSpacing: '0.04em',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                      >
                        {floor.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Photo */}
              <img
                src={selectedBuilding.image}
                alt={selectedBuilding.name}
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover',
                  opacity: buildingTab === 'image' ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: buildingTab === 'image' ? 'auto' : 'none',
                }}
              />

              {/* SVG Floor plan */}
              <div style={{
                position: 'absolute', inset: 0,
                opacity: buildingTab === 'plan' ? 1 : 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: buildingTab === 'plan' ? 'auto' : 'none',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                width: '100%', height: '100%',
                paddingBottom: '28px',
              }}>
                {selectedBuilding.floors && selectedBuilding.floors.length > 0 ? (
                  <ICTFloorPlan
                    floor={selectedBuilding.floors[selectedFloor === 'floor1' ? 0 : 1]}
                    hoveredRoom={hoveredRoom}
                    onRoomClick={id => setHoveredRoom(hoveredRoom === id ? null : id)}
                  />
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontFamily: "'Aventa', sans-serif" }}>
                    No floor plan available
                  </p>
                )}
              </div>
            </div>

            {/* ── Center toggle pill: Image / Plan (aligned with 40% split) ── */}
            <div style={{
              position: 'absolute', left: '50%', top: '40%', transform: 'translate(-50%, -50%)',
              zIndex: 150,
              display: 'flex',
              background: 'rgba(0,0,0,0.85)', borderRadius: '999px',
              border: '2px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              {['plan', 'image'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setBuildingTab(tab)}
                  style={{
                    padding: '12px 28px',
                    fontSize: '13px',
                    fontFamily: "'Aventa', sans-serif",
                    fontWeight: buildingTab === tab ? 700 : 500,
                    background: buildingTab === tab ? COLLEGE_COLOR : 'transparent',
                    color: buildingTab === tab ? '#fff' : 'rgba(255,255,255,0.7)',
                    border: 'none', cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    letterSpacing: '0.08em',
                    borderRadius: '999px',
                    textTransform: 'uppercase',
                  }}
                >
                  {tab === 'image' ? 'Image' : 'Floor Plan'}
                </button>
              ))}
            </div>

            {/* ── Bottom section (60%) ── */}
            <div style={{
              flex: '0 0 60%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'flex-start', overflow: 'auto',
              padding: '48px 28px 20px',
              position: 'relative',
            }}>

              {/* Building name */}
              <p style={{
                margin: 0, fontSize: '22px', fontWeight: 700,
                color: COLLEGE_COLOR, fontFamily: "'Aventa', sans-serif",
                textAlign: 'center', letterSpacing: '-0.02em', lineHeight: 1.2,
                flexShrink: 0,
              }}>
                {selectedBuilding.name}
              </p>

              {/* Code tag */}
              {selectedBuilding.code && (
                <div style={{
                  marginTop: '8px',
                  display: 'inline-flex', alignItems: 'center',
                  background: `rgba(121,9,91,0.08)`,
                  border: `1px solid rgba(121,9,91,0.2)`,
                  borderRadius: '999px',
                  padding: '3px 12px',
                  flexShrink: 0,
                }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
                    color: COLLEGE_COLOR, fontFamily: "'Aventa', sans-serif",
                    textTransform: 'uppercase',
                  }}>{selectedBuilding.code}</span>
                </div>
              )}

              {/* Status | Rooms */}
              <p style={{
                margin: '6px 0 0', fontSize: '12px', color: '#888',
                fontFamily: "'Aventa', sans-serif", textAlign: 'center',
                letterSpacing: '0.04em', flexShrink: 0,
              }}>
                Open&nbsp;&nbsp;|&nbsp;&nbsp;{selectedBuilding.rooms} Rooms
              </p>

              {/* Coordinates */}
              {selectedBuilding.coords && (
                <p style={{
                  margin: '3px 0 0', fontSize: '10px', color: '#bbb',
                  fontFamily: "'Aventa', sans-serif", textAlign: 'center',
                  letterSpacing: '0.04em', flexShrink: 0,
                }}>
                  {selectedBuilding.coords[0].toFixed(6)}, {selectedBuilding.coords[1].toFixed(6)}
                </p>
              )}

              {/* Thin divider */}
              <div style={{
                width: '36px', height: '1.5px', borderRadius: '2px',
                background: COLLEGE_COLOR, opacity: 0.25,
                margin: '14px auto 0', flexShrink: 0,
              }} />

              {/* Hovered room info & schedule */}
              {hoveredRoom && selectedBuilding.floors && (() => {
                const currentFloorIdx = selectedFloor === 'floor1' ? 0 : 1;
                const currentFloor = selectedBuilding.floors[currentFloorIdx];
                const room = currentFloor.rooms.find(r => r.id === hoveredRoom);
                return room ? (
                  <div style={{
                    marginTop: '14px', width: '100%',
                    display: 'flex', flexDirection: 'column', gap: '12px',
                  }}>
                    {/* Room name — no box */}
                    <p style={{
                      margin: 0, fontSize: '13px', color: COLLEGE_COLOR,
                      fontFamily: "'Aventa', sans-serif", fontWeight: 600, textAlign: 'center',
                    }}>
                      {room.fullName}
                    </p>

                    {/* Schedule — only show for rooms with schedules */}
                    {room.schedule && room.schedule.length > 0 && (
                      <div style={{
                        padding: '14px 16px',
                        background: 'rgba(126,18,91,0.05)', borderRadius: '12px',
                        border: `1px solid rgba(126,18,91,0.15)`,
                        flexShrink: 0,
                      }}>
                        <p style={{
                          margin: '0 0 10px', fontSize: '10px', color: COLLEGE_COLOR,
                          fontFamily: "'Aventa', sans-serif", fontWeight: 700,
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                        }}>
                          Schedule
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                          {room.schedule.map((item, idx) => (
                            <div key={idx} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              fontSize: '11px', color: '#555', fontFamily: "'Aventa', sans-serif",
                            }}>
                              <span style={{ fontWeight: 600 }}>{item.code}</span>
                              <span style={{ color: '#888', fontSize: '10px' }}>{item.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null;
              })()}

              {/* View on Map button */}
              {selectedBuilding.coords && (
                <button
                  onClick={() => viewOnMap(selectedBuilding)}
                  style={{
                    marginTop: '20px',
                    width: '100%',
                    padding: '13px 0',
                    background: COLLEGE_COLOR,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '13px',
                    fontWeight: 700,
                    fontFamily: "'Aventa', sans-serif",
                    letterSpacing: '0.06em',
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  View on Map
                </button>
              )}
            </div>

            {/* Back arrow — bottom left */}
            <button
              onClick={closeBuilding}
              style={{
                position: 'absolute', bottom: '18px', left: '22px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: COLLEGE_COLOR, fontFamily: "'Aventa', sans-serif",
                fontSize: '20px', fontWeight: 300, padding: '4px 8px',
                opacity: 0.5, transition: 'opacity 0.15s',
                zIndex: 50,
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
              title="Back to college"
            >‹‹</button>
          </div>
        </div>
      )}

    </div>
  );
}

// ── Single Floor SVG floor plan ────────────────────────────────────
function ICTFloorPlan({ floor, hoveredRoom, onRoomClick }) {
  if (!floor) return null;

  // Overall canvas
  const W = 500;
  const H = 200;
  const PAD = 14;

  // Room layout structure
  const rooms = floor.rooms;
  const mainRooms = rooms.filter(r => r.type === 'room');
  const wcLeft    = rooms.find(r => r.type === 'wc' && r.id.includes('wc1'));
  const wcRight   = rooms.find(r => r.type === 'wc' && r.id.includes('wc2'));
  const stairLeft = rooms.find(r => r.type === 'stair' && r.id.includes('stair1'));
  const stairRight= rooms.find(r => r.type === 'stair' && r.id.includes('stair2'));

  // Dimensions
  const ROOM_H = 80;
  const HALL_H = 40;
  const HALL_Y = ROOM_H + 18;
  const STAIR_W = 44;
  const WC_W = 40;
  const mainW = W - PAD * 2 - WC_W * 2;
  const eachRoomW = mainW / Math.max(mainRooms.length, 1);

  // Top row items
  const topRowItems = [
    wcLeft && { room: wcLeft,  x: PAD,                              w: WC_W   },
    ...mainRooms.map((r, i) => ({ room: r, x: PAD + WC_W + i * eachRoomW,  w: eachRoomW })),
    wcRight && { room: wcRight, x: PAD + WC_W + mainW,             w: WC_W   },
  ].filter(Boolean);

  // Hallway
  const hallX = PAD + STAIR_W + 5;
  const hallW = W - PAD * 2 - STAIR_W * 2 - 10;
  const hallY = HALL_Y;

  // Stair cells
  const stairItems = [
    stairLeft  && { room: stairLeft,  x: PAD,                 w: STAIR_W, y: hallY, h: HALL_H },
    stairRight && { room: stairRight, x: W - PAD - STAIR_W,  w: STAIR_W, y: hallY, h: HALL_H },
  ].filter(Boolean);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '90%', height: 'auto', maxHeight: '100%' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top row rooms */}
      {topRowItems.map(({ room, x, w }) => {
        const isHovered = hoveredRoom === room.id;
        const isWC = room.type === 'wc';
        const cx = x + w / 2;
        const cy = ROOM_H / 2;
        return (
          <g key={room.id} onClick={() => onRoomClick(room.id)} style={{ cursor: 'pointer' }}>
            <rect
              x={x + 2.5} y={4} width={w - 5} height={ROOM_H - 2}
              rx="8"
              fill={isHovered ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.85)'}
              stroke={isHovered ? '#fff' : 'rgba(255,255,255,0.5)'}
              strokeWidth={isHovered ? 2.5 : 1.5}
            />
            {isWC ? (
              <image
                href={toiletIcon}
                x={cx - 12} y={cy - 12}
                width="24" height="24"
                style={{
                  filter: isHovered
                    ? 'brightness(0) saturate(100%) invert(11%) sepia(90%) saturate(3000%) hue-rotate(300deg) brightness(0.85)'
                    : 'brightness(0) invert(1)',
                  pointerEvents: 'none'
                }}
              />
            ) : (
              <>
                <text
                  x={cx} y={cy - 4}
                  textAnchor="middle"
                  fill={isHovered ? COLLEGE_COLOR : '#2a2a2a'}
                  fontSize="12" fontWeight="700" fontFamily="'Aventa', sans-serif"
                  style={{ pointerEvents: 'none' }}
                >{room.label}</text>
                <text
                  x={cx} y={cy + 8}
                  textAnchor="middle"
                  fill={isHovered ? COLLEGE_COLOR : 'rgba(50,50,50,0.6)'}
                  fontSize="7.5" fontFamily="'Aventa', sans-serif"
                  style={{ pointerEvents: 'none' }}
                >{room.fullName.split(' ').slice(0, 2).join(' ')}</text>
              </>
            )}
          </g>
        );
      })}

      {/* Hallway bar */}
      <rect x={hallX} y={hallY} width={hallW} height={HALL_H}
        fill="rgba(255,255,255,0.12)" rx="5" />
      <text x={hallX + hallW / 2} y={hallY + HALL_H / 2 + 3.5}
        textAnchor="middle"
        fill="rgba(255,255,255,0.55)" fontSize="9" fontFamily="'Aventa', sans-serif"
        fontWeight="600" letterSpacing="1.6"
      >HALLWAY</text>

      {/* Stair cells */}
      {stairItems.map(({ room, x, w, y, h }) => {
        const isHovered = hoveredRoom === room.id;
        const cx = x + w / 2;
        const cy = y + h / 2;
        return (
          <g key={room.id} onClick={() => onRoomClick(room.id)} style={{ cursor: 'pointer' }}>
            <rect
              x={x + 2.5} y={y} width={w - 5} height={h}
              rx="6.5"
              fill={isHovered ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.85)'}
              stroke={isHovered ? '#fff' : 'rgba(255,255,255,0.5)'}
              strokeWidth={isHovered ? 2.5 : 1.5}
            />
            <image
              href={stairsIcon}
              x={cx - 10} y={cy - 10}
              width="20" height="20"
              style={{
                filter: isHovered
                  ? 'brightness(0) saturate(100%) invert(11%) sepia(90%) saturate(3000%) hue-rotate(300deg) brightness(0.85)'
                  : 'brightness(0) invert(1)',
                pointerEvents: 'none'
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}