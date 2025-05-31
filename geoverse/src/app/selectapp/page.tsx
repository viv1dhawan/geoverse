"use client";

import SectionTitle from "@/components/Common/SectionTitle";
import { useRouter } from "next/navigation";

const apps = [
  {
    name: "Resistivity Tomography",
    url: "/resitivitytomography",
    icon: (
      <svg width="50" height="50" viewBox="0 0 50 50" className="fill-current">
        <path d="M5 35 Q15 10, 25 25 T45 35" stroke="currentColor" strokeWidth="2" fill="none"/>
        <circle cx="10" cy="35" r="2" fill="currentColor"/>
        <circle cx="20" cy="25" r="2" fill="currentColor"/>
        <circle cx="30" cy="30" r="2" fill="currentColor"/>
        <circle cx="40" cy="35" r="2" fill="currentColor"/>
      </svg>
    ),
  },
  {
    name: "Gravity Anomaly",
    url: "/gravityanomaly",
    icon: (
      <svg width="50" height="50" viewBox="0 0 50 50" className="fill-current">
        <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="2" fill="none"/>
        <text x="18" y="28" fontSize="12" fill="currentColor">+</text>
        <text x="30" y="28" fontSize="12" fill="currentColor">−</text>
      </svg>
    ),
  },
  {
    name: "Seismic Tomography",
    url: "/seismictomography",
    icon: (
      <svg width="50" height="50" viewBox="0 0 50 50" className="fill-current">
        <path d="M5 35 L20 10 L35 35 L50 10" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M5 40 Q15 30, 25 40 T45 40" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    ),
  },
  {
    name: "Remote Sensing",
    url: "/remotesensing",
    icon: (
      <svg width="50" height="50" viewBox="0 0 50 50" className="fill-current">
        <rect x="15" y="15" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"/>
        <line x1="25" y1="10" x2="25" y2="15" stroke="currentColor" strokeWidth="2"/>
        <line x1="25" y1="35" x2="25" y2="40" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    name: "GPR Tomography",
    url: "/gprtomography",
    icon: (
      <svg width="50" height="50" viewBox="0 0 50 50" className="fill-current">
        <line x1="5" y1="25" x2="45" y2="25" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 20 Q15 15, 20 20 T30 20 T40 20" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    ),
  },
  {
    name: "Earthquake Monitoring",
    url: "/earthquakemonitoring",
    icon: (
      <svg width="50" height="50" viewBox="0 0 50 50" className="fill-current">
        <polyline points="5,30 15,10 25,30 35,10 45,30" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M5 40 Q15 30, 25 40 T45 40" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    ),
  },
];

const SelectAppPage = () => {
  const router = useRouter();

  const handleClick = (url: string) => {
    router.push(url);
  };

  return (
    <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
      <div className="container mx-auto">
        <SectionTitle
          title="Select a Geophysical Application"
          paragraph="Click an application to continue."
          center
        />
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {apps.map((app, index) => (
            <div
              key={index}
              onClick={() => handleClick(app.url)}
              className="cursor-pointer border border-gray-300 dark:border-gray-600 p-6 rounded-lg text-center shadow-lg transition hover:shadow-xl"
            >
              <div className="flex justify-center mb-4">{app.icon}</div>
              <div className="font-semibold text-xl text-black dark:text-white">
                {app.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

SelectAppPage.getLayout = function PageLayout(page: React.ReactNode) {
  return <>{page}</>;
};

export default SelectAppPage;
