import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  onAdopt: (signatureDataUrl: string | null, filename?: string) => void;
  prefersReduced?: boolean;
}

export const SignatureModal = memo(function SignatureModal({
  isOpen,
  onClose,
  name,
  onAdopt,
  prefersReduced = false,
}: SignatureModalProps) {
  const [signatureTab, setSignatureTab] = useState<"draw" | "type" | "upload">("draw");
  const [uploadedSignatureFilename, setUploadedSignatureFilename] = useState<string | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [paths, setPaths] = useState<Array<Array<{ x: number; y: number }>>>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawPathsOnCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1E2535";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    paths.forEach((path) => {
      if (path.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    });
  }, [paths]);

  useEffect(() => {
    if (isOpen && signatureTab === "draw") {
      const t = setTimeout(() => drawPathsOnCanvas(), 20);
      return () => clearTimeout(t);
    }
  }, [paths, isOpen, signatureTab, drawPathsOnCanvas]);

  const getCanvasCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const coords = getCanvasCoords(e);
    if (!coords) return;
    setIsDrawing(true);
    setPaths((prev) => [...prev, [coords]]);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    if (!coords) return;

    setPaths((prev) => {
      if (prev.length === 0) return [[coords]];
      const lastIndex = prev.length - 1;
      const lastPath = prev[lastIndex];
      const updatedPath = [...lastPath, coords];
      const nextPaths = [...prev];
      nextPaths[lastIndex] = updatedPath;
      return nextPaths;
    });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleUndo = () => {
    setPaths((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPaths([]);
    if (signatureTab === "upload") {
      setSignatureImage(null);
      setUploadedSignatureFilename(null);
    }
  };

  const handleSignatureFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Signature file size must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSignatureImage(event.target.result as string);
        setUploadedSignatureFilename(file.name);
        toast.success(`Signature file "${file.name}" loaded successfully.`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAdopt = () => {
    if (signatureTab === "draw") {
      const canvas = canvasRef.current;
      if (!canvas || paths.length === 0) {
        toast.error("Please draw a signature first.");
        return;
      }
      const dataUrl = canvas.toDataURL("image/png");
      onAdopt(dataUrl);
    } else if (signatureTab === "upload") {
      if (!signatureImage) {
        toast.error("Please upload a signature file first.");
        return;
      }
      onAdopt(signatureImage, uploadedSignatureFilename || undefined);
    } else {
      onAdopt(null);
    }
    onClose();
  };

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
            maxWidth: "500px",
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
              Adopt Signature
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

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(168,130,44,0.15)" }}>
            <button
              type="button"
              onClick={() => setSignatureTab("draw")}
              style={{
                flex: 1,
                padding: "0.85rem",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: signatureTab === "draw" ? "rgba(168,130,44,0.08)" : "transparent",
                color: signatureTab === "draw" ? "#A8822C" : "#6A6355",
                border: "none",
                borderBottom: signatureTab === "draw" ? "2px solid #A8822C" : "none",
                cursor: "pointer",
              }}
            >
              Draw Signature
            </button>
            <button
              type="button"
              onClick={() => setSignatureTab("type")}
              style={{
                flex: 1,
                padding: "0.85rem",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: signatureTab === "type" ? "rgba(168,130,44,0.08)" : "transparent",
                color: signatureTab === "type" ? "#A8822C" : "#6A6355",
                border: "none",
                borderBottom: signatureTab === "type" ? "2px solid #A8822C" : "none",
                cursor: "pointer",
              }}
            >
              Type Name
            </button>
            <button
              type="button"
              onClick={() => {
                setSignatureTab("upload");
                setSignatureImage(null);
                setUploadedSignatureFilename(null);
              }}
              style={{
                flex: 1,
                padding: "0.85rem",
                fontFamily: "'Inter', sans-serif",
                fontSize: "0.75rem",
                fontWeight: 500,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: signatureTab === "upload" ? "rgba(168,130,44,0.08)" : "transparent",
                color: signatureTab === "upload" ? "#A8822C" : "#6A6355",
                border: "none",
                borderBottom: signatureTab === "upload" ? "2px solid #A8822C" : "none",
                cursor: "pointer",
              }}
            >
              Upload File
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: "1.5rem" }}>
            {signatureTab === "draw" && (
              <div>
                <div style={{ border: "1px solid rgba(168,130,44,0.25)", background: "#FFF", borderRadius: "2px", overflow: "hidden", position: "relative" }}>
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={180}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    style={{
                      display: "block",
                      width: "100%",
                      height: "180px",
                      background: "#FFF",
                      cursor: "crosshair",
                      touchAction: "none",
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.75rem" }}>
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={paths.length === 0}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.65rem",
                      fontWeight: 500,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "0.4rem 0.8rem",
                      border: "1px solid rgba(19,25,41,0.2)",
                      background: "transparent",
                      color: "#131929",
                      cursor: paths.length === 0 ? "default" : "pointer",
                      opacity: paths.length === 0 ? 0.5 : 1,
                    }}
                  >
                    Undo
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={paths.length === 0}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.65rem",
                      fontWeight: 500,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "0.4rem 0.8rem",
                      border: "1px solid rgba(19,25,41,0.2)",
                      background: "transparent",
                      color: "#131929",
                      cursor: paths.length === 0 ? "default" : "pointer",
                      opacity: paths.length === 0 ? 0.5 : 1,
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {signatureTab === "type" && (
              <div>
                <div style={{ marginTop: "0.5rem", textAlign: "center", padding: "1rem", background: "rgba(168,130,44,0.03)", border: "1px dashed rgba(168,130,44,0.2)" }}>
                  <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#6A6355", marginBottom: "0.5rem" }}>
                    Signature Preview
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontWeight: 500, fontSize: "2rem", color: "#1E2535" }}>
                    {name || "Your Signature"}
                  </div>
                </div>
              </div>
            )}

            {signatureTab === "upload" && (
              <div>
                <div
                  style={{
                    border: "1px dashed rgba(168, 130, 44, 0.35)",
                    borderRadius: "2px",
                    background: "rgba(168, 130, 44, 0.02)",
                    padding: "2rem 1.5rem",
                    textAlign: "center",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <input
                    type="file"
                    accept="image/png, image/svg+xml"
                    onChange={handleSignatureFileUpload}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: "100%",
                      height: "100%",
                      opacity: 0,
                      cursor: "pointer",
                      zIndex: 5,
                    }}
                  />
                  <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📥</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", fontWeight: 500, color: "#131929", marginBottom: "0.25rem" }}>
                    Upload Signature File
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", color: "#6A6355" }}>
                    PNG or SVG (Max 5MB)
                  </div>
                </div>

                {signatureImage && (
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "0.75rem 1rem",
                      background: "#FFF",
                      border: "1px solid rgba(168, 130, 44, 0.2)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderRadius: "2px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "1.2rem" }}>
                        {signatureImage.startsWith("data:image/svg+xml;") ? "🎨" : "🖼️"}
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.68rem", fontWeight: 600, color: "#131929" }}>
                          Signature File Loaded
                        </span>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.58rem", color: "#6A6355", maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {uploadedSignatureFilename || "signature.png"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClear}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#A8822C",
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.62rem",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Action */}
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
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdopt}
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
              Adopt Signature
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});
