import { Post, Comment, BlogSettings } from '../types/blog';
import { BLOG_CONFIG } from '../blog.config';

export const DEFAULT_SETTINGS: BlogSettings = {
  publicationName: BLOG_CONFIG.publicationName,
  publicationTagline: BLOG_CONFIG.publicationTagline,
  authorName: BLOG_CONFIG.authorName,
  authorBio: BLOG_CONFIG.authorBio,
  authorAvatar: BLOG_CONFIG.authorAvatar,
  spreadsheetId: BLOG_CONFIG.spreadsheetId,
  appsScriptUrl: BLOG_CONFIG.appsScriptUrl,
  backendMode: BLOG_CONFIG.appsScriptUrl ? "apps-script" : (BLOG_CONFIG.spreadsheetId ? "public-sheet" : "local")
};

export const INITIAL_POSTS: Post[] = [
  {
    id: "post-1",
    title: "The Renaissance of the Static Web & Google Sheets",
    subtitle: "Why decoupled, lightweight architectures hosted on GitHub Pages are outpacing bloated content management systems.",
    slug: "renaissance-of-static-web",
    author: "Bharath Sathuri",
    authorEmail: "bharathsathuri@gmail.com",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
    coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    tags: ["Web Architecture", "Essays", "Publishing"],
    status: "published",
    publishedAt: "2026-10-18T10:00:00.000Z",
    updatedAt: "2026-10-18T10:00:00.000Z",
    likesCount: 142,
    readTimeMinutes: 5,
    content: `# The Renaissance of the Static Web & Google Sheets

For the past decade, publishing a blog meant running an over-engineered database, paying recurring server bills, or locking your thoughts inside a proprietary silo that algorithmically throttles your distribution.

Yet the web has quietly shifted. A powerful convergence of static site hosting on **GitHub Pages**, client-side reactive rendering, and **Google Sheets as a headless database** delivers an unbeatable paradigm:

> *"The best backend is the one you already know how to use, that costs zero dollars to operate, and that you will never have to patch at 2:00 AM on a Saturday."*

---

## Why Google Sheets Makes an Ideal Headless CMS

When you strip away the administrative bloat of traditional publishing engines, what do you truly need to store an essay?

1. **Structured Metadata:** A title, subtitle, publishing timestamp, slug, and cover asset.
2. **Raw Markdown:** Pure, human-readable prose that will outlive any software trend.
3. **Conversational Feedback:** Reader comments, thoughts, and community dialogue.

A Google Spreadsheet represents the ultimate collaborative editor. You can draft an outline on your mobile phone via the Google Sheets app while waiting for coffee, collaborate with an editor who leaves cell comments in real-time, and publish directly through our dedicated markdown interface.

\`\`\`typescript
// Every row is an immutable essay; every column a structured dimension
interface SheetSchema {
  id: string;
  title: string;
  content: string; // Markdown payload
  publishedAt: ISO8601String;
}
\`\`\`

## Zero Cost, Zero Infrastructure, Infinite Scale

Because **GitHub Pages** serves assets over globally distributed CDNs with HTTPS configured out of the box, your publication can absorb front-page Hacker News traffic without slowing down or incurring high hosting fees.

### The Substack Reading Experience
Readers don't come for complex navigation bars or blinking notification feeds. They come for **clarity**, **typographic calm**, and **unhurried focus**. By honoring the editorial proportions of classical print—generous margins, high-contrast serif body copy, and legible header scales—reading on a screen becomes a pleasure once again.

Thank you for reading, and welcome to this new way of writing.`
  },
  {
    id: "post-2",
    title: "Typography, Margins, and the Substack Aesthetic",
    subtitle: "A practical study on line lengths, vertical rhythm, and why reading long-form online should feel like holding a printed book.",
    slug: "typography-margins-substack-aesthetic",
    author: "Bharath Sathuri",
    authorEmail: "bharathsathuri@gmail.com",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
    coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    tags: ["Design", "Typography", "Craft"],
    status: "published",
    publishedAt: "2026-10-12T14:30:00.000Z",
    updatedAt: "2026-10-12T14:30:00.000Z",
    likesCount: 89,
    readTimeMinutes: 4,
    content: `# Typography, Margins, and the Substack Aesthetic

The secret to Substack's reading phenomenon isn't its recommendation feed. It is its strict **graphic restraint**.

In an internet obsessed with sticky floating banners, video popups, and aggressive newsletter prompts, Substack restored the sacred quiet of the printed page.

## The 65-Character Rule

Robert Bringhurst, in his seminal *The Elements of Typographic Style*, noted that anything between 45 and 75 characters per line is satisfactory for single-column text. 

At 66 characters per line, the human eye travels effortlessly from the end of one line to the beginning of the next without losing its vertical anchor.

* **Line Height:** 1.7 to 1.85 gives breath to serif ascenders and descenders.
* **Warmth over Clinical Glare:** A creamy ivory background (\`#faf9f6\`) softens the stark luminescence of OLED and retina displays.
* **Contrasting Headers:** Bold geometric sans-serif headlines anchor the fluid narrative of serif body paragraphs.

Try writing your next dispatch in the Markdown editor above, and notice how the formatting tools let your thoughts take center stage.`
  },
  {
    id: "post-3",
    title: "How to Deploy This Publication to GitHub Pages in 3 Minutes",
    subtitle: "A quick-start guide to hosting your Google Sheets-backed blog on your own custom domain or github.io repository.",
    slug: "how-to-deploy-to-github-pages",
    author: "Bharath Sathuri",
    authorEmail: "bharathsathuri@gmail.com",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    tags: ["GitHub Pages", "Tutorial", "Engineering"],
    status: "published",
    publishedAt: "2026-10-05T09:15:00.000Z",
    updatedAt: "2026-10-05T09:15:00.000Z",
    likesCount: 215,
    readTimeMinutes: 3,
    content: `# Deploying to GitHub Pages in 3 Minutes

Hosting your blog on GitHub Pages gives you a fast, secure, and permanent home on the web.

## Step 1: Create Your Google Sheet

Click the **Google Sheets Setup** button in the top navigation. You can:
1. Connect with Google to automatically create a formatted spreadsheet in your Google Drive with \`Posts\`, \`Comments\`, and \`Subscribers\` tabs.
2. Or copy our ready-made Google Apps Script web connector into your sheet.

## Step 2: Push to GitHub

Create a repository named \`username.github.io\` (for a personal domain) or \`my-newsletter\` on GitHub:

\`\`\`bash
git init
git add .
git commit -m "Initial publication launch"
git branch -M main
git remote add origin https://github.com/username/my-newsletter.git
git push -u origin main
\`\`\`

## Step 3: Turn on GitHub Pages

In your repository on GitHub:
1. Navigate to **Settings > Pages**.
2. Under **Build and deployment**, select **GitHub Actions** or **Deploy from branch (main / root)**.
3. Your Substack publication is live instantly!

Readers can now browse your posts, read with high typographic quality, and submit comments directly into your Google Sheet.`
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: "comment-1",
    postId: "post-1",
    authorName: "Elena Vance",
    authorEmail: "elena@chronicle.design",
    comment: "This is exactly what I've been looking for. The idea of writing articles in Google Sheets or this markdown editor and pushing directly to GitHub Pages without paying $30/mo for a hosted CMS is refreshing.",
    createdAt: "2026-10-18T14:22:00.000Z"
  },
  {
    id: "comment-2",
    postId: "post-1",
    authorName: "Marcus Sterling",
    authorEmail: "marcus@devdaily.io",
    comment: "The typography feels so natural. Reading this on desktop and iPad looks identical to Substack's native reader. Great work!",
    createdAt: "2026-10-19T08:15:00.000Z"
  },
  {
    id: "comment-3",
    postId: "post-2",
    authorName: "Sophia Chen",
    authorEmail: "sophia@webcraft.cc",
    comment: "65 characters per line is indeed the golden rule. So many tech blogs stretch paragraphs to 1200px wide, which causes immense eye strain. Thank you for respecting the craft.",
    createdAt: "2026-10-13T11:04:00.000Z"
  }
];
