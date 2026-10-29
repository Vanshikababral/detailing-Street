# 🚗 Detailing Street Ludhiana — Production Website

Premium automotive detailing website built with Next.js 15, Tailwind CSS, Framer Motion, and Google Sheets CRM integration.

---

## 📁 Project Structure

```
detailing-street/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── book-appointment/
│   │   │       └── route.ts          # Booking API → Google Sheets
│   │   ├── globals.css               # Global styles, animations
│   │   ├── layout.tsx                # Root layout + SEO metadata
│   │   ├── page.tsx                  # Main page (all sections)
│   │   ├── sitemap.ts                # XML sitemap
│   │   └── robots.ts                 # robots.txt
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            # Sticky navigation
│   │   │   └── Footer.tsx            # Footer with links
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx       # Cinematic hero with parallax
│   │   │   ├── ServicesSection.tsx   # 7 premium service cards
│   │   │   ├── WhyChooseUs.tsx       # Animated stats + reasons
│   │   │   ├── GallerySection.tsx    # Filterable gallery + lightbox
│   │   │   ├── InstagramSection.tsx  # Instagram preview grid
│   │   │   ├── ReviewsSection.tsx    # Google reviews carousel
│   │   │   ├── LocationSection.tsx   # Dual location cards + maps
│   │   │   ├── BookingSection.tsx    # Booking form → Google Sheets
│   │   │   └── FAQSection.tsx        # Accordion FAQ
│   │   └── ui/
│   │       └── FloatingButtons.tsx   # Call + Directions FABs
│   └── lib/
│       └── googleSheets.ts           # Google Sheets API integration
├── public/
│   └── images/
│       └── logo.png                  # ← PLACE YOUR LOGO HERE
├── .env.example                      # Environment variable template
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual values (see Google Sheets Setup below).

### 3. Add Your Logo

Place your logo image at:
```
public/images/logo.png
```

The uploaded `Screenshot_2026-06-12_150316.png` logo should be saved here as `logo.png`.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Google Sheets Integration Setup

### Step 1: Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project named `detailing-street-crm` (or use existing)
3. Enable **Google Sheets API**:
   - APIs & Services → Enable APIs → Search "Google Sheets API" → Enable

### Step 2: Create Service Account

1. APIs & Services → Credentials → Create Credentials → **Service Account**
2. Name: `detailing-street-service`
3. Email will be: `detailing-street-service@detailing-street-crm.iam.gserviceaccount.com`
4. Click **Done**

### Step 3: Generate Private Key

1. Click the service account → **Keys** tab
2. Add Key → Create New Key → **JSON**
3. Download the JSON file — keep it safe!

### Step 4: Share Google Sheet with Service Account

1. Open your Google Sheet: `https://docs.google.com/spreadsheets/d/1_60By3JFSXmeNY61vm9dk5iM0w06DGaikz3Sajz5p6w`
2. Click **Share**
3. Add the service account email: `detailing-street-service@detailing-street-crm.iam.gserviceaccount.com`
4. Give it **Editor** access

### Step 5: Set Up Sheet Headers

In the `Bookings` sheet, add these headers in Row 1:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Customer Name | Phone Number | Email | Car Model | Service | Preferred Date | Preferred Time | Message | Booking Status | Submitted At |

> **Note:** The API will auto-create headers if the sheet is empty.

### Step 6: Update .env.local

```env
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n[your key here]\n-----END RSA PRIVATE KEY-----"
GOOGLE_SHEETS_CLIENT_EMAIL="detailing-street-service@detailing-street-crm.iam.gserviceaccount.com"
GOOGLE_SHEETS_SPREADSHEET_ID="1_60By3JFSXmeNY61vm9dk5iM0w06DGaikz3Sajz5p6w"
GOOGLE_SHEETS_SHEET_NAME="Bookings"
GOOGLE_PROJECT_ID="detailing-street-crm"
```

> ⚠️ **Important:** When copying the private key from the JSON file, replace literal newlines with `\n` in the .env file.

---

## 🌐 Deployment on Vercel (Recommended)

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Option B: GitHub + Vercel Dashboard

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Select your repository
4. Add all environment variables from `.env.local`
5. Deploy!

### Environment Variables on Vercel

In Vercel Dashboard → Project → Settings → Environment Variables, add:

| Key | Value |
|-----|-------|
| `GOOGLE_SHEETS_PRIVATE_KEY` | Your private key (with `\n` newlines) |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | Service account email |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Sheet ID |
| `GOOGLE_SHEETS_SHEET_NAME` | `Bookings` |
| `GOOGLE_PROJECT_ID` | `detailing-street-crm` |
| `NEXT_PUBLIC_SITE_URL` | `https://detailingstreetludhiana.com` |

### Custom Domain

1. Vercel Dashboard → Project → Settings → Domains
2. Add `detailingstreetludhiana.com`
3. Update DNS at your domain registrar:
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → `76.76.21.21`

---

## 🔧 Customization Guide

### Update Business Info

Edit `src/app/layout.tsx` for metadata/SEO keywords.

Edit `src/components/layout/Footer.tsx` for contact info.

### Add Real Gallery Images

Replace Unsplash URLs in `src/components/sections/GallerySection.tsx` with your actual car photos. Place images in `public/images/gallery/` and reference as `/images/gallery/your-photo.jpg`.

### Update Reviews

Edit the `reviews` array in `src/components/sections/ReviewsSection.tsx` with real customer reviews.

### Google Maps Embed

In `src/components/sections/LocationSection.tsx`, replace the `embedUrl` values with your actual Google Maps embed URLs:

1. Go to Google Maps → Find your location
2. Share → Embed a map → Copy iframe src URL
3. Paste into `embedUrl` field

### Instagram Live Feed (Optional)

For live Instagram posts, integrate the Instagram Basic Display API:
1. Get Instagram Business Account
2. Set up Instagram Graph API app
3. Replace static posts in `InstagramSection.tsx` with API calls

---

## 📊 Google Sheets CRM — What Gets Saved

Every booking form submission appends a new row:

| Column | Data |
|--------|------|
| Customer Name | Full name entered |
| Phone Number | Mobile number |
| Email | Email address |
| Car Model | Vehicle details |
| Service | Selected service |
| Preferred Date | Chosen date |
| Preferred Time | Chosen time slot |
| Message | Additional notes |
| Booking Status | Always `New Lead` initially |
| Submitted At | IST timestamp |

You can then update "Booking Status" manually in the sheet (e.g., "Confirmed", "Completed", "Cancelled").

---

## 🏗️ Build for Production

```bash
npm run build
npm run start
```

---

## 📱 Performance Checklist

- ✅ Mobile-first responsive design
- ✅ Image optimization with Next.js `<Image>`
- ✅ Font preloading via Google Fonts
- ✅ Lazy loading for below-fold sections
- ✅ Scroll-triggered animations
- ✅ SEO metadata, sitemap, robots.txt
- ✅ Schema.org LocalBusiness markup
- ✅ Open Graph social sharing tags
- ✅ Core Web Vitals optimized

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 15 | React framework + API routes |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Scroll animations & transitions |
| Google Sheets API | CRM / booking storage |
| react-hot-toast | Success/error notifications |
| react-intersection-observer | Scroll-triggered animations |
| react-countup | Animated statistics |

---

## 📞 Support

**Phone:** 9115555035  
**Email:** sarvottamchandel1509@gmail.com  
**Instagram:** [@detailingstreet_modeltownlud](https://www.instagram.com/detailingstreet_modeltownlud)

---

*Built for Detailing Street Ludhiana — Protect. Enhance. Transform.*
