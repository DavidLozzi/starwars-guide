# Consuming the Star Wars Guide news feed

One news list serves every AurebeshFiles app. It lives in `starwars-guide` (this repo) and is published as JSON. Your app reads it — it does not keep its own list.

**Endpoint:** `https://starwars.guide/news-feed.json`

CORS is open (`Access-Control-Allow-Origin: *`) and it's cached 5 minutes, so fetch it at runtime. No auth, no key. The iOS keyboard, the React apps, the Next.js site, and the Canvas game all hit the same URL.

## Shape

```json
{
  "updated": "2026-08-08T14:52:11-04:00",
  "icons": {
    "provider": "font-awesome-6",
    "kit": "https://kit.fontawesome.com/13cabfa89d.js"
  },
  "products": {
    "swordle": {
      "name": "SWordle",
      "icon": "fas fa-table-cells",
      "hex": "#4ade80",
      "url": "https://starwars.guide/swordle-star-wars-wordle"
    }
  },
  "items": [
    {
      "id": "swordle-green-carryover",
      "date": "2026-08-03",
      "product": "swordle",
      "title": "Your focus determines your reality",
      "message": "Green letters now carry over to your next guess…",
      "url": "https://starwars.guide/games/2026/08/03/swordle-green-letters-carry-over.html",
      "link": "https://starwars.guide/news/#swordle-green-carryover"
    }
  ]
}
```

### `items[]`

| Field | Notes |
|---|---|
| `id` | Stable slug. Use it as your React key / diffing identity, never the array index. |
| `date` | `YYYY-MM-DD`. Items arrive **newest first** — don't re-sort unless you want a different order. |
| `product` | Key into the `products` map. See the display rules below. |
| `title` | Plain text. |
| `message` | **May contain HTML** — currently `<a>` and `<strong>`. Render it as HTML (`dangerouslySetInnerHTML` or equivalent) or strip tags; do not print it raw. |
| `url` | Optional. Present when there's a full article to read. Absolute. Open in a new tab/browser — it leaves your app. |
| `link` | Always present. Deep link to that item on `starwars.guide/news/`. Use it for "see all news" or a share target. |

### `products{}`

Keyed by the `product` value on an item. Every key you'll see in `items` exists here.

| Key | Name | Icon (Font Awesome 6 free, solid) | Hex |
|---|---|---|---|
| `site` | General | `fas fa-star` | `#facc15` |
| `comics` | Comics | `fas fa-book-open` | `#c084fc` |
| `timeline` | Ultimate Star Wars Timeline | `fas fa-clock` | `#60a5fa` |
| `hyperpanels` | HyperPanels | `fas fa-book` | `#f87171` |
| `swordle` | SWordle | `fas fa-table-cells` | `#4ade80` |
| `clone-defense` | Clone Defense | `fas fa-shield-halved` | `#f87171` |

**Read this table from the feed at runtime, don't hardcode it.** It's here so you can see what you're dealing with. New products get added centrally and your app should pick them up without a release.

## Display rules

These are the parts that must look the same everywhere. Everything else — placement, whether it's a modal or a drawer or a sidebar, animation, when it opens — is yours to decide per app.

1. **The chip.** Each item shows its product as icon + name, in that product's `hex`. Icon left of the name. That pairing is the shared visual language across apps, so keep the icon *and* the color together — don't invent your own icon per product, don't recolor.
2. **Use Font Awesome 6 — the hub's kit, not your own.** Load `https://kit.fontawesome.com/13cabfa89d.js` (`crossorigin="anonymous"`), the same kit `starwars.guide` loads. Same icon set, same version, one place to update. The kit URL is in the feed as `icons.kit`, so read it from there rather than pasting the ID.

   The `icon` value is already a class string — drop it straight into `className` / `class`:

   ```jsx
   <i className={product.icon} style={{ color: product.hex }} />
   ```

   Native targets (the iOS keyboard) bundle the Font Awesome 6 Free desktop font and use the same glyph names — same icons as the web, no platform substitutions.

   Heads-up: browsers partition HTTP cache by top-level site, so `wordle.` and `timeline.` each fetch their own copy — sharing the kit buys consistency, not a cache hit.
3. **Every app shows every item.** Do not filter to your own product. A SWordle update is news for Clone Defense players too — that's the point of one feed. If you want your own product's items visually first, sort within the same list; don't drop the rest.
4. **Order** is newest first, by `date`.
5. **Future dates:** items dated later than today are scheduled — filter them out (`new Date(item.date) <= new Date()`). This is how we stage an announcement ahead of a launch.
6. **"Read more"** renders only when `url` exists.
7. **Unread badge:** compare the newest visible `date` against a per-user stored timestamp. SWordle already does this with `lastNewsItemDate`; keep that pattern.
8. **Failure is silent.** If the fetch fails, render nothing and move on — news is never blocking. Cache the last good response if your platform makes that easy.

## Minimal fetch

```js
const res = await fetch('https://starwars.guide/news-feed.json');
const { items, products, icons } = await res.json();

// Load the hub's Font Awesome kit once, if your app doesn't already have it.
if (!document.querySelector(`script[src="${icons.kit}"]`)) {
  const s = document.createElement('script');
  s.src = icons.kit;
  s.crossOrigin = 'anonymous';
  document.head.appendChild(s);
}

const today = new Date();
const visible = items.filter(i => new Date(i.date) <= today);

visible.forEach(item => {
  const product = products[item.product] ?? products.site;
  // product.name, product.icon, product.hex → the chip
  // item.title, item.message → the body
  // item.url → optional "Read more"
});
```

## Adding news

Don't add items in your app's repo. They go in `starwars-guide`:

- One-liner → an entry in `_data/news.json`. `url` must be an absolute `https://starwars.guide/...` link, since it renders on your origin.
- Needs a real article → a post in `_posts/` with a `product:` front-matter key. It joins the same stream automatically.

Full detail in that repo's `CLAUDE.md`, "Centralized news feed".
