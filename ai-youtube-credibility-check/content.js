(() => {
  const PANEL_ID = "bsd-panel";
  const cache = new Map(); // videoId -> result

  const videoId = () => new URLSearchParams(location.search).get("v");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Fallback: open YouTube's own transcript panel and read the segments.
  async function getTranscriptFromPanel() {
    const readSegs = () => [...document.querySelectorAll(
      "ytd-transcript-segment-renderer .segment-text, ytd-transcript-segment-renderer yt-formatted-string.segment-text, transcript-segment-view-model span.ytAttributedStringHost, transcript-segment-view-model span[role='text']")]
      .map((e) => e.textContent.trim()).filter(Boolean);
    const visible = (b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    // Only a VISIBLE button works: hidden copies exist while the description is collapsed.
    const findBtn = () => [...document.querySelectorAll("button")]
      .find((b) => visible(b) && /show transcript/i.test(b.getAttribute("aria-label") || b.textContent || ""));
    let segs = readSegs();
    if (!segs.length) {
      let btn = findBtn();
      for (let i = 0; i < 12 && !btn; i++) { // description can load late; expand it and wait
        document.querySelector("#description-inline-expander #expand, tp-yt-paper-button#expand, #expand")?.click();
        await sleep(400);
        btn = findBtn();
      }
      if (!btn) return "";
      btn.click();
      for (let i = 0; i < 50 && !(segs = readSegs()).length; i++) await sleep(300); // can take ~8s to load
      if (segs.length) { // let the full list render before reading
        let prev = -1;
        for (let i = 0; i < 10 && segs.length !== prev; i++) { prev = segs.length; await sleep(400); segs = readSegs(); }
      }
    }
    return segs.join(" ").replace(/\s+/g, " ").trim();
  }

  async function getTranscript() {
    let t = "";
    try { t = await getTranscriptFromTracks(); } catch (_) {}
    if (t) return t;
    return getTranscriptFromPanel();
  }

  async function getTranscriptFromTracks() {
    const html = await (await fetch(location.href, { credentials: "include" })).text();
    const m = html.match(/"captionTracks":(\[.*?\])/);
    if (!m) return "";
    const tracks = JSON.parse(m[1]);
    const track = tracks.find((t) => t.languageCode?.startsWith("en") && t.kind !== "asr")
      || tracks.find((t) => t.languageCode?.startsWith("en")) || tracks[0];
    if (!track) return "";
    const r = await fetch(track.baseUrl.replace(/\\u0026/g, "&") + "&fmt=json3", { credentials: "include" });
    const body = await r.text();
    if (!body) return "";
    const j = JSON.parse(body);
    return (j.events || []).flatMap((e) => (e.segs || []).map((s) => s.utf8)).join("").replace(/\s+/g, " ").trim();
  }

  function ensurePanel() {
    let p = document.getElementById(PANEL_ID);
    if (p) return p;
    p = document.createElement("div");
    p.id = PANEL_ID;
    const host = document.querySelector("#above-the-fold") || document.querySelector("#info-contents");
    if (!host) return null;
    const anchor = host.querySelector("#top-row");
    if (anchor) anchor.before(p); else host.append(p);
    return p;
  }

  // Single-colour line icons (inherit text colour).
  const svg = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const ICON = {
    search: svg('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>'),
    settings: svg('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>'),
    ok: svg('<circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/>'),
    mixed: svg('<path d="M12 4 3 20h18L12 4z"/><path d="M12 10v4M12 17.2v.01"/>'),
    bs: svg('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
    check: svg('<path d="m5 12.5 4.5 4.5L19 7"/>'),
    x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    help: svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17.2v.01"/>'),
  };
  const LABEL = {
    OK: `<span class="bsd-ico ok">${ICON.ok}</span>Credible`,
    MIXED: `<span class="bsd-ico mixed">${ICON.mixed}</span>Mixed`,
    BS: `<span class="bsd-ico bs">${ICON.bs}</span>Red flags`,
    UNCLEAR: `<span class="bsd-ico unclear">${ICON.help}</span>Can't tell`,
  };

  function renderSetup(note) {
    const p = ensurePanel();
    if (!p) return;
    loadSettings().then((s) => {
      p.className = "bsd setup";
      p.innerHTML = `<div class="bsd-h">Quick setup (once)</div>
        <div class="bsd-note">${note || "Pick the AI you use and paste your own API key. It stays in your browser."}</div>
        <div class="bsd-row">
          <select id="bsd-prov">${Object.entries(PROVIDERS).filter(([id]) => id !== "custom")
            .map(([id, v]) => `<option value="${id}"${id === s.provider ? " selected" : ""}>${esc(v.name)}</option>`).join("")}</select>
          <input id="bsd-key" type="password" placeholder="Paste API key" value="${esc(s.apiKey)}">
          <button id="bsd-save">Save & check</button>
        </div>
        <div class="bsd-note"><a id="bsd-get" target="_blank" rel="noreferrer"></a> · <a id="bsd-more" href="#">More options</a></div>`;
      const prov = p.querySelector("#bsd-prov"), get = p.querySelector("#bsd-get");
      const upd = () => { get.href = PROVIDERS[prov.value].keyUrl; get.textContent = "Get a " + PROVIDERS[prov.value].name.split(" ")[0] + " key"; };
      prov.onchange = upd; upd();
      p.querySelector("#bsd-more").onclick = (e) => { e.preventDefault(); chrome.runtime.sendMessage({ type: "openOptions" }); };
      p.querySelector("#bsd-save").onclick = async () => {
        const apiKey = p.querySelector("#bsd-key").value.trim();
        if (!apiKey) return;
        const keepModel = s.provider === prov.value ? s.model : "";
        await chrome.storage.local.set({ provider: prov.value, apiKey, model: keepModel });
        run();
      };
    });
  }

  function render(state) {
    const p = ensurePanel();
    if (!p) return;
    if (state.loading) {
      p.className = "bsd loading";
      p.innerHTML = `<b>Checking credibility…</b> reading transcript`;
    } else if (state.error) {
      p.className = "bsd err";
      p.innerHTML = `<b>Error:</b> ${esc(state.error)} <button id="bsd-retry">${state.stale ? "Refresh page" : "Retry"}</button> <button id="bsd-set">${ICON.settings}Settings</button>`;
      p.querySelector("#bsd-retry").onclick = state.stale ? () => location.reload() : run;
      p.querySelector("#bsd-set").onclick = () => renderSetup();
    } else if (state.idle) {
      p.className = "bsd idle";
      p.innerHTML = `<button id="bsd-go">${ICON.search}Check credibility</button> <button id="bsd-set" title="Settings" aria-label="Settings">${ICON.settings}</button>`;
      p.querySelector("#bsd-go").onclick = run;
      p.querySelector("#bsd-set").onclick = () => renderSetup();
    } else {
      const v = state.result.verdict;
      p.className = `bsd ${v.toLowerCase()}`;
      const conf = ["low", "medium", "high"].includes(state.result.confidence) ? state.result.confidence : "";
      p.innerHTML = `<div class="bsd-h"><span class="bsd-badge">${LABEL[v] || esc(v)}</span> ${esc(state.result.headline)}
          ${conf ? `<span class="bsd-conf">${conf} confidence</span>` : ""}
          <button id="bsd-set" class="bsd-gear" title="Settings" aria-label="Settings">${ICON.settings}</button></div>
        <ul>${state.result.bullets.slice(0, 4).map((b) => {
          const good = typeof b === "object" ? b.good : false;
          const text = typeof b === "object" ? b.text : b;
          const cls = good === true ? "good" : good === null ? "unknown" : "bad";
          const icon = good === true ? ICON.check : good === null ? ICON.help : ICON.x;
          return `<li class="${cls}"><span class="bsd-ico">${icon}</span>${esc(text)}</li>`;
        }).join("")}</ul>
        <div class="bsd-note">AI opinion based on the transcript. Not a fact-check; verify important claims yourself.</div>
        ${state.result.usage ? `<div class="bsd-note">This check: ${state.result.usage.in.toLocaleString()} tokens in + ${state.result.usage.out.toLocaleString()} out
          (${esc(state.result.usage.model)}) · ${fmtCost(state.result.usage.cost)} · all-time total ≈ $${state.result.usage.total.toFixed(4)}
          <br>Costs are approximate estimates from built-in prices, not verified latest prices. Check your provider's billing page for exact charges.</div>` : ""}`;
      p.querySelector("#bsd-set").onclick = () => renderSetup();
    }
  }

  async function run() {
    const id = videoId();
    if (!id) return;
    try {
      const s = await loadSettings();
      if (!s.apiKey) return renderSetup();
      if (cache.has(id)) return render({ result: cache.get(id) });
      render({ loading: true });
      const transcript = await getTranscript();
      if (transcript.length < 200) {
        throw new Error("Couldn't read this video's transcript (it may have none, or the page hadn't finished loading). Nothing was sent to the AI, so no cost. Try again in a few seconds.");
      }
      const title = document.title.replace(/ - YouTube$/, "");
      const channel = document.querySelector("ytd-video-owner-renderer ytd-channel-name a, #owner ytd-channel-name a, #channel-name a")?.textContent?.trim() || "";
      const result = await chrome.runtime.sendMessage({
        type: "analyze",
        payload: { title, channel, transcript, url: location.href },
      });
      if (!result || result.error) throw new Error(result?.error || "No response");
      cache.set(id, result);
      if (id === videoId()) render({ result });
    } catch (e) {
      const stale = /context invalidated|Extension context/i.test(e.message || "");
      render({ error: stale ? "Extension updated, refresh the page (F5)." : e.message, stale });
    }
  }

  // YouTube is an SPA: re-init on navigation.
  let last = null;
  function onNav() {
    if (location.pathname !== "/watch") return;
    const id = videoId();
    if (id === last && document.getElementById(PANEL_ID)) return;
    last = id;
    document.getElementById(PANEL_ID)?.remove();
    const wait = setInterval(() => {
      if (ensurePanel()) { clearInterval(wait); render({ idle: true }); }
    }, 500);
    setTimeout(() => clearInterval(wait), 10000);
  }
  document.addEventListener("yt-navigate-finish", onNav);
  onNav();
})();
