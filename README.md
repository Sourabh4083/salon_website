# Blue Heaven Wighub & Unisex Salon

Online store for wigs, hair patches and toppers for men and women, plus a page for the unisex salon.

Built with Next.js 15 (App Router), MongoDB (Mongoose), Cloudinary (photo uploads), Razorpay (payments) and Tailwind CSS v4. It started from the `my-ecommerce` store template.

## What to edit

| To change | Edit |
|---|---|
| Business name, phone, WhatsApp, address, hours, GSTIN, delivery fee, salon services, hero photos | `lib/site.js` |
| Wig option lists (who it is for, hair type, base type, length) | `lib/wig.js` |
| Colours, fonts, button and card styles | `app/globals.css` |

Anything left empty in `lib/site.js` is hidden on the site. For example, WhatsApp buttons only appear once `whatsapp` is filled in.

## Prices and GST

- The price entered in admin **includes 18% GST**. That is what the customer pays.
- Cart, checkout and saved orders show the breakup (taxable value and GST). The maths lives in `lib/totals.js` and is used by both the server and the browser.
- The delivery fee is part of the amount charged at Razorpay, not only a display line.
- The site does not produce a formal tax invoice (invoice number, HSN, CGST/SGST/IGST split).

## Running it

```bash
npm install
npm run dev        # development, http://localhost:3000
```

```bash
npm run build      # production check; stop the dev server first
npm start
```

Environment variables go in `.env.local` (never committed) and in the Vercel project settings:

```
MONGODB_URI
JWT_SECRET
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

## First-time setup

1. Register an account on the site.
2. In MongoDB, open the `users` collection and set that account's `role` to `admin`.
3. Sign out and back in. "Manage products" now appears in the account menu.
4. Add wigs with photos. Portrait photos (4:5) look best.

## Deploying to Vercel

- The project name decides the free address, for example `blue-heaven-wighub.vercel.app`.
- A custom domain is attached under Project, Settings, Domains. Then update `url` in `lib/site.js`.
- The browser tab title comes from `lib/site.js`.

`docs/V3-CHANGELOG-AND-ARCHITECTURE.md` describes the architecture inherited from the template (caching, cart, auth flow).
