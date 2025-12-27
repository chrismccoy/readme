/**
 * Github Readme Fetcher Application
 * This handles URL validation, repository metadata, retrieves README content,
 * renders Markdown to HTML, and sanitizes the output.
 */
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Octokit } from "octokit";
import NodeCache from "node-cache";
import createDOMPurify from "isomorphic-dompurify";
import { marked } from "marked";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Cache instance for storing GitHub API responses.
 */
const cache = new NodeCache({ stdTTL: 3600 });

/**
 * Octokit client instance for interacting with the GitHub API.
 */
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  userAgent: "readme-fetcher-v2",
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "./public")));

/**
 * Fetches the raw README Markdown content for a specific repository from GitHub.
 * Uses in-memory caching to minimize API calls.
 */
const fetchRepoReadme = async (owner, repo) => {
  const cacheKey = `${owner}/${repo}`;

  // Check Cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`[Cache Hit] ${cacheKey}`);
    return cachedData;
  }

  console.log(`[API Fetch] ${cacheKey}`);

  // Fetch from GitHub
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/readme", {
    owner,
    repo,
    headers: {
      accept: "application/vnd.github.raw",
    },
  });

  // Store in Cache
  cache.set(cacheKey, data);

  return data;
};

/**
 * Validates a GitHub URL and extracts the owner and repository name.
 */
const parseGitHubUrl = (inputUrl) => {
  try {
    const urlObj = new URL(inputUrl);

    const normalizedHost = urlObj.hostname.replace(/^www\./, "");

    if (normalizedHost !== "github.com") return null;

    const parts = urlObj.pathname.split("/").filter(Boolean);

    if (parts.length < 2) return null;

    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
};

/**
 * Endpoint to retrieve, parse, and render a GitHub README.
 */
app.post("/api/fetch-readme", async (req, res, next) => {
  try {
    const { url } = req.body;
    const repoInfo = parseGitHubUrl(url);

    if (!repoInfo) {
      return res.status(400).json({
        error: "Invalid URL. Format: https://github.com/:owner/:repo",
      });
    }

    // Get Raw Markdown
    const markdown = await fetchRepoReadme(repoInfo.owner, repoInfo.repo);

    // Parse Markdown to HTML
    const rawHtml = marked.parse(markdown);

    // Sanitize
    const cleanHtml = createDOMPurify.sanitize(rawHtml);

    return res.json({ html: cleanHtml });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ error: "Repository or Readme not found." });
    }
    if (error.status === 403 || error.status === 429) {
      return res.status(429).json({ error: "GitHub API rate limit exceeded." });
    }

    // Pass to global error handler
    next(error);
  }
});

/**
 * Global Error Handling Middleware.
 */
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
