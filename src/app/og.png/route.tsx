import { ImageResponse } from "next/og";

export const dynamic = "force-static";

// Static 1200×630 social card, rendered once at build time → out/og.png
export function GET() {
  const ring = (size: number, opacity: number) => (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size,
        border: "14px solid #FF5A1F",
        opacity,
      }}
    />
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#F6F1E7", padding: 72, position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 700 }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: "#15120F", letterSpacing: -1.5 }}>TapUlasan</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 92, fontWeight: 800, color: "#15120F", lineHeight: 0.95, letterSpacing: -4 }}>Satu tap.</div>
            <div style={{ fontSize: 92, fontWeight: 800, color: "#15120F", lineHeight: 0.95, letterSpacing: -4 }}>Langsung ke ulasan.</div>
            <div style={{ fontSize: 30, color: "#5E554B", marginTop: 28 }}>Badge NFC + QR untuk ulasan Google · tapulasan.my.id</div>
          </div>
        </div>
        <div style={{ position: "absolute", right: -60, top: 95, width: 440, height: 440, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {ring(440, 0.25)}
          {ring(300, 0.55)}
          <div style={{ width: 120, height: 120, borderRadius: 120, background: "#FF5A1F" }} />
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
