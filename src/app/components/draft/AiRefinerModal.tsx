import React, { memo } from "react";
import { motion, AnimatePresence } from "motion/react";

interface AiRefinerModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalMemo: string;
  refinedText: string;
  onApply: (refinedText: string) => void;
  prefersReduced?: boolean;
}

export const AiRefinerModal = memo(function AiRefinerModal({
  isOpen,
  onClose,
  originalMemo,
  refinedText,
  onApply,
  prefersReduced = false,
}: AiRefinerModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 300,
          background: "rgba(13,18,32,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={prefersReduced ? {} : { scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#F4EFE4",
            width: "100%",
            maxWidth: "700px",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            border: "1px solid rgba(168,130,44,0.3)",
            boxShadow: "0 24px 64px rgba(13,18,32,0.4)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "1.25rem 1.5rem",
              borderBottom: "1px solid rgba(168,130,44,0.15)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.2rem",
                fontWeight: 400,
                color: "#131929",
                margin: 0,
              }}
            >
              ✨ AI Scope Alignment
            </h3>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0.5rem",
                color: "#6A6355",
                display: "flex",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Comparison Content */}
          <div style={{ padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
              {/* Original Box */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#6A6355", fontWeight: 600, marginBottom: "0.4rem" }}>
                  Your Draft
                </div>
                <div style={{ padding: "0.75rem", background: "rgba(19,25,41,0.03)", border: "1px solid rgba(19,25,41,0.08)", fontSize: "0.85rem", color: "#131929", fontFamily: "'Inter', sans-serif", fontWeight: 300, lineHeight: 1.5, minHeight: "60px" }}>
                  {originalMemo}
                </div>
              </div>

              {/* Refined Box */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#A8822C", fontWeight: 600, marginBottom: "0.4rem" }}>
                  ✨ AI-Refined 3-Point MVP Scope
                </div>
                <pre style={{
                  margin: 0,
                  padding: "1rem",
                  background: "#FFF",
                  border: "1px solid rgba(168,130,44,0.3)",
                  borderRadius: "2px",
                  fontSize: "0.8rem",
                  color: "#1E2535",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 300,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  boxShadow: "inset 0 2px 8px rgba(19,25,41,0.02)",
                }}>
                  {refinedText}
                </pre>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div
            style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid rgba(168,130,44,0.15)",
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              background: "rgba(168,130,44,0.02)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.7rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "0.6rem 1.25rem",
                border: "1px solid rgba(19,25,41,0.15)",
                background: "transparent",
                color: "#131929",
                cursor: "pointer",
              }}
            >
              Keep Original
            </button>
            <button
              type="button"
              onClick={() => {
                onApply(refinedText);
                onClose();
              }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.7rem",
                fontWeight: 500,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "0.6rem 1.25rem",
                background: "#131929",
                color: "#F4EFE4",
                border: "none",
                cursor: "pointer",
              }}
            >
              Apply Refined Scope
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});
