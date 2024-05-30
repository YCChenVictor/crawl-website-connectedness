import cheerio from 'cheerio';
import fs from 'fs';
import randomColor from 'randomcolor';
import puppeteer from 'puppeteer';
import path from 'path';

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

const getIdFromNodeName = (nodes: { id: number, name: string, url: string, group: any }[], url: string) => {
  const result = nodes.find((node) => node.url === url);
  if(result) {
    return result.id;
  } else {
    null;
  }
}

const giveColorByGroupTo = (nodes: { id: number, name: string, url: string, group: any, color?: string }[]) => {
  const groups = [...new Set(nodes.map(node => node.group))];
  const colors = randomColor({ count: groups.length });
  nodes.map((node) => {
    node.color = colors[groups.indexOf(node.group)];
  });
  return nodes;
}

const desiredFormat = (structure: object) => {
  let nodes: { id: number, name: string, url: string, group: any }[];
  function getGroupFrom(value: string) {
    // Add your implementation here
  }

  let links;
  nodes = Object.keys(structure).map((value, index) => {
    let name = value.split('/').slice(-1)[0];
    if (name === 'main') {
      name = value.split('/').slice(-2)[0];
    }
    return {
      id: index + 1,
      name: name,
      url: value,
      group: getGroupFrom(value),
    };
  });
  nodes = giveColorByGroupTo(nodes);
  links = Object.entries(structure).map(([key, value]) => {
    return value.map((item: string) => { // Explicitly specify the type of 'item' as string
      const source = getIdFromNodeName(nodes, key);
      const target = getIdFromNodeName(nodes, item);
      if(source && target) {
        return {source: source, target: target};
      }
    });
  }).flat().filter(obj => obj !== undefined);

  return { nodes: nodes, links: links };
}

// const getArticleContent = (items: { title: string, content: string, url: string }[], $: cheerio.Root, url: string) => {
//   const baseUrl = 'http://localhost:3000'; // should be changed in the future according to environment variable
//   const title = $('h1').text();
//   const content = $('#article').text().replace(/(\r\n|\n|\r)/gm, '').replace(/ +(?= )/g,'');
//   const item = {'title': title, 'content': content, 'url': url.replace(baseUrl, '')};
//   items.push(item);
// }

const storeNodeGraphAsFile = async (result: object, filePath: string) => {
  // Convert JSON data to a string
  const jsonString = JSON.stringify(result);
  // Create the necessary directories if they don't exist
  const dirname = path.dirname(filePath);

  try {
    await fs.promises.mkdir(dirname, { recursive: true });
    await fs.promises.writeFile(filePath, jsonString);
    console.log('Save Node Graph Data!');
  } catch (err) {
      console.error(`Error: ${err}`);
  }
};

const crawl = (queue: string[], visited: Set<string>, domain: string): Object => {
  // DFS
  const result: { [key: string]: string[] } = {};
  const childNodes: string[] = [];
  const currentUrl = queue.shift();
  console.log(currentUrl);

  if (!currentUrl) {
    return Promise.resolve(result);
  }

  if(visited.has(currentUrl)) {
    return crawl(queue, visited, domain);
  }

  visited.add(currentUrl);
  
  return new Promise(async (resolve, reject) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(currentUrl, { waitUntil: 'networkidle2' });
    const html = await page.content();

    // Rest of the code remains the same
    const $ = cheerio.load(html);
    // getArticleContent($, currentUrl);
    $('a').each((i, link) => {
      const href = $(link).attr('href');
      if (href && href.startsWith('/blog/') && !href.includes('#')) {
        const absoluteUrl = domain + href;
        childNodes.push(href);
        queue.push(absoluteUrl);
      }
    });
    const parentNode = currentUrl.replace(domain, '');
    result[parentNode] = childNodes;
    resolve(crawl(queue, visited, domain));
  });

}

const main = async (queue: string[], visited: Set<string>, domain: string, nodeGraphStoreFilePath: string) => {
  // should remove domain
  try {
    const crawlResult = await crawl(queue, visited, domain);
    // storeSearchBarAsFile({"items": items})
    storeNodeGraphAsFile(desiredFormat(crawlResult), nodeGraphStoreFilePath);
  } catch (error) {
    console.error('Error occurred during crawling:', error);
  }
};

export default main;
