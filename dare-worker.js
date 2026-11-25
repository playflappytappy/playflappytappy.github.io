// Flappy Tappy dare links: https://<worker>/?d=<challenge id>&v=<sender's version>
// A person's tap goes straight to the Google Play install page (a server redirect, so Messenger never stops on a page).
// Link-preview readers (Messenger, Facebook, WhatsApp...) get a small page with the picture card, which also
// forwards to Google Play if a person ever sees it.
const PKG = "com.flappytappy";
const SITE = "https://playflappytappy.github.io";
const BOT = /bot|crawl|spider|preview|facebookexternalhit|meta-externalfetcher|facebot|whatsapp|telegram|slack|discord|linkedin|skype|viber|embedly|vkshare|pinterest|google-?structured|okhttp|curl|wget|python|java\//i;

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/favicon.ico") return Response.redirect(SITE + "/icon.png", 301);
    const d = url.searchParams.get("d") || "";
    const v = url.searchParams.get("v") || "";
    const id = /^[A-Za-z0-9]{6,12}$/.test(d) ? d : "";
    const ver = /^[0-9]{1,4}$/.test(v) ? v : "";
    const ref = id ? `cx=${id}&utm_source=dare` + (ver ? `&utm_campaign=v${ver}` : "") : "utm_source=link";
    const play = `https://play.google.com/store/apps/details?id=${PKG}&referrer=${encodeURIComponent(ref)}`;
    const market = `market://details?id=${PKG}&referrer=${encodeURIComponent(ref)}`;

    const ua = request.headers.get("user-agent") || "";
    const mode = request.headers.get("sec-fetch-mode") || "";
    const person = mode === "navigate" && !BOT.test(ua);
    if (person) {
      const to = url.searchParams.get("t") === "m" ? market : play;
      return new Response(null, { status: 302, headers: { Location: to, "Cache-Control": "no-store" } });
    }
    const sc = url.searchParams.get("s") || "";
    const score = /^[0-9]{1,6}$/.test(sc) && +sc >= 10 ? +sc : 0;
    return new Response(card(play, score), {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" },
    });
  },
};

function card(play, score) {
  const t = score ? `Can you beat ${score}? I dare you in Flappy Tappy!` : "I dare you: beat my score in Flappy Tappy!";
  const s = "Free one-tap duels. 30 seconds. Tap to play.";
  const img = SITE + "/og.jpg";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t}</title>
<meta name="description" content="${s}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Flappy Tappy">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${s}">
<meta property="og:image" content="${img}">
<meta property="og:image:secure_url" content="${img}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${img}">
<meta http-equiv="refresh" content="0;url=${play}">
</head><body style="font-family:sans-serif;text-align:center;padding:40px">
<a href="${play}" style="font-size:22px">Get Flappy Tappy on Google Play</a>
<script>location.replace(${JSON.stringify(play)});</script>
</body></html>`;
}
