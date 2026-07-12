# softlisteners

A calm, confidential one-to-one listening service booking site. Pure static HTML/CSS/JS — no build step, no framework, no backend.

## Stack

- Plain HTML, CSS, and vanilla JavaScript
- [Formspree](https://formspree.io) for booking submissions (endpoint: `https://formspree.io/f/mpqvanyg`)
- [qrcode.js](https://github.com/soldair/node-qrcode) (via CDN) for the UPI payment QR code
- Deployed on Cloudflare Pages

## Folder structure

```
index.html
style.css
script.js
favicon.svg
privacy.html
terms.html
robots.txt
sitemap.xml
_headers        (Cloudflare Pages response headers)
_redirects      (Cloudflare Pages clean-URL routes)
assets/
  images/
  icons/
```

## Local development

No build step required. Open `index.html` directly in a browser, or serve the folder locally:

```bash
npx serve .
```

## Formspree

The booking form POSTs directly to `https://formspree.io/f/mpqvanyg` as JSON. To change where submissions are delivered, update the recipient email in the Formspree dashboard for that form — this is not configured in code.

## Deploying to Cloudflare Pages

1. Push this folder to a GitHub repository.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the repository.
4. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`
5. Deploy. No environment variables are required — the site is fully static.

## Notes

- Booking data is never stored in the browser or on a server; each submission goes straight to Formspree.
- The UPI ID and QR code are generated client-side from a fixed VPA (`8446913797@slc`) — no payment gateway or backend involved.
- "My bookings" history is intentionally not implemented yet (no backend/database); the section shows a placeholder message instead.
