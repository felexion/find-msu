import React, { useState, useEffect } from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import MapView from './MapView';

// Suppress THREE.Clock deprecation warning from @shadergradient internals
const _origWarn = console.warn.bind(console);
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('THREE.Clock')) return;
  _origWarn(...args);
};

// IMPORT ASSETS
import logo from './images/find_styled.png';
import regionPinIcon from './images/region-pin-alt.png';
import gpsNavigationIcon from './images/gps-navigation.png';

export default function App() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isBlurringOut, setIsBlurringOut] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [homeSearch, setHomeSearch] = useState('');
  const [homeResults, setHomeResults] = useState([]);
  const [mapTargetId, setMapTargetId] = useState(null);

  // All searchable items — kept in sync with MapView data
  const ALL_ITEMS = [
    { id: 1,   name: 'College of Agriculture',                           type: 'College'  },
    { id: 2,   name: 'College of Engineering',                           type: 'College'  },
    { id: 3,   name: 'College of Education',                             type: 'College'  },
    { id: 4,   name: 'College of Fisheries and Aquatic Sciences',        type: 'College'  },
    { id: 5,   name: 'College of Business Administration & Accountancy', type: 'College'  },
    { id: 6,   name: 'College of Social Sciences and Humanities',        type: 'College'  },
    { id: 7,   name: 'College of Natural Sciences and Mathematics',      type: 'College'  },
    { id: 8,   name: 'Senior Highschool Department',                     type: 'College'  },
    { id: 101, name: 'Gymnasium',                                        type: 'Facility' },
    { id: 102, name: "Administration Building (Y Building)",             type: 'Facility' },
    { id: 103, name: 'Library',                                          type: 'Facility' },
    { id: 104, name: 'Office of Student Affairs',                        type: 'Facility' },
    { id: 105, name: 'Laktanan',                                         type: 'Facility' },
    { id: 106, name: 'VLS (Virtual Learning Studio)',                    type: 'Facility' },
  ];

  const COLLEGE_COLOR = '#79095b';
  const FACILITY_COLOR = '#f0ad3e';
  useEffect(() => {
    if (loadingProgress < 100) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const next = prev + Math.floor(Math.random() * 8) + 2;
          return next >= 100 ? 100 : next;
        });
      }, 120);
      return () => clearInterval(interval);
    } else {
      const timeout = setTimeout(() => setIsLoaded(true), 400);
      return () => clearTimeout(timeout);
    }
  }, [loadingProgress]);

  // Update time and date every second
  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();
      
      // Format time (HH:MM AM/PM)
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      setCurrentTime(`${displayHours}:${minutes} ${ampm}`);
      
      // Format date (Mon, May 25 2026)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayName = days[now.getDay()];
      const monthName = months[now.getMonth()];
      const date = now.getDate();
      const year = now.getFullYear();
      setCurrentDate(`${dayName}, ${monthName} ${date} ${year}`);
    };
    
    updateTimeAndDate();
    const interval = setInterval(updateTimeAndDate, 1000);
    return () => clearInterval(interval);
  }, []);

  // Trigger map fade-in after it mounts
  useEffect(() => {
    if (showMap) {
      const timeout = setTimeout(() => setMapVisible(true), 50);
      return () => clearTimeout(timeout);
    } else {
      setMapVisible(false);
    }
  }, [showMap]);

  // Triggered when user clicks anywhere after loading completes
  const handleScreenClick = () => {
    if (isLoaded && !showDashboard) {
      setShowDashboard(true);
    }
  };

  // Handle opening map, optionally with a pre-targeted item
  const openMap = (targetId = null) => {
    setMapTargetId(targetId);
    setIsBlurringOut(true);
    setTimeout(() => setShowMap(true), 500);
  };

  // Handle closing map
  const closeMap = () => {
    setShowMap(false);
    setMapTargetId(null);
    setTimeout(() => setIsBlurringOut(false), 300);
  };

  // Homepage search handlers
  const handleHomeSearch = (e) => {
    const q = e.target.value;
    setHomeSearch(q);
    if (!q.trim()) { setHomeResults([]); return; }
    const lower = q.toLowerCase();
    setHomeResults(ALL_ITEMS.filter(i => i.name.toLowerCase().includes(lower)));
  };

  const handleHomeResultClick = (item) => {
    setHomeSearch('');
    setHomeResults([]);
    openMap(item.id);
  };

  return (
    <div 
      onClick={handleScreenClick}
      className={`relative w-screen h-screen overflow-hidden text-white ${
        isLoaded && !showDashboard ? 'cursor-pointer' : 'cursor-default'
      }`}
      style={{ fontFamily: "'Aventa', sans-serif" }}
    >
      
      {/* TOP LEFT: WiFi Icon and Time */}
      <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
        </svg>
        <span className="text-sm font-light tracking-wide text-white">{currentTime}</span>
      </div>

      {/* TOP RIGHT: Current Date */}
      <div className="absolute top-6 right-6 z-20">
        <p className="text-sm font-light tracking-wide text-white text-right">{currentDate}</p>
      </div>

      {/* FOOTER: Copyright and Credits */}
      <div className="absolute bottom-6 left-0 right-0 z-20 text-center">
        <p className="text-xs font-light tracking-wide text-white/50">© 2026 FIND-MSU All Rights Reserved</p>
        <p className="text-xs font-light tracking-wide text-white/50">MSU-General Santos</p>
      </div>
      
      {/* 3D ANIMATED GRADIENT BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
        <ShaderGradientCanvas style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <ShaderGradient
            animate="on"
            axesHelper="off"
            brightness={1.2}
            cAzimuthAngle={180}
            cDistance={3.6}
            cPolarAngle={90}
            cameraZoom={1}
            color1="#7e125b"
            color2="#eeaa3b"
            color3="#a75f8b"
            destination="onCanvas"
            embedMode="off"
            envPreset="city"
            format="gif"
            fov={45}
            frameRate={10}
            gizmoHelper="hide"
            grain="off"
            lightType="3d"
            pixelDensity={1}
            positionX={-1.4}
            positionY={0}
            positionZ={0}
            range="disabled"
            rangeEnd={40}
            rangeStart={0}
            reflection={0.1}
            rotationX={0}
            rotationY={10}
            rotationZ={50}
            shader="defaults"
            type="plane"
            uAmplitude={1}
            uDensity={1.3}
            uFrequency={5.5}
            uSpeed={0.4}
            uStrength={4}
            uTime={0}
            wireframe={false}
          />
        </ShaderGradientCanvas>
      </div>

      {/* MAP VIEW OVERLAY */}
      {showMap && (
        <div className={`absolute inset-0 z-50 transition-all duration-700 ${
          mapVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          <MapView onClose={closeMap} targetId={mapTargetId} />
        </div>
      )}

      {/* CENTRAL BASE CONTENT INTERFACE LAYER */}
      <div className={`relative z-10 w-full h-full flex flex-col items-center justify-center p-8 bg-black/15 backdrop-blur-xs transition-all duration-500 ${
        isBlurringOut ? 'blur-xl opacity-0 pointer-events-none' : 'blur-none opacity-100'
      }`}>
        
        {/* SHARED MAX-WIDTH BOUNDING BOX FOR PERFECT VERTICAL ALIGNMENT */}
        {/* SHARED MAX-WIDTH BOUNDING BOX FOR PERFECT VERTICAL ALIGNMENT */}
        <div className={`flex flex-col items-center w-full max-w-xl text-center transform transition-all duration-700 ease-in-out pt-20`}>          
          {/* LOGO ELEMENT */}
          <img 
            src={logo} 
            alt="Find Logo" 
            className={`w-96 md:w-[28rem] h-auto object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.4)] transition-all duration-1000 ease-out ${
              showDashboard 
                ? '-translate-y-24 mb-0' 
                : 'translate-y-0 mb-6'
            }`}
          />

          {/* PHASE 1 & 2: LOADING BAR OR PULSING "CLICK TO CONTINUE" */}
          {!showDashboard && (
            <div className="w-full transition-opacity duration-300">
              {!isLoaded ? (
                /* LOADING VIEW */
                <div className="w-64 flex flex-col items-center space-y-2 mx-auto">
                  <div className="w-full h-[4px] bg-white/15 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-white rounded-full kiosk-pulse transition-all duration-200 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-light tracking-widest text-white/40">
                    {loadingProgress}%
                  </span>
                </div>
              ) : (
                /* CLICK ANYWHERE CALL TO ACTION */
                <div className="kiosk-pulse py-1">
                  <p className="text-base font-light tracking-[0.2em] text-amber-400 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    Click Anywhere to Continue
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PHASE 3: THE DASHBOARD HUB */}
          <div className={`w-full flex flex-col items-center space-y-6 -mt-20 transition-all duration-700 delay-100 ${
            showDashboard 
              ? 'opacity-100 translate-y-0 pointer-events-auto' 
              : 'opacity-0 translate-y-10 pointer-events-none absolute'
          }`}>
            
            {/* 1. CAMPUS SEARCH BAR */}
            <div className="relative w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <span className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-10">
                <svg className="w-5 h-5 text-purple-900/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search the Campus..."
                value={homeSearch}
                onChange={handleHomeSearch}
                className="w-full py-4 pl-14 pr-6 bg-white text-purple-950 font-light placeholder-purple-900/60 rounded-full text-lg focus:outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
              />
              {/* Results dropdown */}
              {homeResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-[60] border border-gray-100">
                  {homeResults.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleHomeResultClick(item)}
                      className="w-full px-6 py-3.5 text-left hover:bg-purple-50 active:bg-purple-100 transition-colors duration-150 border-b border-gray-100 last:border-b-0 focus:outline-none flex items-center gap-3"
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

            {/* 2 & 3. BUTTON ROW - VIEW CAMPUS & QUICK NAVIGATION */}
            <div className="flex items-center justify-center gap-8">
              {/* VIEW CAMPUS BUTTON */}
              <button
                className="group flex flex-col items-center space-y-2.5 focus:outline-none"
                onClick={(e) => { e.stopPropagation(); openMap(); }}
              >
                <div className="w-40 aspect-square flex items-center justify-center bg-white/15 border border-white/10 hover:bg-white/20 active:scale-95 rounded-2xl transition duration-200 backdrop-blur-md shadow-lg p-8">
                  <img
                    src={regionPinIcon}
                    alt="View Campus"
                    className="w-full h-full object-contain invert brightness-200 group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="text-sm font-light tracking-wide text-white/90">View Campus</span>
              </button>

              {/* QUICK NAVIGATION BUTTON */}
              <button
                className="group flex flex-col items-center space-y-2.5 focus:outline-none"
                onClick={(e) => { e.stopPropagation(); }}
              >
                <div className="w-40 aspect-square flex items-center justify-center bg-white/15 border border-white/10 hover:bg-white/20 active:scale-95 rounded-2xl transition duration-200 backdrop-blur-md shadow-lg p-8">
                  <img
                    src={gpsNavigationIcon}
                    alt="Quick Navigation"
                    className="w-full h-full object-contain invert brightness-200 group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="text-sm font-light tracking-wide text-white/90">Quick Navigation</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}