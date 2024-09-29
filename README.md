# Crawl Website Connectedness

## Overview

This project creates a module to scrape the connectedness of the websites.

## Installation

To install and set up the project locally, follow these steps:

```bash
yarn install crawl-website-connectedness
```

## Usage

```javascript
import crawl from 'crawl-website-connectedness';

const result = await crawl(
  ['https://ycchenvictor.netlify.app/web-development/'], // URLs to crawl (queue)
  'https://ycchenvictor.netlify.app/', // Base URL
  'https://ycchenvictor.netlify.app/', // Required string in each URL
  true, // If true, it will log out the progress
  new Set(['https://ycchenvictor.netlify.app/', 'https://ycchenvictor.netlify.app/software-dashboard']) // visited. You can add URLs here to prevent the crawler from visiting them
);
```

## Tests

```bash
yarn test
```

## Run this script for development

```bash
yarn dev
```

## Compile and upload to npm

```bash
yarn compile:npm
npm publish
```

## Contributing

Contributions are welcome! Please follow the guidelines for submitting pull requests.

Fork the repository
Create a new branch (git checkout -b feature-branch)
Commit your changes (git commit -m 'Add feature')
Push to the branch (git push origin feature-branch)
Open a pull request

## License

This project is licensed under the MIT License. See the LICENSE file for details.
