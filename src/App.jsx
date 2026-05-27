import React, { useState, useEffect } from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import MapView from './MapView';
import QRCode from 'react-qr-code';

// LEAFLET
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Suppress THREE warnings
const _origWarn = console.warn.bind(console);
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('THREE.Clock')) return;
  _origWarn(...args);
};

// ASSETS
import logo from './images/find_styled.png';
import regionPinIcon from './images/region-pin-alt.png';
import gpsNavigationIcon from './images/gps-navigation.png';

const ORIGIN_COORDS = [6.069115927450321, 125.12674627794516];

const DESTINATION_COORDS = {
  1: [6.070480988321281, 125.12579094360856], 2: [6.064088002693254, 125.12683859876006],
  3: [6.067896313435069, 125.12825013296172], 4: [6.0644563163346765, 125.13004240242738],
  5: [6.06423760601592, 125.12834992857071], 6: [6.06774358929378, 125.12610972165167],
  7: [6.069067815786466, 125.12589392474057], 8: [6.068557633415351, 125.12830040933797],
  101: [6.06702148462265, 125.12394614511116], 102: [6.065520188853716, 125.12838202769997],
  103: [6.066725955964607, 125.12799695772719], 104: [6.069841842030108, 124.12412084582711], // Fixed longitude typo if applicable
  105: [6.066323469760834, 125.12839000321954], 106: [6.067222222222222, 125.12763888888888],
};

const ALL_ITEMS = [
  { id: 1,   name: 'College of Agriculture',                        type: 'College'  },
  { id: 2,   name: 'College of Engineering',                        type: 'College'  },
  { id: 3,   name: 'College of Education',                             type: 'College'  },
  { id: 4,   name: 'College of Fisheries and Aquatic Sciences',        type: 'College'  },
  { id: 5,   name: 'College of Business Administration & Accountancy', type: 'College'  },
  { id: 6,   name: 'College of Social Sciences and Humanities',        type: 'College'  },
  { id: 7,   name: 'College of Natural Sciences and Mathematics',      type: 'College'  },
  { id: 8,   name: 'Senior Highschool Department',                     type: 'College'  },
  { id: 101, name: 'Gymnasium',                                         type: 'Facility' },
  { id: 102, name: "Administration Building (Y Building)",             type: 'Facility' },
  { id: 103, name: 'Library',                                          type: 'Facility' },
  { id: 104, name: 'Office of Student Affairs',                        type: 'Facility' },
  { id: 105, name: 'Laktanan',                                         type: 'Facility' },
  { id: 106, name: 'VLS (Virtual Learning Studio)',                    type: 'Facility' },
];

const createNavPin = (color) => L.divIcon({
  className: 'custom-nav-pin',
  html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 15px rgba(0,0,0,0.4);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const QuickNavRouteMap = ({ origin, dest, routeCoords }) => {
  const MapFixer = () => {
    const map = useMap();
    
    useEffect(() => { 
      setTimeout(() => map.invalidateSize(), 500); 
    }, [map]);

    useEffect(() => {
      if (routeCoords && routeCoords.length > 0) {
        map.fitBounds(L.latLngBounds(routeCoords), { padding: [80, 80] });
      }
    }, [routeCoords, map]);

    return null;
  };

  const currentBounds = routeCoords.length > 0 ? routeCoords : [origin, dest];

  return (
    <MapContainer bounds={L.latLngBounds(currentBounds)} boundsOptions={{ padding: [80, 80] }} style={{ width: '100%', height: '100%' }} zoomControl={false}>
      <MapFixer />
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      <Marker position={origin} icon={createNavPin('#79095b')} />
      <Marker position={dest} icon={createNavPin('#f0ad3e')} />
      {routeCoords.length > 0 && (
        <Polyline positions={routeCoords} color="#f0ad3e" weight={6} className="animate-route-line" />
      )}
    </MapContainer>
  );
};

export default function App() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isBlurringOut, setIsBlurringOut] = useState(false);
  
  const [showMap, setShowMap] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [showQuickNav, setShowQuickNav] = useState(false);
  const [selectedQuickNav, setSelectedQuickNav] = useState(null);
  
  const [routeCoords, setRouteCoords] = useState([]);
  const [directions, setDirections] = useState([]);

  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [homeSearch, setHomeSearch] = useState('');
  const [homeResults, setHomeResults] = useState([]);

  // LOADING LOGIC
  useEffect(() => {
    if (loadingProgress < 100) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => (prev >= 100 ? 100 : prev + Math.floor(Math.random() * 5) + 2));
      }, 80);
      return () => clearInterval(interval);
    } else {
      setTimeout(() => setIsLoaded(true), 500);
    }
  }, [loadingProgress]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch true routing data with descending countdown distance logic
  useEffect(() => {
    if (!selectedQuickNav) return;
    const dest = DESTINATION_COORDS[selectedQuickNav.id];

    fetch(`https://router.project-osrm.org/route/v1/walking/${ORIGIN_COORDS[1]},${ORIGIN_COORDS[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson&steps=true`)
      .then((res) => res.json())
      .then((data) => {
        if (data.routes && data.routes[0]) {
          const route = data.routes[0];
          
          // 1. Process coordinates for Leaflet map display
          const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
          setRouteCoords(coords);

          // 2. Set up initial remaining distance accumulator
          let runningRemainingDistance = route.legs[0].distance;

          // 3. Map steps and decrement total distance step-by-step
          const stepsArray = route.legs[0].steps.map((step) => {
            const roadName = step.name ? step.name : "Campus Walkway";
            const type = step.maneuver.type;
            const modifier = step.maneuver.modifier || "";
            
            let descriptiveText = `Follow the path along ${roadName}`;

            if (type === 'depart') {
              descriptiveText = `Start walking along ${roadName}`;
            } else if (type === 'arrive') {
              descriptiveText = `Arrive at your destination: ${selectedQuickNav.name}`;
            } else if (type === 'turn') {
              descriptiveText = `Turn ${modifier} onto ${roadName}`;
            } else if (type === 'new name') {
              descriptiveText = `Continue onto ${roadName}`;
            }

            descriptiveText = descriptiveText.replace(/\s+/g, ' ').trim();

            // Calculate rounded value for this specific checkpoint step
            const currentDistanceLabel = type === 'arrive' || runningRemainingDistance <= 5
              ? "Arrived" 
              : `${Math.round(runningRemainingDistance)}m left`;

            // Subtract current step's distance for the next row item calculation
            runningRemainingDistance -= step.distance;

            return {
              text: descriptiveText,
              dist: currentDistanceLabel
            };
          });

          setDirections(stepsArray);
        } else {
          setRouteCoords([ORIGIN_COORDS, dest]);
          setDirections([{ text: `Walk directly towards ${selectedQuickNav.name}`, dist: "Proceed" }]);
        }
      })
      .catch(() => {
        setRouteCoords([ORIGIN_COORDS, dest]);
        setDirections([{ text: `Head directly towards ${selectedQuickNav.name}`, dist: "Proceed" }]);
      });
  }, [selectedQuickNav]);

  const getGoogleMapsLink = (item) => {
    if (!item || !DESTINATION_COORDS[item.id]) return '';
    const dest = DESTINATION_COORDS[item.id];
    return `https://maps.google.com/?saddr=${ORIGIN_COORDS[0]},${ORIGIN_COORDS[1]}&daddr=${dest[0]},${dest[1]}&dirflg=w`;
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes routeMarch { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-slide-in-right { animation: slideInRight 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        .animate-route-line { stroke-dasharray: 12; animation: routeMarch 1s linear infinite; stroke-linecap: round; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>

      <div 
        onClick={() => isLoaded && !showDashboard && setShowDashboard(true)} 
        className="relative w-screen h-screen overflow-hidden text-white bg-black cursor-pointer"
      >
        
        {/* BACKGROUND SHADER */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <ShaderGradientCanvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <ShaderGradient
              animate="on" brightness={1.1} color1="#7e125b" color2="#eeaa3b" color3="#a75f8b"
              frameRate={60} grain="off" pixelDensity={2} rotationZ={50} uAmplitude={1} uDensity={1.2} 
              uFrequency={5.5} uSpeed={0.3} uStrength={4} type="plane"
            />
          </ShaderGradientCanvas>
        </div>

        {/* MAIN CENTERED UI */}
        <div className={`relative z-10 w-full h-full flex flex-col items-center justify-center p-8 transition-all duration-1000 ${isBlurringOut ? 'blur-3xl opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
          
          <img src={logo} alt="Find Logo" className={`w-96 md:w-[28rem] h-auto transition-all duration-1000 ${showDashboard ? 'mb-12' : 'mb-8'}`} />

          {/* LOADING STATE */}
          {!showDashboard && (
            <div className="flex flex-col items-center w-full max-w-xs">
              {!isLoaded ? (
                <div className="w-full flex flex-col items-center">
                   <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4 shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-[#f0ad3e] to-white transition-all duration-300 ease-out" 
                        style={{ width: `${loadingProgress}%` }} 
                      />
                   </div>
                   <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#f0ad3e]">{loadingProgress}%</span>
                </div>
              ) : (
                <p className="animate-pulse text-xs font-black tracking-[0.3em] uppercase text-white/60">Click Anywhere to Start</p>
              )}
            </div>
          )}

          {/* DASHBOARD SEARCH & BUTTONS */}
          {showDashboard && (
            <div className="w-full max-w-xl flex flex-col items-center space-y-12 animate-fade-in-up">
              <div className="relative w-full">
                <input
                  type="text" placeholder="Search buildings, colleges..." value={homeSearch} 
                  onChange={(e) => {
                    setHomeSearch(e.target.value);
                    setHomeResults(e.target.value.trim() ? ALL_ITEMS.filter(i => i.name.toLowerCase().includes(e.target.value.toLowerCase())) : []);
                  }}
                  className="w-full py-5 px-12 bg-white text-purple-950 font-bold rounded-full text-lg shadow-2xl focus:outline-none"
                />
                {homeResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl overflow-hidden z-[60] text-black">
                    {homeResults.map(item => (
                      <button key={item.id} onClick={() => { setSelectedQuickNav(item); setIsBlurringOut(true); setTimeout(() => { setShowMap(true); setMapVisible(true); }, 500); }} 
                        className="w-full px-8 py-4 text-left hover:bg-purple-50 border-b border-gray-100 flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.type === 'Facility' ? '#f0ad3e' : '#79095b' }} />
                        <p className="font-bold">{item.name}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-10">
                <button onClick={() => { setIsBlurringOut(true); setTimeout(() => { setShowMap(true); setMapVisible(true); }, 500); }} className="flex flex-col items-center gap-4 group">
                  <div className="w-36 aspect-square bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-9 group-hover:bg-white/20 transition-all active:scale-90">
                    <img src={regionPinIcon} className="w-full h-full object-contain invert" alt="Map" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase opacity-50">View Campus</span>
                </button>
                <button onClick={() => setShowQuickNav(true)} className="flex flex-col items-center gap-4 group">
                  <div className="w-36 aspect-square bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-9 group-hover:bg-white/20 transition-all active:scale-90">
                    <img src={gpsNavigationIcon} className="w-full h-full object-contain invert" alt="Nav" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest uppercase opacity-50">Quick Navigation</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FULL MAP MODAL */}
        {showMap && (
          <div className={`fixed inset-0 z-[100] bg-white transition-opacity duration-700 ${mapVisible ? 'opacity-100' : 'opacity-0'}`}>
            <MapView onClose={() => { setShowMap(false); setMapVisible(false); setIsBlurringOut(false); setSelectedQuickNav(null); }} />
          </div>
        )}

        {/* QUICK NAVIGATION MODAL */}
        {showQuickNav && (
          <div className="fixed inset-0 z-[200] bg-[#79095b] flex animate-fade-in-up">
            {!selectedQuickNav ? (
              <div className="w-full p-16 overflow-y-auto">
                <div className="flex justify-between items-end mb-16">
                  <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Select your destination</h1>
                  <button onClick={() => setShowQuickNav(false)} className="bg-white/10 px-8 py-3 rounded-full font-bold uppercase text-[10px]">Back</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {ALL_ITEMS.map((item) => (
                    <button key={item.id} onClick={() => setSelectedQuickNav(item)} 
                      className="bg-white/5 border border-white/10 rounded-[2rem] p-8 text-left hover:bg-white/10 transition-all">
                      <span className="text-[9px] font-black text-[#f0ad3e] uppercase mb-1 block tracking-widest">{item.type}</span>
                      <h3 className="text-xl font-bold">{item.name}</h3>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full flex h-full">
                {/* MAP AREA */}
                <div className="flex-1 relative bg-[#e5e7eb]">
                  <button onClick={() => { setSelectedQuickNav(null); setRouteCoords([]); setDirections([]); }} className="absolute top-10 left-10 z-[1000] bg-[#79095b] px-6 py-3 rounded-xl font-black uppercase text-[10px]">Change Destination</button>
                  <QuickNavRouteMap origin={ORIGIN_COORDS} dest={DESTINATION_COORDS[selectedQuickNav.id]} routeCoords={routeCoords} />
                </div>

                {/* DIRECTIONS PANEL */}
                <div className="w-[480px] bg-[#79095b] flex flex-col p-12 border-l border-white/5 animate-slide-in-right">
                  <p className="text-[#f0ad3e] text-[10px] font-black uppercase mb-3 tracking-[0.2em]">Heading To</p>
                  <h2 className="text-4xl font-black uppercase italic mb-10 leading-tight">{selectedQuickNav.name}</h2>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-5">
                    {directions.map((step, idx) => (
                      <div key={idx} className="bg-[#79095b] p-6 rounded-[2rem] flex items-center gap-6 border border-white/5">
                        <div className="w-12 h-12 rounded-full bg-[#f0ad3e] text-black flex items-center justify-center font-black text-lg flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-white text-lg font-bold leading-snug">{step.text}</p>
                          <p className="text-[#f0ad3e] text-sm font-black mt-1 uppercase tracking-wider">{step.dist}</p>
                        </div>
                      </div>
                    ))}

                    <div className="mt-10 pt-10 border-t border-white/10 flex flex-col items-center">
                        <div className="bg-white p-6 rounded-[3rem] shadow-2xl mb-8">
                          <QRCode value={getGoogleMapsLink(selectedQuickNav)} size={180} />
                        </div>
                        <p className="text-[11px] text-white/30 text-center mb-10 uppercase font-black tracking-widest px-8 leading-relaxed">
                            Scan to continue navigation on your mobile phone
                        </p>
                        <a href={getGoogleMapsLink(selectedQuickNav)} target="_blank" rel="noreferrer" 
                           className="w-full bg-[#f0ad3e] text-black py-6 rounded-3xl font-black text-center text-sm uppercase tracking-widest hover:bg-white transition flex items-center justify-center gap-3">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                           Start Navigation
                        </a>
                        <button onClick={() => { setShowQuickNav(false); setSelectedQuickNav(null); setRouteCoords([]); setDirections([]); }} className="mt-8 text-white/20 text-[10px] font-black uppercase tracking-widest hover:text-white transition">Exit Navigation</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TOP BAR HUD */}
        <div className="absolute top-8 left-8 z-20 flex items-center gap-3 opacity-40">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-black tracking-widest uppercase">{currentTime}</span>
        </div>
        <div className="absolute top-8 right-8 z-20 opacity-40">
          <span className="text-[10px] font-black tracking-widest uppercase">{currentDate}</span>
        </div>

      </div>
    </>
  );
}