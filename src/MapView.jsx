import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import logo from './images/find_styled.png';
import findIcon from './images/find-icon.png';
import leftIcon from './images/left.png';
import escBtn from './images/esc-btn.png';

// College logo imports — add more as needed, keyed by college id
import cnsmLogo from './images/cnsm.png';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

const COLLEGE_COLOR = '#79095b';
const FACILITY_COLOR = '#f0ad3e';

// Map college/facility id → logo image. Add entries as you get more logos.
const LOGOS = {
  7: cnsmLogo, // College of Natural Sciences and Mathematics
};

// College marker — purple tint
const customIcon = L.divIcon({
  className: '',
  html: `<img src="${findIcon}" style="width:40px;height:40px;filter:invert(11%) sepia(90%) saturate(3000%) hue-rotate(300deg) brightness(80%);" />`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Facility marker — amber tint
const amberIcon = L.divIcon({
  className: '',
  html: `<img src="${findIcon}" style="width:40px;height:40px;filter:invert(75%) sepia(80%) saturate(600%) hue-rotate(5deg) brightness(105%);" />`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// MSU General Santos — corrected coordinates
const MOCK_ROOMS = [
  { id: 1, name: 'College of Agriculture', coords: [6.070376245893397, 125.1258615776752], status: 'Open', type: 'College' },
  { id: 2, name: 'College of Engineering', coords: [6.0641902024993, 125.12677351285932], status: 'Open', type: 'College' },
  { id: 3, name: 'College of Education', coords: [6.067858278201935, 125.1283526750339], status: 'Open', type: 'College' },
  { id: 4, name: 'College of Fisheries and Aquatic Sciences', coords: [6.064504407925031, 125.13015684059019], status: 'Open', type: 'College' },
  { id: 5, name: 'College of Business Administration & Accountancy', coords: [6.064212841714116, 125.12843366241404], status: 'Open', type: 'College' },
  { id: 6, name: 'College of Natural Sciences and Mathematics', coords: [6.068957605147049, 125.12587310793943], status: 'Open', type: 'College' },
  { id: 7, name: 'College of Social Sciences and Humanities', coords: [6.067656228549597, 125.12601418089012], status: 'Open', type: 'College' },
  { id: 8, name: 'Institute of Islamic, Arabic, & International Studies', coords: [6.070908146976309, 125.12745455283785], status: 'Open', type: 'Institute' },
  { id: 9, name: 'College of Health Sciences', coords: [6.0685, 125.1285], status: 'Open', type: 'College' },
  { id: 10, name: 'College of Medicine (City Campus)', coords: [6.116540862723937, 125.17104287877619], status: 'Open', type: 'College' },
  {id: 11, name: 'Main Gate', coords: [6.0657072972022075, 125.13180336952652], status: 'Open', type: 'Entrance/Exit' },
  {id: 12, name: 'University Library', coords: [6.066741408516854, 125.1280344570879], status: 'Open', type: 'Building' },
  {id: 13, name: 'Gemma East', coords: [6.0681941606332765, 125.12761148283968], status: 'Open', type: 'Building' },
  {id: 14, name: 'Gemma West', coords: [6.0680953935971855, 125.12707097058176], status: 'Open', type: 'Building' },
  {id: 15, name: 'CAS Building', coords: [6.069379621150884, 125.12755814918287], status: 'Open', type: 'Building' },
  {id: 16, name: 'Math Building', coords: [6.069424477684039, 125.12684091191258], status: 'For Construction', type: 'Building' },
  {id: 17, name: 'Y Building / Admin Building', coords: [6.065414460468946, 125.12833952730729], status: 'Open', type: 'Building' },
  {id: 18, name: 'ICT Building', coords: [6.065338721556866, 125.12767722597256], status: 'Open', type: 'Building' },
  {id: 19, name: 'IT/Physics Department', coords: [6.069540206440747, 125.12628302571503], status: 'Open', type: 'Building' },
  {id: 20, name: 'ICT Complex', coords: [6.069081855860375, 125.12672089325034], status: 'Open', type: 'Building' },
  {id: 21, name: 'New CNSM Building', coords: [6.069443478106939, 125.12489869975163], status: 'Open', type: 'Building' },
  {id: 22, name: 'Regional Science Research Center (RSRC)', coords: [6.069800666160386, 125.125835670486], status: 'Open', type: 'Building' },
  {id: 23, name: 'Nutraceutical Lab', coords: [6.069450423072744, 125.12540053438978], status: 'Open', type: 'Building' },
  {id: 24, name: 'Science and Technology Training Center', coords: [6.070814015990104, 125.12681925854393], status: 'Open', type: 'Building' },
  {id: 25, name: 'ABE Complex', coords: [6.0719062878529035, 125.12503576731277], status: 'Open', type: 'Building' },
  {id: 26, name: 'CAR Building', coords: [6.0719062878529035, 125.12503576731277], status: 'Open', type: 'Building' },
  {id: 27, name: 'SSC Building ', coords: [6.068957784834432, 125.12482383583192], status: 'Open', type: 'Building' },
  {id: 28, name: 'Boys Dorm Main', coords: [6.070705025510415, 125.12419236220188], status: 'Open', type: 'Dormitory' },
  {id: 29, name: 'Office of Student Affairs', coords: [6.0697524175180515, 125.12418549237167], status: 'Open', type: 'Building' },
  {id: 30, name: 'Girls Dorm Main', coords: [6.068778264559637, 125.12436874823007], status: 'Open', type: 'Dormitory' },
  {id: 31, name: 'Alumni Park', coords: [6.067744143076113, 125.12394121823431], status: 'Open', type: 'Field' },
  {id: 32, name: 'University Gymnasium', coords: [6.066762686141641, 125.12442231852978], status: 'Open', type: 'Building' },
  {id: 33, name: 'Open Court', coords: [6.066232412609107, 125.12380032630378], status: 'Open', type: 'Building' },
  {id: 34, name: 'Quadrangle', coords: [6.0658170898974895, 125.12626962490214], status: 'Open', type: 'Field' },
  {id: 35, name: 'Girls Dorm Annex', coords: [6.064380888138415, 125.12424491023336], status: 'Open', type: 'Dormitory' },
  {id: 36, name: 'Boys Dorm Annex', coords: [6.063938009607605, 125.12485131290474], status: 'Open', type: 'Dormitory' },
  {id: 37, name: 'ROTC Headquarters', coords: [6.063157819644279, 125.12783270375334], status: 'Open', type: 'Building' },
  {id: 38, name: 'Back Gate', coords: [6.065494286706529, 125.12212504400082], status: 'Open', type: 'Entrance/Exit' },
  {id: 39, name: 'University Infirmary', coords: [6.065174012112744, 125.12328029288801], status: 'Open', type: 'Building' },
  {id: 40, name: 'Alumni Pavilion', coords: [6.066760016344999, 125.12845911413804], status: 'Open', type: 'Building' },
  {id: 41, name: 'Laktanan', coords: [6.066342545843633, 125.12857083037396], status: 'Open', type: 'Field' },
  {id: 42, name: 'Mosque', coords: [6.06668695352738, 125.1226887754368], status: 'Open', type: 'Building' },
];

const FACILITIES = [
  { id: 101, name: 'Gymnasium',                     coords: [6.06702148462265,  125.12394614511116], status: 'Open', type: 'Facility' },
  { id: 102, name: "Registrar's Office (Y Building)",coords: [6.065520188853716, 125.12838202769997], status: 'Open', type: 'Facility' },
  { id: 103, name: 'Library',                        coords: [6.066725955964607, 125.12799695772719], status: 'Open', type: 'Facility' },
  { id: 104, name: 'Office of Student Affairs',      coords: [6.069841842030108, 125.12412084582711], status: 'Open', type: 'Facility' },
  { id: 105, name: 'Laktanan',                       coords: [6.066323469760834, 125.12839000321954], status: 'Open', type: 'Facility' },
  { id: 106, name: 'VLS (Virtual Learning Studio)',  coords: [6.067222222222222, 125.12763888888888], status: 'Open', type: 'Facility' },
];

// Hard campus bounds — no panning outside this box
const CAMPUS_BOUNDS = L.latLngBounds(
  L.latLng(6.0620, 125.1210),
  L.latLng(6.0725, 125.1330)
);

// Enforces bounds on every map move — snaps back if user somehow escapes
function BoundsEnforcer() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(CAMPUS_BOUNDS);
    map.on('drag', () => map.panInsideBounds(CAMPUS_BOUNDS, { animate: false }));
  }, [map]);
  return null;
}

export default function MapView({ onClose, selectedFeature }) {
  const zoomPortalRef = useRef(null);
  const [detailItem, setDetailItem] = useState(null);   // item currently shown in detail modal
  const [modalVisible, setModalVisible] = useState(false); // drives fade-in

  // Open detail modal with animation
  const openDetail = (item) => {
    setDetailItem(item);
    setTimeout(() => setModalVisible(true), 10);
  };

  // Close detail modal
  const closeDetail = () => {
    setModalVisible(false);
    setTimeout(() => setDetailItem(null), 350);
  };

  useEffect(() => {
    const style = document.createElement('link');
    style.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    style.rel = 'stylesheet';
    document.head.appendChild(style);
  }, []);

  function ZoomButtons() {
    const map = useMap();
    if (!zoomPortalRef.current) return null;

    return ReactDOM.createPortal(
      <div className="flex gap-2">
        <button
          onClick={() => map.zoomIn()}
          className="w-10 h-10 rounded-full bg-white hover:bg-white/90 active:scale-95 transition-all duration-200 shadow-lg flex items-center justify-center font-bold text-lg select-none"
          style={{ color: COLLEGE_COLOR }}
          title="Zoom in"
        >+</button>
        <button
          onClick={() => map.zoomOut()}
          className="w-10 h-10 rounded-full bg-white hover:bg-white/90 active:scale-95 transition-all duration-200 shadow-lg flex items-center justify-center font-bold text-lg select-none"
          style={{ color: COLLEGE_COLOR }}
          title="Zoom out"
        >−</button>
      </div>,
      zoomPortalRef.current
    );
  }

  // Confirmation popup — college (purple bg, white text)
  function collegePopup(item) {
    return (
      <div style={{ fontFamily: "'Aventa', sans-serif", minWidth: '200px', margin: 0 }}>
        <div style={{
          background: COLLEGE_COLOR,
          padding: '14px 36px 14px 14px',
          position: 'relative',
        }}>
          <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em' }}>
            {item.type.toUpperCase()}
          </p>
          <strong style={{ color: '#fff', fontSize: '13px', lineHeight: 1.3, display: 'block' }}>
            View {item.name}?
          </strong>
        </div>
        <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={() => openDetail(item)}
            style={{
              background: COLLEGE_COLOR,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 18px',
              fontSize: '12px',
              fontFamily: "'Aventa', sans-serif",
              cursor: 'pointer',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            View
          </button>
        </div>
      </div>
    );
  }

  // Confirmation popup — facility (amber bg, black text)
  function facilityPopup(item) {
    return (
      <div style={{ fontFamily: "'Aventa', sans-serif", minWidth: '200px', margin: 0 }}>
        <div style={{
          background: FACILITY_COLOR,
          padding: '14px 36px 14px 14px',
          position: 'relative',
        }}>
          <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'rgba(0,0,0,0.5)', letterSpacing: '0.08em' }}>
            {item.type.toUpperCase()}
          </p>
          <strong style={{ color: '#000', fontSize: '13px', lineHeight: 1.3, display: 'block' }}>
            View {item.name}?
          </strong>
        </div>
        <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={() => openDetail(item)}
            style={{
              background: FACILITY_COLOR,
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 18px',
              fontSize: '12px',
              fontFamily: "'Aventa', sans-serif",
              cursor: 'pointer',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden flex flex-col">
      {/* Top Header */}
      <div className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Find Logo" className="h-14 w-auto object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]" />
          <div className="flex items-center gap-3">
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
            <div ref={zoomPortalRef} className="flex gap-2" />
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:opacity-90"
          style={{ backgroundColor: COLLEGE_COLOR }}
          title="Go back"
        >
          <img src={leftIcon} alt="Back" className="w-6 h-6 object-contain invert brightness-200" />
        </button>
      </div>

      {/* Legend — fully white background, black text */}
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
      </div>

      {/* Map Container */}
      <div className="relative flex-1 w-full h-full">
        <MapContainer
          center={[6.0672, 125.1270]}
          zoom={16}
          minZoom={16}
          maxZoom={18}
          maxBounds={CAMPUS_BOUNDS}
          maxBoundsViscosity={1.0}
          style={{ width: '100%', height: '100%' }}
          className="z-10"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          <BoundsEnforcer />
          <ZoomButtons />

          {COLLEGES.map((item) => (
            <Marker key={item.id} position={item.coords} icon={customIcon}>
              <Popup>{collegePopup(item)}</Popup>
            </Marker>
          ))}

          {FACILITIES.map((item) => (
            <Marker key={item.id} position={item.coords} icon={amberIcon}>
              <Popup
                eventHandlers={{
                  add: (e) => {
                    const btn = e.target._closeButton;
                    if (btn) btn.classList.add('dark-close');
                  }
                }}
              >{facilityPopup(item)}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <style>{`
        .leaflet-popup-content-wrapper {
          background: #fff !important;
          border-radius: 10px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.22) !important;
          padding: 0 !important;
          overflow: hidden;
        }
        .leaflet-popup-tip {
          background: #fff !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          font-family: 'Aventa', sans-serif;
        }
        /* Close button — sits in the colored header */
        .leaflet-popup-close-button {
          color: rgba(255,255,255,0.8) !important;
          font-size: 18px !important;
          top: 10px !important;
          right: 10px !important;
          width: 22px !important;
          height: 22px !important;
          line-height: 22px !important;
          text-align: center;
          font-weight: 400 !important;
        }
        .leaflet-popup-close-button:hover {
          color: #fff !important;
        }
        /* For amber popups the × needs to be dark — toggled via data attr */
        .leaflet-popup-close-button.dark-close {
          color: rgba(0,0,0,0.5) !important;
        }
        .leaflet-popup-close-button.dark-close:hover {
          color: #000 !important;
        }
        .leaflet-container {
          font-family: 'Aventa', sans-serif;
          background: #0a0a0a;
        }
        .leaflet-control-attribution {
          background: rgba(255,255,255,0.1) !important;
          color: white !important;
          font-size: 10px;
        }
      `}</style>
      {/* ── DETAIL MODAL ── */}
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
          {/* Panel */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: 'calc(100% - 48px)',
              maxWidth: '560px',
              height: 'calc(100% - 80px)',
              maxHeight: '820px',
              background: '#ebe8e1',
              borderRadius: '28px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '48px 32px 40px',
              transform: modalVisible ? 'scale(1) translateY(0)' : 'scale(0.93) translateY(24px)',
              opacity: modalVisible ? 1 : 0,
              transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              overflow: 'visible',
            }}
          >
            {/* Protruding esc button — outside the panel bounds via negative position */}
            <button
              onClick={closeDetail}
              style={{
                position: 'absolute',
                top: '-22px',
                right: '-22px',
                width: '56px',
                height: '56px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                zIndex: 10,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              }}
            >
              <img src={escBtn} alt="Close" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </button>

            {/* College logo */}
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: '0 0 auto',
              marginBottom: '20px',
            }}>
              {LOGOS[detailItem.id] ? (
                <img
                  src={LOGOS[detailItem.id]}
                  alt={`${detailItem.name} logo`}
                  style={{
                    maxHeight: '200px',
                    maxWidth: '80%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))',
                  }}
                />
              ) : (
                /* Fallback monogram if no logo exists yet */
                <div style={{
                  width: '120px', height: '120px', borderRadius: '50%',
                  background: detailItem.type === 'Facility' ? FACILITY_COLOR : COLLEGE_COLOR,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '36px', fontWeight: 700, color: '#fff',
                  fontFamily: "'Aventa', sans-serif",
                  letterSpacing: '-1px',
                }}>
                  {detailItem.name.split(' ').filter(w => w.length > 2).map(w => w[0]).join('').slice(0, 4)}
                </div>
              )}
            </div>

            {/* College name */}
            <p style={{
              margin: '0 0 6px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              color: detailItem.type === 'Facility' ? FACILITY_COLOR : COLLEGE_COLOR,
              textAlign: 'center',
              fontFamily: "'Aventa', sans-serif",
              textTransform: 'uppercase',
            }}>
              {detailItem.name}
            </p>

            {/* Status + coordinates */}
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: '#888',
              fontFamily: "'Aventa', sans-serif",
              textAlign: 'center',
              letterSpacing: '0.04em',
            }}>
              ✓ {detailItem.status}&nbsp;&nbsp;|&nbsp;&nbsp;{detailItem.coords[0].toFixed(6)}, {detailItem.coords[1].toFixed(6)}
            </p>

            {/* Divider */}
            <div style={{
              width: '40px', height: '2px', borderRadius: '2px',
              background: detailItem.type === 'Facility' ? FACILITY_COLOR : COLLEGE_COLOR,
              margin: '20px auto 0',
              opacity: 0.4,
            }} />

            {/* Reserved space for future content */}
            <div style={{ flex: 1, width: '100%', marginTop: '24px' }} />
          </div>
        </div>
      )}

    </div>
  );
}