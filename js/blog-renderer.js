/* blog-renderer.js — Fetch and render markdown blog posts */
(function () {
  'use strict';

  /* ── helpers ──────────────────────────────────────────────── */

  function parseFrontmatter(raw) {
    var meta = {};
    var body = raw;
    var m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (m) {
      m[1].split('\n').forEach(function (line) {
        var kv = line.match(/^([^:]+):\s*(.+)$/);
        if (kv) meta[kv[1].trim()] = kv[2].trim();
      });
      body = m[2];
    }
    return { meta: meta, body: body };
  }

  function mdToHtml(md) {
    var lines = md.split('\n');
    var html = '';
    var inUl = false;

    function closeUl() {
      if (inUl) { html += '</ul>\n'; inUl = false; }
    }

    function inlineFormat(text) {
      // Bold must be processed before italic to avoid ** being misread as * + *
      // Bold **text** or __text__
      text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
      // Italic *text* or _text_ (use [^*] to avoid greedily matching bold remnants)
      text = text.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
      text = text.replace(/_([^_\n]+?)_/g, '<em>$1</em>');
      // Inline code
      text = text.replace(/`([^`]+?)`/g, '<code>$1</code>');
      // Links [text](url)
      text = text.replace(/\[([^\]]+?)\]\(([^)]+?)\)/g, '<a href="$2">$1</a>');
      return text;
    }

    var i = 0;
    while (i < lines.length) {
      var line = lines[i];

      // Horizontal rule
      if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
        closeUl();
        html += '<hr>\n';
        i++; continue;
      }

      // Headings
      var hm = line.match(/^(#{1,6})\s+(.*)/);
      if (hm) {
        closeUl();
        var level = hm[1].length;
        html += '<h' + level + '>' + inlineFormat(hm[2]) + '</h' + level + '>\n';
        i++; continue;
      }

      // Blockquote
      if (line.match(/^>\s/)) {
        closeUl();
        var bqLines = [];
        while (i < lines.length && lines[i].match(/^>\s?/)) {
          bqLines.push(lines[i].replace(/^>\s?/, ''));
          i++;
        }
        html += '<blockquote><p>' + inlineFormat(bqLines.join(' ')) + '</p></blockquote>\n';
        continue;
      }

      // Ordered list
      if (/^\d+\.\s/.test(line)) {
        html += '<ol>\n';
        while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
          html += '<li>' + inlineMarkdown(lines[i].replace(/^\d+\.\s/, '')) + '</li>\n';
          i++;
        }
        html += '</ol>\n';
        continue;
      }

      // Unordered list
      if (line.match(/^[-*]\s+/)) {
        if (!inUl) { html += '<ul>\n'; inUl = true; }
        html += '<li>' + inlineFormat(line.replace(/^[-*]\s+/, '')) + '</li>\n';
        i++; continue;
      }

      // Empty line
      if (line.trim() === '') {
        closeUl();
        i++; continue;
      }

      // Paragraph
      closeUl();
      var paraLines = [];
      while (i < lines.length && lines[i].trim() !== '' && !lines[i].match(/^[#>\-*]/)) {
        paraLines.push(lines[i]);
        i++;
      }
      if (paraLines.length) {
        html += '<p>' + inlineFormat(paraLines.join(' ')) + '</p>\n';
      }
    }
    closeUl();
    return html;
  }

  /* ── main ─────────────────────────────────────────────────── */

  var params = new URLSearchParams(window.location.search);
  var postPath = params.get('post');
  if (!postPath) return;

  var titleEl    = document.getElementById('post-title');
  var dateEl     = document.getElementById('post-date');
  var rtEl       = document.getElementById('post-read-time');
  var bodyEl     = document.getElementById('post-body');
  var heroImg    = document.getElementById('post-hero-img');
  var pageTitle  = document.getElementById('page-title');

  if (!bodyEl) return;

  fetch(postPath)
    .then(function (r) {
      if (!r.ok) throw new Error('Not found');
      return r.text();
    })
    .then(function (raw) {
      var parsed = parseFrontmatter(raw);
      var meta   = parsed.meta;
      var body   = parsed.body;

      if (meta.title) {
        if (titleEl) titleEl.textContent = meta.title;
        if (pageTitle) pageTitle.textContent = meta.title + ' | With Love AJ';
      }
      if (meta.date  && dateEl) dateEl.textContent = meta.date;
      if (meta.readTime && rtEl) rtEl.textContent = meta.readTime;

      if (meta.image && heroImg) {
        heroImg.src = meta.image;
        heroImg.style.display = 'block';
      }

      bodyEl.innerHTML = mdToHtml(body);
    })
    .catch(function () {
      if (bodyEl) bodyEl.innerHTML = '<p>Post could not be loaded.</p>';
    });
})();
