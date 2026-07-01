import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { Turnstile } from "@marsidev/react-turnstile";
import { GuillocheBackground } from "./GuillocheBackground";
import { PerforatedEdge } from "./Hero";

const AMBITION_LABELS = [
  "Incremental",
  "Growth-stage",
  "Market-leading",
  "Industry-defining",
  "Category-defining",
];

const ROLES = [
  "Founder",
  "Co-Founder",
  "CEO",
  "CTO",
  "CPO",
  "COO",
  "Director",
  "Manager",
  "Engineer",
  "Designer",
  "Researcher",
  "Student",
  "Investor",
  "Consultant",
  "Other",
];

const CATEGORIES = [
  "Technology / SaaS",
  "Healthcare / MedTech",
  "Finance / FinTech",
  "Education / EdTech",
  "E-commerce / Retail",
  "AI / Machine Learning",
  "Social Impact",
  "Entertainment / Media",
  "Sustainability / CleanTech",
  "Logistics / Supply Chain",
  "Real Estate / PropTech",
  "Agriculture / AgriTech",
  "Other",
];

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
// Backend mounts API under /api and routes are namespaced as /v1
const intakeUrl = `${apiBaseUrl}/api/v1/intake`;

interface FormState {
  ideaName: string;
  ambition: number;
  memo: string;
  name: string;
  role: string;
  affiliation: string;
  email: string;
  category: string;
  file: File | null;
}

interface TheDraftProps {
  sectionRef: React.RefObject<HTMLElement | null>;
}

export function TheDraft({ sectionRef }: TheDraftProps) {
  const prefersReduced = useReducedMotion();
  const [form, setForm] = useState<FormState>({
    ideaName: "",
    ambition: 2,
    memo: "",
    name: "",
    role: "",
    affiliation: "",
    email: "",
    category: "",
    file: null,
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [showSeal, setShowSeal] = useState(false);
  const [refNum] = useState(
    () => `DZ-00-${Math.floor(Math.random() * 9000) + 1000}`
  );
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const [showNDA, setShowNDA] = useState(false);
  const [ndaAccepted, setNdaAccepted] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // ── Signature States & Helpers ─────────────────────────────────────────────
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureTab, setSignatureTab] = useState<"draw" | "type">("draw");
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
    if (showSignatureModal && signatureTab === "draw") {
      // Give a tiny timeout for canvas element mount if needed
      const t = setTimeout(() => drawPathsOnCanvas(), 10);
      return () => clearTimeout(t);
    }
  }, [paths, showSignatureModal, signatureTab, drawPathsOnCanvas]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(e);
    if (!coords) return;
    setIsDrawing(true);
    setPaths((prev) => [...prev, [coords]]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    if (!coords) return;
    setPaths((prev) => {
      const next = [...prev];
      if (next.length === 0) return next;
      const lastPath = [...next[next.length - 1], coords];
      next[next.length - 1] = lastPath;
      return next;
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
  };

  const adoptSignature = () => {
    if (signatureTab === "draw") {
      const canvas = canvasRef.current;
      if (!canvas || paths.length === 0) {
        toast.error("Please draw a signature first.");
        return;
      }
      const dataUrl = canvas.toDataURL("image/png");
      setSignatureImage(dataUrl);
    } else {
      setSignatureImage(null);
    }
    setShowSignatureModal(false);
  };

  // ── AI Refiner States & Helpers ───────────────────────────────────────────
  const [isRefining, setIsRefining] = useState(false);
  const [showRefinerModal, setShowRefinerModal] = useState(false);
  const [refinedText, setRefinedText] = useState("");

  const handleRefineClick = () => {
    const text = form.memo.trim();
    if (!text) {
      toast.error("Please enter a brief description first so the AI can refine it!");
      return;
    }

    setIsRefining(true);
    const loadingToastId = toast.loading("AI is structuring your idea...");

    setTimeout(() => {
      const result = refineIdeaText(text, form.category);
      setRefinedText(result);
      toast.dismiss(loadingToastId);
      setIsRefining(false);
      setShowRefinerModal(true);
    }, 1200);
  };

  // ── Filing Certificate States & Helpers ─────────────────────────────────────
  const [showCertificate, setShowCertificate] = useState(false);
  const [certDetails, setCertDetails] = useState({
    castId: "",
    ideaName: "",
    name: "",
    role: "",
    affiliation: "",
    category: "",
    signatureImage: null as string | null,
    dateString: ""
  });

  const downloadCertificate = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Background
    ctx.fillStyle = "#F4EFE4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Borders
    ctx.strokeStyle = "#A8822C";
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.lineWidth = 2;
    ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

    // 3. Watermark/Guilloche concentric circles
    ctx.strokeStyle = "rgba(168,130,44,0.04)";
    ctx.lineWidth = 1;
    for (let r = 80; r <= 220; r += 20) {
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 4. Header Text
    ctx.textAlign = "center";
    ctx.fillStyle = "#131929";
    ctx.font = "bold 44px Georgia, serif";
    ctx.fillText("DAYZERO FOUNDRY", canvas.width / 2, 130);

    ctx.fillStyle = "#A8822C";
    ctx.font = "bold 13px 'DM Sans', sans-serif";
    ctx.fillText("STEALTH PROJECT INTAKE REGISTRY", canvas.width / 2, 170);

    // Line separator
    ctx.strokeStyle = "rgba(168,130,44,0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 120, 200);
    ctx.lineTo(canvas.width / 2 + 120, 200);
    ctx.stroke();

    // 5. Certification legal statement
    ctx.fillStyle = "#6A6355";
    ctx.font = "italic 16px Georgia, serif";
    ctx.fillText("This document certifies that the confidential concept outlined below has been officially", canvas.width / 2, 245);
    ctx.fillText("recorded in the DayZero Foundry ledger and is fully protected under the legally binding", canvas.width / 2, 275);
    ctx.fillText("Non-Disclosure Agreement (NDA) executed prior to transmission.", canvas.width / 2, 305);

    // 6. Data Rows
    const detailsY = 370;
    const labelX = 260;
    const valueX = 420;
    const rowHeight = 45;

    ctx.textAlign = "left";
    const detailsList = [
      { label: "CAST REGISTRY NO.", value: certDetails.castId },
      { label: "FILING DATE", value: certDetails.dateString },
      { label: "SUBMITTER NAME", value: certDetails.name },
      { label: "IDEA NAME", value: certDetails.ideaName.length > 35 ? certDetails.ideaName.slice(0, 35) + "..." : certDetails.ideaName },
      { label: "CLASSIFICATION", value: certDetails.category || "General / Stealth" }
    ];

    detailsList.forEach((item, index) => {
      const y = detailsY + index * rowHeight;
      ctx.fillStyle = "#A8822C";
      ctx.font = "bold 11px 'DM Sans', sans-serif";
      ctx.fillText(item.label, labelX, y);

      ctx.fillStyle = "#131929";
      ctx.font = "16px Georgia, serif";
      ctx.fillText(item.value, valueX, y);

      ctx.strokeStyle = "rgba(19,25,41,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(labelX, y + 15);
      ctx.lineTo(canvas.width - 260, y + 15);
      ctx.stroke();
    });

    // 7. Green/Gold Certified Wax Seal
    const sealX = 280;
    const sealY = 660;
    
    ctx.fillStyle = "#1A4A3C";
    ctx.beginPath();
    ctx.arc(sealX, sealY, 52, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = "rgba(244,239,228,0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 46, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#F4EFE4";
    ctx.textAlign = "center";
    ctx.font = "bold 8px 'DM Sans', sans-serif";
    ctx.fillText("CERTIFIED", sealX, sealY - 10);
    ctx.fillStyle = "#C9A24A";
    ctx.font = "bold 15px Georgia, serif";
    ctx.fillText("DZF", sealX, sealY + 5);
    ctx.fillStyle = "rgba(244,239,228,0.7)";
    ctx.font = "bold 6px 'DM Sans', sans-serif";
    ctx.fillText("& SECURED", sealX, sealY + 18);

    // 8. Signature Area
    const sigX = canvas.width - 320;
    const sigY = 650;

    ctx.strokeStyle = "rgba(19,25,41,0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sigX - 100, sigY + 15);
    ctx.lineTo(sigX + 100, sigY + 15);
    ctx.stroke();

    ctx.fillStyle = "#6A6355";
    ctx.textAlign = "center";
    ctx.font = "9px 'DM Sans', sans-serif";
    ctx.fillText("DISCLOSING PARTY SIGNATURE", sigX, sigY + 32);

    if (certDetails.signatureImage) {
      const img = new Image();
      img.src = certDetails.signatureImage;
      img.onload = () => {
        ctx.drawImage(img, sigX - 90, sigY - 35, 180, 45);
        triggerDownload();
      };
    } else {
      ctx.fillStyle = "#1E2535";
      ctx.font = "italic 32px Georgia, serif";
      ctx.fillText(certDetails.name || "Stealth Founder", sigX, sigY - 2);
      triggerDownload();
    }

    function triggerDownload() {
      ctx.fillStyle = "rgba(106,99,85,0.45)";
      ctx.textAlign = "center";
      ctx.font = "9px 'DM Sans', sans-serif";
      ctx.fillText("Confidential Idea Registry · DayZero Foundry · Protected under legally binding NDA agreement.", canvas.width / 2, 755);

      const link = document.createElement("a");
      link.download = `DayZero_Certificate_${certDetails.castId || "Filing"}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Filing certificate downloaded successfully!");
    }
  };

  const filteredCategories = CATEGORIES.filter((c) =>
    c.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    }
    if (roleDropdownOpen || categoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [roleDropdownOpen, categoryDropdownOpen]);

  const filteredRoles = ROLES.filter((r) =>
    r.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const update = (field: keyof FormState, value: string | number | File | null) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleTurnstileError = useCallback(() => {
    toast.error("Security check failed. Please refresh and try again.");
  }, []);

  const validate = () => {
    const e: Partial<FormState> = {};
    if (!form.ideaName.trim()) e.ideaName = "Required";
    if (!form.memo.trim()) e.memo = "Required";
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
    return e;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});

    if (!ndaAccepted) {
      toast.error("You must accept the Non-Disclosure Agreement (NDA) to proceed.");
      return;
    }

    if (!turnstileToken) {
      toast.error("Please complete the security check.");
      return;
    }

    const loadingToastId = toast.loading("Filing your draft and certifying under NDA...");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("role", form.role);
      formData.append("affiliation", form.affiliation);
      formData.append("category", form.category);
      formData.append("idea", `Idea Name: ${form.ideaName}\n\nAmbition Scale: ${AMBITION_LABELS[form.ambition]}\n\nDescription:\n${form.memo}`);
      formData.append("turnstileToken", turnstileToken);
      if (form.file) {
        formData.append("file", form.file);
      }
      if (signatureImage) {
        formData.append("signature", signatureImage);
      }

      const response = await fetch(intakeUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        const errorMessage = data.errors?.[0]?.message || data.message || "Submission failed";
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Save details for the downloadable certificate
      setCertDetails({
        castId: data.castId,
        ideaName: form.ideaName,
        name: form.name,
        role: form.role,
        affiliation: form.affiliation,
        category: form.category,
        signatureImage: signatureImage,
        dateString: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      });

      toast.dismiss(loadingToastId);

      setShowSeal(true);
      toast.success(`Protected under NDA — Reference ${data.castId}`, {
        description: "Filing certificate generated.",
        duration: 6500,
      });

      setTimeout(() => {
        setShowSeal(false);
        setShowCertificate(true);
      }, 3500);

      // Reset form
      setForm({
        ideaName: "",
        ambition: 2,
        memo: "",
        name: "",
        role: "",
        affiliation: "",
        email: "",
        category: "",
        file: null,
      });
      setNdaAccepted(false);
      setSignatureImage(null);
      setPaths([]);
    } catch (err: any) {
      toast.dismiss(loadingToastId);
      const message =
        err instanceof TypeError
          ? `Backend is not reachable at "${intakeUrl}". Error: ${err.message || String(err)}`
          : err.message || "Failed to submit. Please ensure the backend server is running.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: `1px solid ${hasError ? "#8B1A1A" : "rgba(19,25,41,0.25)"}`,
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "1.1rem",
    fontWeight: 300,
    color: "#131929",
    padding: "0.4rem 0",
    transition: "border-color 0.2s",
  });

  const labelStyle: React.CSSProperties = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.7rem",
    fontWeight: 500,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#6A6355",
    display: "block",
    marginBottom: "0.3rem",
  };

  return (
    <section
      id="draft"
      ref={sectionRef as React.RefObject<HTMLElement>}
      style={{
        background: "#F4EFE4",
        padding: "7rem 2rem",
        position: "relative",
        overflow: "hidden",
      }}
      className="draft-section"
    >
      <GuillocheBackground color="#131929" opacity={0.03} />

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Section header */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ textAlign: "center", marginBottom: "3.5rem" }}
          className="draft-heading"
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#A8822C",
              marginBottom: "1.5rem",
            }}
            className="draft-title"
          >
            <span style={{ opacity: 0.7, marginRight: "0.5rem" }}>✤</span>
            The Draft · Section I
            <span style={{ opacity: 0.7, marginLeft: "0.5rem" }}>✤</span>
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.6rem, 4.5vw, 4rem)",
              fontWeight: 600,
              lineHeight: 1.15,
              color: "#131929",
              marginBottom: "2rem",
              textAlign: "center",
              margin: "0 auto 2rem",
              maxWidth: "800px",
              position: "relative"
            }}
            className="draft-copy"
          >
            Every idea begins <br />
            <span style={{ fontStyle: "italic", color: "#A8822C" }}>as a signed document.</span>
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "1.1rem",
              fontWeight: 300,
              lineHeight: 1.7,
              color: "#6A6355",
              maxWidth: "680px",
              margin: "0 auto",
            }}
          >
            Draft your idea the way a banker files a cheque. We receive it, verify it,
            and begin building — no public exposure, no prior commitment from you.
          </p>
        </motion.div>

        {/* The Cheque Form */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          style={{
            maxWidth: "780px",
            width: "100%",
            margin: "0 auto",
            position: "relative",
          }}
          className="cheque-shell"
        >
          {/* Cheque outer border */}
          <div
            style={{
              background: "#EDE8DC",
              border: "4px double #A8822C",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(19,25,41,0.1), 0 2px 8px rgba(19,25,41,0.08)",
              width: "100%",
            }}
            className="cheque-card"
          >
            <GuillocheBackground color="#131929" opacity={0.04} />

            {/* Perf edge */}
            <PerforatedEdge />

            {/* Cheque content */}
            <div style={{ position: "relative", zIndex: 2, paddingLeft: "40px" }} className="cheque-content">
              {/* Cheque header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "1.5rem 1.75rem 0.75rem",
                  borderBottom: "1px solid rgba(168,130,44,0.3)",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
                className="cheque-header"
              >
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "baseline",
                      gap: "0.2rem",
                      color: "#131929",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1.9rem",
                        fontWeight: 700,
                      }}
                    >
                      DayZero
                    </span>
                    <span
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        fontStyle: "italic",
                        color: "#A8822C",
                      }}
                    >
                      Foundry
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#6A6355",
                    }}
                  >
                    Confidential Idea Registry
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.7rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "#6A6355",
                    }}
                  >
                    Draft No.
                  </div>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.6rem",
                      fontWeight: 600,
                      color: "#131929",
                    }}
                  >
                    {refNum}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.8rem",
                      color: "#6A6355",
                      marginTop: "0.2rem",
                    }}
                  >
                    Date:{" "}
                    {new Date().toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              {/* Drawn in Favour of — professional cheque terminology for naming the idea */}
              <motion.div
                initial={prefersReduced ? {} : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                style={{ padding: "1.25rem 1.75rem 1rem" }}
              >
                <label style={labelStyle}>Drawn in Favour of</label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "1rem",
                    borderBottom: "1px solid rgba(19,25,41,0.2)",
                    paddingBottom: "0.3rem",
                    marginBottom: "0.2rem",
                  }}
                  className="idea-payline"
                >
                  <input
                    type="text"
                    value={form.ideaName}
                    onChange={(e) => update("ideaName", e.target.value)}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderBottomColor = "#A8822C")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderBottomColor = "transparent")
                    }
                    placeholder="Name your idea"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.6rem",
                      fontWeight: 600,
                      fontStyle: "italic",
                      color: "#131929",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#131929",
                      border: "1px solid rgba(19,25,41,0.25)",
                      padding: "0.15rem 0.6rem",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                    className="idea-amount"
                  >
                    ₹ ∞
                  </span>
                </div>
                {errors.ideaName && (
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.6rem",
                      color: "#8B1A1A",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {errors.ideaName}
                  </div>
                )}
              </motion.div>

              {/* Ambition slider */}
              <motion.div
                initial={prefersReduced ? {} : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
                style={{
                  padding: "0.5rem 1.75rem 1.25rem",
                  borderBottom: "1px solid rgba(19,25,41,0.08)",
                }}
              >
                <label style={labelStyle}>Ambition — On the scale of</label>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                  className="ambition-row"
                >
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.8rem",
                      color: "#6A6355",
                      whiteSpace: "nowrap",
                    }}
                    className="ambition-label"
                  >
                    Incremental
                  </span>
                  <div style={{ flex: 1, position: "relative" }}>
                    {/* Tick marks */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                        padding: "0 2px",
                      }}
                    >
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: "1px",
                            height: i === 0 || i === 4 ? "8px" : "5px",
                            background:
                              i <= form.ambition ? "#A8822C" : "rgba(19,25,41,0.2)",
                          }}
                        />
                      ))}
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={4}
                      step={1}
                      value={form.ambition}
                      onChange={(e) => update("ambition", Number(e.target.value))}
                      style={{ width: "100%", accentColor: "#A8822C", cursor: "pointer" }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.8rem",
                      color: "#6A6355",
                      whiteSpace: "nowrap",
                    }}
                    className="ambition-label"
                  >
                    Category-defining
                  </span>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    fontStyle: "italic",
                    color: "#A8822C",
                    marginTop: "0.35rem",
                  }}
                >
                  {AMBITION_LABELS[form.ambition]}
                </div>
              </motion.div>

              {/* Memo */}
              <motion.div
                initial={prefersReduced ? {} : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
                style={{
                  padding: "1rem 1.75rem",
                  borderBottom: "1px solid rgba(19,25,41,0.08)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Memo — Describe the idea</label>
                  <button
                    type="button"
                    onClick={handleRefineClick}
                    disabled={isRefining}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.58rem",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "0.25rem 0.6rem",
                      background: "rgba(168,130,44,0.06)",
                      border: "1px solid rgba(168,130,44,0.25)",
                      color: "#A8822C",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      borderRadius: "2px",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(168,130,44,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(168,130,44,0.06)";
                    }}
                  >
                    <span>✨</span> {isRefining ? "Refining..." : "Refine with AI"}
                  </button>
                </div>
                <textarea
                  value={form.memo}
                  onChange={(e) => update("memo", e.target.value)}
                  placeholder="What problem does it solve, and for whom. Two or three sentences is enough."
                  rows={3}
                  style={{
                    ...inputStyle(!!errors.memo),
                    resize: "none",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "1.05rem",
                    fontWeight: 300,
                    lineHeight: 1.7,
                    paddingTop: "0.4rem",
                  }}
                  className="memo-textarea"
                />
                {errors.memo && (
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.6rem",
                      color: "#8B1A1A",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {errors.memo}
                  </div>
                )}
              </motion.div>

              {/* File Attachment */}
              <motion.div
                initial={prefersReduced ? {} : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.40 }}
                style={{
                  padding: "1rem 1.75rem",
                  borderBottom: "1px solid rgba(19,25,41,0.08)",
                }}
              >
                <label style={labelStyle}>Attachment — Supporting context (Optional)</label>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.5rem" }}>
                  <label
                    style={{
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      color: "#A8822C",
                      border: "1px solid rgba(168,130,44,0.4)",
                      padding: "0.4rem 1rem",
                      transition: "background 0.2s, color 0.2s",
                      display: "inline-block"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(168,130,44,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Select File
                    <input
                      type="file"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          if (e.target.files[0].size > 10 * 1024 * 1024) {
                            toast.error("File size must be less than 10MB");
                            e.target.value = "";
                            return;
                          }
                          update("file", e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.95rem",
                    color: form.file ? "#131929" : "#6A6355",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "200px"
                  }}>
                    {form.file ? form.file.name : "No file selected"}
                  </span>
                  {form.file && (
                    <button
                      type="button"
                      onClick={() => update("file", null)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#8B1A1A",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontFamily: "'DM Sans', sans-serif",
                        padding: "0"
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Signature panel */}
              <motion.div
                initial={prefersReduced ? {} : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.45 }}
                style={{ padding: "1rem 1.75rem 1.5rem" }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1.25rem 2rem",
                    marginBottom: "1.25rem",
                  }}
                  className="sig-grid"
                >
                  {/* Role searchable dropdown */}
                  <div style={{ gridColumn: "1 / -1" }} ref={roleDropdownRef}>
                    <label style={labelStyle}>Role</label>
                    <div style={{ position: "relative" }}>
                      <div
                        onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.45rem 0.6rem",
                          border: `1px solid ${roleDropdownOpen ? "#A8822C" : "rgba(19,25,41,0.2)"}`,
                          background: "transparent",
                          cursor: "pointer",
                          transition: "border-color 0.2s",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "1rem",
                          fontWeight: 300,
                          color: form.role ? "#131929" : "#9A9388",
                        }}
                      >
                        <span>{form.role || "Search / Select"}</span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          style={{
                            transform: roleDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease",
                          }}
                        >
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="#6A6355" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <AnimatePresence>
                        {roleDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            style={{
                              position: "absolute",
                              top: "calc(100% + 4px)",
                              left: 0,
                              right: 0,
                              zIndex: 20,
                              background: "#EDE8DC",
                              border: "1px solid rgba(168,130,44,0.45)",
                              boxShadow: "0 8px 24px rgba(19,25,41,0.12)",
                              maxHeight: "220px",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <div style={{ padding: "0.4rem 0.5rem", borderBottom: "1px solid rgba(19,25,41,0.08)" }}>
                              <input
                                type="text"
                                value={roleSearch}
                                onChange={(e) => setRoleSearch(e.target.value)}
                                placeholder="Search roles…"
                                autoFocus
                                style={{
                                  width: "100%",
                                  background: "transparent",
                                  border: "none",
                                  outline: "none",
                                  fontFamily: "'DM Sans', sans-serif",
                                  fontSize: "0.95rem",
                                  fontWeight: 300,
                                  color: "#131929",
                                  padding: "0.3rem 0",
                                }}
                              />
                            </div>
                            <div style={{ overflowY: "auto", maxHeight: "170px" }}>
                              {filteredRoles.length === 0 ? (
                                <div
                                  style={{
                                    padding: "0.6rem 0.6rem",
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: "0.75rem",
                                    color: "#9A9388",
                                    fontStyle: "italic",
                                  }}
                                >
                                  No roles found
                                </div>
                              ) : (
                                filteredRoles.map((r) => (
                                  <div
                                    key={r}
                                    onClick={() => {
                                      update("role", r);
                                      setRoleDropdownOpen(false);
                                      setRoleSearch("");
                                    }}
                                    style={{
                                      padding: "0.5rem 0.6rem",
                                      cursor: "pointer",
                                      fontFamily: "'DM Sans', sans-serif",
                                      fontSize: "0.95rem",
                                      fontWeight: form.role === r ? 500 : 300,
                                      color: form.role === r ? "#131929" : "#6A6355",
                                      background: form.role === r ? "rgba(168,130,44,0.1)" : "transparent",
                                      transition: "background 0.12s, color 0.12s",
                                      letterSpacing: "0.03em",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "rgba(168,130,44,0.12)";
                                      e.currentTarget.style.color = "#131929";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = form.role === r ? "rgba(168,130,44,0.1)" : "transparent";
                                      e.currentTarget.style.color = form.role === r ? "#131929" : "#6A6355";
                                    }}
                                  >
                                    {r}
                                  </div>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label style={labelStyle}>Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Full name"
                      style={inputStyle(!!errors.name)}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderBottomColor = "#A8822C")
                      }
                      onBlur={(e) =>
                      (e.currentTarget.style.borderBottomColor =
                        errors.name
                          ? "#8B1A1A"
                          : "rgba(19,25,41,0.25)")
                      }
                    />
                    {errors.name && (
                      <div
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.6rem",
                          color: "#8B1A1A",
                        }}
                      >
                        {errors.name}
                      </div>
                    )}
                  </div>

                  {/* Organisation */}
                  <div>
                    <label style={labelStyle}>Organisation</label>
                    <input
                      type="text"
                      value={form.affiliation}
                      onChange={(e) => update("affiliation", e.target.value)}
                      placeholder="Where you work"
                      style={inputStyle()}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderBottomColor = "#A8822C")
                      }
                      onBlur={(e) =>
                      (e.currentTarget.style.borderBottomColor =
                        "rgba(19,25,41,0.25)")
                      }
                    />
                  </div>

                  {/* Email */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="Work email — kept strictly private"
                      style={inputStyle(!!errors.email)}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderBottomColor = "#A8822C")
                      }
                      onBlur={(e) =>
                      (e.currentTarget.style.borderBottomColor =
                        errors.email
                          ? "#8B1A1A"
                          : "rgba(19,25,41,0.25)")
                      }
                    />
                    {errors.email && (
                      <div
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.6rem",
                          color: "#8B1A1A",
                        }}
                      >
                        {errors.email}
                      </div>
                    )}
                  </div>
                  {/* Category for database segregation */}
                  <div style={{ gridColumn: "1 / -1" }} ref={categoryDropdownRef}>
                    <label style={labelStyle}>Category</label>
                    <div style={{ position: "relative" }}>
                      <div
                        onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.45rem 0.6rem",
                          border: `1px solid ${categoryDropdownOpen ? "#A8822C" : "rgba(19,25,41,0.2)"}`,
                          background: "transparent",
                          cursor: "pointer",
                          transition: "border-color 0.2s",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.82rem",
                          fontWeight: 300,
                          color: form.category ? "#131929" : "#9A9388",
                        }}
                      >
                        <span>{form.category || "Select industry / category"}</span>
                        <svg
                          width="12" height="12" viewBox="0 0 12 12" fill="none"
                          style={{ transform: categoryDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
                        >
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="#6A6355" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <AnimatePresence>
                        {categoryDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15 }}
                            style={{
                              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 20,
                              background: "#EDE8DC", border: "1px solid rgba(168,130,44,0.45)",
                              boxShadow: "0 8px 24px rgba(19,25,41,0.12)", maxHeight: "220px",
                              display: "flex", flexDirection: "column",
                            }}
                          >
                            <div style={{ padding: "0.4rem 0.5rem", borderBottom: "1px solid rgba(19,25,41,0.08)" }}>
                              <input
                                type="text" value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                                placeholder="Search categories…" autoFocus
                                style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", fontWeight: 300, color: "#131929", padding: "0.2rem 0" }}
                              />
                            </div>
                            <div style={{ overflowY: "auto", maxHeight: "170px" }}>
                              {filteredCategories.length === 0 ? (
                                <div style={{ padding: "0.6rem", fontFamily: "'DM Sans', sans-serif", fontSize: "0.75rem", color: "#9A9388", fontStyle: "italic" }}>No categories found</div>
                              ) : (
                                filteredCategories.map((c) => (
                                  <div
                                    key={c}
                                    onClick={() => { update("category", c); setCategoryDropdownOpen(false); setCategorySearch(""); }}
                                    style={{
                                      padding: "0.4rem 0.6rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem",
                                      fontWeight: form.category === c ? 500 : 300, color: form.category === c ? "#131929" : "#6A6355",
                                      background: form.category === c ? "rgba(168,130,44,0.1)" : "transparent",
                                      transition: "background 0.12s, color 0.12s", letterSpacing: "0.03em",
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,130,44,0.12)"; e.currentTarget.style.color = "#131929"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = form.category === c ? "rgba(168,130,44,0.1)" : "transparent"; e.currentTarget.style.color = form.category === c ? "#131929" : "#6A6355"; }}
                                  >
                                    {c}
                                  </div>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* NDA Agreement checkbox */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.6rem",
                    marginBottom: "1.25rem",
                    padding: "0.75rem",
                    border: "1px solid rgba(168,130,44,0.2)",
                    background: "rgba(168,130,44,0.03)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={ndaAccepted}
                    onChange={(e) => setNdaAccepted(e.target.checked)}
                    style={{ marginTop: "0.15rem", accentColor: "#A8822C", cursor: "pointer" }}
                  />
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", fontWeight: 300, color: "#6A6355", lineHeight: 1.6 }}>
                    I acknowledge and agree to the{" "}
                    <span
                      onClick={() => setShowNDA(true)}
                      style={{ color: "#A8822C", cursor: "pointer", textDecoration: "underline", fontWeight: 500 }}
                    >
                      Non-Disclosure Agreement (NDA)
                    </span>
                    {" "}governing the confidential handling of my submission.
                  </div>
                </div>

                {/* Turnstile Security Check */}
                <div
                  style={{ marginBottom: "1.25rem", display: "flex", justifyContent: "flex-end" }}
                  className="turnstile-row"
                >
                  <Turnstile
                    siteKey="1x00000000000000000000AA"
                    onSuccess={setTurnstileToken}
                    onError={handleTurnstileError}
                  />
                </div>

                {/* Signed + Submit */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    borderTop: "1px solid rgba(19,25,41,0.1)",
                    paddingTop: "1rem",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                  className="submit-row"
                >
                  <div
                    className="signature-block"
                    onClick={() => setShowSignatureModal(true)}
                    style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    {signatureImage ? (
                      <div
                        style={{
                          height: "50px",
                          display: "flex",
                          alignItems: "flex-end",
                          minWidth: "180px",
                          borderBottom: "1px solid rgba(19,25,41,0.2)",
                          paddingBottom: "2px",
                        }}
                      >
                        <img src={signatureImage} alt="Handdrawn Signature" style={{ height: "45px", maxWidth: "220px", objectFit: "contain" }} />
                      </div>
                    ) : (
                      <div
                        style={{
                          fontFamily: "'Pinyon Script', cursive",
                          fontSize: "2.2rem",
                          color: "#1E2535",
                          lineHeight: 1.2,
                          minWidth: "180px",
                          borderBottom: "1px solid rgba(19,25,41,0.2)",
                          paddingBottom: "2px",
                        }}
                        className="signature-name"
                      >
                        {form.name || "Your Signature"}
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "0.3rem",
                        gap: "1rem"
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.52rem",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "#6A6355",
                        }}
                      >
                        {form.role || "Role"}
                        {form.affiliation ? ` · ${form.affiliation}` : ""}
                      </div>
                      <div
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.45rem",
                          letterSpacing: "0.05em",
                          color: "#A8822C",
                          fontWeight: 500
                        }}
                      >
                        (Click to Sign)
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.76rem",
                      fontWeight: 500,
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      padding: "1rem 2rem",
                      background: "#131929",
                      color: "#F4EFE4",
                      border: "1px solid #131929",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      transition: "background 0.2s, transform 0.08s",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.8rem",
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#1E2535")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#131929")
                    }
                    onMouseDown={(e) =>
                      (e.currentTarget.style.transform = "scale(0.97)")
                    }
                    onMouseUp={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    <SealIcon />
                    {isSubmitting ? "Filing..." : "File for Review"}
                  </button>
                </div>
              </motion.div>

              {/* MICR */}
              <motion.div
                initial={prefersReduced ? {} : { opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.55 }}
                style={{
                  padding: "0.5rem 1.75rem 0.75rem 40px",
                  borderTop: "1px solid rgba(19,25,41,0.08)",
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: "0.58rem",
                  color: "#131929",
                  letterSpacing: "0.08em",
                  opacity: 0.4,
                }}
                className="micr-line"
              >
                ⌐ 00-DZF-{refNum.slice(-4)} ⌐ CONFIDENTIAL ⌐ VOID AFTER SUBMISSION ⌐
              </motion.div>
            </div>
          </div>

          {/* Microcopy */}
          <div
            style={{
              textAlign: "center",
              marginTop: "1.25rem",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.7rem",
              fontWeight: 300,
              color: "#6A6355",
              letterSpacing: "0.05em",
            }}
          >
            Draft saved automatically · Protected under a signed Non-Disclosure Agreement (NDA)
          </div>
        </motion.div>
      </div>

      {/* Wax seal confirmation overlay */}
      <AnimatePresence>
        {showSeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100,
              background: "rgba(13,18,32,0.82)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            <motion.div
              initial={prefersReduced ? {} : { scale: 0.3, y: -80, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.15 }}
            >
              <FullWaxSeal />
            </motion.div>
            <motion.div
              initial={prefersReduced ? {} : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4, ease: "easeOut" }}
              style={{ textAlign: "center" }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.75rem",
                  fontWeight: 600,
                  color: "#F4EFE4",
                  marginBottom: "0.5rem",
                }}
              >
                Certified &amp; Filed
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 400,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "#A8822C",
                }}
              >
                Reference {refNum}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NDA Modal Overlay */}
      <AnimatePresence>
        {showNDA && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 200,
              background: "rgba(13,18,32,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
            onClick={() => setShowNDA(false)}
          >
            <motion.div
              initial={prefersReduced ? {} : { scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#F4EFE4",
                width: "100%",
                maxWidth: "600px",
                maxHeight: "85vh",
                display: "flex",
                flexDirection: "column",
                border: "1px solid rgba(168,130,44,0.3)",
                boxShadow: "0 24px 64px rgba(13,18,32,0.4)",
              }}
            >
              <div
                style={{
                  padding: "1.5rem",
                  borderBottom: "1px solid rgba(168,130,44,0.2)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.4rem",
                    fontWeight: 600,
                    color: "#131929",
                    margin: 0,
                  }}
                >
                  Non-Disclosure Agreement
                </h3>
                <button
                  onClick={() => setShowNDA(false)}
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
              <div
                style={{
                  padding: "1.5rem",
                  overflowY: "auto",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.85rem",
                  fontWeight: 300,
                  color: "#3F3A30",
                  lineHeight: 1.7,
                }}
              >
                <p style={{ marginBottom: "1rem" }}>
                  <strong>1. Purpose.</strong> This Non-Disclosure Agreement (the "Agreement") is entered into by and between DayZeroFoundry / Veixon (the "Receiving Party") and the Submitting Party (the "Disclosing Party") for the purpose of evaluating a potential business relationship or product development collaboration (the "Purpose").
                </p>
                <p style={{ marginBottom: "1rem" }}>
                  <strong>2. Confidential Information.</strong> "Confidential Information" means any and all technical and non-technical information provided by the Disclosing Party via the DayZeroFoundry submission form, including but not limited to idea concepts, product specifications, business models, algorithms, intellectual property, and market strategies.
                </p>
                <p style={{ marginBottom: "1rem" }}>
                  <strong>3. Obligations.</strong> The Receiving Party agrees that it will:
                  <br />(a) hold the Confidential Information in strict confidence;
                  <br />(b) not disclose such Confidential Information to any third parties without prior written consent;
                  <br />(c) limit access to the Confidential Information only to those employees, contractors, or agents who have a strict need to know for the Purpose and who are bound by confidentiality obligations as protective as this Agreement;
                  <br />(d) not use the Confidential Information for any purpose other than the Purpose.
                </p>
                <p style={{ marginBottom: "1rem" }}>
                  <strong>4. Exclusions.</strong> Confidential Information does not include information that: (a) is or becomes publicly known through no fault of the Receiving Party; (b) is rightfully received from a third party without restriction on disclosure; (c) is independently developed by the Receiving Party without use of the Confidential Information.
                </p>
                <p style={{ marginBottom: "1rem" }}>
                  <strong>5. Intellectual Property.</strong> All Confidential Information remains the sole and exclusive property of the Disclosing Party. No license or other rights to the Confidential Information are granted or implied by this Agreement.
                </p>
                <p style={{ marginBottom: "0" }}>
                  <strong>6. Term.</strong> The obligations of confidentiality shall survive for a period of five (5) years from the date of submission. By checking the agreement box and submitting the form, both parties agree to be bound by these terms electronically.
                </p>
              </div>
              <div
                style={{
                  padding: "1rem 1.5rem",
                  borderTop: "1px solid rgba(168,130,44,0.2)",
                  background: "rgba(168,130,44,0.04)",
                  textAlign: "right",
                }}
              >
                <button
                  onClick={() => {
                    setNdaAccepted(true);
                    setShowNDA(false);
                  }}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "0.75rem 1.5rem",
                    background: "#131929",
                    color: "#F4EFE4",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Agree &amp; Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signature Adopt Modal Overlay */}
      <AnimatePresence>
        {showSignatureModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
            onClick={() => setShowSignatureModal(false)}
          >
            <motion.div
              initial={prefersReduced ? {} : { scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
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
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    color: "#131929",
                    margin: 0,
                  }}
                >
                  Adopt Signature
                </h3>
                <button
                  onClick={() => setShowSignatureModal(false)}
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
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid rgba(168,130,44,0.15)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setSignatureTab("draw")}
                  style={{
                    flex: 1,
                    padding: "0.85rem",
                    fontFamily: "'DM Sans', sans-serif",
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
                    fontFamily: "'DM Sans', sans-serif",
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
              </div>

              {/* Tab Content */}
              <div style={{ padding: "1.5rem" }}>
                {signatureTab === "draw" ? (
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
                          fontFamily: "'DM Sans', sans-serif",
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
                          fontFamily: "'DM Sans', sans-serif",
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
                ) : (
                  <div>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Type your name"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.85rem",
                        border: "1px solid rgba(168,130,44,0.25)",
                        background: "#FFF",
                        color: "#131929",
                        boxSizing: "border-box",
                      }}
                    />
                    <div style={{ marginTop: "1rem", textAlign: "center", padding: "1rem", background: "rgba(168,130,44,0.03)", border: "1px dashed rgba(168,130,44,0.2)" }}>
                      <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "#6A6355", marginBottom: "0.5rem" }}>
                        Preview
                      </div>
                      <div style={{ fontFamily: "'Pinyon Script', cursive", fontSize: "2rem", color: "#1E2535" }}>
                        {form.name || "Your Signature"}
                      </div>
                    </div>
                  </div>
                )}
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
                  onClick={() => setShowSignatureModal(false)}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
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
                  onClick={adoptSignature}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
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
                  Adopt &amp; Sign
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Refiner Preview Modal */}
      <AnimatePresence>
        {showRefinerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
            onClick={() => setShowRefinerModal(false)}
          >
            <motion.div
              initial={prefersReduced ? {} : { scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
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
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    color: "#131929",
                    margin: 0,
                  }}
                >
                  ✨ AI Scope Alignment
                </h3>
                <button
                  onClick={() => setShowRefinerModal(false)}
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
                    <div style={{ padding: "0.75rem", background: "rgba(19,25,41,0.03)", border: "1px solid rgba(19,25,41,0.08)", fontSize: "0.85rem", color: "#131929", fontFamily: "'DM Sans', sans-serif", fontWeight: 300, lineHeight: 1.5, minHeight: "60px" }}>
                      {form.memo}
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
                      fontFamily: "'DM Sans', sans-serif",
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
                  onClick={() => setShowRefinerModal(false)}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
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
                    update("memo", refinedText);
                    setShowRefinerModal(false);
                    toast.success("AI-Refined scope applied to your draft!");
                  }}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
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
        )}
      </AnimatePresence>

      {/* Filing Certificate Modal Overlay */}
      <AnimatePresence>
        {showCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 300,
              background: "rgba(13,18,32,0.92)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              overflowY: "auto",
            }}
          >
            <motion.div
              initial={prefersReduced ? {} : { scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 260, damping: 24 }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                width: "100%",
                maxWidth: "680px",
                alignItems: "center",
              }}
            >
              {/* Certificate paper visual */}
              <div
                style={{
                  background: "#F4EFE4",
                  border: "1px solid rgba(168,130,44,0.45)",
                  padding: "6px",
                  boxShadow: "0 24px 72px rgba(13,18,32,0.5)",
                  width: "100%",
                  boxSizing: "border-box",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    border: "1px solid rgba(168,130,44,0.25)",
                    padding: "2rem 2.5rem",
                    position: "relative",
                  }}
                >
                  <GuillocheBackground color="#131929" opacity={0.03} />

                  {/* Concentric watermark circles */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "300px",
                      height: "300px",
                      border: "1px dashed rgba(168,130,44,0.06)",
                      borderRadius: "50%",
                      pointerEvents: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "240px",
                        height: "240px",
                        border: "1px dashed rgba(168,130,44,0.04)",
                        borderRadius: "50%",
                      }}
                    />
                  </div>

                  {/* Header */}
                  <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.55rem",
                        fontWeight: 500,
                        letterSpacing: "0.35em",
                        textTransform: "uppercase",
                        color: "#A8822C",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Certificate of Filing
                    </div>
                    <div
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "2rem",
                        fontWeight: 600,
                        color: "#131929",
                        letterSpacing: "0.02em",
                      }}
                    >
                      DayZeroFoundry
                    </div>
                    <div
                      style={{
                        width: "60px",
                        height: "1px",
                        background: "#A8822C",
                        margin: "0.75rem auto",
                      }}
                    />
                    <div
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "0.5rem",
                        fontWeight: 400,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "#6A6355",
                      }}
                    >
                      Stealth Idea Registry · Secure Record
                    </div>
                  </div>

                  {/* Certification details */}
                  <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <p
                      style={{
                        fontFamily: "Georgia, serif",
                        fontSize: "0.82rem",
                        fontStyle: "italic",
                        color: "#6A6355",
                        lineHeight: 1.6,
                        margin: "0 auto 2rem",
                        maxWidth: "500px",
                      }}
                    >
                      This document certifies that the confidential concept outlined below has been officially recorded in the DayZero Foundry ledger and is fully protected under the legally binding Non-Disclosure Agreement (NDA) executed prior to transmission.
                    </p>

                    {/* Metadata table */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.85rem",
                        maxWidth: "480px",
                        margin: "0 auto",
                        textAlign: "left",
                      }}
                    >
                      {[
                        { label: "Cast Registry No.", value: certDetails.castId },
                        { label: "Filing Date", value: certDetails.dateString },
                        { label: "Submitter", value: certDetails.name },
                        { label: "Project Title", value: certDetails.ideaName || "Stealth Concept" },
                        { label: "Classification", value: certDetails.category || "Stealth Tech" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            borderBottom: "1px solid rgba(19,25,41,0.06)",
                            paddingBottom: "0.3rem",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "0.6rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              color: "#A8822C",
                            }}
                          >
                            {item.label}
                          </span>
                          <span
                            style={{
                              fontFamily: "Georgia, serif",
                              fontSize: "0.8rem",
                              fontWeight: 500,
                              color: "#131929",
                              textAlign: "right",
                            }}
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stamp & Signatures */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "2.5rem",
                      paddingTop: "1.5rem",
                      borderTop: "1px dashed rgba(168,130,44,0.25)",
                    }}
                  >
                    {/* Golden/Green Seal */}
                    <div style={{ transform: "scale(0.8)", transformOrigin: "left center" }}>
                      <FullWaxSeal />
                    </div>

                    {/* Signature */}
                    <div style={{ textAlign: "center", minWidth: "160px" }}>
                      <div
                        style={{
                          height: "45px",
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "center",
                          borderBottom: "1px solid rgba(19,25,41,0.25)",
                          paddingBottom: "2px",
                          marginBottom: "0.3rem",
                        }}
                      >
                        {certDetails.signatureImage ? (
                          <img src={certDetails.signatureImage} alt="Signature" style={{ height: "40px", maxWidth: "160px", objectFit: "contain" }} />
                        ) : (
                          <span style={{ fontFamily: "'Pinyon Script', cursive", fontSize: "1.8rem", color: "#1E2535" }}>
                            {certDetails.name || "Stealth Founder"}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.48rem",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "#6A6355",
                        }}
                      >
                        Disclosing Party Signature
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "1rem", width: "100%", justifyContent: "center" }}>
                <button
                  onClick={downloadCertificate}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "1rem 2rem",
                    background: "#A8822C",
                    color: "#F4EFE4",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 8px 30px rgba(168,130,44,0.3)",
                    transition: "transform 0.2s, background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#C9A24A";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#A8822C";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Download Certificate (PNG)
                </button>
                <button
                  onClick={() => setShowCertificate(false)}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "1rem 2.5rem",
                    background: "#F4EFE4",
                    color: "#131929",
                    border: "1px solid rgba(19,25,41,0.15)",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .cheque-card input,
        .cheque-card textarea,
        .cheque-card button {
          max-width: 100%;
        }

        .draft-title,
        .draft-copy,
        .cheque-shell,
        .cheque-card {
          max-width: min(780px, calc(100vw - 2rem)) !important;
        }

        @media (max-width: 900px) {
          .draft-section {
            padding: 5rem 1rem !important;
          }
          .draft-title,
          .draft-copy {
            max-width: min(600px, calc(100vw - 2rem)) !important;
          }
          .cheque-shell {
            max-width: min(680px, calc(100vw - 2rem)) !important;
            width: 100% !important;
          }
          .cheque-card {
            max-width: min(680px, calc(100vw - 2rem)) !important;
            width: 100% !important;
          }
        }

        @media (max-width: 768px) {
          .draft-heading {
            margin-bottom: 2.25rem !important;
          }
          .draft-title {
            font-size: 0.75rem !important;
            max-width: min(300px, calc(100vw - 2rem)) !important;
          }
          .draft-copy {
            max-width: min(300px, calc(100vw - 2rem)) !important;
          }
          .cheque-card {
            max-width: 100% !important;
            width: 100% !important;
          }
          .cheque-card {
            box-shadow: 0 6px 24px rgba(19,25,41,0.09) !important;
          }
          .sig-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .sig-grid > div[style*="1 / -1"] {
            grid-column: 1 / -1;
          }
          .cheque-content {
            padding-left: 22px !important;
          }
          .cheque-content > div:not(.cheque-header) {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          .cheque-header {
            padding: 1rem 1rem 0.6rem !important;
          }
          .idea-payline {
            align-items: stretch !important;
            flex-direction: column !important;
            gap: 0.55rem !important;
          }
          .idea-payline input {
            font-size: 1.1rem !important;
          }
          .idea-amount {
            align-self: flex-start !important;
          }
          .ambition-row {
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 0.6rem !important;
          }
          .ambition-label {
            text-align: center !important;
            white-space: normal !important;
          }
          .memo-textarea {
            min-height: 132px !important;
          }
          .turnstile-row {
            justify-content: center !important;
            overflow: hidden !important;
          }
          .submit-row {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .signature-block {
            width: 100% !important;
          }
          .signature-name {
            min-width: 0 !important;
            overflow-wrap: anywhere !important;
          }
          .submit-row button {
            width: 100% !important;
            justify-content: center !important;
          }
          .micr-line {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
            overflow-wrap: anywhere !important;
            line-height: 1.6 !important;
          }
        }
        @media (max-width: 480px) {
          .cheque-shell,
          .cheque-card {
            max-width: calc(100vw - 1.25rem) !important;
          }
          .cheque-content {
            padding-left: 14px !important;
          }
          .cheque-header {
            flex-direction: column !important;
            padding: 0.8rem 0.8rem 0.5rem !important;
          }
          .cheque-header > div:last-child {
            text-align: left !important;
          }
          .turnstile-row > div {
            transform: scale(0.9);
            transform-origin: top center;
          }
          .turnstile-row {
            min-height: 64px;
          }
        }
        @media (max-width: 360px) {
          .draft-section {
            padding-left: 0.65rem !important;
            padding-right: 0.65rem !important;
          }
          .turnstile-row > div {
            transform: scale(0.82);
          }
        }
      `}</style>
    </section>
  );
}

function SealIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1" />
      <circle cx="7" cy="7" r="3.5" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
    </svg>
  );
}

const FullWaxSeal = React.memo(function FullWaxSeal() {
  return (
    <svg width="180" height="180" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="70" r="62" fill="#1A4A3C" />
      <circle cx="70" cy="70" r="56" fill="none" stroke="rgba(244,239,228,0.3)" strokeWidth="1" />
      <circle cx="70" cy="70" r="50" fill="none" stroke="rgba(244,239,228,0.15)" strokeWidth="0.5" strokeDasharray="3 3" />
      <circle cx="70" cy="70" r="44" fill="rgba(19,25,41,0.2)" />
      <text x="70" y="62" textAnchor="middle" fill="#F4EFE4"
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "9px", fontWeight: 600, letterSpacing: "0.35em" }}>
        CERTIFIED
      </text>
      <text x="70" y="78" textAnchor="middle" fill="#C9A24A"
        style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: 700 }}>
        DZF
      </text>
      <text x="70" y="92" textAnchor="middle" fill="rgba(244,239,228,0.65)"
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "7px", letterSpacing: "0.25em" }}>
        &amp; FILED
      </text>
    </svg>
  );
});

function refineIdeaText(input: string, category: string): string {
  const text = input.trim();
  if (!text) return "";

  // Normalize category
  const cat = (category || "").toLowerCase();

  // Extract core theme nouns
  const hasAI = /\b(ai|artificial|intelligence|gpt|bot|llm|model|machine|learning)\b/i.test(text);
  const hasMap = /\b(map|gps|tracking|location|coordinate|geo)\b/i.test(text);
  const hasDelivery = /\b(delivery|deliver|shipping|courier|laundry|dry|clean|uber|on-demand)\b/i.test(text);
  const hasFinance = /\b(finance|pay|payment|wallet|transaction|crypto|bank|money|card)\b/i.test(text);
  const hasHealth = /\b(health|med|patient|doctor|clinical|hospital|wellness|care)\b/i.test(text);
  const hasEdu = /\b(education|edtech|learn|student|teacher|course|class|school)\b/i.test(text);

  // 1. Core Concept elevator pitch
  let coreConcept = `A high-performance ${category || "digital"} platform engineered for ${hasAI ? "intelligent automation" : "seamless user orchestration"}. `;
  if (hasDelivery) {
    coreConcept += `It resolves delivery friction by synchronizing real-time on-demand requests with localized logistics agents.`;
  } else if (hasHealth) {
    coreConcept += `It streamlines healthcare coordination by providing secure, low-latency access to records and patient scheduling.`;
  } else if (hasFinance) {
    coreConcept += `It secures transactional flows via encrypted payment protocols and decentralized ledger state checks.`;
  } else if (hasAI) {
    coreConcept += `It leverages machine learning models to analyze inputs and automate complex decision trees with high precision.`;
  } else if (hasEdu) {
    coreConcept += `It democratizes localized learning by providing direct, intuitive portals for material delivery and tracking.`;
  } else {
    coreConcept += `It integrates high-fidelity data pipelines into a unified administrative workspace to maximize operational efficiency.`;
  }

  // 2. 3-Point MVP Scope
  let phase1Title = "Unified Intake Console";
  let phase1Desc = "A highly responsive portal enabling users to trigger requests and view live statuses.";
  let phase2Title = "Asynchronous Match & Queue Engine";
  let phase2Desc = "The core workflow layer that coordinates and routes requests based on real-time database lookups.";
  let phase3Title = "Administrative Ledger & Audit Portal";
  let phase3Desc = "A secure dashboard for operators to oversee activity logs, manage credentials, and audit compliance.";

  if (hasDelivery) {
    phase1Title = "On-Demand Booking Dashboard";
    phase1Desc = "Mobile-responsive portal allowing users to input requests, specify time slots, and view courier progress.";
    phase2Title = "Logistics Routing & Dispatch Engine";
    phase2Desc = "Coordinates geographic routes, matches couriers, and triggers automated SMS/email alerts.";
    phase3Title = "Partner Settlement Portal";
    phase3Desc = "Administrative panel for tracking payouts, auditing deliveries, and managing agent credentials.";
  } else if (hasAI) {
    phase1Title = "Intelligent Prompt & Input Interface";
    phase1Desc = "Minimalist interface optimized for file uploads and prompt structure validation.";
    phase2Title = "AI Inference & Parsing Middleware";
    phase2Desc = "Connects to processing pipelines, structures inputs, and executes analysis models asynchronously.";
    phase3Title = "Model Training & Accuracy Dashboard";
    phase3Desc = "Admin control panel to review output logs, adjust thresholds, and monitor model performance.";
  } else if (hasFinance) {
    phase1Title = "Encrypted Transaction Dashboard";
    phase1Desc = "High-security portal for users to connect payment accounts, initiate trades, or execute transfers.";
    phase2Title = "Atomic Transaction & Ledger Engine";
    phase2Desc = "Executes state transitions, handles payment gateway integrations, and secures double-entry bookkeeping.";
    phase3Title = "Compliance & Reporting Panel";
    phase3Desc = "Allows administrators to export tax reports, monitor AML flags, and oversee account security.";
  } else if (hasHealth) {
    phase1Title = "Patient Care & Scheduling Portal";
    phase1Desc = "HIPAA-aligned scheduling interface with direct messaging and booking slots.";
    phase2Title = "Secure Medical Records Router";
    phase2Desc = "Retrieves and updates patient files using end-to-end encrypted databases and audit trails.";
    phase3Title = "Provider Administrative Dashboard";
    phase3Desc = "Allows clinical managers to configure shift availability, audit system access, and generate billing reports.";
  } else if (hasEdu) {
    phase1Title = "Learner Engagement Console";
    phase1Desc = "A structured dashboard for courses, progress bars, and interactive assignments.";
    phase2Title = "Curriculum Delivery & Scoring Middleware";
    phase2Desc = "Delivers modular learning resources and automatically computes progress metrics.";
    phase3Title = "Educator Portal & Metrics Ledger";
    phase3Desc = "Allows teachers to compile grades, upload lessons, and evaluate student progress analytics.";
  }

  // If the user's text had custom details, integrate them
  const cleanedText = text.replace(/^(describe|make|create|build)\b/i, "").trim();
  const rawPreview = cleanedText.length > 80 ? cleanedText.slice(0, 80) + "..." : cleanedText;

  return `Idea Scope: ${rawPreview}

1. CORE CONCEPT
${coreConcept}

2. 3-POINT MVP TECHNICAL SCOPE
• Milestone I: ${phase1Title}
  ${phase1Desc}
• Milestone II: ${phase2Title}
  ${phase2Desc}
• Milestone III: ${phase3Title}
  ${phase3Desc}

3. SECURITY & ARCHITECTURE NODE
Designed for stealth-mode deployment. Built with secure database encryption, low-latency API endpoints, and a modular architecture ready for direct handoff to engineering.`;
}
