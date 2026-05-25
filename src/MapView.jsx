import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import logo from './images/find_styled.png';
import findIcon from './images/find-icon.png';
import leftIcon from './images/left.png';
import escBtn from './images/esc-btn.png';
import cnsmLogo from './images/cnsm.png';
import 'leaflet/dist/leaflet.css';

const COLLEGE_COLOR = '#79095b';
const FACILITY_COLOR = '#f0ad3e';

const LOGOS = {
  7: cnsmLogo,
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
function MapInner({ markerRefs, glowId, openDetail, zoomPortalRef }) {
  const map = useMap();

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