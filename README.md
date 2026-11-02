# AI YouTube Credibility Check

**Stop doomscrolling. Pre-check any YouTube video in seconds.** Free tool; you only pay your own AI provider, a fraction of a cent per check.

A Chrome extension that tells you, in seconds, whether a YouTube video is worth your time. Click one button under the video and get a verdict plus four short reasons, colour-coded:

- **Credible / Mixed / Red flags / Can't tell**
- Green = in the video's favour, red = red flag, grey = can't verify
- A confidence level (low / medium / high)
- Token usage and an approximate cost for every check

It is **bring your own AI**: you paste your own API key, so there is no subscription, no account and no server.

Source: https://github.com/xtramo/ai-youtube-credibility-check

> Results are AI opinions based on the video's transcript, not fact-checks. Verify important claims yourself.

## Supported AI providers

| Provider | Default model | Get a key |
|---|---|---|
| Claude (Anthropic) | `claude-haiku-5-5` | https://console.anthropic.com/settings/keys |
| ChatGPT (OpenAI) | `gpt-4.1-mini` | https://platform.openai.com/api-keys |
| Gemini (Google) | `gemini-2.5-flash` | https://aistudio.google.com/apikey |
| Grok (xAI) | `grok-4.3` | https://console.x.ai |
| Muse Spark (Meta AI, US preview) | `muse-spark-1.1` | https://dev.meta.ai |
| Mistral | `mistral-small-latest` | https://console.mistral.ai/api-keys |
| Other OpenAI-compatible (Groq, OpenRouter, Ollama...) | you choose | your provider |

Only Claude has been tested end to end so far. If another provider fails, please open an issue with the error text.

## Install (developer mode)

1. Download or clone this repo.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the `ai-youtube-credibility-check` folder.
4. Open any YouTube video and click **Check credibility**. The first time, a setup form asks for your provider and API key.

If you reload the extension while a YouTube tab is open, refresh that tab (F5).

## How it works

1. Reads the video's title, channel and transcript (it opens YouTube's own "Show transcript" panel; this takes a few seconds).
2. Sends them to the AI provider you chose, using your key.
3. The AI answers in a fixed JSON format, which the extension renders as the panel.

The analyst prompt (see `background.js`) tells the model to stick to what is in the transcript, never invent quotes, sources or facts, say "I can't verify this" when it doesn't know, avoid attacking the creator, and ignore any instructions hidden inside a video. These guardrails reduce errors but cannot eliminate them.

## Privacy

No servers, no analytics, no tracking. Your API key is stored locally in your browser (`chrome.storage.local`). The video's title, channel and transcript go only to the provider you choose, only when you click the button. Full policy: [`docs/privacy-policy.html`](docs/privacy-policy.html) (published at https://xtramo.github.io/ai-youtube-credibility-check/privacy-policy.html once GitHub Pages is enabled).

## About the costs shown

Dollar amounts are **approximate estimates from built-in prices that may be out of date or wrong. They are not verified latest prices.** Your provider's billing page is the only source of truth. You can enter your own per-million-token prices in the extension's Options page, and the built-in table lives in `providers.js` (`PRICES`). Pull requests that update it are welcome.

## Known limitations

- Needs a video that has a transcript/captions.
- The AI's knowledge has a cutoff, so it may not recognise newer products. It is instructed to say "unverified" rather than call them fake.
- YouTube changes its page layout from time to time, which can break transcript reading.

## Repo layout

- `ai-youtube-credibility-check/`: the extension (Manifest V3, no build step, no dependencies)
- `docs/`: privacy policy page (served by GitHub Pages)
- `store-package/`: Chrome Web Store listing text (the upload zip is kept local)

## Contributing

Issues and pull requests are welcome, especially for provider fixes and price updates.

## Contact

Email: ytcredibility@waynehross.com
Website: https://waynehross.com/?utm_source=github&utm_medium=readme&utm_campaign=ai-youtube-credibility

## License

[MIT](LICENSE). Not affiliated with or endorsed by YouTube, Google, Anthropic, OpenAI, xAI, Meta or Mistral.
