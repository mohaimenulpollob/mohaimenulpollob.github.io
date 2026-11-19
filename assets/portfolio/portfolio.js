(function() {
  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  renderIcons();
  window.addEventListener('load', renderIcons);

  // 1. Light / Dark Theme Toggle & Persistence
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

  function toggleTheme() {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('portfolio-theme', next);
    } catch (e) {}
    syncThemeUI(next);
  }

  syncThemeUI(root.getAttribute('data-theme') || 'dark');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // 2. Scroll Progress & Active Section Spy
  var progressBar = document.getElementById('scroll-progress');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var trackedSections = navLinks
    .map(function(link) {
      return document.querySelector(link.getAttribute('href'));
    })
    .filter(Boolean);

  function onScroll() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) {
      var pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      progressBar.style.width = pct.toFixed(1) + '%';
    }

    var currentId = '';
    var offset = scrollTop + 140;
    for (var i = 0; i < trackedSections.length; i++) {
      if (trackedSections[i].offsetTop <= offset) {
        currentId = trackedSections[i].id;
      }
    }
    navLinks.forEach(function(link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 3. Mobile Menu Drawer
  var menuBtn = document.getElementById('mobile-menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');

  function setMenuOpen(open) {
    if (!menuBtn || !mobileMenu) return;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      mobileMenu.removeAttribute('hidden');
    } else {
      mobileMenu.setAttribute('hidden', '');
    }
    var iconEl = document.getElementById('mobile-menu-icon');
    if (iconEl) {
      iconEl.setAttribute('data-lucide', open ? 'x' : 'menu');
      renderIcons();
    }
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function() {
      var isHidden = mobileMenu.hasAttribute('hidden');
      setMenuOpen(isHidden);
    });
    mobileMenu.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        setMenuOpen(false);
      });
    });
    window.addEventListener('resize', function() {
      if (window.innerWidth > 1040 && !mobileMenu.hasAttribute('hidden')) {
        setMenuOpen(false);
      }
    });
  }

  // 4. Interactive HTML5 Canvas FEM Mesh Hero
  var canvas = document.getElementById('fem-canvas');
  var meshMode = 'stress';
  var meshPaused = false;
  var heroSection = document.getElementById('home');

  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var nodes = [];
    var edges = [];
    var pointer = { x: -9999, y: -9999, active: false };
    var cols = 0;
    var rows = 0;

    function buildMesh() {
      var rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = Math.max(320, Math.floor(rect.width));
      canvas.height = Math.max(420, Math.floor(rect.height));
      var spacing = canvas.width < 700 ? 78 : 88;
      cols = Math.ceil(canvas.width / spacing) + 1;
      rows = Math.ceil(canvas.height / spacing) + 1;
      nodes = [];
      edges = [];

      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var jx = (r % 2 === 1 ? spacing * 0.45 : 0) + (Math.sin(r * 3.1 + c * 1.7) * 8);
          var jy = Math.cos(r * 2.3 + c * 2.9) * 8;
          var bx = c * spacing + jx;
          var by = r * spacing + jy;
          nodes.push({
            bx: bx,
            by: by,
            x: bx,
            y: by,
            phase: (r * 0.6) + (c * 0.45),
            stress: 0
          });
        }
      }

      for (var r2 = 0; r2 < rows; r2++) {
        for (var c2 = 0; c2 < cols; c2++) {
          var idx = r2 * cols + c2;
          if (c2 + 1 < cols) edges.push([idx, idx + 1]);
          if (r2 + 1 < rows) edges.push([idx, idx + cols]);
          if (r2 + 1 < rows && c2 + 1 < cols && r2 % 2 === 0) {
            edges.push([idx, idx + cols + 1]);
          } else if (r2 + 1 < rows && c2 - 1 >= 0 && r2 % 2 === 1) {
            edges.push([idx, idx + cols - 1]);
          }
        }
      }
    }

    buildMesh();
    window.addEventListener('resize', buildMesh);

    if (heroSection) {
      heroSection.addEventListener('mousemove', function(e) {
        var rect = canvas.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
        pointer.active = true;
      });
      heroSection.addEventListener('mouseleave', function() {
        pointer.active = false;
      });
    }

    var t = 0;
    function animateMesh() {
      requestAnimationFrame(animateMesh);
      if (meshPaused) return;
      if (window.scrollY > canvas.height + 120) return;

      t += 0.018;
      var isLight = root.getAttribute('data-theme') === 'light';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var influenceRadius = 185;
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var waveX = Math.sin(t + n.phase) * 3.2;
        var waveY = Math.cos(t * 0.85 + n.phase) * 3.2;
        var tx = n.bx + waveX;
        var ty = n.by + waveY;
        var stress = 0;

        if (pointer.active) {
          var dx = tx - pointer.x;
          var dy = ty - pointer.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < influenceRadius && dist > 1) {
            var factor = (1 - dist / influenceRadius);
            var push = factor * factor * 24;
            tx += (dx / dist) * push;
            ty += (dy / dist) * push;
            stress = factor;
          }
        }

        n.x += (tx - n.x) * 0.16;
        n.y += (ty - n.y) * 0.16;
        n.stress = stress;
      }

      for (var eIdx = 0; eIdx < edges.length; eIdx++) {
        var pair = edges[eIdx];
        var a = nodes[pair[0]];
        var b = nodes[pair[1]];
        var s = Math.max(a.stress || 0, b.stress || 0);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        if (s > 0.08 && meshMode === 'stress') {
          ctx.strokeStyle = isLight
            ? 'rgba(192, 86, 33, ' + (0.14 + s * 0.55).toFixed(2) + ')'
            : 'rgba(224, 123, 71, ' + (0.16 + s * 0.62).toFixed(2) + ')';
          ctx.lineWidth = 1 + s * 1.4;
        } else {
          ctx.strokeStyle = isLight
            ? 'rgba(31, 111, 139, 0.10)'
            : 'rgba(95, 180, 204, 0.11)';
          ctx.lineWidth = 1;
        }
        ctx.stroke();
      }

      for (var j = 0; j < nodes.length; j++) {
        var nd = nodes[j];
        var st = nd.stress || 0;
        if (meshMode === 'vectors' && st > 0.04) {
          ctx.beginPath();
          ctx.moveTo(nd.bx, nd.by);
          ctx.lineTo(nd.x, nd.y);
          ctx.strokeStyle = isLight ? 'rgba(192, 86, 33, 0.75)' : 'rgba(224, 123, 71, 0.85)';
          ctx.lineWidth = 1.6;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(nd.x, nd.y, st > 0.1 ? 2.8 : 1.7, 0, Math.PI * 2);
        ctx.fillStyle = st > 0.1
          ? (isLight ? 'rgba(192, 86, 33, 0.8)' : 'rgba(224, 123, 71, 0.85)')
          : (isLight ? 'rgba(31, 111, 139, 0.28)' : 'rgba(95, 180, 204, 0.30)');
        ctx.fill();
      }
    }

    animateMesh();

    document.querySelectorAll('.mesh-mode-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var mode = btn.getAttribute('data-mesh-mode');
        document.querySelectorAll('.mesh-mode-btn').forEach(function(b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        if (mode === 'pause') {
          meshPaused = true;
        } else {
          meshPaused = false;
          meshMode = mode || 'stress';
        }
      });
    });
  }

  // 5. Animated KPI Counters
  var kpiEls = document.querySelectorAll('.kpi-number[data-target]');
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-target') || '0');
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1100;
    var start = performance.now();

    function step(now) {
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.round(target * eased);
      el.textContent = prefix + val + suffix;
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var kpiObserver = new IntersectionObserver(function(entries, obs) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    kpiEls.forEach(function(el) {
      kpiObserver.observe(el);
    });
  }

  // 6. 3D Tilt & Radial Spotlight on .tilt-card
  document.querySelectorAll('.tilt-card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var rx = ((y / rect.height) - 0.5) * -5.5;
      var ry = ((x / rect.width) - 0.5) * 5.5;
      card.style.setProperty('--mouse-x', x.toFixed(0) + 'px');
      card.style.setProperty('--mouse-y', y.toFixed(0) + 'px');
      card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
      card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
    });
    card.addEventListener('mouseleave', function() {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  // 7. Dynamic Experience Explorer (Single Source of Truth from Existing Project DOM)
  var expSection = document.getElementById('experience');
  var timelineWrap = document.getElementById('exp-timeline-list');
  var spotlightWrap = document.getElementById('exp-spotlight');
  var spotlightRail = document.getElementById('spotlight-rail');
  var detailStage = document.getElementById('exp-detail-stage');
  var expSearch = document.getElementById('exp-search');
  var expStatus = document.getElementById('exp-filter-status');
  var expStatusText = document.getElementById('exp-status-text');
  var clearFilterBtn = document.getElementById('clear-exp-filter');
  var stageBtns = document.querySelectorAll('.stage-btn[data-stage]');
  var filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
  var regionBtns = document.querySelectorAll('.region-btn[data-region-filter]');
  var viewBtns = document.querySelectorAll('.view-btn[data-exp-view]');
  var timelineTools = document.getElementById('exp-timeline-tools');
  var expandAllBtn = document.getElementById('exp-expand-all');
  var collapseAllBtn = document.getElementById('exp-collapse-all');

  var knownTools = [
    'PLAXIS 2D', 'RS2', 'STAAD.Pro', 'Unwedge', 'DIPS',
    'GeoStudio SLOPE/W', 'Settle3D', 'QGIS',
    'EN 1992-1-2', 'EN 1997-2', 'EN 206-1', 'Eurocodes', 'Dubai Building Code',
    'BNBC 2020', 'ASTM', 'Hoek-Brown', 'Mohr-Coulomb',
    'SPT', 'CPT', 'SCPT', 'Lugeon', 'HRAT'
  ];

  var regionLabels = {
    uae: 'UAE',
    philippines: 'Philippines',
    bangladesh: 'Bangladesh'
  };

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightHtmlSafe(html, query) {
    if (!query) return html;
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    var regex = new RegExp('(' + escapeRegex(query) + ')', 'gi');

    function walk(node) {
      if (node.nodeType === 3) {
        var text = node.nodeValue;
        if (!text || !regex.test(text)) return;
        regex.lastIndex = 0;
        var frag = document.createDocumentFragment();
        var lastIdx = 0;
        var m;
        while ((m = regex.exec(text)) !== null) {
          if (m.index > lastIdx) {
            frag.appendChild(document.createTextNode(text.slice(lastIdx, m.index)));
          }
          var mark = document.createElement('mark');
          mark.className = 'exp-hl';
          mark.textContent = m[1];
          frag.appendChild(mark);
          lastIdx = regex.lastIndex;
        }
        if (lastIdx < text.length) {
          frag.appendChild(document.createTextNode(text.slice(lastIdx)));
        }
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1 && node.tagName !== 'MARK') {
        var children = Array.prototype.slice.call(node.childNodes);
        for (var i = 0; i < children.length; i++) {
          walk(children[i]);
        }
      }
    }

    walk(tmp);
    return tmp.innerHTML;
  }

  var projectsData = [];
  var activeStage = 'all';
  var activeCategory = 'all';
  var activeRegion = 'all';
  var activeView = 'spotlight';
  var selectedProjectIdx = 0;

  if (timelineWrap) {
    var expItemEls = Array.prototype.slice.call(timelineWrap.querySelectorAll('.exp-item'));
    var projectIdxCounter = 0;

    expItemEls.forEach(function(expEl) {
      var companyEl = expEl.querySelector('.exp-company');
      var companyName = companyEl ? companyEl.textContent.trim() : '';
      var roleDefaultEl = expEl.querySelector('.exp-role');
      var dateDefaultEl = expEl.querySelector('.exp-date');

      var blocks = Array.prototype.slice.call(expEl.querySelectorAll('.project-block'));
      blocks.forEach(function(block) {
        var roleGroup = block.getAttribute('data-role') || 'sde-role';
        var divEl = roleGroup ? expEl.querySelector('.role-divider[data-role-group="' + roleGroup + '"]') : null;
        var roleLabel = divEl
          ? divEl.textContent.replace(/^Role:\s*/i, '').trim()
          : (roleDefaultEl ? roleDefaultEl.textContent.trim() + ' (' + (dateDefaultEl ? dateDefaultEl.textContent.trim() : '') + ')' : '');

        var titleSpanEl = block.querySelector('.project-title-text');
        var iconEl = block.querySelector('.project-title i');
        var metaEl = block.querySelector('.project-meta');
        var ulEl = block.querySelector('ul');
        var liEls = ulEl ? Array.prototype.slice.call(ulEl.querySelectorAll('li')) : [];

        var origTitleHtml = titleSpanEl ? titleSpanEl.innerHTML : '';
        var origTitleText = titleSpanEl ? titleSpanEl.textContent.trim() : '';
        var origBulletsHtml = liEls.map(function(li) { return li.innerHTML; });
        var fullSearchText = (companyName + ' ' + roleLabel + ' ' + origTitleText + ' ' + (metaEl ? metaEl.textContent : '') + ' ' + block.textContent).toLowerCase();

        var toolsFound = knownTools.filter(function(tool) {
          return (block.textContent || '').toLowerCase().indexOf(tool.toLowerCase()) !== -1;
        });

        block.setAttribute('data-proj-idx', String(projectIdxCounter));

        // Wire accordion trigger inside Timeline card
        var accBtn = block.querySelector('.project-acc-trigger');
        if (accBtn) {
          accBtn.addEventListener('click', function() {
            var isCollapsed = block.classList.toggle('is-collapsed');
            accBtn.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
          });
        }

        projectsData.push({
          idx: projectIdxCounter,
          el: block,
          company: companyName,
          shortCompany: companyName.indexOf('ACE') !== -1 ? 'ACE Consultants' : 'SDE Ltd.',
          roleLabel: roleLabel,
          stage: roleGroup,
          category: block.getAttribute('data-category') || '',
          region: block.getAttribute('data-region') || 'bangladesh',
          iconName: iconEl ? iconEl.getAttribute('data-lucide') : 'briefcase',
          titleSpanEl: titleSpanEl,
          origTitleHtml: origTitleHtml,
          origTitleText: origTitleText,
          metaHtml: metaEl ? metaEl.innerHTML : '',
          liEls: liEls,
          origBulletsHtml: origBulletsHtml,
          searchText: fullSearchText,
          tools: toolsFound
        });

        projectIdxCounter++;
      });
    });
  }

  function getFilteredProjects() {
    var query = expSearch ? expSearch.value.trim().toLowerCase() : '';
    return projectsData.filter(function(p) {
      var stOk = activeStage === 'all' || p.stage === activeStage;
      var catOk = activeCategory === 'all' || p.category === activeCategory;
      var regOk = activeRegion === 'all' || p.region === activeRegion;
      var qOk = !query || p.searchText.indexOf(query) !== -1;
      return stOk && catOk && regOk && qOk;
    });
  }

  function renderSpotlightDetail(filtered, query) {
    if (!detailStage) return;
    if (!filtered.length) {
      detailStage.innerHTML =
        '<div style="padding:2rem 1rem;text-align:center;">' +
          '<h3 style="margin-bottom:0.5rem;">No Matching Projects Found</h3>' +
          '<p style="color:var(--muted);margin-bottom:1rem;">No deliverables match your current combination of career stage, discipline, region, or search query.</p>' +
          '<button type="button" id="empty-reset-btn" class="clear-filter-btn">Reset All Filters</button>' +
        '</div>';
      var emptyBtn = document.getElementById('empty-reset-btn');
      if (emptyBtn) emptyBtn.addEventListener('click', resetAllExpFilters);
      return;
    }

    var posInFiltered = -1;
    for (var i = 0; i < filtered.length; i++) {
      if (filtered[i].idx === selectedProjectIdx) {
        posInFiltered = i;
        break;
      }
    }
    if (posInFiltered === -1) {
      posInFiltered = 0;
      selectedProjectIdx = filtered[0].idx;
    }

    var proj = filtered[posInFiltered];
    var highlightedTitle = highlightHtmlSafe(proj.origTitleHtml, query);
    var toolsHtml = proj.tools.length
      ? '<div class="detail-tools">' + proj.tools.map(function(t) {
          return '<button type="button" class="detail-tool-chip" data-tool-chip="' + t + '" title="Filter projects using ' + t + '">' + t + '</button>';
        }).join('') + '</div>'
      : '';

    var bulletsHtml = proj.origBulletsHtml.map(function(bHtml, bIdx) {
      var num = (bIdx + 1 < 10 ? '0' : '') + (bIdx + 1);
      return '<li><span class="bullet-idx">' + num + '</span><span>' + highlightHtmlSafe(bHtml, query) + '</span></li>';
    }).join('');

    detailStage.innerHTML =
      '<div class="detail-topbar">' +
        '<span class="detail-employer-pill">' + proj.company + ' &middot; ' + proj.roleLabel + '</span>' +
        '<div class="detail-pager">' +
          '<button type="button" id="detail-prev-btn" class="detail-pager-btn" aria-label="Previous project"' + (filtered.length <= 1 ? ' disabled' : '') + '>' +
            '<i data-lucide="chevron-left" style="width:14px;height:14px;"></i> Prev' +
          '</button>' +
          '<span class="detail-count">' + (posInFiltered + 1) + ' / ' + filtered.length + '</span>' +
          '<button type="button" id="detail-next-btn" class="detail-pager-btn" aria-label="Next project"' + (filtered.length <= 1 ? ' disabled' : '') + '>' +
            'Next <i data-lucide="chevron-right" style="width:14px;height:14px;"></i>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<h3 class="detail-title"><i data-lucide="' + proj.iconName + '"></i><span>' + highlightedTitle + '</span></h3>' +
      '<div class="project-meta">' + proj.metaHtml + '</div>' +
      toolsHtml +
      '<ul class="detail-bullets">' + bulletsHtml + '</ul>';

    var prevBtn = document.getElementById('detail-prev-btn');
    var nextBtn = document.getElementById('detail-next-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        var nextPos = (posInFiltered - 1 + filtered.length) % filtered.length;
        selectedProjectIdx = filtered[nextPos].idx;
        renderSpotlight(filtered, query);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        var nextPos = (posInFiltered + 1) % filtered.length;
        selectedProjectIdx = filtered[nextPos].idx;
        renderSpotlight(filtered, query);
      });
    }

    detailStage.querySelectorAll('[data-tool-chip]').forEach(function(chip) {
      chip.addEventListener('click', function() {
        if (expSearch) {
          expSearch.value = chip.getAttribute('data-tool-chip') || '';
          refreshExperienceExplorer();
        }
      });
    });

    renderIcons();
  }

  function renderSpotlight(filtered, query) {
    if (!spotlightRail) return;
    if (!filtered.length) {
      spotlightRail.innerHTML = '';
      renderSpotlightDetail(filtered, query);
      return;
    }

    var foundCurrent = filtered.some(function(p) { return p.idx === selectedProjectIdx; });
    if (!foundCurrent) {
      selectedProjectIdx = filtered[0].idx;
    }

    spotlightRail.innerHTML = filtered.map(function(p) {
      var isActive = p.idx === selectedProjectIdx;
      var regionLabel = regionLabels[p.region] || 'Bangladesh';
      return '<button type="button" class="spotlight-nav-card' + (isActive ? ' active' : '') + '" data-select-proj="' + p.idx + '">' +
        '<div class="spotlight-nav-top">' +
          '<span>' + p.shortCompany + ' &middot; ' + regionLabel + '</span>' +
          '<span>' + p.origBulletsHtml.length + ' items</span>' +
        '</div>' +
        '<div class="spotlight-nav-title">' + highlightHtmlSafe(p.origTitleHtml, query) + '</div>' +
      '</button>';
    }).join('');

    spotlightRail.querySelectorAll('[data-select-proj]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        selectedProjectIdx = parseInt(btn.getAttribute('data-select-proj') || '0', 10);
        renderSpotlight(filtered, query);
      });
    });

    renderSpotlightDetail(filtered, query);
  }

  function updateTimelineDOM(filtered, query) {
    if (!timelineWrap) return;
    var visibleSet = {};
    filtered.forEach(function(p) { visibleSet[p.idx] = true; });

    projectsData.forEach(function(p) {
      var visible = !!visibleSet[p.idx];
      p.el.classList.toggle('is-hidden', !visible);

      if (p.titleSpanEl) {
        p.titleSpanEl.innerHTML = query ? highlightHtmlSafe(p.origTitleHtml, query) : p.origTitleHtml;
      }
      for (var i = 0; i < p.liEls.length; i++) {
        p.liEls[i].innerHTML = query ? highlightHtmlSafe(p.origBulletsHtml[i], query) : p.origBulletsHtml[i];
      }

      if (visible && query) {
        p.el.classList.remove('is-collapsed');
        var btn = p.el.querySelector('.project-acc-trigger');
        if (btn) btn.setAttribute('aria-expanded', 'true');
      }
    });

    timelineWrap.querySelectorAll('.exp-item').forEach(function(exp) {
      exp.querySelectorAll('.role-divider').forEach(function(div) {
        var grp = div.getAttribute('data-role-group');
        var anyInGrp = exp.querySelectorAll('.project-block[data-role="' + grp + '"]:not(.is-hidden)').length > 0;
        div.classList.toggle('is-hidden', !anyInGrp);
      });
      var hasVisible = exp.querySelectorAll('.project-block:not(.is-hidden)').length > 0;
      exp.classList.toggle('is-hidden', !hasVisible);
    });
  }

  function refreshExperienceExplorer() {
    var query = expSearch ? expSearch.value.trim() : '';
    var filtered = getFilteredProjects();

    renderSpotlight(filtered, query);
    updateTimelineDOM(filtered, query);

    if (expStatus && expStatusText) {
      var isFiltered = activeStage !== 'all' || activeCategory !== 'all' || activeRegion !== 'all' || query.length > 0;
      expStatus.style.display = isFiltered ? 'flex' : 'none';
      expStatusText.textContent = 'Showing ' + filtered.length + ' of ' + projectsData.length + ' projects' +
        (query ? ' matching "' + query + '"' : '');
    }
  }

  function resetAllExpFilters() {
    activeStage = 'all';
    activeCategory = 'all';
    activeRegion = 'all';
    if (expSearch) expSearch.value = '';
    stageBtns.forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-stage') === 'all'); });
    filterBtns.forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-filter') === 'all'); });
    regionBtns.forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-region-filter') === 'all'); });
    refreshExperienceExplorer();
  }

  function setExperienceView(view) {
    activeView = view;
    viewBtns.forEach(function(b) {
      b.classList.toggle('active', b.getAttribute('data-exp-view') === view);
    });
    if (spotlightWrap) {
      if (view === 'spotlight') spotlightWrap.removeAttribute('hidden');
      else spotlightWrap.setAttribute('hidden', '');
    }
    if (timelineWrap) {
      if (view === 'timeline') timelineWrap.removeAttribute('hidden');
      else timelineWrap.setAttribute('hidden', '');
    }
    if (timelineTools) {
      timelineTools.style.display = view === 'timeline' ? 'flex' : 'none';
    }
    renderIcons();
  }

  stageBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      stageBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeStage = btn.getAttribute('data-stage') || 'all';
      refreshExperienceExplorer();
    });
  });

  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-filter') || 'all';
      refreshExperienceExplorer();
    });
  });

  regionBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      regionBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeRegion = btn.getAttribute('data-region-filter') || 'all';
      refreshExperienceExplorer();
    });
  });

  viewBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      setExperienceView(btn.getAttribute('data-exp-view') || 'spotlight');
    });
  });

  if (expSearch) {
    expSearch.addEventListener('input', refreshExperienceExplorer);
  }

  if (clearFilterBtn) {
    clearFilterBtn.addEventListener('click', resetAllExpFilters);
  }

  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', function() {
      projectsData.forEach(function(p) {
        p.el.classList.remove('is-collapsed');
        var btn = p.el.querySelector('.project-acc-trigger');
        if (btn) btn.setAttribute('aria-expanded', 'true');
      });
    });
  }

  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', function() {
      projectsData.forEach(function(p) {
        p.el.classList.add('is-collapsed');
        var btn = p.el.querySelector('.project-acc-trigger');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Click any software pill in #skills to jump to #experience and filter matching projects
  document.querySelectorAll('.skill-tag[data-skill-query]').forEach(function(tag) {
    tag.addEventListener('click', function() {
      var q = tag.getAttribute('data-skill-query') || '';
      if (!expSection) return;
      activeStage = 'all';
      activeCategory = 'all';
      activeRegion = 'all';
      stageBtns.forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-stage') === 'all'); });
      filterBtns.forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-filter') === 'all'); });
      regionBtns.forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-region-filter') === 'all'); });
      if (expSearch) expSearch.value = q;
      refreshExperienceExplorer();
      expSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  setExperienceView('spotlight');
  refreshExperienceExplorer();

  // 8. Command Palette (Ctrl+K / Cmd+K)
  var cmdOverlay = document.getElementById('cmd-overlay');
  var cmdInput = document.getElementById('cmd-input');
  var cmdList = document.getElementById('cmd-list');
  var cmdBtn = document.getElementById('cmd-btn');

  var commands = [
    { label: 'About & Career Objective', type: 'Section', action: function() { location.hash = '#about'; } },
    { label: 'Core Competencies (8 Areas)', type: 'Section', action: function() { location.hash = '#competencies'; } },
    { label: 'Academic Qualification (BUET M.Sc. & IUT B.Sc.)', type: 'Section', action: function() { location.hash = '#education'; } },
    { label: 'BUET M.Sc. Coursework (6 Courses)', type: 'Section', action: function() { location.hash = '#coursework'; } },
    { label: 'Experience Explorer (11 Projects)', type: 'Section', action: function() { location.hash = '#experience'; } },
    { label: 'Software Expertise & IEB Membership', type: 'Section', action: function() { location.hash = '#skills'; } },
    { label: 'References & Contact', type: 'Section', action: function() { location.hash = '#contact'; } },
    { label: 'Open CE 6401 — Soil Mechanics I', type: 'Course Page', action: function() { location.href = 'courses/ce6401.html'; } },
    { label: 'Open CE 6403 — Foundation Analysis Methods', type: 'Course Page', action: function() { location.href = 'courses/ce6403.html'; } },
    { label: 'Open CE 6405 — Earth Dams & Stability of Slopes', type: 'Course Page', action: function() { location.href = 'courses/ce6405.html'; } },
    { label: 'Open CE 6409 — Reinforced Earth', type: 'Course Page', action: function() { location.href = 'courses/ce6409.html'; } },
    { label: 'Open CE 6410 — Constitutive Modeling of Soil Mechanics', type: 'Course Page', action: function() { location.href = 'courses/ce6410.html'; } },
    { label: 'Open CE 6411 — Earthquake Engineering', type: 'Course Page', action: function() { location.href = 'courses/ce6411.html'; } },
    { label: 'Toggle Light / Dark Theme', type: 'Action', action: toggleTheme },
    { label: 'Download Curriculum Vitae (PDF)', type: 'Action', action: function() { window.open('CV-Mohaimenul_Islam.pdf', '_blank'); } }
  ];

  var filteredCommands = commands.slice();
  var activeCmdIdx = 0;

  function renderCmdList() {
    if (!cmdList) return;
    var q = cmdInput ? cmdInput.value.trim().toLowerCase() : '';
    filteredCommands = commands.filter(function(c) {
      return !q || c.label.toLowerCase().indexOf(q) !== -1 || c.type.toLowerCase().indexOf(q) !== -1;
    });
    if (activeCmdIdx >= filteredCommands.length) activeCmdIdx = 0;
    cmdList.innerHTML = filteredCommands.map(function(c, idx) {
      return '<li class="cmd-item' + (idx === activeCmdIdx ? ' active' : '') + '" data-cmd-idx="' + idx + '">' +
        '<span>' + c.label + '</span>' +
        '<span class="cmd-item-type">' + c.type + '</span>' +
        '</li>';
    }).join('');

    cmdList.querySelectorAll('.cmd-item').forEach(function(item) {
      item.addEventListener('click', function() {
        var i = parseInt(item.getAttribute('data-cmd-idx') || '0', 10);
        if (filteredCommands[i]) {
          closeCmdPalette();
          filteredCommands[i].action();
        }
      });
    });
  }

  function openCmdPalette() {
    if (!cmdOverlay) return;
    cmdOverlay.removeAttribute('hidden');
    activeCmdIdx = 0;
    if (cmdInput) {
      cmdInput.value = '';
      renderCmdList();
      cmdInput.focus();
    }
  }

  function closeCmdPalette() {
    if (!cmdOverlay || cmdOverlay.hasAttribute('hidden')) return;
    cmdOverlay.setAttribute('hidden', '');
  }

  if (cmdBtn) cmdBtn.addEventListener('click', openCmdPalette);
  if (cmdInput) {
    cmdInput.addEventListener('input', function() {
      activeCmdIdx = 0;
      renderCmdList();
    });
    cmdInput.addEventListener('keydown', function(e) {
      if (!filteredCommands.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeCmdIdx = (activeCmdIdx + 1) % filteredCommands.length;
        renderCmdList();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeCmdIdx = (activeCmdIdx - 1 + filteredCommands.length) % filteredCommands.length;
        renderCmdList();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        var cmd = filteredCommands[activeCmdIdx];
        if (cmd) {
          closeCmdPalette();
          cmd.action();
        }
      }
    });
  }

  if (cmdOverlay) {
    cmdOverlay.addEventListener('click', function(e) {
      if (e.target === cmdOverlay) closeCmdPalette();
    });
  }

  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdOverlay && !cmdOverlay.hasAttribute('hidden')) {
        closeCmdPalette();
      } else {
        openCmdPalette();
      }
      return;
    }
    if (e.key === 'Escape') {
      closeCmdPalette();
    }
  });

  // 9. Copy Buttons & Contact Form
  function copyText(text, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone).catch(function() {});
    }
  }

  document.querySelectorAll('.copy-btn[data-copy]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var val = btn.getAttribute('data-copy') || '';
      var orig = btn.textContent;
      copyText(val, function() {
        btn.textContent = 'Copied!';
        setTimeout(function() { btn.textContent = orig; }, 1400);
      });
    });
  });

  var contactForm = document.getElementById('contact-form');
  var formStatus = document.getElementById('form-status');
  var copyMsgBtn = document.getElementById('copy-message-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var name = (document.getElementById('sender-name').value || '').trim();
      var email = (document.getElementById('sender-email').value || '').trim();
      var subject = (document.getElementById('message-subject').value || '').trim();
      var body = (document.getElementById('message-body').value || '').trim();
      if (!name || !email || !subject || !body) return;
      var mailto = 'mailto:mohaimenul.geo@gmail.com?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent('From: ' + name + ' (' + email + ')\n\n' + body);
      window.location.href = mailto;
      if (formStatus) {
        formStatus.textContent = 'Opening your email client...';
        formStatus.classList.add('show');
      }
    });
  }

  if (copyMsgBtn) {
    copyMsgBtn.addEventListener('click', function() {
      var name = (document.getElementById('sender-name').value || '').trim();
      var email = (document.getElementById('sender-email').value || '').trim();
      var subject = (document.getElementById('message-subject').value || '').trim();
      var body = (document.getElementById('message-body').value || '').trim();
      var msg = 'To: mohaimenul.geo@gmail.com\nSubject: ' + subject + '\nFrom: ' + name + ' <' + email + '>\n\n' + body;
      copyText(msg, function() {
        if (formStatus) {
          formStatus.textContent = 'Formatted message copied to clipboard.';
          formStatus.classList.add('show');
        }
      });
    });
  }
})();
