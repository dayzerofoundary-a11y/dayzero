import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Terminal, MessageSquare, ShieldAlert, FolderTree, Lock, CheckCircle2 } from "lucide-react";
import { GuillocheBackground } from "./GuillocheBackground";

type TabType = "console" | "chat" | "security" | "repo";

const MOCK_LOGS = [
  "[sys] initializing secure sandbox environment v1.2.8...",
  "[sys] validation checklist: NDA key DZ-26-2277 loaded successfully.",
  "[sys] isolated database instance initialized (SQLite).",
  "[git] initialized empty git repository in /stealth/active-build.",
  "[git] created base branch: main",
  "[build] installing dependencies: express, prisma, nodemailer, zod...",
  "[build] dependencies installed (493 packages audited).",
  "[db] prisma client generated to ./node_modules/@prisma/client.",
  "[db] running sequential table push: schema sync successful.",
  "[auth] turnstile captcha verification credentials set.",
  "[git] commit: f467126 - 'Setup sequential SQLite writes & IPv4 SMTP configuration'",
  "[build] compiling TypeScript sources using tsc...",
  "[build] compilation successful (0 errors, 0 warnings).",
  "[deploy] starting staging container deployment on Render...",
  "[deploy] deployed successfully to https://dayzero-e03g-staging.onrender.com",
  "[audit] vulnerability audit completed: 0 critical issues found.",
  "[sys] sandbox locked. Active dev logging initialized."
];

interface FileNode {
  name: string;
  isFolder: boolean;
  children?: FileNode[];
}

const REPO_DATA: FileNode = {
  name: "dayzero-project",
  isFolder: true,
  children: [
    {
      name: "prisma",
      isFolder: true,
      children: [{ name: "schema.prisma", isFolder: false }]
    },
    {
      name: "src",
      isFolder: true,
      children: [
        {
          name: "web",
          isFolder: true,
          children: [
            {
              name: "routes",
              isFolder: true,
              children: [
                { name: "intake.ts", isFolder: false },
                { name: "admin.ts", isFolder: false }
              ]
            },
            { name: "app.ts", isFolder: false }
          ]
        },
        { name: "server.ts", isFolder: false }
      ]
    },
    { name: "eslint.config.js", isFolder: false },
    { name: "package.json", isFolder: false },
    { name: "tsconfig.json", isFolder: false }
  ]
};

export function WorkspacePreview() {
  const prefersReduced = useReducedMotion();
  const [activeTab, setActiveTab] = useState<TabType>("console");
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [logIndex, setLogIndex] = useState(0);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Animate terminal logs line-by-line
  useEffect(() => {
    if (activeTab !== "console") return;
    if (logIndex < MOCK_LOGS.length) {
      const interval = setTimeout(() => {
        setVisibleLogs((prev) => [...prev, MOCK_LOGS[logIndex]]);
        setLogIndex((prev) => prev + 1);
      }, 900);
      return () => clearTimeout(interval);
    }
  }, [logIndex, activeTab]);

  // Scroll to bottom of terminal console
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [visibleLogs, activeTab]);

  const resetConsole = () => {
    setVisibleLogs([]);
    setLogIndex(0);
  };

  const renderFileTree = (node: FileNode, depth = 0) => {
    return (
      <div key={node.name} style={{ marginLeft: `${depth * 1.2}rem` }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.25rem 0",
            fontFamily: "monospace",
            fontSize: "0.85rem",
            color: node.isFolder ? "#A8822C" : "rgba(244,239,228,0.75)"
          }}
        >
          <span>{node.isFolder ? "📁" : "📄"}</span>
          <span>{node.name}</span>
        </div>
        {node.children && node.children.map((child) => renderFileTree(child, depth + 1))}
      </div>
    );
  };

  return (
    <section
      id="workspace-preview"
      style={{
        background: "#090D1A",
        padding: "7rem 2rem",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <GuillocheBackground color="#F4EFE4" opacity={0.02} />

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1
        }}
      >
        {/* Header */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ textAlign: "center", marginBottom: "4.5rem" }}
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
              marginBottom: "1.5rem"
            }}
          >
            <span style={{ opacity: 0.7, marginRight: "0.5rem" }}>✤</span>
            Interactive Workspace · Section V.A
            <span style={{ opacity: 0.7, marginLeft: "0.5rem" }}>✤</span>
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.6rem, 4.5vw, 4rem)",
              fontWeight: 600,
              lineHeight: 1.15,
              color: "#F4EFE4",
              marginBottom: "2rem",
              textAlign: "center",
              margin: "0 auto 2rem",
              maxWidth: "800px"
            }}
          >
            Stealth Workspace Preview
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "1.1rem",
              fontWeight: 300,
              lineHeight: 1.7,
              color: "rgba(244,239,228,0.6)",
              maxWidth: "680px",
              margin: "0 auto"
            }}
          >
            See how we operate. Monitor code changes, communicate directly with developers, and view real-time compliance audits.
          </p>
        </motion.div>

        {/* Dashboard Window */}
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            background: "rgba(19, 25, 41, 0.45)",
            border: "1px solid rgba(168, 130, 44, 0.3)",
            boxShadow: "0 24px 64px rgba(6, 9, 21, 0.7)",
            display: "flex",
            flexDirection: "column",
            height: "500px",
            borderRadius: "4px",
            overflow: "hidden"
          }}
          className="workspace-window"
        >
          {/* OS Title Bar */}
          <div
            style={{
              background: "#131929",
              padding: "0.8rem 1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(168, 130, 44, 0.15)"
            }}
          >
            {/* Window dots */}
            <div style={{ display: "flex", gap: "0.45rem" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FF5F56" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#FFBD2E" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#27C93F" }} />
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.68rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#A8822C",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontWeight: 500
              }}
            >
              <Lock size={11} /> Stealth Portal — Active Build
            </div>
            <div style={{ width: "42px" }} /> {/* Spacer */}
          </div>

          {/* Sidebar & Content Body */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* Left Nav Sidebar */}
            <div
              style={{
                width: "220px",
                background: "#0D1321",
                borderRight: "1px solid rgba(168, 130, 44, 0.15)",
                display: "flex",
                flexDirection: "column",
                padding: "1rem 0"
              }}
              className="workspace-sidebar"
            >
              {(
                [
                  { id: "console", label: "Build Console", icon: Terminal },
                  { id: "chat", label: "Secure Chat", icon: MessageSquare },
                  { id: "security", label: "Security Ledger", icon: ShieldAlert },
                  { id: "repo", label: "Repository Tree", icon: FolderTree }
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.8rem 1.5rem",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "0.8rem",
                      color: isActive ? "#F4EFE4" : "rgba(244,239,228,0.5)",
                      background: isActive ? "rgba(168,130,44,0.08)" : "transparent",
                      border: "none",
                      borderLeft: isActive ? "3px solid #A8822C" : "3px solid transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                      boxSizing: "border-box",
                      transition: "all 0.15s"
                    }}
                  >
                    <Icon size={15} color={isActive ? "#A8822C" : "rgba(244,239,228,0.5)"} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Right Content Area */}
            <div style={{ flex: 1, padding: "1.5rem", background: "rgba(13,18,32,0.65)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <AnimatePresence mode="wait">
                {activeTab === "console" && (
                  <motion.div
                    key="console"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}
                  >
                    <div
                      style={{
                        background: "#080B14",
                        border: "1px solid rgba(19,25,41,0.5)",
                        padding: "1rem",
                        flex: 1,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.4rem"
                      }}
                    >
                      {visibleLogs.map((log, index) => (
                        <div
                          key={index}
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.85rem",
                            lineHeight: 1.4,
                            color: log.startsWith("[sys]")
                              ? "#27C93F"
                              : log.startsWith("[build]")
                              ? "#FFBD2E"
                              : log.startsWith("[git]")
                              ? "#A8822C"
                              : "rgba(244,239,228,0.8)",
                            whiteSpace: "pre-wrap"
                          }}
                        >
                          {log}
                        </div>
                      ))}
                      {logIndex < MOCK_LOGS.length ? (
                        <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#6A6355", paddingLeft: "4px" }}>
                          typing<span className="dot-animate">...</span>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#27C93F", fontSize: "0.85rem", fontFamily: "monospace", marginTop: "0.5rem" }}>
                          <CheckCircle2 size={12} /> Console Sync Active.
                        </div>
                      )}
                      <div ref={consoleBottomRef} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.75rem" }}>
                      <button
                        onClick={resetConsole}
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "0.62rem",
                          fontWeight: 500,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          padding: "0.4rem 0.8rem",
                          background: "transparent",
                          border: "1px solid rgba(168,130,44,0.3)",
                          color: "#A8822C",
                          cursor: "pointer"
                        }}
                      >
                        Restart Terminal Logs
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === "chat" && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", justifyContent: "flex-end" }}
                  >
                    {[
                      { sender: "Lead Architect", text: "Welcome aboard, Shlok. We've initiated the repository lock and verified the signed NDA." },
                      { sender: "Lead Architect", text: "I've structured the sqlite database sequential write logic to bypass transaction constraints. We are deploying staging in parallel." },
                      { sender: "You (Mock Client)", text: "Excellent. Let's make sure the background Nodemailer worker uses port 2525 so Render doesn't block SMTP." },
                      { sender: "Lead Architect", text: "Already configured. Staging container is live, and I've pushed the clean Hand-off repository files." }
                    ].map((msg, index) => {
                      const isClient = msg.sender.startsWith("You");
                      return (
                        <div
                          key={index}
                          style={{
                            alignSelf: isClient ? "flex-end" : "flex-start",
                            maxWidth: "75%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: isClient ? "flex-end" : "flex-start"
                          }}
                        >
                          <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#A8822C", marginBottom: "0.2rem" }}>
                            {msg.sender}
                          </span>
                          <div
                            style={{
                              padding: "0.7rem 0.9rem",
                              background: isClient ? "#A8822C" : "#131929",
                              color: isClient ? "#F4EFE4" : "rgba(244,239,228,0.85)",
                              border: isClient ? "none" : "1px solid rgba(168,130,44,0.15)",
                              borderRadius: "2px",
                              fontSize: "0.85rem",
                              fontFamily: "'DM Sans', sans-serif",
                              fontWeight: 300,
                              lineHeight: 1.4
                            }}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                {activeTab === "security" && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}
                  >
                    {[
                      { category: "ACCESS LOG", msg: "Secure connection from Render Staging (Authorized)", time: "Just now" },
                      { category: "KEY LOG", msg: "Signed confidentiality agreement (Cast Ref: DZ-26-2277) loaded.", time: "10 min ago" },
                      { category: "ENCRYPTION", msg: "SQLite file development database encrypt checks active.", time: "25 min ago" },
                      { category: "NETWORK EGRESS", msg: "Outbound SMTP routing restricted to port 2525 relay.", time: "40 min ago" },
                      { category: "ACCESS BLOCK", msg: "IP Whitelisting checks deactivated for dynamic cloud deployment compatibility.", time: "1 hour ago" }
                    ].map((sec, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.75rem 1rem",
                          background: "#080B14",
                          border: "1px solid rgba(168,130,44,0.1)",
                          borderRadius: "2px"
                        }}
                      >
                        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                          <span
                            style={{
                              fontSize: "0.55rem",
                              fontWeight: 600,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              padding: "0.2rem 0.4rem",
                              background: "rgba(168,130,44,0.15)",
                              color: "#A8822C"
                            }}
                          >
                            {sec.category}
                          </span>
                          <span style={{ fontSize: "0.8rem", color: "rgba(244,239,228,0.8)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
                            {sec.msg}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.68rem", color: "rgba(244,239,228,0.3)", fontFamily: "monospace" }}>
                          {sec.time}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === "repo" && (
                  <motion.div
                    key="repo"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ flex: 1, overflowY: "auto" }}
                  >
                    <div style={{ padding: "0.5rem 0" }}>{renderFileTree(REPO_DATA)}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        .dot-animate {
          animation: blink 1.4s infinite both;
        }
        @keyframes blink {
          0% { opacity: .2; }
          20% { opacity: 1; }
          100% { opacity: .2; }
        }
        @media (max-width: 768px) {
          .workspace-window {
            height: auto !important;
            min-height: 480px;
          }
          .workspace-window > div:last-child {
            flex-direction: column !important;
          }
          .workspace-sidebar {
            width: 100% !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            padding: 0.5rem 0 !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(168, 130, 44, 0.15) !important;
          }
          .workspace-sidebar button {
            width: auto !important;
            flex: 1 1 40% !important;
            padding: 0.5rem 1rem !important;
            border-left: none !important;
            border-bottom: 2px solid transparent !important;
          }
          .workspace-sidebar button[style*="3px solid rgb(168, 130, 44)"] {
            border-bottom: 2px solid #A8822C !important;
          }
        }
      `}</style>
    </section>
  );
}
