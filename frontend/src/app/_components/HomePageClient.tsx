"use client";

import { useState } from "react";
import CinematicLoader from "@/components/CinematicLoader";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ConceptSection from "@/components/ConceptSection";
import TargetGroupsSection from "@/components/TargetGroupsSection";
import DifferenceSection from "@/components/DifferenceSection";
import AppSection from "@/components/AppSection";
import GetStartedSection from "@/components/GetStartedSection";
import Footer from "@/components/Footer";

export default function HomePageClient() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <CinematicLoader onLoadingComplete={() => setIsLoading(false)} />

      <main className={`overflow-x-hidden ${isLoading ? "h-screen overflow-hidden" : ""}`}>
        <Navbar />
        <Hero />
        <DifferenceSection />
        <ConceptSection />
        <TargetGroupsSection />
        <AppSection />
        <GetStartedSection />
        <Footer />
      </main>
    </>
  );
}
