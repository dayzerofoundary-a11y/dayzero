import React, { memo } from "react";

const AMBITION_LABELS = [
  "Incremental",
  "Growth-stage",
  "Market-leading",
  "Industry-defining",
  "Category-defining",
];

interface AmbitionSliderProps {
  value: number;
  onChange: (val: number) => void;
  labelStyle: React.CSSProperties;
}

export const AmbitionSlider = memo(function AmbitionSlider({
  value,
  onChange,
  labelStyle,
}: AmbitionSliderProps) {
  return (
    <div
      style={{
        padding: "1.25rem 1.75rem 1.75rem",
        borderBottom: "1px solid rgba(19,25,41,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <label style={{ ...labelStyle, marginBottom: 0 }}>
          How ambitious is this idea?
        </label>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "1rem",
            fontWeight: 500,
            fontStyle: "italic",
            color: "#A8822C",
            background: "rgba(168, 130, 44, 0.08)",
            padding: "0.15rem 0.6rem",
            borderRadius: "2px",
          }}
        >
          {AMBITION_LABELS[value]}
        </span>
      </div>

      <div style={{ position: "relative", padding: "0 0.5rem", marginBottom: "1.2rem" }}>
        {/* Custom Ruler Line and Ticks */}
        <div
          style={{
            position: "absolute",
            left: "0.5rem",
            right: "0.5rem",
            top: "50%",
            transform: "translateY(-50%)",
            height: "2px",
            background: "rgba(19,25,41,0.1)",
            zIndex: 0,
          }}
        />

        {/* Dynamic Filled Track */}
        <div
          style={{
            position: "absolute",
            left: "0.5rem",
            width: `${(value / 4) * 100}%`,
            top: "50%",
            transform: "translateY(-50%)",
            height: "2px",
            background: "#A8822C",
            zIndex: 1,
            transition: "width 0.15s ease-out",
          }}
        />

        {/* 5 Tick Nodes */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            position: "relative",
            zIndex: 2,
            alignItems: "center",
            height: "24px",
          }}
        >
          {[0, 1, 2, 3, 4].map((idx) => {
            const isActive = idx === value;
            const isFilled = idx <= value;
            return (
              <div
                key={idx}
                onClick={() => onChange(idx)}
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  border: `2px solid ${isFilled ? "#A8822C" : "rgba(19,25,41,0.2)"}`,
                  background: isActive ? "#A8822C" : "#F4EFE4",
                  cursor: "pointer",
                  transition: "all 0.15s ease-out",
                  transform: isActive ? "scale(1.3)" : "scale(1)",
                  boxShadow: isActive ? "0 0 8px rgba(168,130,44,0.4)" : "none",
                }}
              />
            );
          })}
        </div>

        {/* Range Input overlay */}
        <input
          type="range"
          min={0}
          max={4}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: "absolute",
            left: "0",
            width: "100%",
            top: "0",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
            zIndex: 3,
          }}
        />
      </div>

      {/* Labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0",
          marginTop: "0.5rem",
        }}
      >
        {AMBITION_LABELS.map((label, idx) => {
          const isActive = idx === value;
          return (
            <button
              type="button"
              key={idx}
              onClick={() => onChange(idx)}
              style={{
                background: "none",
                border: "none",
                padding: "0",
                margin: "0",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.6rem",
                fontWeight: isActive ? 600 : 400,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: isActive ? "#A8822C" : "rgba(19,25,41,0.45)",
                cursor: "pointer",
                width: "80px",
                textAlign: idx === 0 ? "left" : idx === 4 ? "right" : "center",
                transition: "color 0.15s, font-weight 0.15s",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
});
