import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import * as url from "url";

const toAbsoluteUrl = (relativeUrl: string, baseUrl = "") => {
  return url.resolve(baseUrl, relativeUrl);
};

const processPage = async (currentUrl: string, baseUrl = "") => {
  const childUrls: string[] = [];
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(currentUrl, { waitUntil: "networkidle2" });
  const html = await page.content();
  const $ = cheerio.load(html);
  $("a").each((i, link) => {
    const href = $(link).attr("href");
    if (href && !href.includes("#")) {
      childUrls.push(toAbsoluteUrl(href, baseUrl));
    }
  });
  await browser.close();

  return childUrls;
};

const crawl = async (
  queue: string[],
  baseUrl: string,
  requiredPath: string,
  shouldLog = false,
  visited: Set<string> = new Set(),
  result: Record<string, string[]> = {},
): Promise<Record<string, string[]>> => {
  const currentUrl = queue.shift();
  if (!currentUrl) {
    return result;
  }
  if (!visited.has(currentUrl) && currentUrl.includes(requiredPath)) {
    if (shouldLog) {
      console.log(`Crawling: ${currentUrl}`); // Log the current URL
    }
    const childUrls = await processPage(currentUrl, baseUrl);
    result[currentUrl] = childUrls;
    queue.push(...childUrls.filter((url) => !visited.has(url)));
  }
  visited.add(currentUrl);

  return await crawl(queue, baseUrl, requiredPath, shouldLog, visited, result);
};

export { processPage, toAbsoluteUrl };
export default crawl;
