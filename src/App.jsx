import React, { useState, useEffect } from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import MapView from './MapView';

// IMPORT ASSETS
import logo from './images/find_styled.png';
import coworkingIcon from './images/coworking.png';
import wifiIcon from './images/router-wifi-alt.png';
import calendarIcon from './images/calendar-clock.png';
import gpsIcon from './images/gps-navigation.png';

export default function App() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isBlurringOut, setIsBlurringOut] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [mapFeature, setMapFeature] = useState(null);

  // Smooth loading bar simulation (0 to 100%)
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

  // Handle opening map for specific features
  const openMap = (feature) => {
    setMapFeature(feature);
    // Step 1: Start blurring out dashboard (500ms animation)
    setIsBlurringOut(true);
    // Step 2: After blur animation completes, show map (300ms delay + 200ms for safety)
    setTimeout(() => {
      setShowMap(true);
    }, 500);
  };

  const closeMap = () => {
    // Step 1: Hide map
    setShowMap(false);
    // Step 2: After map is gone, unblur dashboard
    setTimeout(() => {
      setIsBlurringOut(false);
      setMapFeature(null);
    }, 300);
  };

  return (
    <div 
      onClick={handleScreenClick}
      className={`relative w-screen h-screen overflow-hidden text-white ${
        isLoaded && !showDashboard ? 'cursor-pointer' : 'cursor-default'
      }`}
      style={{ fontFamily: "'Aventa', sans-serif" }}
    >
      
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
          <MapView onClose={closeMap} selectedFeature={mapFeature} />
        </div>
      )}

      {/* CENTRAL BASE CONTENT INTERFACE LAYER */}
      <div className={`relative z-10 w-full h-full flex flex-col items-center justify-center p-8 bg-black/15 backdrop-blur-xs transition-all duration-500 ${
        isBlurringOut ? 'blur-xl opacity-0 pointer-events-none' : 'blur-none opacity-100'
      }`}>
        
        {/* SHARED MAX-WIDTH BOUNDING BOX FOR PERFECT VERTICAL ALIGNMENT */}
        <div className={`flex flex-col items-center w-full max-w-xl text-center transform transition-all duration-700 ease-in-out`}>
          
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
            <div className="relative w-full shadow-2xl">
              <span className="absolute inset-y-0 left-5 flex items-center pr-2">
                <svg className="w-5 h-5 text-purple-900/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                type="text" 
                placeholder="Search the Campus..." 
                className="w-full py-4 pl-14 pr-6 bg-white text-purple-950 font-light placeholder-purple-900/60 rounded-full text-lg focus:outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* 2. MATCHING GRID BLOCK (Inherits max-w-xl directly from parent wrapper) */}
            <div className="grid grid-cols-4 gap-4 w-full">
              
              {/* BUTTON 1 - ROOM AVAILABILITY */}
              <button 
                className="group flex flex-col items-center space-y-2.5 focus:outline-none"
                onClick={(e) => { e.stopPropagation(); openMap('Room Availability'); }}
              >
                {/* p-6 makes the inner graphic look smaller and crisp inside the square */}
                <div className="w-full aspect-square flex items-center justify-center bg-white/15 border border-white/10 hover:bg-white/20 active:scale-95 rounded-2xl transition duration-200 backdrop-blur-md shadow-lg p-6">
                  <img 
                    src={coworkingIcon} 
                    alt="Room Availability"
                    className="w-full h-full object-contain invert brightness-200 group-hover:scale-105 transition-transform" 
                  />
                </div>
                <span className="text-[11px] font-light tracking-wide text-white/90">Room Availability</span>
              </button>

              {/* BUTTON 2 - TEST WI-FI */}
              <button 
                className="group flex flex-col items-center space-y-2.5 focus:outline-none"
                onClick={(e) => { e.stopPropagation(); openMap('Wi-Fi Hotspots'); }}
              >
                <div className="w-full aspect-square flex items-center justify-center bg-white/15 border border-white/10 hover:bg-white/20 active:scale-95 rounded-2xl transition duration-200 backdrop-blur-md shadow-lg p-6">
                  <img 
                    src={wifiIcon} 
                    alt="Test Wi-Fi"
                    className="w-full h-full object-contain invert brightness-200 group-hover:scale-105 transition-transform" 
                  />
                </div>
                <span className="text-[11px] font-light tracking-wide text-white/90">Test Wi-Fi</span>
              </button>

              {/* BUTTON 3 - ROOM SCHEDULES */}
              <button 
                className="group flex flex-col items-center space-y-2.5 focus:outline-none"
                onClick={(e) => { e.stopPropagation(); openMap('Room Schedules'); }}
              >
                <div className="w-full aspect-square flex items-center justify-center bg-white/15 border border-white/10 hover:bg-white/20 active:scale-95 rounded-2xl transition duration-200 backdrop-blur-md shadow-lg p-6">
                  <img 
                    src={calendarIcon} 
                    alt="Room Schedules"
                    className="w-full h-full object-contain invert brightness-200 group-hover:scale-105 transition-transform" 
                  />
                </div>
                <span className="text-[11px] font-light tracking-wide text-white/90">Room Schedules</span>
              </button>

              {/* BUTTON 4 - NAVIGATION */}
              <button 
                className="group flex flex-col items-center space-y-2.5 focus:outline-none"
                onClick={(e) => { e.stopPropagation(); openMap('Campus Navigation'); }}
              >
                <div className="w-full aspect-square flex items-center justify-center bg-white/15 border border-white/10 hover:bg-white/20 active:scale-95 rounded-2xl transition duration-200 backdrop-blur-md shadow-lg p-6">
                  <img 
                    src={gpsIcon} 
                    alt="Shortest Route"
                    className="w-full h-full object-contain invert brightness-200 group-hover:scale-105 transition-transform" 
                  />
                </div>
                <span className="text-[11px] font-light tracking-wide text-white/90">Navigate Campus</span>
              </button>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}