import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sensei — The open-source qualification engine for AI agents";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1410 0%, #0d0b09 40%, #1a1410 100%)",
          fontFamily: "Inter, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Warm glow effect */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "400px",
            background: "radial-gradient(ellipse, rgba(212, 165, 116, 0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Logo + Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <span style={{ fontSize: "80px" }}>🥋</span>
          <span
            style={{
              fontSize: "96px",
              fontWeight: 800,
              color: "#d4a574",
              letterSpacing: "-2px",
            }}
          >
            Sensei
          </span>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "28px",
            color: "rgba(232, 228, 223, 0.7)",
            fontWeight: 300,
            letterSpacing: "1px",
            marginBottom: "12px",
          }}
        >
          The open-source qualification engine for AI agents
        </p>

        {/* Tagline */}
        <p
          style={{
            fontSize: "22px",
            color: "rgba(232, 228, 223, 0.45)",
            fontWeight: 300,
          }}
        >
          Test. Evaluate. Certify.
        </p>

        {/* Bottom border accent */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "4px",
            background: "linear-gradient(90deg, transparent, #d4a574, transparent)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
