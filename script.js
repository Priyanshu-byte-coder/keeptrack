// ── Dynamic Version Fetch ──
async function updateDownloadLinks() {
  try {
    const res = await fetch('https://api.github.com/repos/Priyanshu-byte-coder/keeptrack/releases/latest');
    if (!res.ok) return;
    const data = await res.json();
    const version = data.tag_name;
    const asset = data.assets.find(a => a.name.endsWith('.zip'));
    
    if (asset) {
      document.querySelectorAll('[data-download-link]').forEach(el => {
        el.href = asset.browser_download_url;
      });
    }

    document.querySelectorAll('[data-show-version]').forEach(el => {
      const svg = el.querySelector('svg');
      el.innerHTML = '';
      if(svg) el.appendChild(svg);
      el.appendChild(document.createTextNode(` Download ${version}`));
    });

  } catch {
    console.warn("Failed to fetch latest version from GitHub.");
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
      const codeBlock = btn.closest('.code-block').querySelector('code');
      if(!codeBlock) return;
      
      navigator.clipboard.writeText(codeBlock.textContent).then(() => {
        const originalHTML = btn.innerHTML;
        // Check icon
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        btn.style.borderColor = "#10b981";
        btn.style.color = "#10b981";
        
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.borderColor = "";
          btn.style.color = "";
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
        const delay = entry.target.getAttribute('data-delay');
        if (delay) {
          entry.target.style.transitionDelay = `${delay}s`;
        }
        
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}


// ── Install Tabs ──
function initInstallTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panes = document.querySelectorAll('.tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = `tab-${tab.getAttribute('data-tab')}`;
      document.getElementById(targetId).classList.add('active');
    });
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

// ── Demo Video Autoplay on Scroll ──
function initDemoAutoplay() {
  const video = document.getElementById('demo-video');
  if (!video) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(video);
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  updateDownloadLinks();
  initMobileNav();
  initCopyButtons();
  initScrollAnimations();
  initInstallTabs();
  initAnalyticsEvents();
  initDemoAutoplay();
});
