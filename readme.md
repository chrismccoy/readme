# GitHub Readme Fetcher

A tiny application that accepts a GitHub repository URL, retrieves the associated `README.md` file using the GitHub API, and renders it as sanitized HTML within a clean, Tailwind styled interface.

## Features

*   🔗 **Smart URL Validation**: Automatically validates and parses GitHub repository links to ensure accurate fetching.
*   📡 **Direct API Integration**: Connects to the GitHub API to detect repository existence and locate the correct README file automatically.
*   📝 **Markdown Parsing**: Conversion of raw Markdown into HTML using the `marked` library.
*   🛡️ **XSS Protection**: Implements `isomorphic-dompurify` to sanitize rendered HTML, ensuring safe display of content.
*   🌊 **Tailwind Styling**: specific GitHub-flavored CSS styles wrapped in a responsive Tailwind container.
*   ✖️ **Interactive UI**: Includes loading states, detailed error feedback, and a dismissible content area to reset the view.
