(function() {
  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  renderIcons();
  window.addEventListener('load', renderIcons);

  // Light / Dark Theme Toggle (shared with main portfolio via localStorage)
  var root = document.documentElement;
  var themeToggle = document.getElementById('theme-toggle');
  var themeLabel = document.getElementById('theme-label');

  function syncThemeUI(theme) {
    if (themeLabel) {
      themeLabel.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }
    if (themeToggle) {
      themeToggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }
    var iconEl = document.getElementById('theme-icon');
    if (iconEl) {
      iconEl.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
      renderIcons();
    }
  }

  syncThemeUI(root.getAttribute('data-theme') || 'dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem('portfolio-theme', next);
      } catch (e) {}
      syncThemeUI(next);
    });
  }

  // Lightbox Modal for Course Snaps
  var snapCards = Array.prototype.slice.call(document.querySelectorAll('.snap-card'));
  var lightbox = document.getElementById('lightbox');
  if (!snapCards.length || !lightbox) return;

  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxMeta = document.getElementById('lightbox-meta');
  var lightboxTitle = document.getElementById('lightbox-title');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxCount = document.getElementById('lightbox-count');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');
  var activeSnapIndex = 0;
  var lastFocusedEl = null;

  function renderLightboxAt(index) {
    activeSnapIndex = (index + snapCards.length) % snapCards.length;
    var card = snapCards[activeSnapIndex];
    var img = card.querySelector('img');
    var meta = card.querySelector('.snap-meta');
    var title = card.querySelector('.snap-title');
    var caption = card.querySelector('.snap-caption');

    if (img && lightboxImg) {
      lightboxImg.src = img.getAttribute('src') || '';
      lightboxImg.alt = img.getAttribute('alt') || '';
    }
    if (lightboxMeta) lightboxMeta.textContent = meta ? meta.textContent : '';
    if (lightboxTitle) lightboxTitle.textContent = title ? title.textContent : '';
    if (lightboxCaption) lightboxCaption.textContent = caption ? caption.textContent : '';
    if (lightboxCount) lightboxCount.textContent = (activeSnapIndex + 1) + ' / ' + snapCards.length;
  }

  function openLightboxForCard(card) {
    var idx = snapCards.indexOf(card);
    lastFocusedEl = document.activeElement;
    renderLightboxAt(idx < 0 ? 0 : idx);
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    renderIcons();
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (lightbox.hasAttribute('hidden')) return;
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (lightboxImg) lightboxImg.removeAttribute('src');
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  snapCards.forEach(function(card) {
    var thumbBtn = card.querySelector('.snap-thumb');
    if (thumbBtn) {
      thumbBtn.addEventListener('click', function() {
        openLightboxForCard(card);
      });
    }
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', function() {
      renderLightboxAt(activeSnapIndex - 1);
    });
  }
  if (lightboxNext) {
    lightboxNext.addEventListener('click', function() {
      renderLightboxAt(activeSnapIndex + 1);
    });
  }
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function(e) {
    if (lightbox.hasAttribute('hidden')) return;
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      renderLightboxAt(activeSnapIndex - 1);
    } else if (e.key === 'ArrowRight') {
      renderLightboxAt(activeSnapIndex + 1);
    }
  });
})();
