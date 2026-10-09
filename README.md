# TapUlasan

Website and online store for **TapUlasan** (tapulasan.my.id): NFC + QR badges that send a business's customers straight to its Google review page.

- Bilingual: Indonesian at `/`, English at `/en/`
- Live badge customizer with a 3D viewer (2D fallback), shareable via the URL
- Checkout runs entirely in the browser and ends by opening **WhatsApp** with a prefilled order (email fallback). No backend, no payment gateway.
- Fully static (`output: "export"`), hosted on Cloudflare Pages

Design direction: [`docs/DESIGN.md`](docs/DESIGN.md). Build brief: [`docs/BRIEF.md`](docs/BRIEF.md).

## Develop

Requires **Node 26** (see `.nvmrc`; `nvm use`).

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # order-message + review-link tests (node --test)
npm run lint
npm run build      # static export → out/
npx serve out      # preview the export locally
```

Debug flag: add `?no3d=1` to a product URL to force the 2D fallback viewer.

## Deploy (Cloudflare Pages)

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `out` |
| Environment variable | `NODE_VERSION=26` |

Cloudflare serves `out/404.html` for unknown URLs automatically.

## Where to edit things

| What | File |
|---|---|
| All copy (ID + EN) | `src/content/dictionary.ts` (EN is type-checked against ID: a missing key fails the build) |
| Badge formats, sizes, prices, finishes, colour swatches, product photos | `src/content/products.ts` |
| WhatsApp number, email, domain | `src/config/site.ts` |
| WhatsApp/email order message | `src/lib/order-message.ts` |
| Badge face layout (used for 3D, 2D and thumbnails) | `src/lib/render-badge.ts` |
| Design tokens (colours, type, radius, motion) | `src/app/globals.css` |

Unknown values are marked `[[PLACEHOLDER: …]]` and show as a "to be confirmed" chip on the site. List them with:

```bash
grep -rn "PLACEHOLDER" src
```

To remove a badge format or finish, delete its entry in `src/content/products.ts`. Prices are `null` until decided ("price coming soon"). To add a real product photo, put it in `public/mockups/` and set `photo: "/mockups/<slug>.webp"` on the format.

## Structure

```
src/app/(id)/…          Indonesian routes (root layout, <html lang="id">)
src/app/(en)/en/…       English routes (root layout, <html lang="en">)
src/app/global-not-found.tsx   bilingual 404
src/views/              one implementation per page, takes `lang`
src/components/         UI (customizer, checkout, tap demo, badge viewer…)
src/content/            dictionary + product data
src/lib/                renderer, message builder, link checker, helpers
```
