import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

// Site-wide share image for links posted to social apps and chats. Generated at build time.
// Colors match the light theme tokens in globals.css.

export const alt = `${siteConfig.name}: free online timer and calculators`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#fafafa",
          color: "#18181b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              width: "96px",
              height: "96px",
              borderRadius: "20px",
              background: "#0f766e",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "56px",
              fontWeight: 700,
            }}
          >
            U
          </div>
          <div style={{ fontSize: "56px", fontWeight: 700 }}>{siteConfig.name}</div>
        </div>
        <div style={{ marginTop: "48px", fontSize: "72px", fontWeight: 700, lineHeight: 1.1 }}>
          Free online timer and calculators
        </div>
        <div style={{ marginTop: "28px", fontSize: "36px", color: "#52525b" }}>
          Percentages, discounts, tips, sales tax, averages, fractions, and more.
        </div>
      </div>
    ),
    size,
  );
}
