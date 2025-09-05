---
layout: page
title: "Tech"
permalink: /tech/
---

<!-- <h2>Tech posts</h2> -->
<ul>
  {% assign posts = site.categories.tech | sort: "date" | reverse %}
  {% for post in posts %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <small>— {{ post.date | date: "%Y-%m-%d" }}</small>
    </li>
  {% endfor %}
</ul>