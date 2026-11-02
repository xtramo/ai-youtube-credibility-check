# Chrome Web Store listing: AI YouTube Credibility Check

Copy these into the Developer Dashboard (https://chrome.google.com/webstore/devconsole).

## Name
AI YouTube Credibility Check

## Summary (max 132 chars)
Stop wasting hours on hype videos. Pre-check any YouTube video in seconds for a fraction of a cent. Free tool, your own AI key.

## Tagline / call to action (use in the promo tile, screenshots and social posts)
**Stop doomscrolling. Pre-check any YouTube video in seconds.**
Don't sit through 20 minutes of hype to find out it was a sales pitch. Get a verdict and 4 reasons first, for a fraction of a cent, on your own AI key. The tool itself is free.

Alternatives to A/B test:
- "Is this video worth your time? Know before you watch."
- "Your time is worth more than another hype video."
- "Check it first. Watch it only if it's real."

## Category
Productivity

## Description
STOP DOOMSCROLLING. PRE-CHECK ANY YOUTUBE VIDEO IN SECONDS.

Don't sit through endless videos just to find out they were hype, clickbait or a disguised sales pitch. Check first, then decide whether to watch. The extension is free. You only pay your own AI provider's usage, which is a fraction of a cent per check (typical real checks cost around $0.001 to $0.002 on a low-cost model, but costs vary by provider and video length).

Click one button under any YouTube video and get a verdict plus four short reasons, in colour:

- Credible, Mixed, Red flags, or "Can't tell"
- Green points in the video's favour, red flags, grey "can't verify"
- A confidence level, so you know how sure the AI is
- Token usage and an approximate cost for every check

BRING YOUR OWN AI
Works with the AI you already use: Claude (Anthropic), ChatGPT (OpenAI), Gemini (Google), Grok (xAI), Muse Spark (Meta AI, US preview), Mistral, or any OpenAI-compatible service such as Groq, OpenRouter or a local Ollama. You paste your own API key. There is no subscription and no account with us. A typical check costs a fraction of a cent on low-cost models.

BUILT TO NOT MAKE THINGS UP
The analyst is instructed to stick to what is actually in the transcript, never invent quotes, sources or facts, say "I can't verify this" when it doesn't know, avoid attacking the creator, and ignore any instructions hidden inside a video. When there isn't enough information, it says so instead of guessing.

PRIVATE BY DESIGN
No servers, no analytics, no tracking. Your API key stays in your browser. The video's title, channel and transcript go only to the AI provider you choose, and only when you click the button.

IMPORTANT
- Results are AI opinions based on the transcript, not fact-checks. Verify important claims yourself.
- Costs shown are approximate estimates from built-in prices that may be out of date. They are not verified latest prices. Your provider's billing page is the source of truth.
- Not affiliated with YouTube, Google, Anthropic, OpenAI, xAI, Meta or Mistral.

Free and open source. Made by waynehross.com
Questions or feedback: ytcredibility@waynehross.com

## Official / website URL (dashboard field)
https://waynehross.com (verify the domain in the dashboard for a trust badge)

## Single purpose (dashboard field)
Show an AI-generated credibility assessment of the YouTube video the user is watching, on request.

## Permission justifications (dashboard fields)
- **storage**: Saves the user's chosen AI provider, API key, model and usage totals locally.
- **Host permission https://www.youtube.com/\***: Injects the credibility panel into video pages and reads the video's transcript from the page.
- **Host permissions api.anthropic.com, api.openai.com, generativelanguage.googleapis.com, api.x.ai, api.meta.ai, api.mistral.ai**: Sends the user's request (video title, channel, transcript) to the AI provider the user selected, using the user's own API key.
- **Optional host permissions (https://\*/\*, localhost)**: Requested at runtime only if the user enters a custom OpenAI-compatible endpoint, and only for that one address.
- **Remote code**: None. All code is bundled in the extension.

## Data usage disclosures (dashboard checkboxes)
- Collects: "Website content" (video title, channel, transcript), used only to provide the feature and sent only to the user-chosen AI provider on user action. Also "Authentication information" (the user's API key, stored locally and sent only to the user-chosen provider).
- Certify: not sold to third parties; not used for unrelated purposes; not used for creditworthiness or lending.
- Privacy policy URL: https://xtramo.github.io/ai-youtube-credibility-check/privacy-policy.html (works once GitHub Pages is enabled, see checklist step 1).
- Homepage / support URL: https://github.com/xtramo/ai-youtube-credibility-check

## Assets to prepare
- Icon 128x128: included (`ai-youtube-credibility-check/icons/icon128.png`).
- Screenshots (1280x800, 24-bit PNG, at least 1, up to 5). Real captures from the running extension are in `store-package/screenshots/`:
  1. `01-mixed-result.png`: Mixed verdict with green and red bullets, confidence, token and cost line.
  2. `02-red-flags-result.png`: Red flags verdict with a grey "can't verify" bullet.
  3. `03-quick-setup.png`: first-run setup form (provider dropdown and key box).
  4. Still to take: the Options page showing the "About costs" notice (open the extension's Options, press Win+Shift+S, then resize to 1280x800).
  Before publishing, consider the risk of showing a real named creator with a negative verdict in a public listing. A sample from your own video, or a clearly credible one, is safer. Retake with a different video by repeating the same steps.
- Optional small promo tile 440x280.

## Submission checklist
1. Enable GitHub Pages: repo Settings > Pages > Source "Deploy from a branch", branch `main`, folder `/docs`. After a minute, open the privacy policy URL above to confirm it loads. (The contact email, ytcredibility@waynehross.com, is already filled in.)
2. Pay the one-time $5 developer registration fee.
3. Re-check the built-in prices in `providers.js` (`PRICES`) against each provider's pricing page. Claude, Grok, OpenAI, Gemini and Mistral were read from the providers' pricing pages on 2 Nov 2026 (Mistral lists "Mistral Small 4"; the `-latest` alias is unconfirmed); Muse Spark is the launch price as reported by news sites. The OpenAI default is `gpt-4.1-mini` because `gpt-4o-mini` is marked deprecated. The disclaimer already says costs are approximate, but re-check before each release.
4. Test each provider with a real key at least once (only Claude has been tested end to end).
5. Upload `ai-youtube-credibility-v0.2.0.zip`, fill in the fields above, add screenshots, submit for review (usually a few days).
6. Expect questions about the "optional host permissions"; the justification above covers it. If review is slow or rejects it, the fallback is to remove the "Other (OpenAI-compatible)" option and those optional permissions.
