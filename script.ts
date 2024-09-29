import crawl from "./src/index";

const result = await crawl(
  ["https://ycchenvictor.netlify.app/web-development/"], // URLs to crawl (queue)
  "https://ycchenvictor.netlify.app/", // Base URL
  "https://ycchenvictor.netlify.app/", // Required string in each URL
  true, // If true, it will log out the progress
  new Set([
    "https://ycchenvictor.netlify.app/",
    "https://ycchenvictor.netlify.app/software-dashboard",
  ]), // visited. You can add URLs here to prevent the crawler from visiting them
);

console.log(result);
