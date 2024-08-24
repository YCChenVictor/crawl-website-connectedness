import cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import * as url from 'url';

const toAbsoluteUrl = (relativeUrl: string, baseUrl: string = '') => {
  return url.resolve(baseUrl, relativeUrl);
};

const processPage = async (currentUrl: string, baseUrl: string = '') => {
  const childUrls: string[] = [];
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(currentUrl, { waitUntil: 'networkidle2' });
  const html = await page.content();
  const $ = cheerio.load(html);
  // comment out currently
  // getArticleContent($, currentUrl);
  $('a').each((i, link) => {
    const href = $(link).attr('href');
    // should add picky mechanism
    if (href && !href.includes('#')) {
      childUrls.push(toAbsoluteUrl(href, baseUrl));
    }
  });
  await browser.close();

  return childUrls;
}

const crawl = async (
  startPoint: string,
  queue: string[],
  visited: Set<string> = new Set(),
  result: { [key: string]: string[] } = {},
  shouldLog: boolean = false,
  requiredPath: string = '',
  baseUrl: string = ''
): Promise<{ [key: string]: string[] }> => {
  const currentUrl = queue.shift();

  if (!currentUrl) {
    return result;
  }
  if(!visited.has(currentUrl) && currentUrl.includes(requiredPath) && currentUrl.startsWith(startPoint)) {
    if (shouldLog) {
      console.log(`Crawling: ${currentUrl}`); // Log the current URL
    }
    const childUrls = await processPage(currentUrl, baseUrl);
    visited.add(currentUrl);
    result[currentUrl] = childUrls;
    queue.push(...childUrls.filter(url => !visited.has(url)));
  }

  return await crawl(startPoint, queue, visited, result, shouldLog, requiredPath, baseUrl);
}

const main = (startPoint: string) => {
  return crawl(startPoint, [startPoint]);
}

export { processPage, crawl, toAbsoluteUrl }
export default main;
