import { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler";
import { errorResponse } from "../utils/api";
import hljs from "highlight.js";
import puppeteer from "puppeteer";

interface Section {
  type: "heading" | "paragraph" | "code";
  level?: number;
  text?: string;
  language?: string;
  code?: string;
}

interface GeneratePdfRequest {
  title: string;
  sections: Section[];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderHeadingSection(text: string, level?: number): string {
  const hLevel = level && level >= 1 && level <= 6 ? level : 2;
  return `<h${hLevel}>${escapeHtml(text)}</h${hLevel}>`;
}

function renderParagraphSection(text: string): string {
  // Convert newlines to br for formatting paragraphs nicely
  const htmlText = escapeHtml(text).replace(/\n/g, "<br>");
  return `<p>${htmlText}</p>`;
}

function renderCodeSection(code: string, language?: string): string {
  let highlighted = "";
  const lang = language?.trim() || "";

  try {
    if (lang && hljs.getLanguage(lang)) {
      highlighted = hljs.highlight(code, { language: lang }).value;
    } else {
      highlighted = hljs.highlightAuto(code).value;
    }
  } catch (err) {
    console.error(
      "Syntax highlighting failed, falling back to escaped HTML:",
      err,
    );
    highlighted = escapeHtml(code);
  }

  const displayLang = lang || "code";

  return `
    <div class="code-container">
      <div class="code-titlebar">
        <div class="code-dots"><span></span><span></span><span></span></div>
        <span class="lang-badge">${displayLang}</span>
      </div>
      <pre><code class="hljs language-${displayLang}">${highlighted}</code></pre>
    </div>
  `;
}

function renderSection(section: Section): string {
  switch (section.type) {
    case "heading":
      return renderHeadingSection(section.text || "", section.level);
    case "paragraph":
      return renderParagraphSection(section.text || "");
    case "code":
      return renderCodeSection(
        section.code || section.text || "",
        section.language,
      );
    default:
      return "";
  }
}

function buildHtml(title: string, sections: Section[]): string {
  const renderedSections = sections.map(renderSection).join("\n");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    @page {
      size: A4;
      margin: 22mm 20mm;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      background-color: #ffffff;
      color: #1f2937;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.65;
      font-size: 10.5pt;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }

    .doc-container {
      padding: 0;
    }

    /* Header */
    .doc-header {
      margin-bottom: 2.6em;
      padding-bottom: 1.5em;
      border-bottom: 1px solid #e5e7eb;
    }

    .doc-meta {
      display: inline-block;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #4f46e5;
      background: #eef0ff;
      padding: 4px 10px;
      border-radius: 4px;
      margin-bottom: 0.9em;
    }

    .doc-header h1 {
      font-size: 24pt;
      color: #111827;
      font-weight: 800;
      margin: 0;
      line-height: 1.3;
      letter-spacing: -0.02em;
    }

    /* Headings */
    h2, h3, h4 {
      color: #111827;
      font-weight: 700;
      line-height: 1.35;
      break-after: avoid;
      page-break-after: avoid;
    }

    h2 {
      font-size: 14.5pt;
      margin-top: 2.1em;
      margin-bottom: 0.9em;
      padding-bottom: 8px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
    }

    h2::before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 14px;
      background: #4f46e5;
      border-radius: 2px;
      margin-right: 9px;
    }

    h3 {
      font-size: 11.5pt;
      margin-top: 1.6em;
      margin-bottom: 0.6em;
      color: #1f2937;
    }

    /* Body text */
    p {
      margin-top: 0;
      margin-bottom: 1.1em;
      orphans: 3;
      widows: 3;
      text-align: left;
      color: #4b5563;
    }

    strong { color: #111827; font-weight: 600; }

    ul, ol {
      margin-top: 0;
      margin-bottom: 1.2em;
      padding-left: 1.4em;
      color: #4b5563;
    }

    li {
      margin-bottom: 0.45em;
    }

    li::marker {
      color: #4f46e5;
    }

    /* Inline code — light theme, small accent */
    :not(pre) > code {
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      font-size: 0.88em;
      background: #f3f4f6;
      color: #4338ca;
      padding: 0.15em 0.4em;
      border-radius: 4px;
      border: 1px solid #e5e7eb;
    }

    /* Code block — dark, contained, no floating elements */
    .code-container {
      margin: 1.6em 0;
      break-inside: avoid;
      page-break-inside: avoid;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #d1d5db;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
    }

    .code-titlebar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #161b22;
      padding: 8px 14px;
      border-bottom: 1px solid #30363d;
    }

    .code-dots {
      display: flex;
      gap: 5px;
    }

    .code-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
      background: #30363d;
    }

    .lang-badge {
      font-family: 'Inter', sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    pre {
      background: #0d1117;
      margin: 0;
      padding: 1.1em 1.3em;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-x: hidden;
    }

    code {
      font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
      font-size: 8.8pt;
      line-height: 1.65;
      color: #c9d1d9;
    }

    /* Syntax highlighting inside dark code blocks */
    .hljs-keyword, .hljs-selector-tag, .hljs-literal, .hljs-section, .hljs-link {
      color: #ff7b93;
      font-weight: 600;
    }
    .hljs-function .hljs-title, .hljs-title.function_ {
      color: #79c0ff;
    }
    .hljs-string, .hljs-attribute, .hljs-symbol, .hljs-bullet, .hljs-addition {
      color: #7ee787;
    }
    .hljs-number, .hljs-regexp, .hljs-variable, .hljs-template-variable {
      color: #d2a8ff;
    }
    .hljs-comment, .hljs-quote, .hljs-deletion {
      color: #8b949e;
      font-style: italic;
    }
    .hljs-type, .hljs-class .hljs-title, .hljs-title.class_ {
      color: #ffa657;
    }
    .hljs-params, .hljs-attr {
      color: #c9d1d9;
    }
    .hljs-built_in, .hljs-bullet {
      color: #79c0ff;
    }
    .hljs-meta {
      color: #8b949e;
    }
  </style>
</head>
<body>
  <div class="doc-container">
    <div class="doc-header">
      <div class="doc-meta">GenieLearn Study Guide</div>
      <h1>${escapeHtml(title)}</h1>
    </div>
    <div class="doc-content">
      ${renderedSections}
    </div>
  </div>
</body>
</html>`;
}

export const generatePdf = asyncHandler(async (req: Request, res: Response) => {
  const { title, sections } = req.body as GeneratePdfRequest;

  if (!title || typeof title !== "string") {
    return errorResponse(res, {
      statusCode: 400,
      message: "Title is required and must be a string",
      errorCode: "INVALID_TITLE",
    });
  }

  if (!sections || !Array.isArray(sections)) {
    return errorResponse(res, {
      statusCode: 400,
      message: "Sections are required and must be an array",
      errorCode: "INVALID_SECTIONS",
    });
  }

  // Build high-quality styled HTML with inlined highlight.js styles
  const htmlContent = buildHtml(title, sections);

  let browser;
  try {
    const launchOptions: any = {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    };

    // If running on Windows, try using Microsoft Edge as a fallback to avoid
    // security policy (Smart App Control / Code Integrity) blocking unsigned Puppeteer-installed binaries.
    if (process.platform === "win32") {
      const edgePath =
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
      const fs = require("fs");
      if (fs.existsSync(edgePath)) {
        launchOptions.executablePath = edgePath;
      }
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // Set page content and wait for it to be fully rendered
    await page.setContent(htmlContent, {
      waitUntil: "load",
    });

    // Generate A4 format PDF with background graphics enabled
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();
    browser = null;

    // Send PDF stream
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(title.replace(/\s+/g, "_"))}.pdf"`,
    );
    return res.send(pdfBuffer);
  } catch (error: any) {
    console.error("Puppeteer PDF generation error:", error);
    if (browser) {
      try {
        await browser.close();
      } catch (closeErr) {
        console.error("Error closing puppeteer browser:", closeErr);
      }
    }
    return errorResponse(res, {
      statusCode: 500,
      message: "Failed to generate PDF document",
      errorCode: "PDF_GENERATION_FAILED",
      errors: [error.message || error],
    });
  }
});
