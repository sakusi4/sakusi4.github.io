---
layout: page
title: "Personal"
permalink: /personal/
---

<!-- <h2>Personal posts</h2> -->
<ul>
  {% assign posts = site.categories.personal | sort: "date" | reverse %}
  {% for post in posts %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <small>— {{ post.date | date: "%Y-%m-%d" }}</small>
    </li>
  {% endfor %}
</ul>