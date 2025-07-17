# Agentic Learnings

As you, the coding agent, learn about the user's preferences, application context, or anything else you were not aware about, write them below, as bullets.

<learnings>
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
</learnings>