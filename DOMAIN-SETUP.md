# Connecting skbridalstudio.com

The site is live at https://skbridalstudio.web.app (Firebase project `sk-bridal-studio`, Hosting site `skbridalstudio`).
Everything in the code is ready for the custom domain; the only code change needed later is one line in `vite.config.ts`.

## 1. Buy the domain
Buy `skbridalstudio.com` from any registrar (GoDaddy, Namecheap, Hostinger, Google/Squarespace Domains, etc.).
Keep the registrar's **DNS settings** page open for step 2.

## 2. Add the domain in Firebase
1. Open https://console.firebase.google.com/project/sk-bridal-studio/hosting/sites
2. Pick the **skbridalstudio** site (not `sk-bridal-studio`) → **Add custom domain**.
3. Enter `skbridalstudio.com` and continue.
4. Firebase shows the DNS records to add — copy them exactly as shown. Usually:
   - a **TXT** record on `@` (proves you own the domain)
   - **A** record(s) on `@` pointing at the IP address(es) Firebase gives
5. At the registrar, delete any existing `A`/`AAAA` records on `@` (often a "parked" page), then add Firebase's records.
6. Back in Firebase, click **Verify**.

## 3. Add www
Repeat **Add custom domain** with `www.skbridalstudio.com`, choose **Redirect to an existing domain** → `skbridalstudio.com`,
and add the record Firebase shows (usually a **CNAME** on `www`).

## 4. Wait for SSL
DNS can take from a few minutes up to 24 hours (rarely 48). Firebase then issues the HTTPS certificate automatically.
The domain shows **Connected** in the console when done. Check that https://skbridalstudio.com opens before going on.

## 5. Switch the site to the new address
In `vite.config.ts` change:

```ts
const SITE_URL = 'https://skbridalstudio.web.app';
```
to
```ts
const SITE_URL = 'https://skbridalstudio.com';
```

Then build and deploy:

```
npm run build
firebase deploy --only hosting:skbridalstudio
```

This one change updates the canonical links, share previews, `sitemap.xml` and `robots.txt`, and makes visitors who open
`skbridalstudio.web.app` (or old links to it) jump to the same page on `skbridalstudio.com`.

Do **not** do step 5 before step 4 is finished, or visitors will be sent to a domain that doesn't work yet.

## 6. After it's live
- [ ] Open https://skbridalstudio.com, https://www.skbridalstudio.com and https://skbridalstudio.web.app — all should end on `skbridalstudio.com`.
- [ ] Refresh on an inner page (e.g. `/gallery`) — it should load, not 404.
- [ ] Test on a phone (Android and iPhone): menu, gallery, Book Now, WhatsApp, Call, Instagram, Contact form.
- [ ] Firebase Console → Authentication → Settings → **Authorized domains**: add `skbridalstudio.com` (only needed if Firebase login is added later).
- [ ] Google Analytics → Admin → Data streams → web stream: update the website URL to `https://skbridalstudio.com`.
- [ ] Google Search Console (https://search.google.com/search-console): add `skbridalstudio.com` as a **Domain** property, verify with the TXT record it gives, then submit `https://skbridalstudio.com/sitemap.xml`.
- [ ] Google Business Profile and Instagram bio: update the website link.
- [ ] Optional: a professional email like `hello@skbridalstudio.com` (Google Workspace or Zoho Mail) — add the MX records they give at the registrar.

## 7. The old site
Keep `sk-bridal-studio.web.app` until step 6 checks pass. After that you can either leave it (it stops receiving updates)
or deploy the current build to it too so it also redirects to `skbridalstudio.com`.
