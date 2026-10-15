# Lay Low Cafe website

Website for Lay Low Cafe, 241 Princess St, Kingston, ON. Served at https://laylowcafe.ca.

It's plain HTML, CSS and a little JavaScript. There's no build step and no framework, so any static host can serve the repo as it is.

```
index.html              the cafe page: hero, menu, visit (map, hours, phone), fall banner
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

**Seasonal banner.** The fall drinks strip is the `fall-banner` block at the top of `index.html`. Edit the `<span>` items in **both** `<p>` lines, which must match because the second copy makes the scroll loop seamlessly. Delete the whole block to remove it.

**Photos.** The page uses one hero photo, `assets/img/brunch-spread.jpg`. The other photos in `assets/img/` are spares for swapping in. Keep photos at roughly 1200px on the long edge and JPEG quality 80.

After changing `styles.css` or `main.js`, bump the `?v=` number on their links in each HTML file (e.g. `?v=4` to `?v=5`). Otherwise visitors' browsers can keep using the old copy for a while.

Every link and asset path is relative. Keep it that way, so the site works on the real domain, on a GitHub Pages subfolder and when opened straight from disk.

## Hosting: GitHub Pages + laylowcafe.ca

The site is deployed with GitHub Pages: Settings → Pages, deploy from a branch, branch root `/`. GitHub Pages can stay the permanent host. Websites + Marketing is a site builder and can't serve custom code. The domain stays registered at GoDaddy. Only the DNS records change so that they point at GitHub Pages.

**Going live on the real domain** (best done after the cafe closes at 4pm):

1. **Back up the current DNS.** In GoDaddy, go to My Products, then laylowcafe.ca, then DNS, and screenshot every record. That screenshot is the rollback plan.
2. **Verify the domain with GitHub.** In your GitHub account, go to Settings, then Pages, then Add a domain, and enter `laylowcafe.ca`. GitHub gives you a `TXT` record. Add it in GoDaddy DNS and click Verify. This stops anyone else from pointing the domain at their own site.
3. **Set the custom domain.** In the repo, go to Settings, then Pages, then Custom domain. Enter `laylowcafe.ca` and save. GitHub commits a `CNAME` file. The github.io link starts redirecting to laylowcafe.ca, which shows the old site until step 5 finishes.
4. **Disconnect Websites + Marketing.** In GoDaddy, open the Websites + Marketing site settings and disconnect or remove the domain, so GoDaddy stops managing its records. Also check that domain Forwarding is off.
5. **Edit the DNS records in GoDaddy:**
   - `A` records for `@`: delete the existing ones and add four, pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`.
   - `AAAA` records for `@`: delete any. Optionally, add GitHub's IPv6 addresses `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153` and `2606:50c0:8003::153`.
   - `CNAME` for `www`: set it to `shepcx3.github.io`.
   - **Leave MX, TXT (SPF/DKIM/verification) and any email-related `CNAME` records exactly as they are.**
6. **Turn on HTTPS.** Once Settings → Pages shows "DNS check successful", tick **Enforce HTTPS**. The certificate can take up to an hour. Until then the box may be greyed out.
7. **Check the live site.** Open `https://laylowcafe.ca`, `https://www.laylowcafe.ca`, `https://laylowcafe.ca/menu` and `https://laylowcafe.ca/late-night/` on a phone using mobile data, plus a computer.
8. **Cancel the old plan.** After a few days of the new site running fine, cancel the Websites + Marketing plan. **Keep the domain registration** and any email plan.

**Rollback:** if something goes wrong, put back the records from the step 1 screenshot and remove the custom domain in Settings → Pages.

**After launch:**
- In Google Search Console, verify the domain and submit `https://laylowcafe.ca/sitemap.xml`.
- In Google Business Profile, make sure the website, hours and menu link (`https://laylowcafe.ca/#menu`) match the site.
- Put the website link in the Instagram and TikTok bios.

**Notes:**
- The canonical and social-preview tags already point at `https://laylowcafe.ca`, so search engines won't index the staging URL as the real site.
- The repo must be public for GitHub Pages on a free GitHub plan.
