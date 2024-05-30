import crawlWebsiteConnectedness from '../crawlWebsiteConnectedness';

describe('getIdFromNodeName', () => {
  it('should return the correct node when the URL matches', () => {
    const nodes = [
      { id: 1, name: 'Node 1', url: 'http://example.com', group: 'Group 1' },
      { id: 2, name: 'Node 2', url: 'http://test.com', group: 'Group 2' },
    ];

    const result = getIdFromNodeName(nodes, 'http://test.com');

    expect(result).toEqual({ id: 2, name: 'Node 2', url: 'http://test.com', group: 'Group 2' });
  });

  it('should return undefined when no node matches the URL', () => {
    const nodes = [
      { id: 1, name: 'Node 1', url: 'http://example.com', group: 'Group 1' },
      { id: 2, name: 'Node 2', url: 'http://test.com', group: 'Group 2' },
    ];

    const result = getIdFromNodeName(nodes, 'http://nonexistent.com');

    expect(result).toBeUndefined();
  });
});
