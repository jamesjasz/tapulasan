# TapUlasan: build brief for the web agent

> **Who this is for:** the coding agent building the TapUlasan website and online store.
> Read this whole file before you write any code. It is the source of truth. If something here conflicts with your own defaults, this file wins. If something is unclear or missing, ask the owner (James). Do not guess on anything marked **DECIDE**.

---

## 0. TL;DR

Build a **static, interactive, bilingual (Indonesian default, English toggle) Next.js site** for TapUlasan: a store selling NFC + QR badges that send customers straight to a business's Google review page.

The hero of the site is the **product experience**:
1. An interactive **3D badge viewer**
2. A **live customizer**
3. A **"phone taps badge, review page opens"** animation

Checkout runs fully client-side and **ends by sending a prefilled WhatsApp message** with the order. There is no backend and no payment gateway.

Hosting is **Cloudflare Pages**, from the static export in `out/`.

---

## 1. Business context (self-contained, no other file needed)

**One-liner:** NFC and QR badges that take customers straight to a business's Google review page, sold online through our own store, plus a simple website and AI-assisted review tools for cafés and local businesses.

- **Domain:** tapulasan.my.id
- **Contact email:** james@tapulasan.my.id
- **Stage:** idea / pre-launch
- **Name:** *Tap* + *Ulasan* (Indonesian for "review").

**Problem.** Local businesses (cafés, restaurants, clinics, salons, workshops) depend on Google reviews, but happy customers rarely leave one. Finding the review page takes too many steps. Owners also have little time to reply to reviews or spot problems.

**Products.**
1. **Review badge (NFC + QR):** a branded tag or stand for the counter or table. Customers tap their phone or scan the code and land directly on the business's Google review page. **This is what the store sells.**
2. **Business website:** a simple, mobile-friendly site for each client with menu or services, hours, location, contact links and a "Leave a review" button. On this site it gets a **marketing section only**, with no ordering flow.
3. **AI review assistant (planned, built with Claude):** drafts replies for the owner to approve, summarizes review themes, and flags negative reviews quickly. Show it as **"Segera hadir / Coming soon"**.

**Customers:** cafés, restaurants, salons, clinics, workshops and other local businesses that rely on Google Maps reviews. **Most buyers are on phones.**

**How it works (for the "Cara kerja / How it works" page):**
1. The business gets a badge (and, optionally, a website) set up with its Google review link.
2. A customer taps or scans the badge after a good visit.
3. The customer writes a review on Google.
4. *(Planned)* The owner sees tap counts and review insights in a dashboard and approves suggested replies.

### Non-negotiable principles (they must also show up in the site copy)
- **Every customer goes to the real Google review page.** No review gating: no "rate us first and only happy people get sent to Google" flows, anywhere. Say this plainly in How it works and in the FAQ. It is a trust point.
- **No fake or purchased reviews.** The AI only drafts replies, and the **owner approves before anything is posted**.
- **Do not invent testimonials, statistics, ratings, customer logos or prices.** Use clearly marked placeholders (see §9).

---

## 2. Decisions already made

| Topic | Decision |
|---|---|
| Framework | **Next.js latest stable** (16.x at time of writing), App Router, TypeScript, React 19 |
| Rendering | **Fully static**: `output: 'export'`. No server, no API routes, no middleware/proxy, no ISR, no server actions |
| Hosting | **Cloudflare Pages**: build command `npm run build`, output directory `out` |
| Languages | **Indonesian is default at `/`**, English at **`/en`**. Language toggle in the header. Every string exists in both languages |
| Checkout | Full multi-step UI on the client → final button **opens WhatsApp (`wa.me`) with a prefilled order message**. Email (`mailto:`) as a fallback. Payment method is chosen as a *preference* and confirmed manually over WhatsApp |
| Brand | **None exists yet.** You propose the visual identity (see §5). Use a text wordmark as the logo |
| Theme | Light-first. Dark bands/sections are allowed for drama. A full dark-mode toggle is **not** required |

### Still open (do not decide these yourself; use placeholders)
- **DECIDE: Prices.** Use `null` in data and show "Harga segera diumumkan / Price coming soon".
- **DECIDE: Final badge formats.** Build all four candidates (§6.1) from data, so removing one is a one-line change.
- **DECIDE: Finishes/materials.** Build the candidates in §6.2 as data.
- **DECIDE: WhatsApp business number.** Use the placeholder `62XXXXXXXXXX` in `src/config/site.ts`.
- **DECIDE: Real photography.** Use 3D/illustrated mockups now, and leave image slots for photos later.

---

## 3. Required skills and workflow

You have design skills available. **Use them. Do not skip the design phase.**

| Skill | Where | Use it for |
|---|---|---|
| **frontend-design** | Claude Code plugin skill `frontend-design:frontend-design` | Aesthetic direction, typography and distinctive layout. Load it **before** designing any page. Its job is to stop the result looking like a template |
| **ui-ux-pro-max** | Repo-local: `.claude/skills/ui-ux-pro-max/` | Design-system generation, UX rules (a11y, touch, motion, forms), Next.js stack guidance and pre-delivery checklist |
| **ui-styling** | `.claude/skills/ui-styling/` | Tailwind patterns. shadcn/ui is **optional**: prefer native elements, and add a component only when it clearly saves work |
| **brand** | `.claude/skills/brand/` | Voice and tone for ID/EN copy |
| **design-system** | `.claude/skills/design-system/` | Token layering (primitive → semantic → component) |

Useful ui-ux-pro-max commands (run from the repo root):

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "NFC QR review badge store product customizer local business" --design-system -p "TapUlasan" --variance 7 --motion 7 --density 4 -f markdown
```

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "3d product viewer customizer" --stack nextjs
```

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "multi-step checkout form validation" --domain ux
```

> ⚠️ The generator's default output for this product was generic: amber/green, Rubik + Nunito Sans, a "Bento grid" layout, and a "Product Review/Ratings" pattern that *depends on testimonials we are not allowed to invent*. Treat it as **input to your thinking, not the answer**. Use it mainly for its UX rules and checklist. The art direction in §5 takes priority.

### Phases (finish each one before starting the next)
1. **Design direction:** load the skills, then write `docs/DESIGN.md` covering concept, tokens (colors, type scale, radius, shadows, motion durations and easings), component inventory, and a page-by-page wireframe in words. Keep it to about one page.
2. **Scaffold:** project setup (§4), tokens in CSS, fonts, layout shell, i18n plumbing, header/footer, language toggle.
3. **Badge engine:** the badge-face canvas renderer and the 3D viewer, with fallbacks (§6.3–6.4).
4. **Product page + customizer** (§6.5).
5. **Home**, including the tap-demo hero animation (§7.1).
6. **Checkout → WhatsApp** (§6.6).
7. **How it works, Contact, Shop listing, 404, SEO** (§7).
8. **QA pass** against §11, then fix everything it finds.

Commit after each phase with a clear message.

---

## 4. Technical setup

### 4.1 Scaffolding
The repo already contains `.claude/`, `.gitignore`, `README.md` and `docs/`, so `create-next-app` may refuse to run in a non-empty folder. Scaffold into a temp folder and move the files in. **Do not overwrite `docs/`, `.claude/` or `CLAUDE.md`.** If the scaffold generates its own `AGENTS.md`/`CLAUDE.md`, merge its content into ours instead of replacing ours.

```bash
npx create-next-app@latest /tmp/tapulasan-scaffold --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Node in this environment is v20.19, which meets Next 16's Node ≥ 20.9 requirement.

> Next.js 16 changed several defaults: Turbopack is the default bundler, `next lint` was removed (call ESLint directly), Tailwind v4 uses CSS-first `@theme` config, and async `params` are required. **Check APIs against the docs bundled in `node_modules/next/dist/docs/` (if present) or nextjs.org/docs, not against memory.**

### 4.2 Dependencies (keep the list short)
| Package | Why |
|---|---|
| `three`, `@react-three/fiber`, `@react-three/drei` | 3D badge viewer |
| `motion` (import from `motion/react`) | UI and tap-demo animation |
| `qrcode` (+ `@types/qrcode`) | Draws the live QR onto the badge canvas |
| `lucide-react` | Icons (no emoji as icons) |

**Do not add** a state library, form library, i18n library, CMS or analytics. React state, URL params and a typed dictionary are enough here. If you think you need something else, write the reason in `docs/DESIGN.md` first.

### 4.3 `next.config.ts`
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true }, // static export: no image optimizer
};

export default nextConfig;
```

Load fonts with `next/font/google`. They are self-hosted at build time, which works with static export.

### 4.4 i18n structure (static-export friendly)
Use **two root layouts via route groups** so each language gets a correct `<html lang>`, with no middleware and no redirects:

```
src/app/
  (id)/
    layout.tsx            ← <html lang="id">
    page.tsx              ← /             → <HomeView lang="id" />
    shop/page.tsx         ← /shop
    shop/[format]/page.tsx← /shop/table-stand  (generateStaticParams)
    checkout/page.tsx     ← /checkout
    how-it-works/page.tsx ← /how-it-works
    contact/page.tsx      ← /contact
  (en)/
    en/
      layout.tsx          ← <html lang="en">
      page.tsx            ← /en
      shop/...            ← /en/shop, /en/shop/[format]
      checkout/...        ← /en/checkout
      how-it-works/...
      contact/...
src/views/                ← one real implementation per page, takes `lang`
src/content/
  dictionary.ts           ← typed { id: {...}, en: {...} }; the EN type must match ID exactly
  products.ts             ← formats, finishes, colors (bilingual labels)
src/config/site.ts        ← email, WhatsApp number, domain
src/lib/                  ← badge renderer, whatsapp message builder, review-link check
```

- Route files stay **thin** (about 3 lines): they import a view and pass `lang`. All logic and markup live in `src/views` and `src/components`.
- URL path segments stay the same in both languages (`/shop`, `/en/shop`). Localized slugs are not worth the mapping work.
- The language toggle maps the current path to its counterpart (`/shop/keychain` ↔ `/en/shop/keychain`) and keeps the query string, so the customizer state survives the switch.
- Add `alternates.languages` (hreflang) and `canonical` to each page's metadata.
- **404:** with multiple root layouts there is no shared root `not-found`. Use `global-not-found.tsx` per the current Next docs (it may need an experimental flag). Cloudflare Pages serves `out/404.html` automatically. Show a bilingual 404 message.

---

## 5. Art direction (default proposal: refine it, don't throw it away without a reason)

**Concept: "Satu tap." (One tap.)** The site should feel **tactile and physical**: a real object you want to pick up, set in the warm, everyday world of an Indonesian café counter. Think premium product-launch page crossed with a friendly neighborhood brand. Not a SaaS template, not a purple gradient.

- **Mood words:** tactile, warm, confident, crisp, playful-but-trustworthy.
- **Signature motif:** the **NFC ripple**, concentric rings radiating from a point of touch. Use it for the tap demo, hover states, section dividers, loading states and the favicon. One strong motif, used with discipline.
- **Palette (starting point; check every text pair against 4.5:1 contrast):**
  - Paper `#F6F1E7` (main background, warm off-white)
  - Ink `#15120F` (text, dark bands)
  - Tap orange `#FF5A1F` (the single loud accent, used for primary CTAs and the ripple; use it sparingly)
  - Star gold `#F5B301` (rating stars only)
  - Leaf green `#1F7A4D` (success/confirmation states)
  - Neutrals: derive warm greys from Ink and Paper, not cool slate.
  - Dark ink-colored text on Tap orange buttons usually passes contrast better than white. Verify it.
- **Type (starting point):**
  - Display: **Bricolage Grotesque**, big, tight tracking, expressive at hero sizes.
  - Body/UI: **Plus Jakarta Sans**, designed in Jakarta, so it carries a real local story. Good Indonesian readability.
  - Mono accents (tap counters, order IDs, labels): **JetBrains Mono**, used sparingly.
- **Layout:** mobile-first, with large type, generous whitespace and asymmetric compositions on desktop. The 3D badge should break out of its container: let it overlap section edges.
- **Motion:** purposeful and physical (springs, slight overshoot on the badge, ripple easing out). Respect `prefers-reduced-motion`: show final states and swap animations for crossfades.
- **Imagery:** 3D renders of the badge and simple illustrated or 3D scenes. **No stock photos of "happy diverse people".** No AI-generated photos passed off as real customers.

> Write your final direction in `docs/DESIGN.md`. If you change the palette or fonts, explain why in one line.

---

## 6. Store and product experience (core scope)

### 6.1 Badge formats (candidates: data-driven, **DECIDE** final list)
| slug | ID name | EN name | Rough shape for 3D |
|---|---|---|---|
| `counter-plate` | Plakat Kasir | Counter Plate | Flat rounded rectangle (~A6) on a slight stand angle |
| `table-stand` | Stand Meja | Table Stand | Upright card in a base (L or triangular tent) |
| `lanyard-card` | Kartu Lanyard | Lanyard Card | CR80 card size (85.6 × 54 mm) with a slot hole |
| `keychain` | Gantungan Kunci | Keychain | Small rounded tag with a ring |

All of these live in `src/content/products.ts` with `price: null`, real-world dimensions (placeholder values, marked `// DECIDE`), and the NFC zone position on the face.

### 6.2 Customization options
- **Business name:** text, max ~28 chars, auto-fits to the face.
- **Logo:** upload PNG/JPG/SVG, max 2 MB, **processed only in the browser** (FileReader/object URL). Never uploaded anywhere. Show a "remove" control. During checkout, tell the user to send the logo file in the WhatsApp chat.
- **Base color:** about 8 curated swatches plus a custom picker (`<input type="color">`). Text color switches between ink and paper automatically for contrast.
- **Finish (candidates, DECIDE):** Matte, Glossy, Wood (bamboo), Brushed metal. Each maps to a `MeshPhysicalMaterial` preset (roughness, metalness, clearcoat, or a wood grain made procedurally or as a small texture).
- **Call-to-action line on the badge:** default "Tap atau scan untuk ulasan" / "Tap or scan to review". Editable, with a character limit.
- **Google review link:** drives a **live QR code** on the face. Until a valid link is entered, use a clearly fake demo QR labeled "contoh / sample".
- **Show NFC zone:** a toggle that overlays a pulsing ripple on the NFC coil area.

### 6.3 Badge face renderer (one source of truth)
Write **one function** that draws the badge face onto a 2D `<canvas>` from the config (background/finish tint, logo, name, CTA, QR, NFC icon, small TapUlasan mark). Use this canvas for:
- the **3D texture** (`THREE.CanvasTexture`, with `needsUpdate` set on change), and
- the **2D fallback preview** and checkout summary thumbnail.

This keeps 2D and 3D identical with no duplicated layout logic. Render at about 2× resolution for crispness. Debounce redraws while the user types.

### 6.4 3D viewer
- `@react-three/fiber` `<Canvas>`, loaded with `next/dynamic` and `ssr: false`. Show a **poster** (the 2D canvas preview, or a static image) while it loads.
- Build the geometry **procedurally** (drei `RoundedBox`, extruded shapes). No external GLB files are needed.
- Rotate and zoom: drei `OrbitControls` (or `PresentationControls`) with limits: no flipping under the floor, clamped zoom. Add a gentle auto-idle rotation that stops on interaction.
- Lighting: **use drei `<Environment>` with `<Lightformer>`s, not `preset`**. Presets download HDRs from a third-party CDN, which breaks offline/static robustness.
- Soft contact shadow under the object.
- Performance: `dpr={[1, 2]}`, `frameloop="demand"` (call invalidate on change), and pause when off-screen (IntersectionObserver).
- **Fallbacks:** if WebGL is unavailable or the context is lost, show the 2D canvas preview with a CSS 3D tilt on pointer move. With reduced motion, turn off auto-rotate.
- **Accessibility:** the canvas gets `role="img"` plus a live `aria-label` describing the current config. Visible buttons for "Putar / Rotate", "Reset view" and zoom +/- so it works without drag gestures (WCAG 2.2 dragging alternative).
- Mobile: horizontal drag rotates the badge. Vertical swipes must still scroll the page (`touch-action: pan-y` on the wrapper; don't trap scrolling).

### 6.5 Product page `/shop/[format]` (+ `/en/...`)
- **Mobile:** viewer on top (about 55vh), with a sticky bottom bar showing **"Lanjut ke pesanan / Continue to order"**. Customizer controls go in sections or a bottom sheet below.
- **Desktop:** viewer on the left (sticky), controls on the right.
- Format switcher (the four formats) at the top of the controls. Switching keeps the rest of the config.
- **Customizer state lives in URL search params** (name, color, finish, cta, link, format). The design is then shareable, survives language switching and survives reloads. The logo is the exception: keep it in memory/sessionStorage only. Wrap storage access in try/catch.
- Below the fold:
  - **In-context mockups:** the badge on a café counter, a table stand on a table, a lanyard, a keychain. Build them as 3D or illustrated scenes using the user's live design where feasible. Otherwise use image slots `public/mockups/<slug>.webp` with a tasteful "Foto segera / Photo coming soon" placeholder.
  - Specs table (dimensions, material, NFC chip type, compatibility note: "works with NFC-enabled phones; QR for everyone else"). All values are placeholders, marked `[[PLACEHOLDER]]`.
  - A short FAQ.

### 6.6 Checkout `/checkout` → WhatsApp
A stepper with visible progress, Back on every step, and errors shown next to the field. The order of steps follows the spec ("choose type, customize, enter Google review link, pay, ship"):

1. **Badge & quantity:** format (pre-filled from the product page), quantity stepper. Prices show "Harga dikonfirmasi via WhatsApp / Price confirmed via WhatsApp".
2. **Design:** a summary thumbnail from the canvas renderer, plus an "Ubah desain / Edit design" link back to the customizer with the state intact.
3. **Google review link:** an input with **soft validation**. Accept `g.page/r/.../review`, `search.google.com/local/writereview?placeid=...`, `maps.app.goo.gl/...` and `google.com/maps...`. Show a non-blocking warning for anything else. Add a collapsible helper: "Cara menemukan link ulasan Google Anda / How to find your Google review link" (step-by-step via Google Business Profile → "Ask for reviews").
4. **Contact & shipping:** name, business name, WhatsApp number (with an Indonesian format hint), address, city, postal code, optional notes. Use proper `autocomplete` attributes, visible labels and `inputmode` for phone/postal fields.
5. **Payment preference:** QRIS / Transfer bank / E-wallet (radio cards), with the note "Detail pembayaran dikirim via WhatsApp setelah pesanan dikonfirmasi / Payment details are sent over WhatsApp after the order is confirmed". **Do not collect any card or bank numbers.**
6. **Review & send:** the full summary, a generated order reference (`TU-YYMMDD-XXXX`, client-side), and:
   - Primary: **"Kirim pesanan via WhatsApp"** → `https://wa.me/<WHATSAPP_NUMBER>?text=<encodeURIComponent(message)>`
   - Secondary: **"Kirim via email"** → `mailto:james@tapulasan.my.id?subject=...&body=...`
   - A reminder: "Kirim file logo Anda di chat setelah pesan terkirim / Send your logo file in the chat after sending".
   - A success state with next steps (we confirm the design mockup, send payment details, then produce and ship).

Form progress is saved to `sessionStorage` (try/catch) so an accidental back or refresh loses nothing.

**Message builder:** put it in `src/lib/order-message.ts` as a pure function `(order, lang) => string`. It produces a readable multi-line message (order ref, format, quantity, finish, color hex, business name, CTA text, review link, contact, address, payment preference, design-share URL). Leave **one small test** next to it (`node --test` or a plain assert script) that covers encoding, both languages and empty optional fields. Do the same for the review-link checker.

---

## 7. Pages

### 7.1 Home `/` and `/en`
1. **Hero: the tap demo (the most important moment on the site).** A phone moves toward the badge → contact → the NFC ripple bursts → the phone screen transitions into a **generic review screen** (business name from the default demo, 5 empty stars that fill one by one, a "Tulis ulasan" field). Loops calmly, or plays on scroll into view, with a replay button.
   - Headline suggestion: **ID** "Satu tap. Langsung ke ulasan." / **EN** "One tap. Straight to the review." (refine with the brand skill)
   - Sub: what it is in one sentence. CTAs: **"Desain badge Anda / Design your badge"** (primary, goes to the shop) and **"Lihat cara kerja / See how it works"**.
   - Reduced motion: show a static 3-frame storyboard instead.
   - **Do not use the Google logo or copy Google's UI exactly.** Make the review screen generic and clearly illustrative. You may write "Google review" in the text.
2. **Problem → solution:** "Pelanggan senang jarang menulis ulasan" with the friction shown as steps (open Maps → search → scroll → find the review button…) versus one tap.
3. **Formats strip:** the four formats as interactive cards (mini 3D or turntable image) linking to the product pages.
4. **How it works:** 3 steps (the 4th labeled as planned).
5. **Business website** offering: a short section with a phone mockup of an example client site (menu, hours, map, "Tinggalkan ulasan" button). CTA goes to contact.
6. **AI review assistant: Segera hadir.** Describe draft replies, theme summaries and negative-review alerts, and stress that **the owner approves everything**.
7. **Our principles:** no review gating, no fake reviews, the owner stays in control. This is a trust block in place of testimonials.
8. **FAQ** (Do customers need an app? Does it work on iPhone? What if a phone has no NFC? Can I change the link later? **DECIDE** the answer to that one, use a placeholder.)
9. **Final CTA** + footer (email, WhatsApp, language toggle, © TapUlasan).

### 7.2 Shop `/shop`
A grid of the four formats with a hero visual each, a short description, "Harga segera" and a "Kustomisasi / Customize" button.

### 7.3 How it works `/how-it-works`
An expanded version of the steps, with a visual for each: tap vs scan, iPhone/Android NFC notes, the "where to place your badge" tips, the no-gating principle, and setup steps for the business (find the review link → design → order → receive → place it).

### 7.4 Contact `/contact`
No form backend. Show big tappable WhatsApp and email buttons (prefilled greeting) and the domain. Optionally a simple form that composes a `mailto:` or `wa.me` link on the client. Do not store or send anything anywhere else.

### 7.5 Global
- Header: wordmark, nav (Beranda/Home, Toko/Shop, Cara Kerja/How it works, Kontak/Contact), ID | EN toggle, CTA button. Mobile: a compact header with a menu sheet. Keep targets ≥ 44px.
- Skip link, visible focus rings, one `h1` per page, sequential headings.
- **SEO:** per-page `metadata` (title, description, OG) in both languages, a static OG image (`opengraph-image` that works with static export, or a PNG in `public/`), `sitemap.ts` + `robots.ts` (both static), Organization JSON-LD. Favicon built from the ripple motif.

---

## 8. Copy and voice
- **Indonesian first.** Write natural, friendly, everyday Indonesian ("Anda" for respect, but keep it warm, not bureaucratic). Then English with the same meaning. Do not translate word for word.
- Short sentences. Talk to café and salon owners, not developers. Avoid jargon. If you mention "NFC", explain it once ("tempelkan HP / tap your phone").
- All copy lives in `src/content/dictionary.ts`. Type the EN object against the ID object so a missing key is a type error.

## 9. Placeholders policy
- Mark every unknown with the literal string `[[PLACEHOLDER: what is missing]]` in data/content, **or** render a styled "segera / coming soon" UI state. Never write a plausible-looking fake value.
- **Forbidden:** invented prices, "1,000+ businesses", star ratings, testimonials, partner logos, press logos, "as seen in".
- Before finishing, run `grep -rn "PLACEHOLDER" src` and list every result in your final report so the owner knows what to fill in.

## 10. Out of scope (don't build)
Accounts/login, the owner dashboard, the AI assistant itself, real payments, order database, CMS, analytics/tracking, cookie banners (nothing is tracked), and the client-website template product.

---

## 11. Definition of done (check every item, and report the results)
- [ ] `npm run build` succeeds with `output: 'export'` and produces `out/` with `index.html`, `en/index.html`, every `shop/<format>` page in both languages, `checkout`, `how-it-works`, `contact` and `404.html`.
- [ ] Serve `out/` locally (e.g. `npx serve out`) and click through every page in **both languages**, with no console errors.
- [ ] Works at **375px**, 768px, 1024px and 1440px, with no horizontal scroll. Thumb-friendly on mobile.
- [ ] 3D viewer: rotate, zoom, reset and buttons all work; live updates on every customizer change; WebGL-off fallback verified (e.g. force the fallback through a query flag).
- [ ] Tap demo plays; the reduced-motion version is verified (emulate `prefers-reduced-motion`).
- [ ] Customizer state survives reload and the language switch (except the logo, by design).
- [ ] Checkout: validation, back/forward, sessionStorage restore; the WhatsApp link opens with a correctly encoded message in ID and EN; the mailto fallback works.
- [ ] The tests for `order-message` and the review-link checker pass.
- [ ] Lighthouse (mobile) on Home and a product page: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95. The 3D bundle is **not** in the initial JS of pages that don't use it.
- [ ] Keyboard-only run-through of the customizer and checkout. Visible focus everywhere. Contrast checked.
- [ ] The ui-ux-pro-max pre-delivery checklist has been run, with results noted.
- [ ] No invented numbers, testimonials or prices; placeholder list reported (§9).
- [ ] `README.md` updated: what the project is, `npm run dev`, `npm run build`, Cloudflare Pages settings (build `npm run build`, output `out`, Node version env var `NODE_VERSION=20` or higher), and where to edit copy, products and the WhatsApp number.

## 12. Final report to the owner
When done, reply with: what was built (pages list), screenshots of Home/product/checkout on mobile, the placeholder list, any deviations from this brief with a reason, and open questions.
