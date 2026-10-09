# TapUlasan: design direction

**Concept: "Satu tap."** A real object on a real café counter. The page behaves like a product launch for a small physical thing: big confident type, one loud orange, and the badge itself (3D or canvas-rendered, always the user's live design where possible) as the hero. Everything else stays quiet.

**Signature: the NFC ripple.** Concentric rings from a point of touch. Used for: the tap demo burst, the NFC-zone overlay on the badge, primary-button hover, the favicon, the loading poster and the dark CTA band. Nowhere else.

**One risk taken:** the checkout's final step is printed as a café **nota (receipt)**: mono type, dashed tear line, order ref `TU-YYMMDD-XXXX` at the top. It comes from the customer's own world (every warung and café hands one over) and makes "confirm over WhatsApp" feel like a normal counter transaction, not a missing payment gateway.

## Tokens (kept from the brief; contrast-checked)
| Token | Hex | Use / contrast |
|---|---|---|
| `paper` | `#F6F1E7` | page background |
| `paper-raised` | `#FCFAF5` | cards, inputs |
| `paper-sunk` | `#ECE4D5` | wells, stage floors |
| `line` | `#D9CEBB` | borders (decorative only) |
| `ink` | `#15120F` | text 16.6:1 on paper; dark bands |
| `ink-soft` | `#5E554B` | secondary text 6.5:1 on paper |
| `ink-on-dark` | `#A89E91` | secondary text on ink 7.1:1 |
| `tap` | `#FF5A1F` | CTAs and ripple only. **Ink text on tap (6.0:1)**; white on tap fails (3.1) |
| `tap-deep` | `#A93A0C` | orange *text*/links on paper 5.7:1 (raw tap is 2.8, fails) |
| `gold` | `#F5B301` | rating stars only |
| `leaf` | `#1F7A4D` | success; 4.7:1 on paper, white on leaf 5.3:1 |
| `danger` | `#B42318` | field errors 5.8:1 |

- **Type:** Bricolage Grotesque (display, 600–800, tracking −0.035em, used for h1/h2 and big numerals only) · Plus Jakarta Sans (body/UI, 400–700, made in Jakarta) · JetBrains Mono (labels, order ref, tap counter, specs; uppercase 11–13px, +0.08em).
- **Scale (fluid):** display `clamp(2.75rem, 8vw, 6.5rem)`/0.92 · h2 `clamp(2rem, 4.5vw, 3.5rem)`/1 · h3 1.375rem · body 1rem/1.6 (1.0625 on ≥md) · small 0.875 · mono 0.75.
- **Radius:** 10px controls · 20px cards · 32px stages · pill for buttons. Badges in 3D use real mm proportions.
- **Shadow:** warm, ink-tinted: `0 1px 0 #15120F14, 0 12px 32px -12px #15120F40`; "object" shadow under badges: `0 30px 60px -25px #15120F66`.
- **Motion:** fast 150ms `cubic-bezier(.2,.8,.2,1)` (hover/focus) · base 300ms same · spring for the badge/phone (`stiffness 260, damping 20`, slight overshoot) · ripple 1.1s `cubic-bezier(.16,1,.3,1)` (ease-out-expo). `prefers-reduced-motion`: no loops, no auto-rotate, tap demo becomes a 3-frame storyboard, transitions become 150ms crossfades.

## Components
Header (wordmark, nav, ID|EN toggle, CTA; mobile menu sheet via `<dialog>`) · Footer · Button (primary tap / secondary ink outline / ghost) · Ripple (SVG rings) · BadgeFace canvas (single renderer) · BadgeViewer (3D, dynamic, ssr:false) + 2D tilt fallback + view buttons · Customizer (format switch, text fields, swatches + `<input type=color>`, finish radio cards, logo upload, NFC toggle) · TapDemo · FormatCard · StepList · FAQ (native `<details>`) · Stepper/checkout fields · Nota (receipt) · ComingSoon tag · Placeholder slot.

No component library: native elements + Tailwind v4 tokens in `globals.css` (`@theme`). No extra deps beyond the brief.

## Pages (wireframes in words)
- **Home.** Hero: mobile = eyebrow, h1 "Satu tap. Langsung ke ulasan.", sub, two CTAs, then the tap-demo stage (phone + table stand on a sunk floor). Desktop = 7/5 asymmetric split, stage overlaps into the next band. → Problem/solution: left a long greyed list of the 6 real steps it takes today, right one giant "1 tap" card. → Formats: horizontal snap strip (mobile) / 4 cards, each a canvas-rendered face on a CSS turntable tilt (keeps three.js off the home bundle). → How it works: 3 numbered steps + 4th tagged "Segera". → Business website: phone mockup of a sample café site. → AI assistant: dark ink band, "Segera hadir", owner-approves line. → Principles: three short statements, big type. → FAQ. → Final CTA: dark band with orange ripple.
- **Shop.** Intro + 4 format cards (face render, dims, "Harga segera", Customize).
- **Product `/shop/[format]`.** Mobile: viewer 55vh, controls below, sticky bottom bar "Lanjut ke pesanan". Desktop: sticky viewer left 7 cols, controls right 5. Below: in-context illustrated scene using the live face, specs table, FAQ.
- **Checkout.** Progress bar + "Langkah 2 dari 6", one step per screen, Back on each. Step 6 = Nota + WhatsApp primary / email secondary, then success state.
- **How it works.** Tap vs scan, iPhone/Android notes, placement tips, no-gating principle, setup steps.
- **Contact.** Two huge buttons (WhatsApp, email) + a small compose form that only builds a link.
- **404.** Bilingual, ripple, links home in both languages.
