import cheerio from 'cheerio';
import fs from 'fs';
// import randomColor from 'randomcolor';
import puppeteer from 'puppeteer';
import path from 'path';
import * as url from 'url';

// const giveColorByGroupTo = (nodes: { id: number, name: string, url: string, group: any, color?: string }[]) => {
//   const groups = [...new Set(nodes.map(node => node.group))];
//   const colors = randomColor({ count: groups.length });
//   nodes.map((node) => {
//     node.color = colors[groups.indexOf(node.group)];
//   });
//   return nodes;
// }

// const getIdFromNodeName = (nodes: { id: number, name: string, url: string, group: any }[], url: string) => {
//   const result = nodes.find((node) => node.url === url);
//   if(result) {
//     return result.id;
//   } else {
//     null;
//   }
// }

// const desiredFormat = (structure: object) => {
//   let nodes: { id: number, name: string, url: string, group: any }[];
//   let links;
//   nodes = Object.keys(structure).map((value, index) => {
//     let name = value.split('/').slice(-1)[0];
//     if (name === 'main') {
//       name = value.split('/').slice(-2)[0];
//     }
//     return {
//       id: index + 1,
//       name: name,
//       url: value,
//       group: value.split('/').length - 2,
//     };
//   });
//   nodes = giveColorByGroupTo(nodes);
//   links = Object.entries(structure).map(([key, value]) => {
//     return value.map((item: string) => { // Explicitly specify the type of 'item' as string
//       const source = getIdFromNodeName(nodes, key);
//       const target = getIdFromNodeName(nodes, item);
//       if(source && target) {
//         return {source: source, target: target};
//       }
//     });
//   }).flat().filter(obj => obj !== undefined);

//   return { nodes: nodes, links: links };
// }

// add unit test lately
// const getArticleContent = (items: { title: string, content: string, url: string }[], $: cheerio.Root, url: string) => {
//   const baseUrl = 'http://localhost:3000'; // should be changed in the future according to environment variable
//   const title = $('h1').text();
//   const content = $('#article').text().replace(/(\r\n|\n|\r)/gm, '').replace(/ +(?= )/g,'');
//   const item = {'title': title, 'content': content, 'url': url.replace(baseUrl, '')};
//   items.push(item);
// }

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

// const storeSearchBarAsFile = (filePath, result) => {
//   // Convert JSON data to a string
//   const jsonString = JSON.stringify(result)

//   // Create the necessary directories if they don't exist
//   const dirname = path.dirname(filePath)

//   if (!fs.existsSync(dirname)) {
//     fs.mkdir(dirname, { recursive: true })
//   }

//   // Write the JSON data to a file
//   fs.writeFileSync(filePath, jsonString)
//   console.log('Save Search Bar Data!')
// }

// const storeNodeGraphAsFile = async (result: object, filePath: string) => {
//   // Convert JSON data to a string
//   const jsonString = JSON.stringify(result);
//   // Create the necessary directories if they don't exist
//   const dirname = path.dirname(filePath);

//   try {
//     await fs.promises.mkdir(dirname, { recursive: true });
//     await fs.promises.writeFile(filePath, jsonString);
//     console.log('Save Node Graph Data!');
//   } catch (err) {
//       console.error(`Error: ${err}`);
//   }
// };

export { processPage, crawl, toAbsoluteUrl }
export default main;
