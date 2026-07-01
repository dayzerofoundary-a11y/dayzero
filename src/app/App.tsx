import { useRef } from "react";
import { Toaster } from "sonner";
import { motion, useScroll, useSpring } from "motion/react";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { TheDraft } from "./components/TheDraft";
import { SignedAndSealed } from "./components/SignedAndSealed";
import { VerifiedCertified } from "./components/VerifiedCertified";
import { Pillars } from "./components/Pillars";
import { HowItWorks } from "./components/HowItWorks";
import { WorkspacePreview } from "./components/WorkspacePreview";
import { Team } from "./components/Team";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

export default function App() {
  const draftRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      <motion.div
        style={{
          scaleX,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: "#A8822C",
          transformOrigin: "0%",
          zIndex: 100,
        }}
      />

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#131929",
            color: "#F4EFE4",
            border: "1px solid rgba(168,130,44,0.45)",
            borderRadius: "0",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.82rem",
            letterSpacing: "0.04em",
            boxShadow: "0 8px 32px rgba(13,18,32,0.5)",
          },
        }}
      />
      <Nav onDraftClick={() => draftRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} />
      <main>
        <Hero draftRef={draftRef} />
        <TheDraft sectionRef={draftRef} />
        <SignedAndSealed />
        <VerifiedCertified />
        <Pillars />
        <HowItWorks />
        <WorkspacePreview />
        <Team />
        <Contact />
      </main>
      <Footer />

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        html {
          font-family: 'DM Sans', system-ui, sans-serif;
          scroll-behavior: smooth;
        }

        body {
          background: #F4EFE4;
          color: #131929;
          -webkit-font-smoothing: antialiased;
        }

        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 2px;
          background: linear-gradient(90deg, #A8822C 0%, #A8822C calc(var(--val, 50%)), rgba(19,25,41,0.2) calc(var(--val, 50%)));
          outline: none;
          border-radius: 0;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 0;
          background: #A8822C;
          cursor: pointer;
          border: 2px solid #F4EFE4;
          box-shadow: 0 0 0 1px #A8822C;
        }
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 0;
          background: #A8822C;
          cursor: pointer;
          border: 2px solid #F4EFE4;
          box-shadow: 0 0 0 1px #A8822C;
        }

        :focus-visible {
          outline: 2px solid #A8822C;
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(168,130,44,0.3); border-radius: 0; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(168,130,44,0.55); }
      `}</style>
    </>
  );
}
