// Tells IndexNow search engines (Bing, Yandex, Seznam, Naver, and others) that the site's pages
// changed, so they recrawl them without waiting. Google does not use IndexNow.
//
// Run after a production deploy has finished: npm run indexnow
// It reads the URL list from the live sitemap, so it always matches what is deployed.

const SITE = "https://getutilityhub.com";
// The key is public by design: search engines confirm it by fetching the matching file
// served from the site root (public/<key>.txt).
const KEY = "94af2187212f1fc3907525c78172c329";

async function main() {
  const keyResponse = await fetch(`${SITE}/${KEY}.txt`);
  const keyText = keyResponse.ok ? (await keyResponse.text()).trim() : "";
  if (keyText !== KEY) {
    throw new Error(`${SITE}/${KEY}.txt is not live yet (HTTP ${keyResponse.status}). Deploy first.`);
  }

  const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text();
  const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (urlList.length === 0) throw new Error("No URLs found in the live sitemap.");

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(SITE).host,
      key: KEY,
      keyLocation: `${SITE}/${KEY}.txt`,
      urlList,
    }),
  });

  // 200 = received, 202 = received and the key is still being verified.
  console.log(`IndexNow: HTTP ${response.status} for ${urlList.length} URLs`);
  if (response.status !== 200 && response.status !== 202) {
    console.error(await response.text());
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
