
import puppeteer, { Page, Browser } from 'puppeteer';
import { processPage, crawl } from '../src/crawlWebsiteConnectedness';

afterEach(() => jest.resetAllMocks());

beforeEach(() => {
  const mockContent = jest.fn();
  const mockGoto = jest.fn().mockImplementation((url) => {
    switch (url) {
      case 'http://test.com/page1':
        mockContent.mockResolvedValue(`
          <html>
            <body>
              <a href="http://test.com/page1/post1">Post 1</a>
              <a href="http://test.com/page1/post2">Post 2</a>
              <a href="http://test.com/page1/post3">Post 3</a>
            </body>
          </html>
        `);
        break;
      case 'http://test.com/page2':
        mockContent.mockResolvedValue(`
          <html>
            <body>
              <a href="http://test.com/page2/post1">Post 1</a>
              <a href="http://test.com/page2/post2">Post 2</a>
            </body>
          </html>
        `);
        break;
      default:
        mockContent.mockResolvedValue('');
    }
    return Promise.resolve();
  });
  const mockPage: Partial<Page> = {
    content: mockContent,
    goto: mockGoto,
  };
  const mockBrowser: Partial<Browser> = {
    newPage: jest.fn().mockResolvedValue(mockPage),
    close: jest.fn(),
  };
  jest.spyOn(puppeteer, 'launch').mockResolvedValue(mockBrowser as Browser);
});

describe('processPage', () => {
  test('should process a page correctly', async () => {
    const requiredPath = '';
    const currentUrl = 'http://test.com/page1';

    const childUrls = await processPage(currentUrl, requiredPath);

    expect(puppeteer.launch).toHaveBeenCalled();
    expect(childUrls).toEqual([
      'http://test.com/page1/post1',
      'http://test.com/page1/post2',
      'http://test.com/page1/post3'
    ]);
  });

  test('should not return childUrls if not matching required path', async () => {
    const requiredPath = '/required/';
    const currentUrl = 'http://test.com/page1';

    const childUrls = await processPage(currentUrl, requiredPath);

    expect(puppeteer.launch).toHaveBeenCalled();
    expect(childUrls).toEqual([]);
  });
});

describe('crawl', () => {
  test('should crawl the website and return the correct result', async () => {
    const queue = ['http://test.com/page1', 'http://test.com/page2'];
    const visited = new Set<string>();
    const result = {};

    const finalResult = await crawl(queue, visited, result);

    expect(finalResult).toEqual({ // it will call processPage twice
      'http://test.com/page1': [
        'http://test.com/page1/post1',
        'http://test.com/page1/post2',
        'http://test.com/page1/post3'
      ],
      'http://test.com/page2': [
        'http://test.com/page2/post1',
        'http://test.com/page2/post2',
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
