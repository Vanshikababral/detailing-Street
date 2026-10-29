# DECISIONS.md
## Detailing Street Ludhiana — Premium Home Page
**Track:** Part 2 — The Premium Home Page  
**Live URL:** https://detailingstreetludhiana.pro  
**GitHub:** https://github.com/jatinvohra11/detailing-street-ludhiana

---

## What I Built & Why

I took a real, operating automotive detailing studio in Ludhiana, India and rebuilt their web presence from scratch. The business had no website — just an Instagram page. The brief was simple: make someone who lands on this page want to book an appointment in under 3 seconds.

**Stack:** Next.js 15, Tailwind CSS, Framer Motion, Google Sheets API (as CRM backend)

---

## Question 1 — Why this approach over the obvious alternative I rejected?

**The obvious alternative:** A static marketing page with fake testimonials, stock photos, and made-up "500+ happy customers" counters — the standard agency template.

**What I did instead:** Every data point on this site is real:
- Reviews are pulled directly from the business's Google Maps listing (10 reviews, all 5-star, real customer names)
- Studio photos are actual shots from the workshop
- Videos are real reels shot at the detailing bay
- The booking form connects to a live Google Sheet the owner checks daily
- Stats (500+ cars, 2 locations, 7 services) are actual business numbers

The constraint in the brief — *"no fabricated testimonials, fake user counts, or fake logos"* — is not a constraint for this project because the real data is compelling enough. A Mahindra Scorpio PPF job, a G-Wagon ceramic coat, a customer named Varinder saying "best PPF service ever in Ludhiana" — that converts better than any invented copy.

**Why Google Sheets over a database:** The business owner is non-technical. He opens Google Sheets every morning. A PostgreSQL dashboard would sit unused. The right backend is the one the client actually uses.

---

## Question 2 — One trade-off under the time limit, and what I'd do with a real week

**Trade-off made:** Instagram embeds are server-side iframes (Instagram's official oEmbed). They load slowly (~1.5s), depend on Instagram's CDN, and break if Instagram changes their embed policy. The real solution is the Instagram Graph API — it would let me fetch posts server-side, cache them, and display them with full design control.

I didn't build the Graph API integration because it requires Meta Business verification (a 2-3 day process), which falls outside the time budget.

**With a real week:** I'd complete Meta Business verification, implement the Graph API with a 1-hour cache layer (Redis or Vercel KV), and replace the iframe embeds with natively styled post cards that match the dark theme. This also removes the external dependency entirely — if Instagram goes down, the site still shows the last cached posts.

**Second trade-off:** The two gallery videos (69MB and 73MB .mov files) are served directly from Vercel's CDN. Under real traffic, this would burn through the 100GB/month bandwidth limit quickly. With a real week, I'd run them through FFmpeg compression to H.264 at 720p (~12MB each) and serve them from Cloudflare R2 with proper cache headers.

---

## Question 3 — Where I used AI tools, and what I personally verified or changed

**Used AI for:**
- Initial component scaffolding (hero section, booking form structure, navbar)
- Tailwind class suggestions for glassmorphism effects
- Google Sheets API integration boilerplate

**What I personally verified and changed:**

1. **The booking form had a critical bug** — a decorative `<div>` with `absolute inset-0` and no `pointer-events-none` was sitting on top of all form inputs, making them completely unclickable. The AI-generated code missed this. I found it by inspecting the DOM in DevTools, seeing a 843×1157px div highlighted over the form, and adding `pointer-events-none` to fix it.

2. **Google Sheets private key format** — the AI-generated `.env` example had `---BEGIN PRIVATE KEY` (3 dashes) instead of `-----BEGIN PRIVATE KEY` (5 dashes). The API was returning `ERR_OSSL_UNSUPPORTED` and I traced it through the Vercel function logs to find the malformed key.

3. **InstagramSection had a broken SVG path** — a `<path d="M12 2.163..."/>` with literal `...` in the path data, which caused a React hydration crash that silently disabled all interactive elements site-wide. Console showed `Error: <path> attribute d: Expected number`. I identified the broken SVG, replaced it with the complete Instagram icon path.

4. **Real reviews** — AI generated placeholder reviews with Indian-sounding names. I replaced all of them with the actual 10 Google reviews from the business's Maps listing, verified by screenshot.

5. **All copy** — I rewrote service descriptions, FAQ answers, and the hero tagline. The AI defaults to generic automotive copy; I made it specific to Ludhiana market (local landmarks for location cards, Punjab-specific vehicle preferences in service descriptions).

---

## Easter Egg 🥚

Type the Konami Code on the homepage:  
`↑ ↑ ↓ ↓ ← → ← → B A`

A red neon "DETAILING STREET APPROVES 🚗" toast notification appears.  
*(Not yet implemented — would add with `useEffect` + `keydown` listener if time permitted. Flagging it honestly.)*

