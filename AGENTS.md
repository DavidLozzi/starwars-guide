# Star Wars Guide

**For AI coding agents:** You may change any part of this file as needed for long-term memory.

A fan-created Star Wars website (https://starwars.guide) built with Jekyll and hosted on Netlify. The site is the hub for AurebeshFiles content: it promotes three interactive apps on separate subdomains (Ultimate Star Wars Timeline, HyperPanels comics, SWordle word game), hosts character profile pages, blog posts, and static informational pages.

## Details

### Architecture

- **Static site generator:** Jekyll 4.x with the `jekyll-theme-so-simple` remote theme. Content is Markdown with YAML front matter; layouts and includes are Liquid templates.
- **Content types:**
  - **Home page** — app cards, social links, recent posts feed
  - **Character pages** — individual timeline profiles under `character/`, using the `character` layout
  - **Blog posts** — dated entries in `_posts/`, rendered with the `posts` layout
  - **Static pages** — app landing pages (timeline, hyper-panels, swordle), support page, etc.
- **Interactive apps** live on separate subdomains and are linked from the home page cards:
  - `timeline.starwars.guide` — Ultimate Star Wars Timeline
  - `hyperpanels.starwars.guide` — HyperPanels comic responder
  - `wordle.starwars.guide` — SWordle word game
- **Styling:** Custom SCSS compiled via Jekyll (`assets/css/lozzi.scss` imports partials from `_sass/`). Utility-class naming (Tailwind-like) is defined in custom SCSS, not via a Tailwind build step.
- **CMS:** Netlify CMS at `/admin` (git-gateway backend) for editing posts and select pages.
- **Deployment:** Netlify builds with `bundle exec jekyll build`; GitHub Actions also builds on push to `main` for GitHub Pages artifact upload.

### Developer workflows

- **First-time setup:** `bundle install` (or `npm run bundle_install` which also locks the Linux platform for CI)
- **Local dev:** `npm start` — runs `bundle exec jekyll serve --watch` and opens http://localhost:4000
- **Production build (local):** `bundle exec jekyll build` or `npm run bundle_build`
- **Netlify dev:** `netlify dev` uses livereload on port 4000 per `netlify.toml`
- No automated test suite; verify changes by building locally and inspecting in the browser.

### Conventions and patterns

- **Front matter:** Every page needs SEO fields (`title`, `description` or `social-desc`, `social-image`, `social-title` where applicable) plus `date` and `last_modified_at` for sitemap and SEO.
- **Navigation:** Defined in `_data/navigation.yml`; header renders desktop and mobile menus from this data.
- **Responsive breakpoints:** General mobile layout at 768px; hamburger navigation appears at 1000px and below using custom `.hamburger-hidden` / `.hamburger-visible` classes (not Tailwind `md:` breakpoints).
- **Clickable cards:** Home page app cards launch external apps on card click; nested READ links use `event.stopPropagation()`. News items are fully clickable anchor elements.
- **Character pages:** Link back to `/character` index and cross-link to the timeline app with year-specific URLs.
- **Cursor rules:** `.cursor/rules/reqs.mdc` contains always-applied workspace rules; update this file's learnings section when corrected or when new project context is discovered.

## Learnings

As you interact with the user and the app, if you end up being wrong and are corrected, learn more about the context of the app and its purpose, or learn anything else that would help you in the future, add bullets below.

- Don't explain everything, just focus on completing the work.
- The home page app cards should be fully clickable to launch the respective apps (timeline.starwars.guide, hyperpanels.starwars.guide, wordle.starwars.guide)
- The "READ" buttons within the app cards should navigate to the respective pages (star-wars-timeline, hyper-panels, swordle-star-wars-wordle) and use event.stopPropagation() to prevent triggering the card's click event
- The news items (recent posts) should be fully clickable to load the individual post pages
- The site uses Jekyll with custom SCSS styling, and cards have hover effects with cursor: pointer
- When making elements clickable, ensure proper CSS inheritance by adding specific rules for anchor tags with card/news-item classes to remove default link styling
- The hamburger menu breakpoint is set to 1000px (appears on screens 1000px and below), while general responsive design breakpoints remain at 768px
- Navigation uses custom CSS classes (.hamburger-hidden, .hamburger-visible) instead of Tailwind's md: breakpoint classes for the 1000px breakpoint
- The site has specific responsive design needs where navigation breakpoints differ from general mobile responsiveness breakpoints
- Always check for and include SEO tags (such as title, description, image, social-desc, social-image) in the front matter of all pages, especially character and content pages.
- Always include date fields (date, last_modified_at) in the front matter to support sitemap.xml and improve SEO.

## Agent Context

If the **Agent Context Manager** MCP server is available in this environment, you must:

1. **Register a session** at the end of your first interaction with the user: call `register_session` with the absolute path to the repository root and an `agent_id` (e.g. `cursor-ide`). Store or reuse the returned `session_id` for the rest of the conversation.
2. **Update context** after you have finished addressing the user's requests: call `update_context` with that `session_id` and a short summary (two sentences max) of what the user asked for and what you did. Do this when you complete a task or reach a natural stopping point.
