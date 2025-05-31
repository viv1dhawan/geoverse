import SectionTitle from "../Common/SectionTitle";
import SingleFeature from "./SingleTools";
import featuresData from "./toolsData";

const Tools = () => {
  return (
    <>
      <section id="features" className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <SectionTitle
            title="Explore Our Tools"
            paragraph="Discover Geoverse’s innovative geophysical tools designed to simplify data analysis and enhance exploration. Whether you're mapping subsurface structures or interpreting complex datasets, our cutting-edge solutions empower you with accuracy and efficiency."
            center
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map((feature) => (
              <SingleFeature key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Tools;
