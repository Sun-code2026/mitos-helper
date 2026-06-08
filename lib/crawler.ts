import * as cheerio from "cheerio";

interface PageContent {
  url: string;
  title: string;
  content: string;
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MitosBot/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractText(html: string): { title: string; content: string; links: string[] } {
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header, noscript, iframe, img").remove();

  const title = $("title").text().trim() || $("h1").first().text().trim();
  const content = $("body").text().replace(/\s+/g, " ").trim().slice(0, 3000);

  const links: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href) links.push(href);
  });

  return { title, content, links };
}

function resolveLinks(base: string, links: string[]): string[] {
  const baseUrl = new URL(base);
  const resolved = new Set<string>();
  for (const link of links) {
    try {
      const url = new URL(link, base);
      if (url.hostname === baseUrl.hostname && url.protocol.startsWith("http")) {
        url.hash = "";
        resolved.add(url.toString());
      }
    } catch {}
  }
  return Array.from(resolved);
}

export async function crawlSite(startUrl: string, maxPages = 10): Promise<PageContent[]> {
  const visited = new Set<string>();
  const queue = [startUrl];
  const results: PageContent[] = [];

  while (queue.length > 0 && results.length < maxPages) {
    const url = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);

    const html = await fetchPage(url);
    if (!html) continue;

    const { title, content, links } = extractText(html);
    if (content.length > 100) {
      results.push({ url, title, content });
    }

    const newLinks = resolveLinks(url, links).filter((l) => !visited.has(l));
    queue.push(...newLinks.slice(0, 5));
  }

  return results;
}
