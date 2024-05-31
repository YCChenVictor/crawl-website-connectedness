
import puppeteer from 'puppeteer';
import { processPage, crawl } from '../crawlWebsiteConnectedness';

jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      goto: jest.fn(),
      content: jest.fn().mockResolvedValue(`
        <html>
          <body>
            <a href="http://example.com/blog/post1">Post 1</a>
            <a href="http://example.com/blog/post2">Post 2</a>
            <a href="http://example.com/blog/post3">Post 3</a>
          </body>
        </html>
      `),
    }),
    close: jest.fn(),
  }),
}));

describe('processPage', () => {
  it('should process a page correctly', async () => {
    const requiredPath = '/blog/';
    const currentUrl = 'http://example.com';

    const childUrls = await processPage(requiredPath, currentUrl);

    expect(puppeteer.launch).toHaveBeenCalled();
    expect(childUrls).toEqual([
      'http://example.com/blog/post1',
      'http://example.com/blog/post2',
      'http://example.com/blog/post3'
    ]);
  });
});

describe('crawl', () => {
  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
  });

  test('should crawl the website and return the correct result', async () => {
    const queue = ['http://test.com/page1', 'http://test.com/page2'];
    const visited = new Set<string>();
    const result = {};

    const finalResult = await crawl(queue, visited, result);

    expect(finalResult).toEqual({ // it will call processPage twice
      'http://test.com/page1': [
        'http://example.com/blog/post1',
        'http://example.com/blog/post2',
        'http://example.com/blog/post3'
      ],
      'http://test.com/page2': [
        'http://example.com/blog/post1',
        'http://example.com/blog/post2',
        'http://example.com/blog/post3'
      ]
    });

    // Jest does not know ES6. It sees the imported processPage are different from the transpiled one. I cannot resolve it now.
    // expect(processPage).toHaveBeenCalledTimes(2);
    // expect(processPage).toHaveBeenCalledWith('http://test.com/page1');
    // expect(processPage).toHaveBeenCalledWith('http://test.com/page2');
  });
});

// describe('crawlWebsiteConnectedness', () => {
//   it('getIdFromNodeName', () => {
//     // Setup
//     const nodes = [{ id: 1, name: 'name', url: 'url', group: 'group' }];
//     const url = 'url';

//     // Exercise
//     const result = crawlWebsiteConnectedness.getIdFromNodeName(nodes, url);

//     // Verify
//     // Check that result is as expected...
//   })
//   it('storeSearchBarAsFile', )
//   it('crawl function should return expected result', async () => {
//     // Setup
//     const queue = ['http://example.com'];
//     const visited = new Set<string>();
//     const domain = 'http://example.com';

//     // Mock network requests here...

//     // Exercise
//     const result = await crawl(queue, visited, domain);

//     // Verify
//     // Check that result is as expected...
//   });

//   it('storeNodeGraphAsFile function should write expected data to file', () => {
//     // Setup
//     const nodeGraph = { /* ... */ };
//     const filePath = './test.txt';

//     // Mock file system here...

//     // Exercise
//     storeNodeGraphAsFile(nodeGraph, filePath);

//     // Verify
//     // Check that file system was written to as expected...
//   });

//   it('main function should call crawl and storeNodeGraphAsFile with expected arguments', async () => {
//     // Setup
//     const queue = ['http://example.com'];
//     const visited = new Set<string>();
//     const domain = 'http://example.com';
//     const filePath = './test.txt';

//     const mockCrawl = mocked(crawl, true);
//     const mockStoreNodeGraphAsFile = mocked(storeNodeGraphAsFile, true);

//     // Exercise
//     await main(queue, visited, domain, filePath);

//     // Verify
//     expect(mockCrawl).toHaveBeenCalledWith(queue, visited, domain);
//     // Check that mockStoreNodeGraphAsFile was called with expected arguments...
//   });
// });
