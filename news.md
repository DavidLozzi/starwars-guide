---
layout: page
title: News & Updates
permalink: /news/
description: "Every update across the Star Wars Guide apps — SWordle, the Ultimate Star Wars Timeline, HyperPanels, Clone Defense, and Red Five — in one place."
social-desc: "Every update across the Star Wars Guide apps in one place"
social-title: "Star Wars Guide — News & Updates"
social-image: /assets/social.png
date: 2026-08-08
last_modified_at: 2026-08-08
---

<p class="text-white opacity-80 mb-8">
  Everything new across the apps — <a href="/swordle-star-wars-wordle/" class="text-yellow-400">SWordle</a>,
  the <a href="/star-wars-timeline/" class="text-yellow-400">Ultimate Star Wars Timeline</a>,
  <a href="/hyper-panels/" class="text-yellow-400">HyperPanels</a>,
  <a href="/clone-defense/" class="text-yellow-400">Clone Defense</a>, and
  <a href="/red-five/" class="text-yellow-400">Red Five</a>.
</p>

{%- comment -%}
One stream, two storage shapes: short items live in _data/news.json, long-form
lives in _posts/. Liquid can't sort a mixed array of Documents and hashes, so
build a sortable index of "YYYY-MM-DD~type~index" strings, sort that, then
dereference each row back to its source collection.
{%- endcomment -%}
{%- comment -%}
A blurb whose `url` points at one of our posts stands in for that post — skip
the post itself so the stream doesn't show the same update twice. Match on the
post's path, not its absolute URL: `jekyll serve` rewrites site.url to
localhost, which would break an absolute-URL comparison in dev only.
{%- endcomment -%}
{%- assign linked = "" -%}
{%- for item in site.data.news -%}
  {%- if item.url -%}{%- capture linked %}{{ linked }}{{ item.url }},{% endcapture -%}{%- endif -%}
{%- endfor -%}
{%- assign rowlist = "" -%}
{%- for post in site.posts -%}
  {%- unless linked contains post.url -%}
    {%- capture rowlist %}{{ rowlist }}{{ post.date | date: "%Y-%m-%d" }}~post~{{ forloop.index0 }},{% endcapture -%}
  {%- endunless -%}
{%- endfor -%}
{%- for item in site.data.news -%}
  {%- capture rowlist %}{{ rowlist }}{{ item.date }}~news~{{ forloop.index0 }},{% endcapture -%}
{%- endfor -%}
{%- assign rows = rowlist | split: "," | sort | reverse -%}

<div class="news-filters mb-8" role="group" aria-label="Filter news by product">
  <button type="button" class="news-filter is-active" data-product="all">All</button>
  {% for product in site.data.products %}
    {% assign news_count = site.data.news | where: "product", product.key | size %}
    {% assign post_count = site.posts | where: "product", product.key | size %}
    {% if news_count > 0 or post_count > 0 %}
      <button type="button" class="news-filter" data-product="{{ product.key }}">
        <i class="{{ product.icon }} mr-2"></i>{{ product.name }}
      </button>
    {% endif %}
  {% endfor %}
</div>

<div class="space-y-4" id="news-list">
  {% for row in rows %}
    {% assign parts = row | split: "~" %}
    {% assign idx = parts[2] | plus: 0 %}

    {% if parts[1] == "post" %}
      {% assign entry = site.posts[idx] %}
      {% assign key = entry.product | default: "site" %}
      {% assign anchor = entry.slug %}
      {% assign body = entry.social-desc | default: entry.excerpt | strip_html | truncatewords: 40 %}
      {% assign read_url = entry.url %}
    {% else %}
      {% assign entry = site.data.news[idx] %}
      {% assign key = entry.product | default: "site" %}
      {% assign anchor = entry.id %}
      {% assign body = entry.message %}
      {% assign read_url = entry.url %}
    {% endif %}
    {% assign read_label = entry.link_text | default: "Read more" %}
    {% assign product = site.data.products | where: "key", key | first %}

    <article class="news-item news-entry" data-product="{{ key }}" id="{{ anchor }}">
      <div class="mb-2 relative z-10">
        <div class="flex items-center">
          <div class="news-icon">
            <i class="{{ product.icon | default: 'fas fa-star' }} text-{{ product.color | default: 'yellow-400' }}"></i>
          </div>
          <h2 class="news-title">{{ entry.title | upcase }}</h2>
        </div>
      </div>
      <p class="news-summary relative z-10">{{ body }}</p>
      <div class="mt-3 news-summary relative z-10">
        <a href="{{ product.url | default: '/' }}" class="text-{{ product.color | default: 'yellow-400' }} text-sm uppercase tracking-wide font-bold">
          {{ product.name | default: 'Star Wars Guide' }}
        </a>
        <span class="opacity-60 text-sm ml-3">{{ parts[0] | date: "%b %-d, %Y" }}</span>
        {% if read_url %}
          <a href="{{ read_url }}" class="text-yellow-400 text-sm uppercase tracking-wide font-bold ml-3">
            <i class="fas fa-arrow-right mr-1"></i>{{ read_label }}
          </a>
        {% endif %}
      </div>
    </article>
  {% endfor %}
</div>

<script>
  (function () {
    var buttons = document.querySelectorAll('.news-filter');
    var entries = document.querySelectorAll('.news-entry');

    function apply(product) {
      entries.forEach(function (entry) {
        entry.style.display = (product === 'all' || entry.dataset.product === product) ? '' : 'none';
      });
      buttons.forEach(function (button) {
        button.classList.toggle('is-active', button.dataset.product === product);
      });
      var url = product === 'all' ? window.location.pathname : window.location.pathname + '?product=' + product;
      history.replaceState(null, '', url);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () { apply(button.dataset.product); });
    });

    var requested = new URLSearchParams(window.location.search).get('product');
    if (requested) { apply(requested); }
  })();
</script>
