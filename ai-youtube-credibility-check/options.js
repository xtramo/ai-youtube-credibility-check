const $ = (id) => document.getElementById(id);
for (const [id, p] of Object.entries(PROVIDERS)) $("provider").add(new Option(p.name, id));

function sync() {
  const p = PROVIDERS[$("provider").value];
  $("model").placeholder = p.model || "required";
  $("key").placeholder = p.hint;
  $("custom").hidden = $("provider").value !== "custom";
  $("getkey").hidden = !p.keyUrl;
  $("getkey").href = p.keyUrl || "#";
}
$("provider").onchange = sync;

loadSettings().then((s) => {
  $("provider").value = s.provider; $("key").value = s.apiKey; $("model").value = s.model; $("base").value = s.baseUrl;
  $("pin").value = s.priceIn; $("pout").value = s.priceOut;
  sync();
});
chrome.storage.local.get(["totalCost", "totalTokens"]).then((t) => {
  $("spent").textContent = `Spent so far through this extension: ≈ $${(t.totalCost || 0).toFixed(3)} (${(t.totalTokens || 0).toLocaleString()} tokens). Costs are estimates from the price table; your provider's billing page is the source of truth.`;
});

$("save").onclick = async () => {
  const provider = $("provider").value, baseUrl = $("base").value.trim();
  if (provider === "custom" && baseUrl) {
    const origin = new URL(baseUrl).origin + "/*";
    const granted = await chrome.permissions.request({ origins: [origin] });
    if (!granted) { $("ok").textContent = "Permission for that URL was denied."; return; }
  }
  await chrome.storage.local.set({ provider, apiKey: $("key").value.trim(), model: $("model").value.trim(), baseUrl, priceIn: $("pin").value, priceOut: $("pout").value });
  $("ok").textContent = "Saved";
};
