# Status and TODO

_Last updated: 6 Nov 2026_

## Status
- v0.2.0 is **published (public)** on the Chrome Web Store. 1 user, no ratings yet.
- Store URL: https://chromewebstore.google.com/detail/ankejgmoabdmmpecjjdcfajknegkpidc
- Extension ID: `ankejgmoabdmmpecjjdcfajknegkpidc` (1 of 2 extension slots used)
- GitHub Pages is live; privacy policy loads at https://xtramo.github.io/ai-youtube-credibility-check/privacy-policy.html
- Auth model: no login or OAuth. Users paste their own provider API key (stored in `chrome.storage.local`).

## Next session
1. **Store listing audit** (dashboard > Store listing, scroll down): confirm 3-5 screenshots (1280x800) are uploaded, category is Productivity, and the official URL and support link are set. The `store-package/screenshots/` folder mentioned in `STORE_LISTING.md` is not in the repo.
2. **Promo tile** 440x280 (optional, helps listing quality).
3. **Summary text**: the dashboard summary comes from `manifest.json` `description`. Decide whether to swap in the catchier line from `STORE_LISTING.md`; this needs a version bump (e.g. 0.2.1), a new zip, and a resubmit.
4. **Test other providers with real keys**: OpenAI, Gemini, Grok, Meta, Mistral, and a custom endpoint. Only Claude is tested end to end. Offered: review `background.js` for likely provider bugs first.
5. **Re-check `PRICES`** in `providers.js` (last checked 2 Nov 2026).
6. **Promotion** (listing has 1 user, so discovery is the main gap):
   - README install link: done.
   - Draft posts for Reddit (r/chrome_extensions, r/youtube, r/SideProject, r/artificial; read each sub's self-promo rules), Show HN, Product Hunt, X and LinkedIn.
   - Record a ~30 second demo of a check on a hype video.
   - Add the link to waynehross.com and an email signature.
   - Ask the first ~10 users for honest reviews.
7. **Review risk**: the optional `https://*/*` host permission may draw reviewer questions. Fallback is to remove the "Other (OpenAI-compatible)" option.

## Releasing an update
Bump `version` in `manifest.json`, zip the `ai-youtube-credibility-check/` folder, upload under Package in the dashboard, then Submit for review (current version stays live meanwhile).
