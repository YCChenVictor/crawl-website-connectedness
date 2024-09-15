
import puppeteer, { Page, Browser } from 'puppeteer';
import crawl, { processPage, toAbsoluteUrl } from '../src/crawl-website-connectedness';

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

describe('toAbsoluteUrl', () => {
  it('should correctly resolve relative URLs to absolute URLs', () => {
    const baseUrl = 'http://example.com';
    const relativeUrl = '/test';
    const expectedUrl = 'http://example.com/test';

    const result = toAbsoluteUrl(relativeUrl, baseUrl);

    expect(result).toEqual(expectedUrl);
  });

  it('should return the relative URL if no base URL is provided', () => {
    const relativeUrl = '/test';
    const expectedUrl = '/test';

    const result = toAbsoluteUrl(relativeUrl);

    expect(result).toEqual(expectedUrl);
  });
});

describe('processPage', () => {
  it('should process a page correctly', async () => {
    const currentUrl = 'http://test.com/page1';

    const childUrls = await processPage(currentUrl);

    expect(puppeteer.launch).toHaveBeenCalled();
    expect(childUrls).toEqual([
      'http://test.com/page1/post1',
      'http://test.com/page1/post2',
      'http://test.com/page1/post3'
    ]);
  });
});

describe('crawl', () => {
  it('should crawl the website and return the correct result', async () => {
    const queue = ['http://test.com/page1', 'http://test.com/page2', 'http://test1.com/page2'];
    const baseUrl = 'http://test.com';
    const visited = new Set<string>();
    const result = {};
    const logSpy = jest.spyOn(console, 'log');
    const finalResult = await crawl(queue, baseUrl, baseUrl, true);

    expect(finalResult).toEqual({ // it will call processPage twice
      'http://test.com/page1': [
        'http://test.com/page1/post1',
        'http://test.com/page1/post2',
        'http://test.com/page1/post3'
      ],
      "http://test.com/page1/post1": [],
      "http://test.com/page1/post2": [],
      "http://test.com/page1/post3": [],
      'http://test.com/page2': [
        'http://test.com/page2/post1',
        'http://test.com/page2/post2',
      ],
      'http://test.com/page2/post1': [],
      'http://test.com/page2/post2': [],
    });

    // Check if console.log was called with the correct arguments
    expect(logSpy).toHaveBeenCalledWith('Crawling: http://test.com/page1');
    expect(logSpy).toHaveBeenCalledWith('Crawling: http://test.com/page2');
  });

  it('should crawl only the required path if provided', async () => {
    const queue = ['http://test.com/page1', 'http://test.com/page2'];
    const baseUrl = 'http://test.com';
    const requiredPath = 'page1';
    const resultWithRequiredPath = await crawl(queue, baseUrl, requiredPath, true);

    // Expect only the required path and its posts to be crawled
    expect(resultWithRequiredPath).toEqual({
      'http://test.com/page1': [
        'http://test.com/page1/post1',
        'http://test.com/page1/post2',
        'http://test.com/page1/post3'
      ],
      "http://test.com/page1/post1": [],
      "http://test.com/page1/post2": [],
      "http://test.com/page1/post3": [],
    });
  });
});
