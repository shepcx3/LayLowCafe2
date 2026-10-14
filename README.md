# Lay Low Cafe website

Website for Lay Low Cafe, 241 Princess St, Kingston, ON. Served at https://laylowcafe.ca.

It's plain HTML, CSS and a little JavaScript. There's no build step and no framework, so any static host can serve the repo as it is.

```
index.html              the cafe page: hero, menu, visit (map, hours, phone), fall pop-up
late-night/index.html   Late Night @ Lay Low: events and private bookings (dark theme)
menu/ events/ contact-us/   tiny redirects so the old GoDaddy URLs still work (events/ goes to late-night/)
404.html
assets/css/styles.css   all styles; colours and fonts are at the top in :root
assets/js/main.js       open-now badge, menu tabs
assets/img/             photos, logo, icons
.nojekyll               tells GitHub Pages to serve files as-is
```

## Preview locally

```sh
python3 -m http.server 8080
# open http://localhost:8080
```

## Common edits

**Menu.** Edit the `#menu` section of `index.html`. Each category is one tab panel, and each item is one `<li>` with its name, price and description. Copy an existing item and change it. The comment above the tabs explains the VG / V / GF tags.

**Hours.** Hours appear in three places. Update all three:
1. The `HOURS` array in `assets/js/main.js`. This drives the "Open now" badge.
2. The JSON-LD `openingHoursSpecification` near the top of `index.html`. Google reads this.
3. The "When" line in the Visit section, plus the "7–4" sticker in the hero.

**Events.** Edit the event list in `late-night/index.html`. The comment above the list explains how. Each event has a `data-date` and hides itself automatically once its day has passed. When none are left, the page says new events are on the way. Also update the matching JSON-LD entry at the top of that file so Google shows the event.

**Seasonal pop-up.** The fall drinks card is the `<aside class="pop">` near the bottom of `index.html`. Edit the text there. A visitor who closes it won't see it again. For next season's card, change `data-pop-id` (e.g. to `winter-2026`) so everyone sees the new one. Delete the `<aside>` to turn the pop-up off.

**Photos.** The page uses one hero photo, `assets/img/brunch-spread.jpg`. The other photos in `assets/img/` are spares for swapping in. Keep photos at roughly 1200px on the long edge and JPEG quality 80.

Every link and asset path is relative. Keep it that way, so the site works on the real domain, on a GitHub Pages subfolder and when opened straight from disk.

## Hosting: GitHub Pages + laylowcafe.ca

The site is deployed with GitHub Pages: Settings → Pages, deploy from a branch, branch root `/`. GitHub Pages can stay the permanent host. Websites + Marketing is a site builder and can't serve custom code. The domain stays registered at GoDaddy. Only the DNS records change so that they point at GitHub Pages.

**Going live on the real domain**, once the owner approves the staging version:

1. **Disconnect at GoDaddy.** Disconnect the domain from the Websites + Marketing site. If you skip this, GoDaddy may keep rewriting the records.
2. **Edit the DNS records** at GoDaddy: My Products, then the domain, then DNS.
   - Replace the `A` records for `@` with GitHub's four: `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`.
   - Set the `CNAME` record for `www` to `shepcx3.github.io`.
   - **Don't touch MX, TXT (SPF/DKIM) or other email records.**
3. **Set the custom domain** in the repo's Settings → Pages to `laylowcafe.ca`. GitHub commits a `CNAME` file for you. Tick **Enforce HTTPS** once the certificate is issued, which can take up to an hour.
4. **Optional:** verify the domain in your GitHub account settings, under Pages. This stops anyone else from claiming it.
5. **Cancel the old plan.** Once the new site is live, cancel the Websites + Marketing plan. Keep the domain registration.

Don't add the `CNAME` file before DNS points at GitHub. If you do, the staging URL will redirect to laylowcafe.ca, which still shows the old GoDaddy site.

**After launch:**
- In Google Search Console, verify the domain and submit `https://laylowcafe.ca/sitemap.xml`.
- In Google Business Profile, make sure the website, hours and menu link (`https://laylowcafe.ca/#menu`) match the site.
- Put the website link in the Instagram and TikTok bios.

**Notes:**
- The canonical and social-preview tags already point at `https://laylowcafe.ca`, so search engines won't index the staging URL as the real site.
- The repo must be public for GitHub Pages on a free GitHub plan.
