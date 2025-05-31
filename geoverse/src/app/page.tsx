import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import Blog from "@/components/Blog";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import FrequantlyAskQuestion from "@/components/Faq";
import Features from "@/components/Tools";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import Research from "@/components/Research";
import Testimonials from "@/components/Testimonials";
import { Metadata } from "next";
import SelectAppPage from "./selectapp/page";
import UserProfile from "./profile/page";
// import Dashboard from "./dashboard/page";

export const metadata: Metadata = {
  title: "Welcome to Geoverse",
  description: "Explore geophysical tools, research, and applications with Geoverse.",
};

export default function Home() {
  return (
    <>
      <ScrollUp />
      <Hero />
      <Features />
      <Research />
      <AboutSectionOne />
      <AboutSectionTwo />
      <Testimonials />
      <Blog />
      <FrequantlyAskQuestion />
      <Contact />
      {/* <SelectAppPage /> */}
      <UserProfile />
    </>
  );
}
