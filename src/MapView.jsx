import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import logo from './images/find_styled.png';
import findIcon from './images/find-icon.png';
import leftIcon from './images/left.png';
import gpsNavIcon from './images/gps-navigation.png';
import rectListIcon from './images/rectangle-list.png';
import escBtn from './images/esc-btn.png';
import cnsmLogo from './images/cnsm.png';
import toiletIcon from './images/restroom-simple.png';
import stairsIcon from './images/stairs.png';
import yIconImg      from './images/yicon.png';
import yBuildingImg   from './buildings/ybuilding.jpg';
import newScienceImg  from './buildings/new-science.jpg';
import cnsmOldImg     from './buildings/cnsm-old.jpg';
import ictComplexImg  from './buildings/ict-complex.jpg';
import itpDepImg      from './buildings/itp6-dep.jpg';
import mathBuildingImg from './buildings/math-building.jpg';
import 'leaflet/dist/leaflet.css';

const COLLEGE_COLOR = '#79095b';
const FACILITY_COLOR = '#f0ad3e';

const LOGOS = {
  7: cnsmLogo,
  102: yIconImg,
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
      id: 'cnsm-3', name: 'ICT Complex', code: 'ICT', rooms: 8, image: ictComplexImg,
      coords: [6.069115927450321, 125.12674627794516],
      floors: [
        {
          label: 'Floor 1',
          rooms: [
            { id: 'wc1-f1',    label: 'WC',  fullName: "Bathroom (Left)",           type: 'wc'    },
            { id: 'cl1',       label: 'CL1', fullName: 'Computer Laboratory 1',      type: 'room',  schedule: rotateSchedule(0) },
            { id: 'ccc',       label: 'CCC', fullName: 'Command and Control Center', type: 'office',
              director: 'Assoc. Prof. Jose T. Trillo',
              position: 'ICTO Director',
              contact: '0908-810-5709',
              email: 'icto@msugensan.edu.ph',
              description: 'The Command and Control Center is the central security monitoring hub of the university. It connects and monitors campus security camera systems to help maintain campus safety and surveillance. The center also houses the university data center, which supports the institution\'s network and digital infrastructure.',
            },
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

// Facility buildings — keyed by facility id
const FACILITY_BUILDINGS = {
  102: [
    {
      id: 'ybldg-1', name: "Y Building", code: 'Y-BLDG', rooms: 9, image: yBuildingImg,
      coords: [6.065520188853716, 125.12838202769997],
      accentColor: FACILITY_COLOR,
      planType: 'ybldg',
      floors: [
        {
          label: 'Floor 1',
          rooms: [
            {
              id: 'y-cashier', label: 'Cashier', fullName: "Cashier's Office", type: 'office',
              director: 'Angela Q. Sanchez', position: 'University Acting Cashier',
              contact: '0908 810 7847', email: 'cashiersoffice@msugensan.edu.ph',
              description: "The Cashier's Office handles official university payments and financial transactions. Students may visit this office to pay tuition fees, miscellaneous fees, clearances, and other required university charges. It also provides payment verification and official receipts for completed transactions.",
            },
            {
              id: 'y-registrar', label: 'Registrar', fullName: "Office of the University Registrar", type: 'office',
              director: 'James Edward R. Olaer', position: 'OIC-University Registrar',
              contact: '0908-810-5671', email: 'registraroffice@msugensan.edu.ph',
              description: "The Office of the Registrar is the gateway of the students to the University. It is an essential unit of the institution which keeps and maintains sensitive data related to the academic records of the students.",
            },
            {
              id: 'y-smo', label: 'SMO', fullName: "Supply Management Office", type: 'office',
              director: 'Lorraine M. Dagalangit-Sarigala, MS', position: 'SMO Director',
              contact: '0908 810 5630', email: 'smo@msugensan.edu.ph',
              description: "The Supply Management Office (SMO) manages the procurement, distribution, and proper use of university resources and equipment in accordance with government rules and regulations. It helps ensure that university supplies and property are used efficiently and responsibly. Student organizations and offices may also coordinate with the SMO to request chairs, tables, and other logistical resources for events and activities.",
            },
            {
              id: 'y-vcaa', label: 'VCAA', fullName: "Office of the Vice Chancellor for Academic Affairs", type: 'office',
              director: 'Prof. Mishell D. Lawas, D. Eng.', position: 'Vice Chancellor for Academic Affairs',
              contact: '09088105579', email: 'vcaaoffice@msugensan.edu.ph',
              description: "The Office of the Vice Chancellor for Academic Affairs serves as the university's central academic leadership unit responsible for overseeing, coordinating, and enhancing all academic programs, instructional activities, and academic support services to ensure quality education and institutional excellence.",
            },
            {
              id: 'y-confroom', label: 'MCR', fullName: "Mini Conference Room", type: 'office',
              director: 'Atty. Shidik T. Abantas, MDM, LLM', position: 'University Chancellor',
              contact: '09619767447', email: 'oc@msugensan.edu.ph',
              description: "The Mini Conference Room is a venue for meetings, discussions, presentations, and small university gatherings. It provides a professional and organized space for academic, administrative, and organizational activities. Students, faculty, and university offices may use the room for conferences, planning sessions, and collaborative events.",
            },
            {
              id: 'y-oc', label: 'OC', fullName: "Office of the Chancellor (Old)", type: 'office',
              director: 'Atty. Shidik T. Abantas, MDM, LLM', position: 'University Chancellor',
              contact: '09619767447', email: 'oc@msugensan.edu.ph',
              description: "The Office of the Chancellor serves as the central leadership office of the university, overseeing all administrative, academic, and institutional functions in alignment with the university's vision and mission.",
            },
            {
              id: 'y-vcaf', label: 'VCAF', fullName: "Office of the Vice Chancellor for Administration and Finance", type: 'office',
              director: 'Prof. Sheila J. Loable, MS', position: 'Vice Chancellor for Administration and Finance',
              contact: '09088107845', email: 'vcafoffice@msugensan.edu.ph',
              description: "The Office of the Vice Chancellor for Administration and Finance serves as the university's central administrative unit responsible for ensuring efficient, transparent, and effective management of financial resources, administrative services, and operational support systems.",
            },
            {
              id: 'y-vcpd', label: 'VCPD', fullName: "Office of the Vice Chancellor for Planning and Development", type: 'office',
              director: 'Prof. Randy P. Asturias, D. Eng.', position: 'Vice Chancellor for Planning and Development',
              contact: '09088104701', email: 'ovcpd@msugensan.edu.ph',
              description: "The Office of the Vice Chancellor for Planning and Development leads the formulation, coordination, and monitoring of the university's strategic and development plans. It ensures that programs and initiatives are aligned with institutional priorities, national policies, and long-term goals.",
            },
            {
              id: 'y-quamso', label: 'QuAMSO', fullName: "Quality Assurance Management Services Office", type: 'office',
              director: 'Monsour A. Pelmin, PhD', position: 'QuAMSO Director',
              contact: '09088105715', email: 'quamso@msugensan.edu.ph',
              description: "The Quality Assurance Management Services Office (QuAMSO) acts as central coordinating office for all colleges and units in the University to ensure the establishment, implementation, maintenance and upscaling of the University Quality Management System (QMS), Accreditation System, as well as quality and quantity assurance mechanisms to be aligned in accordance with the University Vision, Mission, College Goals and Program Objectives.",
            },
          ],
        },
        {
          label: 'Floor 2',
          rooms: [
            { id: 'wc1-yf2',     label: 'WC',   fullName: 'Bathroom (Left)',              type: 'wc'    },
            { id: 'reg-adm',     label: 'ADM',  fullName: 'Admissions Office',             type: 'room'  },
            { id: 'reg-scho',    label: 'SCH',  fullName: 'Scholarships Section',          type: 'room'  },
            { id: 'reg-arch',    label: 'ARC',  fullName: 'Archives Room',                 type: 'room'  },
            { id: 'reg-conf',    label: 'CONF', fullName: 'Conference Room',               type: 'room'  },
            { id: 'wc2-yf2',     label: 'WC',   fullName: 'Bathroom (Right)',              type: 'wc'    },
            { id: 'stair1-yf2',  label: '↑',    fullName: 'Staircase (Left)',              type: 'stair' },
            { id: 'stair2-yf2',  label: '↑',    fullName: 'Staircase (Right)',             type: 'stair' },
          ],
        },
      ],
    },
  ],
};
const COLLEGES = [
  { id: 1,  name: 'College of Agriculture',                           code: 'COA',  coords: [6.070480988321281,  125.12579094360856], status: 'Open', type: 'College' },
  { id: 2,  name: 'College of Engineering',                           code: 'COE',  coords: [6.064088002693254,  125.12683859876006], status: 'Open', type: 'College' },
  { id: 3,  name: 'College of Education',                             code: 'COED', coords: [6.067896313435069,  125.12825013296172], status: 'Open', type: 'College' },
  { id: 4,  name: 'College of Fisheries and Aquatic Sciences',        code: 'COF',  coords: [6.0644563163346765, 125.13004240242738], status: 'Open', type: 'College' },
  { id: 5,  name: 'College of Business Administration & Accountancy', code: 'CBAA', coords: [6.06423760601592,   125.12834992857071], status: 'Open', type: 'College' },
  { id: 6,  name: 'College of Social Sciences and Humanities',        code: 'CSSH', coords: [6.06774358929378,   125.12610972165167], status: 'Open', type: 'College' },
  { id: 7,  name: 'College of Natural Sciences and Mathematics',      code: 'CNSM', coords: [6.069067815786466,  125.12589392474057], status: 'Open', type: 'College' },
  { id: 8,  name: 'Senior Highschool Department',                     code: 'SHS',  coords: [6.068557633415351,  125.12830040933797], status: 'Open', type: 'College' },
];

const FACILITIES = [
  { id: 101, name: 'Gymnasium',                      coords: [6.06702148462265,  125.12394614511116], status: 'Open', type: 'Facility' },
  { id: 102, name: "Registrar's Office (Y Building)", coords: [6.065520188853716, 125.12838202769997], status: 'Open', type: 'Facility' },
  { id: 103, name: 'Library',                         coords: [6.066725955964607, 125.12799695772719], status: 'Open', type: 'Facility' },
  { id: 104, name: 'Office of Student Affairs',       coords: [6.069841842030108, 125.12412084582711], status: 'Open', type: 'Facility' },
  { id: 105, name: 'Laktanan',                        coords: [6.066323469760834, 125.12839000321954], status: 'Open', type: 'Facility' },
  { id: 106, name: 'VLS (Virtual Learning Studio)',   coords: [6.067222222222222, 125.12763888888888], status: 'Open', type: 'Facility' },
  { id: 107, name: 'University Infirmary',            coords: [6.065174012112744,  125.12328029288801], status: 'Open', type: 'Facility' },
];

// ── Secondary dot-only locations (no modal) ───────────────────────────────────
// These show as small coloured circles on the map and are searchable.
// IDs start at 200+ to avoid collision with main markers.
const EXTRA_COLLEGES = [
  { id: 201, name: 'Institute of Islamic, Arabic & International Studies', coords: [6.070908146976309, 125.12745455283785], status: 'Open', type: 'Institute' },
  { id: 202, name: 'SSC Building',                                         coords: [6.068957784834432, 125.12482383583192], status: 'Open', type: 'Building'  },
  { id: 203, name: 'Regional Science Research Center',                     coords: [6.069800666160386, 125.125835670486],   status: 'Open', type: 'Building'  },
  { id: 204, name: 'ROTC Headquarters',                                    coords: [6.063157819644279, 125.12783270375334], status: 'Open', type: 'Building'  },
  { id: 205, name: 'ICT Building',                                         coords: [6.065338721556866, 125.12767722597256], status: 'Open', type: 'Building'  },
  { id: 206, name: 'ICT Complex',                                          coords: [6.069115927450321, 125.12674627794516], status: 'Open', type: 'Building'  },
  { id: 207, name: 'IT/Physics Department',                                coords: [6.069610682801607, 125.1263247496069],  status: 'Open', type: 'Building'  },
];

const EXTRA_FACILITIES = [
  { id: 302, name: 'Alumni Park',           coords: [6.067744143076113,  125.12394121823431], status: 'Open', type: 'Facility'   },
  { id: 303, name: 'Boys Dorm (Main)',      coords: [6.070705025510415,  125.12419236220188], status: 'Open', type: 'Dormitory'  },
  { id: 304, name: 'Girls Dorm (Main)',     coords: [6.068778264559637,  125.12436874823007], status: 'Open', type: 'Dormitory'  },
  { id: 305, name: 'Girls Dorm (Annex)',    coords: [6.064380888138415,  125.12424491023336], status: 'Open', type: 'Dormitory'  },
  { id: 306, name: 'Boys Dorm (Annex)',     coords: [6.063938009607605,  125.12485131290474], status: 'Open', type: 'Dormitory'  },
  { id: 307, name: 'Alumni Pavilion',       coords: [6.066760016344999,  125.12845911413804], status: 'Open', type: 'Building'   },
  { id: 308, name: 'Mosque',                coords: [6.06668695352738,   125.1226887754368],  status: 'Open', type: 'Building'   },
  { id: 309, name: 'Open Court',            coords: [6.066232412609107,  125.12380032630378], status: 'Open', type: 'Building'   },
  { id: 310, name: 'Quadrangle',            coords: [6.0658170898974895, 125.12626962490214], status: 'Open', type: 'Field'      },
];

const GATES = [
  { id: 311, name: 'Main Gate',  coords: [6.0657072972022075, 125.13180336952652], status: 'Open', type: 'Entrance/Exit' },
  { id: 312, name: 'Back Gate',  coords: [6.065494286706529,  125.12212504400082], status: 'Open', type: 'Entrance/Exit' },
];

const ALL_ITEMS = [
  ...COLLEGES,
  ...FACILITIES,
  ...EXTRA_COLLEGES,
  ...EXTRA_FACILITIES,
  ...GATES,
];

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
// ── Right-side floating control panel (inside MapContainer so useMap works) ──
function MapZoomPanel({ onClose }) {
  const map = useMap();
  const BTN = {
    width: '48px', height: '48px', borderRadius: '12px',
    background: COLLEGE_COLOR, border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
    transition: 'opacity 0.15s, transform 0.1s',
    position: 'relative', flexShrink: 0,
  };
  const [hovered, setHovered] = React.useState(null);
  const tooltip = (label) => hovered === label ? (
    <div style={{
      position: 'absolute', right: '58px', top: '50%', transform: 'translateY(-50%)',
      background: 'rgba(0,0,0,0.80)', color: '#fff', fontSize: '11px',
      fontFamily: "'Aventa', sans-serif", fontWeight: 600, letterSpacing: '0.04em',
      padding: '5px 10px', borderRadius: '6px', whiteSpace: 'nowrap',
      pointerEvents: 'none', zIndex: 10,
    }}>{label}</div>
  ) : null;

  return (
    <div style={{
      position: 'absolute', right: '20px', bottom: '24px',
      zIndex: 600, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '8px',
    }}>
      {/* Top group: Back, Navigate, All Locations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button style={BTN} onClick={onClose}
          onMouseEnter={() => setHovered('Return to Homepage')} onMouseLeave={() => setHovered(null)}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {tooltip('Return to Homepage')}
          <img src={leftIcon} alt="Back" style={{ width: '22px', height: '22px', objectFit: 'contain', filter: 'invert(1) brightness(2)' }} />
        </button>
        <button style={BTN}
          onMouseEnter={() => setHovered('Navigate Campus')} onMouseLeave={() => setHovered(null)}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {tooltip('Navigate Campus')}
          <img src={gpsNavIcon} alt="Navigate" style={{ width: '22px', height: '22px', objectFit: 'contain', filter: 'invert(1) brightness(2)' }} />
        </button>
        <button style={BTN}
          onMouseEnter={() => setHovered('View All Locations')} onMouseLeave={() => setHovered(null)}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {tooltip('View All Locations')}
          <img src={rectListIcon} alt="All Locations" style={{ width: '22px', height: '22px', objectFit: 'contain', filter: 'invert(1) brightness(2)' }} />
        </button>
      </div>

      {/* Spacer */}
      <div style={{ height: '16px' }} />

      {/* Bottom group: Zoom In, Zoom Out */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button style={{ ...BTN, fontSize: '24px', fontWeight: 700, color: '#fff', fontFamily: 'sans-serif' }}
          onClick={() => map.zoomIn()}
          onMouseEnter={() => setHovered('Zoom In')} onMouseLeave={() => setHovered(null)}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {tooltip('Zoom In')}
          +
        </button>
        <button style={{ ...BTN, fontSize: '24px', fontWeight: 700, color: '#fff', fontFamily: 'sans-serif' }}
          onClick={() => map.zoomOut()}
          onMouseEnter={() => setHovered('Zoom Out')} onMouseLeave={() => setHovered(null)}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {tooltip('Zoom Out')}
          −
        </button>
      </div>
    </div>
  );
}

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

    const item = ALL_ITEMS.find(i => i.id === glowId);
    if (!item) return;

    map.flyTo(item.coords, 17, { duration: 0.8 });

    const ref = markerRefs.current[glowId];
    if (!ref) return; // extra dot markers may not have popups — just fly-to is enough

    setTimeout(() => {
      // Open the popup (main markers only)
      try { ref.openPopup(); } catch (_) {}
      // Add glow to the marker's DOM element
      const markerEl = ref.getElement();
      if (markerEl) {
        markerEl.classList.add('marker-glow');
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

  // Zoom handled by fixed right-side panel — no portal needed
  function ZoomButtons() { return null; }

  function collegePopup(item) {
    return (
      <div style={{ fontFamily: "'Aventa', sans-serif", minWidth: '200px', margin: 0 }}>
        <div style={{ background: COLLEGE_COLOR, padding: '14px 36px 14px 14px', position: 'relative' }}>
          <p style={{ margin: '0 0 2px', fontSize: '11px', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em' }}>
            {item.type.toUpperCase()}
          </p>
          <strong style={{ color: '#fff', fontSize: '13px', lineHeight: 1.3, display: 'block' }}>
            {item.name}
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
            {item.name}
          </strong>
        </div>
        <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button
            onClick={() => openDetail(item)}
            style={{
              background: FACILITY_COLOR, color: '#fff', border: 'none', borderRadius: '6px',
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

  // Small dot icons for secondary locations
  const dotMagenta = L.divIcon({
    className: '',
    html: `<div style="width:13px;height:13px;border-radius:50%;background:${COLLEGE_COLOR};border:2.5px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,0.35);"></div>`,
    iconSize: [13, 13], iconAnchor: [6, 6], popupAnchor: [0, -10],
  });

  const dotAmber = L.divIcon({
    className: '',
    html: `<div style="width:13px;height:13px;border-radius:50%;background:#f0ad3e;border:2.5px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,0.35);"></div>`,
    iconSize: [13, 13], iconAnchor: [6, 6], popupAnchor: [0, -10],
  });

  const gateIcon = L.divIcon({
    className: '',
    html: `<div style="width:15px;height:15px;border-radius:50%;background:#e03030;border:2.5px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,0.4);"></div>`,
    iconSize: [15, 15], iconAnchor: [7, 7], popupAnchor: [0, -12],
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

      {/* ── Extra dot markers — colleges/buildings (magenta) ── */}
      {EXTRA_COLLEGES.map(item => (
        <Marker
          key={item.id}
          position={item.coords}
          icon={dotMagenta}
          ref={el => { if (el) markerRefs.current[item.id] = el; }}
        >
          <Popup>
            <div style={{ fontFamily: "'Aventa', sans-serif", padding: '10px 14px', minWidth: '160px' }}>
              <p style={{ margin: '0 0 2px', fontSize: '10px', color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.type}</p>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: COLLEGE_COLOR }}>{item.name}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* ── Extra dot markers — facilities/other (amber) ── */}
      {EXTRA_FACILITIES.map(item => (
        <Marker
          key={item.id}
          position={item.coords}
          icon={dotAmber}
          ref={el => { if (el) markerRefs.current[item.id] = el; }}
        >
          <Popup
            eventHandlers={{
              add: (e) => { const btn = e.target._closeButton; if (btn) btn.classList.add('dark-close'); }
            }}
          >
            <div style={{ fontFamily: "'Aventa', sans-serif", padding: '10px 14px', minWidth: '160px' }}>
              <p style={{ margin: '0 0 2px', fontSize: '10px', color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.type}</p>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#b07d00' }}>{item.name}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* ── Gate markers — red ── */}
      {GATES.map(item => (
        <Marker
          key={item.id}
          position={item.coords}
          icon={gateIcon}
          ref={el => { if (el) markerRefs.current[item.id] = el; }}
        >
          <Popup>
            <div style={{ fontFamily: "'Aventa', sans-serif", padding: '10px 14px', minWidth: '160px' }}>
              <p style={{ margin: '0 0 2px', fontSize: '10px', color: '#aaa', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{item.type}</p>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#e03030' }}>{item.name}</p>
            </div>
          </Popup>
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
  const [buildingTab, setBuildingTab]           = useState('plan'); // 'image' | 'plan'
  const [hoveredRoom, setHoveredRoom]           = useState(null);
  const [selectedFloor, setSelectedFloor]       = useState('floor1'); // 'floor1' | 'floor2'
  const [buildingMarker, setBuildingMarker]     = useState(null); // { building, coords }

  const openBuilding = (building) => {
    setBuildingTab('plan');
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
      ALL_ITEMS.filter(i =>
        i.name.toLowerCase().includes(lower) ||
        i.type.toLowerCase().includes(lower) ||
        (i.code && i.code.toLowerCase().includes(lower))
      )
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

      {/* ── Everything behind the modal blurs when detail or building modal is open ── */}
      <div style={{
        position: 'absolute', inset: 0,
        transition: 'filter 0.35s ease',
        filter: (detailItem || selectedBuilding) ? 'blur(6px)' : 'none',
        pointerEvents: (detailItem || selectedBuilding) ? 'none' : 'auto',
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
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-[600] border border-gray-100" style={{ maxHeight: '340px', overflowY: 'auto' }}>
              {searchResults.map(item => {
                const isFacilityType = ['Facility', 'Dormitory', 'Building', 'Field', 'Entrance'].includes(item.type);
                const dotColor = isFacilityType ? FACILITY_COLOR : COLLEGE_COLOR;
                return (
                  <button
                    key={item.id}
                    onClick={e => { e.stopPropagation(); handleResultClick(item); }}
                    className="w-full px-5 py-3.5 text-left hover:bg-purple-50 active:bg-purple-100 transition-colors duration-150 border-b border-gray-100 last:border-b-0 focus:outline-none flex items-center gap-3"
                  >
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-tight">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.type}</p>
                    </div>
                    {item.code && (
                      <span style={{
                        fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
                        color: COLLEGE_COLOR, background: `${COLLEGE_COLOR}12`,
                        border: `1px solid ${COLLEGE_COLOR}28`,
                        borderRadius: '5px', padding: '2px 7px', flexShrink: 0,
                        fontFamily: "'Aventa', sans-serif",
                      }}>{item.code}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>{/* end floating header */}

      {/* ── Legend ── */}
      <div className="absolute bottom-6 left-6 z-[500] bg-white border border-gray-200 rounded-xl p-4 shadow-xl text-sm space-y-2">
        <h3 className="text-xs font-semibold tracking-wide text-gray-800 mb-2">MSU General Santos</h3>
        <div className="flex items-center space-x-2.5">
          <img src={findIcon} style={{ width: '14px', height: '14px', filter: 'invert(11%) sepia(90%) saturate(3000%) hue-rotate(300deg) brightness(80%)' }} alt="" />
          <span className="text-xs text-gray-700">Colleges &amp; Departments</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <img src={findIcon} style={{ width: '14px', height: '14px', filter: 'invert(75%) sepia(80%) saturate(600%) hue-rotate(5deg) brightness(105%)' }} alt="" />
          <span className="text-xs text-gray-700">Offices &amp; Facilities</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-3 rounded-full flex-shrink-0 border-2 border-white shadow-sm" style={{ backgroundColor: COLLEGE_COLOR }} />
          <span className="text-xs text-gray-700">Buildings &amp; Institutes</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-3 rounded-full flex-shrink-0 border-2 border-white shadow-sm" style={{ backgroundColor: FACILITY_COLOR }} />
          <span className="text-xs text-gray-700">Other Facilities</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="w-3 h-3 rounded-full flex-shrink-0 border-2 border-white shadow-sm" style={{ backgroundColor: '#e03030' }} />
          <span className="text-xs text-gray-700">Entrances &amp; Exits</span>
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
          <MapZoomPanel onClose={onClose} />
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
                  style={{ maxHeight: '190px', maxWidth: '90%', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }}
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
              {(BUILDINGS[detailItem.id] || FACILITY_BUILDINGS[detailItem.id] || []).map(building => (
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

              {((!BUILDINGS[detailItem.id] || BUILDINGS[detailItem.id].length === 0) &&
                (!FACILITY_BUILDINGS[detailItem.id] || FACILITY_BUILDINGS[detailItem.id].length === 0)) && (
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

      {/* ── Building Detail Modal — LANDSCAPE ── */}
      {selectedBuilding && (() => {
        const bldgColor = selectedBuilding.accentColor || COLLEGE_COLOR;
        const currentFloorData = selectedBuilding.floors
          ? selectedBuilding.floors[selectedFloor === 'floor1' ? 0 : 1]
          : null;
        const activeRoom = hoveredRoom && currentFloorData
          ? currentFloorData.rooms.find(r => r.id === hoveredRoom) || null
          : null;

        return (
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 300,
            backdropFilter: buildingVisible ? 'blur(14px)' : 'blur(0px)',
            WebkitBackdropFilter: buildingVisible ? 'blur(14px)' : 'blur(0px)',
            background: buildingVisible ? 'rgba(0,0,0,0.48)' : 'rgba(0,0,0,0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
        >
          {/* ── Card: landscape row layout ── */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: 'calc(100% - 48px)', maxWidth: '1240px',
              height: 'calc(100% - 60px)', maxHeight: '680px',
              borderRadius: '28px',
              boxShadow: '0 40px 100px rgba(0,0,0,0.5), 0 8px 28px rgba(0,0,0,0.3)',
              display: 'flex', flexDirection: 'row',
              overflow: 'hidden',
              opacity: buildingVisible ? 1 : 0,
              transform: buildingVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(22px)',
              transition: 'all 0.32s cubic-bezier(0.34, 1.3, 0.64, 1)',
            }}
          >
            {/* ── ESC button — protrudes top-right of card ── */}
            <button
              onClick={() => { closeBuilding(); setTimeout(closeDetail, 350); }}
              style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '56px', height: '56px', background: 'none', border: 'none',
                cursor: 'pointer', padding: 0, zIndex: 500,
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.45))',
              }}
            >
              <img src={escBtn} alt="Close" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </button>

            {/* ════════════════════════════════════════
                LEFT PANEL — 65% — floor plan / photo
            ════════════════════════════════════════ */}
            <div style={{
              flex: '0 0 65%',
              position: 'relative',
              background: buildingTab === 'plan' ? bldgColor : '#111',
              transition: 'background 0.3s ease',
              borderRadius: '28px 0 0 28px',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Floor selector — top-left, only in plan mode */}
              {selectedBuilding.floors && selectedBuilding.floors.length > 0 && buildingTab === 'plan' && (
                <div style={{
                  position: 'absolute', top: '22px', left: '28px', zIndex: 50,
                  display: 'flex', gap: '24px',
                }}>
                  {selectedBuilding.floors.map((floor, idx) => {
                    const floorKey = `floor${idx + 1}`;
                    const isSelected = selectedFloor === floorKey;
                    return (
                      <button
                        key={floorKey}
                        onClick={e => { e.stopPropagation(); setSelectedFloor(floorKey); setHoveredRoom(null); }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 4px',
                          color: isSelected ? '#fff' : 'rgba(255,255,255,0.45)',
                          fontWeight: isSelected ? 700 : 400,
                          fontSize: '18px', fontFamily: "'Aventa', sans-serif",
                          letterSpacing: '0.04em',
                          borderBottom: isSelected ? '2.5px solid #fff' : '2.5px solid transparent',
                          transition: 'all 0.2s ease',
                        }}
                      >{floor.label}</button>
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
                  pointerEvents: 'none',
                }}
              />

              {/* SVG floor plan */}
              <div style={{
                position: 'absolute', inset: 0,
                opacity: buildingTab === 'plan' ? 1 : 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: buildingTab === 'plan' ? 'auto' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '72px 24px 76px',
              }}>
                {selectedBuilding.floors && selectedBuilding.floors.length > 0 ? (
                  selectedBuilding.planType === 'ybldg' && selectedFloor === 'floor1' ? (
                    <YBuildingFloorPlan
                      floor={selectedBuilding.floors[0]}
                      hoveredRoom={hoveredRoom}
                      onRoomClick={id => setHoveredRoom(hoveredRoom === id ? null : id)}
                      accentColor={bldgColor}
                    />
                  ) : (
                    <ICTFloorPlan
                      floor={selectedBuilding.floors[selectedFloor === 'floor1' ? 0 : 1]}
                      hoveredRoom={hoveredRoom}
                      onRoomClick={id => setHoveredRoom(hoveredRoom === id ? null : id)}
                      accentColor={bldgColor}
                    />
                  )
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px', fontFamily: "'Aventa', sans-serif" }}>
                    No floor plan available
                  </p>
                )}
              </div>

              {/* Image / Floor Plan toggle — bottom-centre of left panel */}
              <div style={{
                position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                zIndex: 50, display: 'flex',
                background: 'rgba(0,0,0,0.78)', borderRadius: '999px',
                border: '1.5px solid rgba(255,255,255,0.22)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                overflow: 'hidden',
              }}>
                {['plan', 'image'].map(tab => (
                  <button
                    key={tab}
                    onClick={e => { e.stopPropagation(); setBuildingTab(tab); }}
                    style={{
                      padding: '11px 32px',
                      fontSize: '13px', fontFamily: "'Aventa', sans-serif",
                      fontWeight: buildingTab === tab ? 700 : 500,
                      background: buildingTab === tab ? bldgColor : 'transparent',
                      color: buildingTab === tab ? '#fff' : 'rgba(255,255,255,0.6)',
                      border: 'none', cursor: 'pointer',
                      borderRadius: '999px',
                      letterSpacing: '0.09em', textTransform: 'uppercase',
                      transition: 'all 0.22s ease', whiteSpace: 'nowrap',
                    }}
                  >{tab === 'image' ? 'Photo' : 'Floor Plan'}</button>
                ))}
              </div>
            </div>

            {/* ════════════════════════════════════════
                RIGHT PANEL — 35% — info
            ════════════════════════════════════════ */}
            <div style={{
              flex: '0 0 35%',
              background: '#ebe8e1',
              borderRadius: '0 28px 28px 0',
              display: 'flex', flexDirection: 'column',
              padding: '34px 32px 26px',
              overflow: 'hidden',
            }}>

              {/* Name + tag on the same row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                flexWrap: 'wrap', marginBottom: '8px', flexShrink: 0,
              }}>
                <p style={{
                  margin: 0, fontSize: '27px', fontWeight: 700,
                  color: bldgColor, fontFamily: "'Aventa', sans-serif",
                  letterSpacing: '-0.02em', lineHeight: 1.15,
                }}>{selectedBuilding.name}</p>
                {selectedBuilding.code && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: `${bldgColor}18`, border: `1.5px solid ${bldgColor}38`,
                    borderRadius: '7px', padding: '4px 12px', flexShrink: 0,
                  }}>
                    <span style={{
                      fontSize: '12px', fontWeight: 700, letterSpacing: '0.13em',
                      color: bldgColor, fontFamily: "'Aventa', sans-serif", textTransform: 'uppercase',
                    }}>{selectedBuilding.code}</span>
                  </div>
                )}
              </div>

              {/* Status row */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginBottom: '4px', flexWrap: 'wrap', flexShrink: 0,
              }}>
                <span style={{ fontSize: '14px', color: '#888', fontFamily: "'Aventa', sans-serif" }}>Open</span>
                <span style={{ color: '#ccc', fontSize: '12px' }}>|</span>
                <span style={{ fontSize: '14px', color: '#888', fontFamily: "'Aventa', sans-serif" }}>
                  {selectedBuilding.rooms} {selectedBuilding.rooms === 1 ? 'Room' : 'Rooms'}
                </span>
                <span style={{ color: '#ccc', fontSize: '12px' }}>|</span>
                <span style={{ fontSize: '14px', color: '#27ae60', fontFamily: "'Aventa', sans-serif", fontWeight: 600 }}>WiFi: Strong</span>
              </div>

              {/* Coords */}
              {selectedBuilding.coords && (
                <p style={{
                  margin: '0 0 16px', fontSize: '11.5px', color: '#bbb',
                  fontFamily: "'Aventa', sans-serif", letterSpacing: '0.04em', flexShrink: 0,
                }}>
                  {selectedBuilding.coords[0].toFixed(6)}, {selectedBuilding.coords[1].toFixed(6)}
                </p>
              )}

              {/* Info box — fills remaining space, no divider above */}
              <div style={{
                flex: 1,
                padding: '16px 18px',
                background: `${bldgColor}08`,
                borderRadius: '14px',
                border: `1px solid ${bldgColor}1e`,
                overflowY: 'auto',
                display: 'flex', flexDirection: 'column',
              }}>
                {activeRoom ? (() => {
                  const room = activeRoom;

                  /* ── OFFICE view ── */
                  if (room.type === 'office') return (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <p style={{
                        margin: '0 0 14px', fontSize: '16px', color: '#1a1a1a',
                        fontFamily: "'Aventa', sans-serif", fontWeight: 700, lineHeight: 1.3,
                      }}>{room.fullName}</p>

                      {[
                        { label: 'Director', value: room.director, sub: room.position },
                        { label: 'Contact',  value: room.contact },
                        { label: 'Email',    value: room.email },
                      ].map(({ label, value, sub }) => value && (
                        <div key={label} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                          <span style={{
                            fontSize: '12px', color: '#aaa', fontFamily: "'Aventa', sans-serif",
                            flexShrink: 0, minWidth: '64px', paddingTop: '1px',
                          }}>{label}</span>
                          <span style={{ fontSize: '14px', color: '#2a2a2a', fontFamily: "'Aventa', sans-serif", fontWeight: 600, lineHeight: 1.35 }}>
                            {value}
                            {sub && <span style={{ display: 'block', fontWeight: 400, color: '#666', fontSize: '13px' }}>{sub}</span>}
                          </span>
                        </div>
                      ))}

                      {room.description && (
                        <p style={{
                          margin: '4px 0 0', fontSize: '13px', color: '#666', lineHeight: 1.65,
                          fontFamily: "'Aventa', sans-serif",
                          borderTop: `1px solid ${bldgColor}18`, paddingTop: '12px',
                        }}>{room.description}</p>
                      )}
                    </div>
                  );

                  /* ── ROOM / schedule view ── */
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <p style={{
                        margin: '0 0 4px', fontSize: '16px', color: bldgColor,
                        fontFamily: "'Aventa', sans-serif", fontWeight: 700,
                      }}>{room.fullName}</p>
                      <p style={{
                        margin: '0 0 14px', fontSize: '11px', color: '#aaa',
                        fontFamily: "'Aventa', sans-serif", fontWeight: 600,
                        letterSpacing: '0.09em', textTransform: 'uppercase',
                      }}>Today's Schedule</p>
                      {room.schedule && room.schedule.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                          {room.schedule.map((item, idx) => (
                            <div key={idx} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '10px 0',
                              borderBottom: idx < room.schedule.length - 1 ? '1px solid rgba(0,0,0,0.07)' : 'none',
                              fontFamily: "'Aventa', sans-serif",
                            }}>
                              <span style={{ fontSize: '15px', fontWeight: 700, color: '#2a2a2a' }}>{item.code}</span>
                              <span style={{ fontSize: '14px', color: '#888' }}>{item.time}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontSize: '14px', color: '#bbb', fontFamily: "'Aventa', sans-serif", fontStyle: 'italic' }}>
                          No schedule available.
                        </p>
                      )}
                    </div>
                  );
                })() : (
                  <div style={{ margin: 'auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={bldgColor} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.28">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                    </svg>
                    <p style={{ fontSize: '14px', color: '#c0bbb5', fontFamily: "'Aventa', sans-serif", fontStyle: 'italic' }}>
                      Select a room to view its details
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ flexShrink: 0, marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedBuilding.coords && (
                  <button
                    onClick={() => viewOnMap(selectedBuilding)}
                    style={{
                      width: '100%', padding: '15px 0',
                      background: bldgColor, border: 'none', borderRadius: '14px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
                      color: '#fff', fontSize: '15px', fontWeight: 700,
                      fontFamily: "'Aventa', sans-serif", letterSpacing: '0.07em',
                      boxShadow: `0 6px 22px ${bldgColor}50`,
                      transition: 'opacity 0.15s, transform 0.12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    VIEW ON MAP
                  </button>
                )}
                <button
                  onClick={closeBuilding}
                  style={{
                    width: '100%', padding: '13px 0',
                    background: 'transparent', border: `1.5px solid ${bldgColor}40`,
                    borderRadius: '14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    color: bldgColor, fontSize: '14px', fontWeight: 600,
                    fontFamily: "'Aventa', sans-serif", letterSpacing: '0.07em',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = `${bldgColor}10`}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  ‹ BACK
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

    </div>
  );
}

// ── Single Floor SVG floor plan ────────────────────────────────────
function ICTFloorPlan({ floor, hoveredRoom, onRoomClick, accentColor }) {
  if (!floor) return null;
  const ACCENT = accentColor || COLLEGE_COLOR;

  // Overall canvas
  const W = 620;
  const H = 220;
  const PAD = 14;

  // Room layout structure
  const rooms = floor.rooms;
  const mainRooms = rooms.filter(r => r.type === 'room' || r.type === 'office');
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
          <g key={room.id}
            onClick={isWC ? undefined : () => onRoomClick(room.id)}
            style={{ cursor: isWC ? 'default' : 'pointer' }}
          >
            <rect
              x={x + 2.5} y={4} width={w - 5} height={ROOM_H - 2}
              rx="8"
              fill={isWC ? 'rgba(255,255,255,0.55)' : (isHovered ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.85)')}
              stroke={isWC ? 'rgba(255,255,255,0.3)' : (isHovered ? '#fff' : 'rgba(255,255,255,0.5)')}
              strokeWidth={isHovered && !isWC ? 2.5 : 1.5}
            />
            {isWC ? (
              <image
                href={toiletIcon}
                x={cx - 12} y={cy - 12}
                width="24" height="24"
                style={{
                  filter: 'brightness(0) saturate(100%) invert(11%) sepia(90%) saturate(3000%) hue-rotate(300deg) brightness(0.7)',
                  pointerEvents: 'none', opacity: 0.85,
                }}
              />
            ) : (
              <>
                <text
                  x={cx} y={cy - 4}
                  textAnchor="middle"
                  fill={isHovered ? ACCENT : '#2a2a2a'}
                  fontSize="12" fontWeight="700" fontFamily="'Aventa', sans-serif"
                  style={{ pointerEvents: 'none' }}
                >{room.label}</text>
                <text
                  x={cx} y={cy + 8}
                  textAnchor="middle"
                  fill={isHovered ? ACCENT : 'rgba(50,50,50,0.6)'}
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
        const cx = x + w / 2;
        const cy = y + h / 2;
        return (
          <g key={room.id} style={{ cursor: 'default' }}>
            <rect
              x={x + 2.5} y={y} width={w - 5} height={h}
              rx="6.5"
              fill='rgba(255,255,255,0.55)'
              stroke='rgba(255,255,255,0.3)'
              strokeWidth={1.5}
            />
            <image
              href={stairsIcon}
              x={cx - 10} y={cy - 10}
              width="20" height="20"
              style={{
                filter: 'brightness(0) saturate(100%) invert(11%) sepia(90%) saturate(3000%) hue-rotate(300deg) brightness(0.7)',
                pointerEvents: 'none', opacity: 0.85,
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}
// ── Y Building First Floor SVG Plan ─────────────────────────────────────────
// Coordinates measured directly from the reference image (firstfloor.png)
function YBuildingFloorPlan({ floor, hoveredRoom, onRoomClick, accentColor }) {
  if (!floor) return null;
  const ACCENT = accentColor || FACILITY_COLOR;
  const rooms = floor.rooms;
  const byId = Object.fromEntries(rooms.map(r => [r.id, r]));

  function Room({ id, x, y, w, h, rx = 6, labelLines }) {
    const room = byId[id];
    if (!room) return null;
    const isHovered = hoveredRoom === id;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const lines = labelLines || [room.label];
    const lineH = 10;
    const totalTextH = lines.length * lineH;
    return (
      <g onClick={() => onRoomClick(id)} style={{ cursor: 'pointer' }}>
        <rect x={x} y={y} width={w} height={h} rx={rx}
          fill={isHovered ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.86)'}
          stroke={isHovered ? '#fff' : 'rgba(255,255,255,0.38)'}
          strokeWidth={isHovered ? 2.5 : 1.2}
          style={{ transition: 'fill 0.15s' }} />
        {lines.map((line, i) => (
          <text key={i} x={cx} y={cy - totalTextH / 2 + i * lineH + lineH * 0.82}
            textAnchor="middle"
            fill={isHovered ? ACCENT : '#1a1a1a'}
            fontSize="11" fontWeight="700" fontFamily="'Aventa', sans-serif"
            style={{ pointerEvents: 'none', transition: 'fill 0.15s' }}
          >{line}</text>
        ))}
      </g>
    );
  }

  /*
   MEASURED FROM REFERENCE IMAGE (firstfloor.png ~780×555px):
   
   The image is landscape. Key proportional positions (as % of image w/h):
   
   Rotunda circle:  centre ~(50%, 64%),  radius ~9% of width  → cx=390 cy=355 r=70 on 780×555
   
   TOP WING (exits rotunda straight up, columns aligned ~40–67% x):
     SMO:       left~38%, top~3%,   right~50%, bot~22%   → x=296 y=14  w=94  h=106
     VCAA:      left~38%, top~25%,  right~50%, bot~49%   → x=296 y=136 w=94  h=132
     Registrar: left~51%, top~3%,   right~67%, bot~49%   → x=400 y=14  w=124 h=254

   LEFT WING (exits rotunda to the left, rows at ~54–70% y):
     OC:        left~1%,  top~54%,  right~20%, bot~70%   → x=8   y=300 w=148 h=88
     MCR:       left~21%, top~54%,  right~33%, bot~70%   → x=162 y=300 w=94  h=88
     VCAF:      left~1%,  top~71%,  right~33%, bot~83%   → x=8   y=394 w=248 h=68

   BOTTOM-RIGHT WING (exits rotunda bottom-right ~51–100% x, 58–100% y):
     Cashier:   left~61%, top~59%,  right~75%, bot~72%   → x=474 y=328 w=110 h=72
     QuAMSO:    left~77%, top~59%,  right~100%,bot~100%  → x=600 y=328 w=172 h=220
     VCPD:      left~61%, top~73%,  right~75%, bot~100%  → x=474 y=408 w=110 h=136
  */

  // Canvas
  const VBW = 780, VBH = 555;

  // Rotunda
  const RX = 390, RY = 355, RR = 68;

  // TOP WING
  const SMO_X=260, SMO_Y=14,  SMO_W=94,  SMO_H=108;
  const VCA_X=260, VCA_Y=130, VCA_W=94,  VCA_H=134;
  const REG_X=364, REG_Y=14,  REG_W=124, REG_H=250;

  // WING_Y — shared top Y for both left and right wing top rows
  const WING_Y = 298;

  // LEFT WING
  const OC_X=8,   OC_Y=WING_Y, OC_W=148, OC_H=90;
  const MC_X=162, MC_Y=WING_Y, MC_W=94,  MC_H=90;
  const VF_X=8,   VF_Y=WING_Y+OC_H+6, VF_W=248, VF_H=70;

  // BOTTOM-RIGHT WING — top row at same WING_Y as left wing
  const CA_X=474, CA_Y=WING_Y, CA_W=112, CA_H=74;
  const QU_X=594, QU_Y=WING_Y, QU_W=172, QU_H=WING_Y+OC_H+6+VF_H - WING_Y; // matches VCAF bottom
  const VP_X=474, VP_Y=WING_Y+CA_H+6, VP_W=112, VP_H=QU_H-(CA_H+6);

  // Corridors
  const topCorrX = 330, topCorrY = VCA_Y + VCA_H + 2, topCorrW = 34, topCorrH = RY - RR - topCorrY;
  const lCorrX = MC_X + MC_W, lCorrY = 328, lCorrW = RX - RR - lCorrX, lCorrH = 34;
  const brCorrX = RX + RR, brCorrY = RY, brCorrW = CA_X - (RX + RR), brCorrH = 32;

  return (
    <svg viewBox={`0 0 ${VBW} ${VBH}`}
      style={{ width: '100%', height: 'auto', maxHeight: '100%' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Corridors */}
      <rect x={topCorrX} y={topCorrY} width={topCorrW} height={topCorrH} fill="rgba(255,255,255,0.10)" />
      <rect x={lCorrX} y={lCorrY} width={lCorrW} height={lCorrH} fill="rgba(255,255,255,0.10)" />
      <rect x={brCorrX} y={brCorrY} width={brCorrW} height={brCorrH} fill="rgba(255,255,255,0.10)" />

      {/* Rotunda */}
      <circle cx={RX} cy={RY} r={RR}
        fill="rgba(255,255,255,0.13)" stroke="rgba(255,255,255,0.38)" strokeWidth="2" />
      <text x={RX} y={RY} textAnchor="middle" dominantBaseline="middle"
        fill="rgba(255,255,255,0.55)" fontSize="9" fontFamily="'Aventa', sans-serif"
        fontWeight="700" letterSpacing="1.2">LOBBY</text>

      {/* TOP WING */}
      <Room id="y-smo"       x={SMO_X} y={SMO_Y} w={SMO_W} h={SMO_H} labelLines={['Supply Mgmt', 'Office (SMO)']} />
      <Room id="y-vcaa"      x={VCA_X} y={VCA_Y} w={VCA_W} h={VCA_H} labelLines={['Office of the VC', 'for Academic', 'Affairs']} />
      <Room id="y-registrar" x={REG_X} y={REG_Y} w={REG_W} h={REG_H} labelLines={['Office of the', 'University', 'Registrar']} />

      {/* LEFT WING */}
      <Room id="y-oc"       x={OC_X} y={OC_Y} w={OC_W} h={OC_H} labelLines={['Office of the', 'Chancellor (Old)']} />
      <Room id="y-confroom" x={MC_X} y={MC_Y} w={MC_W} h={MC_H} labelLines={['Mini Conference', 'Room']} />
      <Room id="y-vcaf"     x={VF_X} y={VF_Y} w={VF_W} h={VF_H} labelLines={['Office of the Vice Chancellor', 'for Administration and Finance']} />

      {/* BOTTOM-RIGHT WING */}
      <Room id="y-cashier" x={CA_X} y={CA_Y} w={CA_W} h={CA_H} labelLines={['Cashier']} />
      <Room id="y-quamso"  x={QU_X} y={QU_Y} w={QU_W} h={QU_H} labelLines={['Quality Assurance', 'Management', 'Services Office']} />
      <Room id="y-vcpd"    x={VP_X} y={VP_Y} w={VP_W} h={VP_H} labelLines={['Office of the VC', 'for Planning &', 'Development']} />
    </svg>
  );
}