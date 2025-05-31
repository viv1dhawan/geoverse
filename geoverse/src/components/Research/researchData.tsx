import { Feature } from "@/types/feature";

const featuresData: Feature[] = [
  {
    id: 1,
    icon: (
      <svg
    width="40"
    height="40"
    viewBox="0 0 50 50"
    className="fill-current"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Ground Layer */}
    <path
      d="M5 20 Q15 15, 25 18 T45 20"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />

    {/* Seismic Waves */}
    <path
      d="M10 22 Q20 27, 30 24 T40 26"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      strokeDasharray="4,2"
    />
    
    {/* Drilling Tool */}
    <rect x="22" y="5" width="6" height="10" fill="currentColor" />
    <polygon points="22,15 28,15 25,22" fill="currentColor" />
    
    {/* Subsurface Layers */}
    <path
      d="M5 30 Q15 28, 25 32 T45 30"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      opacity="0.7"
    />
    <path
      d="M5 36 Q15 34, 25 37 T45 36"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      opacity="0.5"
    />

    {/* Ground Line */}
    <line x1="5" y1="40" x2="45" y2="40" stroke="currentColor" strokeWidth="2" />
    
    </svg>
    ),
    title: "Geophysical Tools",
    paragraph:
      "These are instruments and software used to analyze subsurface properties, including gravity meters, magnetometers, seismic sensors, and electromagnetic tools. They help in resource exploration, environmental studies, and geotechnical assessments.",
  },
  {
    id: 2,
    icon: (
      <svg
    width="50"
    height="50"
    viewBox="0 0 50 50"
    className="fill-current"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Paper Document */}
    <rect x="10" y="8" width="28" height="36" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
    
    {/* Folded Corner */}
    <path d="M32 8 L38 14 L32 14 Z" fill="currentColor" />

    {/* Text Lines */}
    <line x1="14" y1="14" x2="30" y2="14" stroke="currentColor" strokeWidth="1.5" />
    <line x1="14" y1="20" x2="34" y2="20" stroke="currentColor" strokeWidth="1.5" />
    <line x1="14" y1="26" x2="34" y2="26" stroke="currentColor" strokeWidth="1.5" />
    <line x1="14" y1="32" x2="28" y2="32" stroke="currentColor" strokeWidth="1.5" />
    
    {/* Magnifying Glass */}
    <circle cx="36" cy="32" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
    <line x1="40" y1="36" x2="44" y2="40" stroke="currentColor" strokeWidth="2" />

    </svg>
    ),
    title: "Research Paper",
    paragraph:
      "A detailed academic or scientific document presenting original research, methodologies, and findings in geophysics. It includes literature reviews, data analysis, and conclusions that contribute to the field’s advancement.",
  },
  {
    id: 3,
    icon: (
    <svg
    width="50"
    height="50"
    viewBox="0 0 50 50"
    className="fill-current"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Open Book */}
    <path
      d="M8 12 Q20 5, 25 12 Q30 5, 42 12 L42 38 Q30 32, 25 38 Q20 32, 8 38 Z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    
    {/* Book Content Lines */}
    <line x1="12" y1="18" x2="22" y2="18" stroke="currentColor" strokeWidth="1.5" />
    <line x1="12" y1="24" x2="22" y2="24" stroke="currentColor" strokeWidth="1.5" />
    <line x1="28" y1="18" x2="38" y2="18" stroke="currentColor" strokeWidth="1.5" />
    <line x1="28" y1="24" x2="38" y2="24" stroke="currentColor" strokeWidth="1.5" />

    {/* Gear Symbol (Application) */}
    <circle cx="25" cy="32" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
    <path
      d="M25 26 L25 22 M25 38 L25 34 M30 32 L34 32 M16 32 L20 32"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="25" cy="32" r="2" fill="currentColor" />
    </svg>
    ),
    title: "Case Studies",
    paragraph:
      "Real-world examples or investigations showcasing the application of geophysical methods in different industries, such as oil and gas exploration, mineral detection, groundwater assessment, and environmental monitoring.",
  },
  {
    id: 4,
    icon: (
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          className="fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left Hand */}
          <path
            d="M10 25 C12 20, 18 18, 20 22 L25 27 L15 32 Q10 30, 10 25 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Right Hand */}
          <path
            d="M40 25 C38 20, 32 18, 30 22 L25 27 L35 32 Q40 30, 40 25 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
      
          {/* Handshake Connection */}
          <line x1="20" y1="22" x2="30" y2="22" stroke="currentColor" strokeWidth="2" />
          <line x1="22" y1="24" x2="28" y2="24" stroke="currentColor" strokeWidth="2" />
      
          {/* Gear (Technical Aspect) */}
          <circle cx="25" cy="10" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
          <path
            d="M25 4 L25 2 M25 16 L25 14 M30 10 L32 10 M18 10 L20 10"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="25" cy="10" r="2" fill="currentColor" />
      
        </svg>
    ),
    title: "Technical Support",
    paragraph:
      "Assistance provided by experts to help users with geophysical tools, data interpretation, software troubleshooting, and practical applications, ensuring accuracy and efficiency in geophysical surveys.",
  },
];
export default featuresData;
