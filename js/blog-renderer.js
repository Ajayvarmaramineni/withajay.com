/* blog-renderer.js — Markdown to HTML renderer for blog posts */
(function () {

  var MAX_RETRIES = 2;
  var RETRY_DELAY_MS = 800; // base delay; doubles on each subsequent retry
  var GITHUB_RAW_BASE_URL = 'https://raw.githubusercontent.com/Ajayvarmaramineni/withajay.com/main/';

  /**
   * Parse YAML-ish frontmatter (--- delimited)
   * Returns { meta: {}, body: '' }
   */
  function parseFrontmatter(raw) {
    var meta = {};
    var body = raw;
    var match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (match) {
      match[1].split('\n').forEach(function (line) {
        var keyValuePair = line.match(/^(.+?):\s*(.+)$/);
        if (keyValuePair) meta[keyValuePair[1].trim()] = keyValuePair[2].trim();
      });
      body = match[2];
    }
    return { meta: meta, body: body };
  }

  /**
   * Minimal Markdown → HTML parser
   * Supports: headings, paragraphs, bold, italic, inline code,
   *           blockquotes, unordered lists, links, horizontal rules
   */
  function parseMarkdown(md) {
    var lines = md.split('\n');
    var html = '';
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];

      // Heading
      var hMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (hMatch) {
        var level = hMatch[1].length;
        html += '<h' + level + '>' + inlineMarkdown(hMatch[2]) + '</h' + level + '><br>';
        i++;
        continue;
      }

      // Horizontal rule
      if (/^[-*_]{3,}\s*$/.test(line)) {
        html += '<hr><br>';
        i++;
        continue;
      }

      // Blockquote
      if (/^>\s/.test(line)) {
        var bqContent = '';
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          bqContent += lines[i].replace(/^>\s?/, '') + ' ';
          i++;
        }
        html += '<blockquote>' + inlineMarkdown(bqContent.trim()) + '</blockquote><br>';
        continue;
      }

      // Unordered list
      if (/^[-*+]\s/.test(line)) {
        html += '<ul>' + '\n';
        while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
          html += '<li>' + inlineMarkdown(lines[i].replace(/^[-*+]\s/, '')) + '</li>' + '\n';
          i++;
        }
        html += '</ul>' + '\n';
        continue;
      }

      // Empty line
      if (line.trim() === '') {
        i++;
        continue;
      }

      // Paragraph — collect consecutive non-empty, non-special lines
      var pContent = '';
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        !/^#{1,6}\s/.test(lines[i]) &&
        !/^>\s/.test(lines[i]) &&
        !/^[-*+]\s/.test(lines[i]) &&
        !/^[-*_]{3,}\s*$/.test(lines[i])
      ) {
        pContent += (pContent ? ' ' : '') + lines[i];
        i++;
      }
      if (pContent) {
        html += '<p>' + inlineMarkdown(pContent) + '</p>' + '\n';
      }
    }

    return html;
  }

  /** Inline markdown: bold, italic, inline code, links */
  function inlineMarkdown(text) {
    // Escape HTML first
    text = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Links: [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    // Inline code: `code`
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bold: **text**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic: *text* or _text_
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

    return text;
  }

  /** Calculate rough reading time */
  function readingTime(text) {
    var wordCount = text.trim().split(/\s+/).length;
    var minutes = Math.ceil(wordCount / 200);
    return minutes + ' min read';
  }

  /** Show a shimmer skeleton while the post is being fetched */
  function renderLoading() {
    var bodyEl = document.getElementById('post-body');
    if (!bodyEl) return;
    bodyEl.innerHTML =
      '<div class="post-loading" aria-live="polite" aria-label="Loading post">' +
        '<div class="post-loading-line" style="width:60%"></div>' +
        '<div class="post-loading-line" style="width:90%"></div>' +
        '<div class="post-loading-line" style="width:75%"></div>' +
        '<div class="post-loading-line" style="width:85%"></div>' +
        '<div class="post-loading-line" style="width:50%"></div>' +
        '<div class="post-loading-line" style="width:80%"></div>' +
        '<div class="post-loading-line" style="width:65%"></div>' +
      '</div>';
  }

  /**
   * Fetch a URL with automatic retries.
   * 404s are never retried (the file simply does not exist).
   * Network failures and 5xx responses are retried up to MAX_RETRIES times
   * with exponential back-off.
   *
   * Returns a Promise that resolves with the Response, or rejects with an
   * Error whose .code is 'NOT_FOUND' or 'NETWORK_ERROR'.
   */
  function fetchWithRetry(url, attempt) {
    attempt = attempt || 0;
    return fetch(url).then(function (res) {
      if (res.ok) return res;
      // 404 → do not retry, surface a clear NOT_FOUND error
      if (res.status === 404) {
        var err = new Error('The post could not be found (404).');
        err.code = 'NOT_FOUND';
        throw err;
      }
      // Other HTTP errors (5xx, etc.) → retry if attempts remain
      if (attempt < MAX_RETRIES) {
        return delay(RETRY_DELAY_MS * Math.pow(2, attempt)).then(function () {
          return fetchWithRetry(url, attempt + 1);
        });
      }
      var err2 = new Error('Server error (' + res.status + ').');
      err2.code = 'NETWORK_ERROR';
      throw err2;
    }, function (networkErr) {
      // Genuine network failure (offline, DNS, etc.) → retry if attempts remain
      if (attempt < MAX_RETRIES) {
        return delay(RETRY_DELAY_MS * Math.pow(2, attempt)).then(function () {
          return fetchWithRetry(url, attempt + 1);
        });
      }
      var err = new Error('Unable to reach the server. Check your connection and try again.');
      err.code = 'NETWORK_ERROR';
      throw err;
    });
  }

  /** Small helper: resolve after `ms` milliseconds */
  function delay(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  /** Set a meta/link tag attribute if the element exists */
  function setMeta(selector, attr, value) {
    var el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  }

  /** Main: load post from URL ?post=path/to/file.md */
  function loadPost() {
    var params = new URLSearchParams(window.location.search);
    var postPath = params.get('post');

    if (!postPath) {
      renderError('no_post', null);
      return;
    }

    renderLoading();

    // GitHub Pages does not serve raw .md files — rewrite relative paths
    // to fetch from raw.githubusercontent.com instead.
    var fetchUrl = postPath;
    if (!postPath.startsWith('http://') && !postPath.startsWith('https://')) {
      fetchUrl = GITHUB_RAW_BASE_URL + postPath;
    }

    fetchWithRetry(fetchUrl)
      .then(function (res) { return res.text(); })
      .then(function (raw) {
        var parsed = parseFrontmatter(raw);
        var meta = parsed.meta;
        var bodyHTML = parseMarkdown(parsed.body);
        var time = meta.readTime || readingTime(parsed.body);
        renderPost(meta, bodyHTML, time);
      })
      .catch(function (err) {
        renderError(err.code || 'UNKNOWN', postPath);
      });
  }

  function renderPost(meta, bodyHTML, time) {
    var titleEl  = document.getElementById('post-title');
    var dateEl   = document.getElementById('post-date');
    var timeEl   = document.getElementById('post-read-time');
    var bodyEl   = document.getElementById('post-body');
    var pageTitle = document.getElementById('page-title');

    if (titleEl)  titleEl.textContent  = meta.title || 'Untitled';
    if (dateEl)   dateEl.textContent   = meta.date  || ''; 
    if (timeEl)   timeEl.textContent   = time;
    if (bodyEl)   bodyEl.innerHTML     = bodyHTML;
    if (pageTitle) pageTitle.textContent = (meta.title || 'Post') + ' | With Love AJ';

    // Update meta description and Open Graph tags dynamically
    var postTitle = (meta.title || 'Post') + ' | With Love AJ';
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = bodyHTML;
    var plainText = (tempDiv.textContent || tempDiv.innerText || '').trim();
    var postDesc = meta.description ||
      (plainText.split(/\s+/).slice(0, 30).join(' ') + '…');
    var postUrl = window.location.href;

    // Update meta, Open Graph, canonical, and Twitter card tags
    setMeta('meta[name="description"]',          'content', postDesc);
    setMeta('meta[property="og:title"]',         'content', postTitle);
    setMeta('meta[property="og:description"]',   'content', postDesc);
    setMeta('meta[property="og:url"]',           'content', postUrl);
    setMeta('link[rel="canonical"]',             'href',    postUrl);
    setMeta('meta[name="twitter:title"]',        'content', postTitle);
    setMeta('meta[name="twitter:description"]',  'content', postDesc);

    if (meta.image) {
      setMeta('meta[property="og:image"]',       'content', meta.image);
      setMeta('meta[name="twitter:image"]',      'content', meta.image);

      var heroImg = document.getElementById('post-hero-img');
      if (heroImg) {
        heroImg.src = meta.image;
        heroImg.alt = meta.title || '';
        heroImg.style.display = 'block';
      }
    }
  }

  /**
   * Render a friendly, on-brand error state inside #post-body.
   *
   * @param {string} code      - 'no_post' | 'NOT_FOUND' | 'NETWORK_ERROR' | 'UNKNOWN'
   * @param {string|null} path - the post path that failed (for the retry button)
   */
  function renderError(code, path) {
    var bodyEl = document.getElementById('post-body');
    if (!bodyEl) return;

    var icon, heading, detail, showRetry;

    switch (code) {
      case 'no_post':
        icon      = '∅';
        heading   = 'No post specified';
        detail    = 'It looks like no post was linked here. Head back to the blog and pick a story.';
        showRetry = false;
        break;
      case 'NOT_FOUND':
        icon      = '404';
        heading   = 'Post not found';
        detail    = 'This post may have moved or been removed. Try browsing the archive for something else.';
        showRetry = false;
        break;
      case 'NETWORK_ERROR':
        icon      = '⟳';
        heading   = 'Connection lost';
        detail    = 'Could not load the post — please check your internet connection and try again.';
        showRetry = true;
        break;
      default:
        icon      = '!';
        heading   = 'Something went wrong';
        detail    = 'An unexpected error occurred while loading this post. You can try again or return to the blog.';
        showRetry = true;
    }

    var retryBtn = showRetry
      ? '<button class="error-retry-btn" id="errorRetryBtn">Try again</button>'
      : '';

    bodyEl.innerHTML =
      '<div class="post-error" role="alert">' +
        '<span class="post-error-icon" aria-hidden="true">' + icon + '</span>' +
        '<h2 class="post-error-heading">' + heading + '</h2>' +
        '<p class="post-error-detail">' + detail + '</p>' +
        '<div class="post-error-actions">' +
          retryBtn +
          '<a class="error-back-btn" href="blog.html">← Back to Blog</a>' +
        '</div>' +
      '</div>';

    // Wire up the retry button without a full page reload
    if (showRetry && path) {
      var btn = document.getElementById('errorRetryBtn');
      if (btn) {
        btn.addEventListener('click', function () {
          loadPost();
        });
      }
    }
  }

  document.addEventListener('DOMContentLoaded', loadPost);

})();