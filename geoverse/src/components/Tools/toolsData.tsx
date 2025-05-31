import { Feature } from "@/types/feature";

const featuresData: Feature[] = [
  {
    id: 1,
    icon: (
      <svg width="40" height="41" viewBox="0 0 40 41" className="fill-current">
        {/* Ground Layer */}
        <path
          d="M2 20 Q10 15, 20 18 T38 20"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Electrodes */}
        <circle cx="5" cy="19" r="2" fill="currentColor" />
        <circle cx="15" cy="17" r="2" fill="currentColor" />
        <circle cx="25" cy="19" r="2" fill="currentColor" />
        <circle cx="35" cy="20" r="2" fill="currentColor" />
    
        {/* Depth Measurement Waves */}
        <path
          d="M5 19 Q10 25, 15 22 T25 26 T35 24"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="4,2"
        />
        
        {/* Subsurface Layers */}
        <path
          d="M2 30 Q10 28, 20 32 T38 30"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M2 36 Q10 34, 20 37 T38 36"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          opacity="0.5"
        />
        
        {/* Ground Line */}
        <line x1="2" y1="38" x2="38" y2="38" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    title: "Resistivity Tomography",
    paragraph:
      "This Resistivity Tomography technique that maps subsurface structures by measuring electrical resistivity variations. It helps in groundwater detection, mineral exploration, and environmental assessments.",
  },
  {
    id: 2,
    icon: (
      <svg width="40" height="41" viewBox="0 0 40 41" className="fill-current">
        {/* Ground / Terrain Line */}
        <path
          d="M2 30 Q10 25, 20 28 T38 30"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Gravitational Field Arrows (indicating downward force) */}
        <line x1="10" y1="10" x2="10" y2="20" stroke="currentColor" strokeWidth="2"/>
        <line x1="20" y1="5" x2="20" y2="18" stroke="currentColor" strokeWidth="2"/>
        <line x1="30" y1="12" x2="30" y2="22" stroke="currentColor" strokeWidth="2"/>
    
        {/* Regional Anomaly Curve (smooth trend) */}
        <path
          d="M2 20 Q10 15, 20 22 T38 18"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          opacity="0.7"
        />
    
        {/* Residual Anomalies (localized gravity variations) */}
        <circle cx="8" cy="22" r="2" fill="currentColor" />
        <circle cx="22" cy="24" r="2" fill="currentColor" />
        <circle cx="35" cy="20" r="2" fill="currentColor" />
    
        {/* Ground Base Line */}
        <line x1="2" y1="38" x2="38" y2="38" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    title: "Gravity Anomaly",
    paragraph:
      "The Gravity Anomaly Analysis is used to study subsurface density variations by measuring gravitational field changes. It helps in identifying geological structures, mineral deposits, and tectonic features.",
  },
  {
    id: 3,
    icon: (
      <svg width="40" height="41" viewBox="0 0 40 41" className="fill-current">
        {/* Ground Surface Line */}
        <line x1="2" y1="8" x2="38" y2="8" stroke="currentColor" strokeWidth="2" />
    
        {/* P-Wave (Compressional wave - represented as vertical lines) */}
        <line x1="6" y1="10" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
        <line x1="12" y1="10" x2="12" y2="18" stroke="currentColor" strokeWidth="2"/>
        <line x1="18" y1="10" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
        <line x1="24" y1="10" x2="24" y2="18" stroke="currentColor" strokeWidth="2"/>
        <line x1="30" y1="10" x2="30" y2="18" stroke="currentColor" strokeWidth="2"/>
    
        {/* S-Wave (Shear wave - represented as a sine wave pattern) */}
        <path
          d="M2 25 Q6 20, 10 25 T18 25 T26 25 T34 25"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
    
        {/* Seismic Source (Wave Emission Point) */}
        <circle cx="20" cy="35" r="3" fill="currentColor" />
    
        {/* Propagation Arrows */}
        <line x1="20" y1="32" x2="10" y2="20" stroke="currentColor" strokeWidth="2"/>
        <line x1="20" y1="32" x2="30" y2="20" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    title: "Seismic Tomography",
    paragraph:
      "The Seismic Tomography is a technique that maps subsurface structures by analyzing P-wave and S-wave travel times. It helps in Rock studies, resource exploration, and crustal investigations.",
  },
  {
    id: 4,
    icon: (
      <svg width="40" height="41" viewBox="0 0 40 41" className="fill-current">
        {/* Earth Representation */}
        <circle cx="10" cy="30" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
        
        {/* Satellite (Main Body) */}
        <rect x="25" y="10" width="6" height="6" fill="currentColor" />
        
        {/* Satellite Solar Panels */}
        <rect x="20" y="8" width="4" height="10" fill="currentColor" />
        <rect x="31" y="8" width="4" height="10" fill="currentColor" />
        
        {/* Signal Waves (Representing Remote Sensing Data Transmission) */}
        <path d="M15 25 Q20 20, 25 15" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M15 28 Q22 22, 28 17" stroke="currentColor" strokeWidth="2" fill="none" />
        
        {/* Satellite Directional Line */}
        <line x1="28" y1="13" x2="18" y2="23" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    title: "Remote Sensing",
    paragraph:
      "Remote Sensing utilizes satellite imagery and aerial data to analyze Earth's surface for geological, environmental, and resource exploration. It helps in monitoring land use, detecting mineral deposits, and assessing climate change impacts.",
  },
  {
    id: 5,
    icon: (
      <svg width="40" height="41" viewBox="0 0 40 41" className="fill-current">
        {/* Ground Layer */}
        <rect x="5" y="30" width="30" height="6" fill="currentColor" opacity="0.5" />
    
        {/* Radar Waves (Curved Lines) */}
        <path d="M10 28 Q20 18, 30 28" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M12 26 Q20 16, 28 26" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M14 24 Q20 14, 26 24" stroke="currentColor" strokeWidth="2" fill="none" />
    
        {/* Antenna / Sensor on Ground */}
        <rect x="18" y="22" width="4" height="6" fill="currentColor" />
        <line x1="20" y1="22" x2="20" y2="15" stroke="currentColor" strokeWidth="2" />
    
        {/* Subsurface Reflection */}
        <circle cx="20" cy="34" r="2" fill="currentColor" />
      </svg>
    ),
    title: "GPR Tomography",
    paragraph:
      "GPR Tomography is a high-resolution method that uses electromagnetic waves to detect subsurface structures. It is widely used in archaeology, engineering, and environmental studies for mapping underground utilities, soil layers, and voids.",
  },
  {
    id: 6,
    icon: (
      <svg width="40" height="41" viewBox="0 0 40 41" className="fill-current">
        {/* Ground Layer */}
        <rect x="5" y="30" width="30" height="6" fill="currentColor" opacity="0.5" />
    
        {/* Epicenter (Circle at Bottom) */}
        <circle cx="20" cy="34" r="3" fill="currentColor" />
    
        {/* Earthquake Shock Waves */}
        <path d="M10 28 Q20 18, 30 28" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M7 26 Q20 12, 33 26" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M5 24 Q20 8, 35 24" stroke="currentColor" strokeWidth="2" fill="none" />
    
        {/* Seismograph Line (Jagged Earthquake Wave) */}
        <polyline points="5,16 10,20 15,10 20,25 25,5 30,18 35,12" stroke="currentColor" strokeWidth="2" fill="none" />
    
        {/* Fault Line / Crack */}
        <path d="M15 30 L22 35 L25 30" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ),
    title: "Seismological Tomography",
    paragraph:
      "Seismological Tomography method analyzes earthquake wave data to map Earth's deep interior, revealing subsurface structures and tectonic activity. It aids in studying fault zones, mantle dynamics, and seismic hazard assessment.",
  },
];
export default featuresData;
