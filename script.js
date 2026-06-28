// ── Dynamic Version Fetch ──

async function updateDownloadLinks() {
  try {
    const res = await fetch('https://api.github.com/repos/Priyanshu-byte-coder/keeptrack/releases/latest');
    if (!res.ok) return;
    const data = await res.json();
    const version = data.tag_name;
    const asset = data.assets.find(a => a.name.endsWith('.zip'));
    if (!asset) return;

    document.querySelectorAll('[data-download-link]').forEach(el => {
      el.href = asset.browser_download_url;
    });
    document.querySelectorAll('[data-show-version]').forEach(el => {
      el.textContent = `Download ${version}`;
    });

    // Update install command version display
    const versionBadges = document.querySelectorAll('.version-tag');
    versionBadges.forEach(el => {
      el.textContent = version;
    });
  } catch {
    // Silently use hardcoded fallback
  }
}

// ── Mobile Nav ──

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', links.classList.contains('open'));
  });

  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── Copy to Clipboard ──

function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.closest('.code-block').querySelector('code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });
}

// ── Scroll Animations ──

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// ── GoatCounter Events ──

function initAnalyticsEvents() {
  document.querySelectorAll('[data-goatcounter-click]').forEach(el => {
    el.addEventListener('click', () => {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({
          path: 'click-' + el.dataset.goatcounterClick,
          event: true
        });
      }
    });
  });
}

// ── Init ──

updateDownloadLinks();
initMobileNav();
initCopyButtons();
initScrollAnimations();
initAnalyticsEvents();
