/* Waypoint Logistics: Minimal Desktop Swiss System Controller */
(function () {
  'use strict';

  const THEME_STORAGE_KEY = 'wp-theme';

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    } catch (error) {
      return 'light';
    }
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch (error) {
      /* ignore storage failures */
    }
    document.querySelectorAll('[data-wp-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      button.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      button.title = isDark ? 'Light mode' : 'Dark mode';
      const icon = button.querySelector('[data-lucide]');
      if (icon) icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    });
    initLucide();
  }

  function toggleTheme() {
    const nextTheme = getStoredTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    refreshChartsForTheme();
    refreshSignaturePadTheme();
  }

  function createThemeToggleButton(extraClass) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `wp-icon-btn wp-theme-toggle${extraClass ? ` ${extraClass}` : ''}`;
    button.setAttribute('data-wp-theme-toggle', '');
    button.setAttribute('aria-pressed', getStoredTheme() === 'dark' ? 'true' : 'false');
    button.setAttribute('aria-label', getStoredTheme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    button.title = getStoredTheme() === 'dark' ? 'Light mode' : 'Dark mode';
    button.innerHTML = `<i data-lucide="${getStoredTheme() === 'dark' ? 'sun' : 'moon'}"></i>`;
    button.addEventListener('click', toggleTheme);
    return button;
  }

  function initThemeToggle() {
    applyTheme(getStoredTheme());

    const topbarRight = document.querySelector('.wp-topbar-right');
    if (topbarRight && !topbarRight.querySelector('[data-wp-theme-toggle]')) {
      const toggle = createThemeToggleButton();
      topbarRight.insertBefore(toggle, topbarRight.firstChild);
    }

    if (document.body.classList.contains('wp-login') && !document.querySelector('[data-wp-theme-toggle]')) {
      const loginToggle = createThemeToggleButton('wp-login-theme-toggle');
      document.body.appendChild(loginToggle);
    }
  }

  function initLucide() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  function initLogoMark() {
    document.querySelectorAll('.wp-logo-mark img').forEach((img) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 32 32');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML =
        '<rect width="32" height="32" rx="8" fill="var(--wp-primary)"></rect>' +
        `<path d="M7 9 L10 22 L13 15 L16 22 L19 15 L22 22 L25 9" stroke="var(--wp-mark-on-primary)" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"></path>` +
        '<circle cx="16" cy="9" r="2.25" fill="var(--wp-mark-on-primary)"></circle>';
      img.replaceWith(svg);
    });
  }

  const WP_ROLES = {
    dispatcher: {
      label: 'Dispatcher',
      avatar: 'NP',
      name: 'Nimal Perera',
      sub: 'Peliyagoda Hub',
      home: 'index.html',
    },
    loader: {
      label: 'Loader',
      avatar: 'PF',
      name: 'Priya Fernando',
      sub: 'Peliyagoda Dock',
      home: 'loader-runs.html',
    },
    driver: {
      label: 'Driver',
      avatar: 'KS',
      name: 'Kamal Silva',
      sub: 'Route R025229',
      home: 'driver-home.html',
    },
    store: {
      label: 'Store',
      avatar: 'AJ',
      name: 'Anjali Jayawardena',
      sub: 'OUT001 Fresh Galle Rd',
      home: 'store-portal.html',
    },
  };

  const WP_UTILITY_PAGES = [
    { id: 'DEG-01', href: 'degradation.html', icon: 'shield-alert', label: 'Degradation', section: 'Prototype' },
    { id: 'AUTH-01', href: 'login.html', icon: 'log-in', label: 'Login', section: 'Prototype' },
  ];

  const WP_PAGES = [
    { id: 'DISP-01', href: 'index.html', icon: 'home', label: 'Mission Control', section: 'Overview', roles: ['dispatcher'] },
    { id: 'DISP-02', href: 'dispatcher-queue.html', icon: 'list-ordered', label: 'Order Queue', section: 'Orders', roles: ['dispatcher'] },
    { id: 'DISP-03', href: 'dispatcher-cutoff.html', icon: 'clock', label: 'Cutoff & Late Orders', section: 'Orders', roles: ['dispatcher'] },
    { id: 'DISP-05', href: 'dispatcher-deferral.html', icon: 'calendar-x', label: 'Deferral Panel', section: 'Orders', roles: ['dispatcher'] },
    { id: 'DISP-04', href: 'dispatcher-allocation.html', icon: 'layout-grid', label: 'Fleet Allocation', section: 'Fleet', roles: ['dispatcher'] },
    { id: 'DISP-06', href: 'dispatcher-validator.html', icon: 'shield-check', label: 'Constraint Validator', section: 'Fleet', roles: ['dispatcher'] },
    { id: 'DISP-07', href: 'dispatcher-exceptions.html', icon: 'alert-circle', label: 'Exceptions', section: 'Fleet', roles: ['dispatcher'], badge: '3' },
    { id: 'DISP-10', href: 'dispatcher-forecast.html', icon: 'trending-up', label: 'Capacity Forecast', section: 'Fleet', roles: ['dispatcher'] },
    { id: 'DISP-08', href: 'dispatcher-map.html', icon: 'map', label: 'Live Progress Map', section: 'Network', roles: ['dispatcher'] },
    { id: 'DISP-09', href: 'dispatcher-outlet.html', icon: 'building-2', label: 'Outlet Detail', section: 'Network', roles: ['dispatcher'] },
    { id: 'LOAD-01', href: 'loader-depot.html', icon: 'warehouse', label: 'Depot Select', section: 'Depot', roles: ['loader'] },
    { id: 'LOAD-02', href: 'loader-runs.html', icon: 'list', label: 'Vehicle Runs', section: 'Depot', roles: ['loader'] },
    { id: 'LOAD-03', href: 'loader-dock.html', icon: 'package-check', label: 'Load Checklist', section: 'Load', roles: ['loader'] },
    { id: 'LOAD-04', href: 'loader-shortfall.html', icon: 'alert-triangle', label: 'Shortfall / Damage', section: 'Load', roles: ['loader'] },
    { id: 'LOAD-05', href: 'loader-signoff.html', icon: 'badge-check', label: 'Departure Sign-off', section: 'Load', roles: ['loader'] },
    { id: 'DRV-01', href: 'driver-home.html', icon: 'circle-user', label: 'Driver Home', section: 'Today', roles: ['driver'] },
    { id: 'DRV-02', href: 'driver-route.html', icon: 'truck', label: "Today's Route", section: 'Today', roles: ['driver'] },
    { id: 'DRV-03', href: 'driver-stop.html', icon: 'map-pin', label: 'Stop Detail', section: 'Today', roles: ['driver'] },
    { id: 'DRV-04', href: 'driver-pod.html', icon: 'camera', label: 'Proof of Delivery', section: 'Delivery', roles: ['driver'] },
    { id: 'DRV-05', href: 'driver-issue.html', icon: 'message-square-warning', label: 'Issue Report', section: 'Delivery', roles: ['driver'] },
    { id: 'DRV-06', href: 'driver-sync.html', icon: 'cloud-off', label: 'Offline & Sync', section: 'Delivery', roles: ['driver'] },
    { id: 'SM-01', href: 'store-portal.html', icon: 'store', label: 'Store Portal', section: 'Orders', roles: ['store'] },
    { id: 'SM-02', href: 'store-orders.html', icon: 'clipboard-list', label: 'Orders List', section: 'Orders', roles: ['store'] },
    { id: 'SM-03', href: 'store-order.html', icon: 'shopping-cart', label: 'Place Order', section: 'Orders', roles: ['store'] },
    { id: 'SM-04', href: 'store-confirm.html', icon: 'check-circle', label: 'Order Confirmation', section: 'Orders', roles: ['store'] },
    { id: 'SM-05', href: 'store-cutoff.html', icon: 'timer', label: 'Cutoff Countdown', section: 'Service', roles: ['store'] },
    { id: 'SM-06', href: 'store-deferral.html', icon: 'bell-off', label: 'Deferral Notice', section: 'Service', roles: ['store'] },
    { id: 'SM-07', href: 'store-tracking.html', icon: 'route', label: 'Delivery Tracking', section: 'Service', roles: ['store'] },
    { id: 'SM-08', href: 'store-receipt.html', icon: 'package-open', label: 'Receipt Confirmation', section: 'Service', roles: ['store'] },
    { id: 'AGENT-01', href: 'agent.html', icon: 'bot', label: 'Waypoint Agent', section: 'Assistant', roles: ['dispatcher', 'loader', 'driver', 'store'] },
    { id: 'AUTH-02', href: 'login.html', icon: 'log-out', label: 'Logout', section: 'Account', roles: ['dispatcher', 'loader', 'driver', 'store'], action: 'logout' },
  ];

  const AGENT_LIVE_KEY = 'wp-agent-live';
  const AGENT_STATUS_KEY = 'wp-agent-status';
  const AGENT_SPOTLIGHT_KEY = 'wp-agent-spotlight';
  const AGENT_VOICE_REPLY_KEY = 'wp-agent-voice-reply';

  const WP_AGENT_SPOTLIGHTS = {
    'dispatcher-exceptions.html': '#exception-table-view',
    'dispatcher-allocation.html': '#allocation-board',
    'dispatcher-queue.html': '#queue-view-switcher',
    'dispatcher-cutoff.html': '.wp-cutoff-banner',
  };

  const WP_AGENT_ANSWERS = [
    {
      match: /orders?\s*(today|count|how many)|how many orders/i,
      reply: 'There are <strong>142 orders today</strong> — 138 confirmed and 4 pending deferrals.',
    },
    {
      match: /cutoff|deadline|16:00|4\s*pm/i,
      reply: 'Today\'s cutoff is <strong>16:00 SLST</strong>. The countdown is live in the sidebar and on cutoff screens.',
    },
    {
      match: /fleet|vehicles?|active fleet|how many (trucks|vans)/i,
      reply: '<strong>32 vehicles</strong> are active today — 28 at Peliyagoda Hub and 4 at Kandy Terminal.',
    },
    {
      match: /exception|incident|triage count|open incident/i,
      reply: 'There are <strong>3 open exceptions</strong> requiring triage across dock, sync, and cold chain.',
    },
  ];

  const WP_AGENT_ACTIONS = [
    {
      match: /open\s+exception|exceptions|triage|show exception/i,
      id: 'exceptions',
      href: 'dispatcher-exceptions.html',
      label: 'Exceptions',
      description: 'Navigate to Exception & Synchronization Triage and highlight the incident table.',
      status: 'Opened Exceptions',
    },
    {
      match: /order\s+queue|open queue|show queue|queue page/i,
      id: 'queue',
      href: 'dispatcher-queue.html',
      label: 'Order Queue',
      description: 'Navigate to the dispatcher order queue for today\'s 142 orders.',
      status: 'Opened Order Queue',
    },
    {
      match: /fleet\s+alloc|allocation|allocate|open allocation/i,
      id: 'allocation',
      href: 'dispatcher-allocation.html',
      label: 'Fleet Allocation',
      description: 'Navigate to the fleet allocation board to review vehicle assignments.',
      status: 'Opened Fleet Allocation',
    },
    {
      match: /cutoff screen|late orders|open cutoff/i,
      id: 'cutoff',
      href: 'dispatcher-cutoff.html',
      label: 'Cutoff & Late Orders',
      description: 'Navigate to the cutoff countdown and late-order review screen.',
      status: 'Opened Cutoff',
    },
  ];

  const WP_ACTIONS = [
    { label: 'Publish Daily Plan', icon: 'check-circle-2', href: 'dispatcher-allocation.html' },
    { label: 'New Order', icon: 'plus', href: 'store-order.html' },
    { label: 'Scan Barcode', icon: 'scan-barcode', href: 'loader-dock.html' },
    { label: 'Deferral Rules', icon: 'clock', href: 'dispatcher-deferral.html' },
    { label: 'Report Shortfall', icon: 'alert-triangle', href: 'loader-shortfall.html' },
    { label: 'Refresh Telemetry', icon: 'refresh-cw', href: 'dispatcher-map.html' },
    { label: 'Ask Waypoint Agent', icon: 'bot', href: 'agent.html' },
  ];

  function getCurrentPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    return WP_PAGES.find((page) => page.href === path)
      || WP_UTILITY_PAGES.find((page) => page.href === path)
      || null;
  }

  function renderUtilityNavItems(path) {
    let html = '<div class="wp-sidebar-nav-utility">';
    html += '<div class="wp-sidebar-nav-group-title">Prototype</div>';
    html += '<div class="wp-sidebar-nav-group-items">';
    WP_UTILITY_PAGES.forEach((page) => {
      const active = page.href === path ? ' active' : '';
      html +=
        `<a href="${page.href}" data-wp-nav class="wp-sidebar-nav-item${active}">` +
        `<i data-lucide="${page.icon}"></i>` +
        `<span>${page.label}</span></a>`;
    });
    html += '</div></div>';
    return html;
  }

  function initLogoutHandlers() {
    document.querySelectorAll('[data-wp-logout]').forEach((link) => {
      if (link.dataset.logoutInit) return;
      link.dataset.logoutInit = 'true';
      link.addEventListener('click', () => {
        try {
          localStorage.removeItem('wp-role');
        } catch (error) {
          /* ignore */
        }
      });
    });
  }

  function detectRole() {
    const page = getCurrentPage();
    if (page && page.roles && page.roles[0]) return page.roles[0];
    const stored = localStorage.getItem('wp-role');
    if (stored && WP_ROLES[stored]) return stored;
    return 'dispatcher';
  }

  function getActiveRole() {
    return detectRole();
  }

  function setActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('[data-wp-nav]').forEach((link) => {
      if (link.hasAttribute('data-wp-logout')) {
        link.classList.remove('active');
        return;
      }
      const href = link.getAttribute('href');
      if (!href) return;
      const target = href.split('/').pop();
      link.classList.toggle('active', target === path);
    });
  }

  function renderSidebarNav(role) {
    const nav = document.querySelector('[data-wp-nav-root], .wp-sidebar-nav');
    if (!nav) return;

    const pages = WP_PAGES.filter((page) => page.roles.includes(role));
    const sections = [];
    pages.forEach((page) => {
      if (!sections.includes(page.section)) sections.push(page.section);
    });

    const path = window.location.pathname.split('/').pop() || 'index.html';
    let html = '';
    sections.forEach((section) => {
      const sectionPages = pages.filter((page) => page.section === section);
      html += '<div class="wp-sidebar-nav-group">';
      html += `<div class="wp-sidebar-nav-group-title">${section}</div>`;
      html += '<div class="wp-sidebar-nav-group-items">';
      sectionPages.forEach((page) => {
        const active = !page.action && page.href === path ? ' active' : '';
        const badge = page.badge ? `<span class="nav-badge">${page.badge}</span>` : '';
        const logoutClass = page.action === 'logout' ? ' wp-sidebar-nav-item--logout' : '';
        const logoutAttr = page.action === 'logout' ? ' data-wp-logout' : '';
        html +=
          `<a href="${page.href}" data-wp-nav class="wp-sidebar-nav-item${active}${logoutClass}"${logoutAttr}>` +
          `<i data-lucide="${page.icon}"></i>` +
          `<span>${page.label}</span>${badge}</a>`;
      });
      html += '</div></div>';
    });
    html += renderUtilityNavItems(path);
    nav.innerHTML = html;
  }

  function renderSidebarUtility() {
    document.querySelectorAll('.wp-sidebar-nav:not([data-wp-nav-root])').forEach((nav) => {
      if (nav.querySelector('.wp-sidebar-nav-utility')) return;
      const path = window.location.pathname.split('/').pop() || 'index.html';
      nav.insertAdjacentHTML('beforeend', renderUtilityNavItems(path));
    });
  }

  function renderRoleSwitcher(role) {
    const footer = document.querySelector('.wp-sidebar-footer');
    if (!footer || footer.dataset.roleInit) return;
    footer.dataset.roleInit = 'true';

    const profile = footer.querySelector('.wp-profile-pill');
    if (!profile) return;

    if (profile.tagName === 'A') {
      const replacement = document.createElement('div');
      replacement.className = profile.className;
      if (profile.getAttribute('style')) replacement.setAttribute('style', profile.getAttribute('style'));
      profile.replaceWith(replacement);
    }

    const profileEl = footer.querySelector('.wp-profile-pill');
    if (!profileEl) return;

    const current = WP_ROLES[role];
    profileEl.innerHTML =
      `<span class="wp-avatar">${current.avatar}</span>` +
      `<div style="overflow:hidden;flex:1">` +
      `<div class="wp-title-md" style="font-size:0.8rem;white-space:nowrap;text-overflow:ellipsis;overflow:hidden">${current.name}</div>` +
      `<div class="wp-subtext" style="font-size:0.7rem">${current.sub}</div>` +
      `</div>` +
      `<i data-lucide="chevrons-up-down" style="width:0.9rem;height:0.9rem;opacity:0.5;flex-shrink:0"></i>`;

    profileEl.style.cursor = 'pointer';
    profileEl.setAttribute('role', 'button');
    profileEl.setAttribute('tabindex', '0');
    profileEl.setAttribute('aria-label', 'Switch role view');

    let menu = footer.querySelector('.wp-role-menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.className = 'wp-role-menu';
      menu.setAttribute('role', 'menu');
      footer.appendChild(menu);
    }

    menu.innerHTML = Object.entries(WP_ROLES)
      .map(([key, info]) => {
        const selected = key === role ? ' is-selected' : '';
        return (
          `<button type="button" class="wp-role-menu-item${selected}" data-wp-role="${key}" role="menuitem">` +
          `<span class="wp-avatar" style="width:1.75rem;height:1.75rem;font-size:0.65rem">${info.avatar}</span>` +
          `<span><strong>${info.label}</strong><span class="wp-subtext" style="display:block;font-size:0.68rem">${info.name}</span></span>` +
          `</button>`
        );
      })
      .join('');

    function closeMenu() {
      menu.classList.remove('open');
    }

    profileEl.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      menu.classList.toggle('open');
      initLucide();
    });

    menu.querySelectorAll('[data-wp-role]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.stopPropagation();
        const nextRole = btn.getAttribute('data-wp-role');
        localStorage.setItem('wp-role', nextRole);
        closeMenu();
        window.location.href = WP_ROLES[nextRole].home;
      });
    });

    document.addEventListener('click', closeMenu);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  function renderCommandPalette() {
    const results = document.querySelector('[data-wp-command-results], .wp-command-results');
    if (!results) return;

    const path = window.location.pathname.split('/').pop() || 'index.html';
    let html = '<div class="wp-command-group-label">Pages</div>';

    WP_PAGES.forEach((page) => {
      const selected = !page.action && page.href === path ? ' selected' : '';
      const logoutAttr = page.action === 'logout' ? ' data-wp-logout' : '';
      html +=
        `<a href="${page.href}" class="wp-command-item${selected}"${logoutAttr}>` +
        `<i data-lucide="${page.icon}"></i>` +
        `<div class="wp-command-item-body">` +
        `<span class="wp-command-item-title">${page.label}</span>` +
        `<span class="wp-command-item-meta">${page.id} · ${page.section}</span>` +
        `</div>` +
        `<div class="wp-command-item-action">` +
        `<span class="wp-command-item-action-label">${page.id}</span>` +
        `</div>` +
        `</a>`;
    });

    html += '<div class="wp-command-group-label">Prototype</div>';
    WP_UTILITY_PAGES.forEach((page) => {
      const selected = page.href === path ? ' selected' : '';
      html +=
        `<a href="${page.href}" class="wp-command-item${selected}">` +
        `<i data-lucide="${page.icon}"></i>` +
        `<div class="wp-command-item-body">` +
        `<span class="wp-command-item-title">${page.label}</span>` +
        `<span class="wp-command-item-meta">${page.id} · ${page.section}</span>` +
        `</div>` +
        `<div class="wp-command-item-action">` +
        `<span class="wp-command-item-action-label">${page.id}</span>` +
        `</div>` +
        `</a>`;
    });

    html += '<div class="wp-command-group-label">Actions</div>';
    WP_ACTIONS.forEach((action) => {
      html +=
        `<a href="${action.href}" class="wp-command-item">` +
        `<i data-lucide="${action.icon}"></i>` +
        `<div class="wp-command-item-body">` +
        `<span class="wp-command-item-title">${action.label}</span>` +
        `<span class="wp-command-item-meta">in Actions</span>` +
        `</div>` +
        `</a>`;
    });

    results.innerHTML = html;
  }

  function initNavRegistry() {
    if (document.body.classList.contains('wp-login')) return;
    const role = getActiveRole();
    renderSidebarNav(role);
    renderSidebarUtility();
    renderRoleSwitcher(role);
    renderCommandPalette();
    setActiveNav();
    initLogoutHandlers();
    initLucide();
  }

  /** Off-canvas sidebar for tablet and mobile */
  function initResponsiveShell() {
    if (!document.body.classList.contains('wp-site')) return;

    const sidebar = document.querySelector('.wp-sidebar');
    const topbarLeft = document.querySelector('.wp-topbar-left');
    if (!sidebar || !topbarLeft) return;

    let backdrop = document.querySelector('.wp-sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'wp-sidebar-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      sidebar.parentNode.insertBefore(backdrop, sidebar);
    }

    let toggle = document.querySelector('.wp-nav-toggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'wp-icon-btn wp-nav-toggle';
      toggle.setAttribute('aria-label', 'Open navigation menu');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<i data-lucide="menu"></i>';
      topbarLeft.insertBefore(toggle, topbarLeft.firstChild);
      initLucide();
    }

    const sidebarHeader = sidebar.querySelector('.wp-sidebar-header');
    if (sidebarHeader && !sidebarHeader.querySelector('.wp-nav-close')) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'wp-icon-btn wp-nav-close';
      closeBtn.setAttribute('aria-label', 'Close navigation menu');
      closeBtn.innerHTML = '<i data-lucide="x"></i>';
      sidebarHeader.appendChild(closeBtn);
      initLucide();
    }

    const mqTablet = window.matchMedia('(max-width: 1023px)');

    function closeNav() {
      document.body.classList.remove('wp-nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
      document.body.style.overflow = '';
    }

    function openNav() {
      if (!mqTablet.matches) return;
      document.body.classList.add('wp-nav-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close navigation menu');
      document.body.style.overflow = 'hidden';
    }

    toggle.addEventListener('click', () => {
      if (document.body.classList.contains('wp-nav-open')) {
        closeNav();
        toggle.focus();
      } else {
        openNav();
      }
    });

    backdrop.addEventListener('click', () => {
      closeNav();
      toggle.focus();
    });

    const closeBtn = sidebar.querySelector('.wp-nav-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeNav();
        toggle.focus();
      });
    }

    document.addEventListener('click', (event) => {
      const link = event.target.closest('.wp-sidebar-nav [data-wp-nav]');
      if (link && document.body.classList.contains('wp-nav-open')) closeNav();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && document.body.classList.contains('wp-nav-open')) {
        closeNav();
        toggle.focus();
      }
    });

    mqTablet.addEventListener('change', (event) => {
      if (!event.matches) closeNav();
    });
  }

  /** Countdown to 4:00 PM Sri Lanka (Asia/Colombo) */
  function initCutoffClock() {
    const els = document.querySelectorAll('[data-wp-cutoff]');
    if (!els.length) return;

    function tick() {
      const now = new Date();
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Colombo',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      }).formatToParts(now);
      const get = (type) => parseInt(parts.find((p) => p.type === type)?.value || '0', 10);
      const h = get('hour');
      const min = get('minute');
      const sec = get('second');
      const nowSec = h * 3600 + min * 60 + sec;
      const cutoffSec = 16 * 3600;
      let diffSec = cutoffSec - nowSec;
      if (diffSec <= 0) diffSec += 24 * 3600;
      const hrs = Math.floor(diffSec / 3600);
      const mins = Math.floor((diffSec % 3600) / 60);
      const secs = diffSec % 60;
      const text = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      els.forEach((el) => {
        el.textContent = text;
      });
    }
    tick();
    setInterval(tick, 1000);
  }

  /** Command palette shell: open/close only */
  function initCommandPalette() {
    const palette = document.getElementById('wp-command-palette');
    if (!palette) return;

    const dialog = palette.querySelector('.wp-command-dialog');

    function openPalette() {
      palette.classList.add('open');
      palette.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      initLucide();
    }

    function closePalette() {
      palette.classList.remove('open');
      palette.setAttribute('aria-hidden', 'true');
      const hasOpenDrawer = document.querySelector('.wp-drawer-backdrop.open');
      if (!hasOpenDrawer) document.body.style.overflow = '';
    }

    function togglePalette() {
      if (palette.classList.contains('open')) closePalette();
      else openPalette();
    }

    document.querySelectorAll('[data-wp-command-open]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openPalette();
      });
    });

    palette.addEventListener('click', (e) => {
      if (e.target === palette) closePalette();
    });

    if (dialog) {
      dialog.addEventListener('click', (e) => e.stopPropagation());
    }

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        togglePalette();
        return;
      }
      if (e.key === 'Escape' && palette.classList.contains('open')) {
        closePalette();
      }
    });
  }

  /** Floating Slide-Out Drawer System */
  function initDrawers() {
    function openDrawer(drawer) {
      if (!drawer) return;
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      initLucide();
    }

    function closeDrawer(drawer) {
      if (!drawer) return;
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      drawer.dispatchEvent(new CustomEvent('wp-drawer-close', { bubbles: true }));
      const hasOpen = document.querySelector('.wp-drawer-backdrop.open');
      if (!hasOpen) {
        document.body.style.overflow = '';
      }
    }

    // Open triggers
    document.querySelectorAll('[data-wp-drawer-open]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-wp-drawer-open');
        const drawer = document.getElementById(id);
        openDrawer(drawer);
      });
    });

    // Close triggers
    document.querySelectorAll('[data-wp-drawer-close]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-wp-drawer-close');
        if (id) {
          closeDrawer(document.getElementById(id));
        } else {
          closeDrawer(btn.closest('.wp-drawer-backdrop'));
        }
      });
    });

    // Backdrop click dismiss
    document.querySelectorAll('.wp-drawer-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          closeDrawer(backdrop);
        }
      });
    });

    // ESC dismiss
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.wp-drawer-backdrop.open').forEach(closeDrawer);
      }
    });

    // Expose globally for dynamic triggers
    window.wpOpenDrawer = openDrawer;
    window.wpCloseDrawer = closeDrawer;
  }

  const CHASSIS_LABELS = {
    truck: 'Dry Truck',
    truck_freezer: 'Truck + Freezer',
    van_freezer: 'Van + Freezer',
  };

  const VEHICLES = {
    VEH001: {
      id: 'VEH001',
      chassisType: 'truck',
      label: 'VEH001: 7.5T Dry Truck',
      model: 'Isuzu FRR Ambient',
      tare: '9,800 kg',
      payload: '7,200 kg',
      status: 'In transit',
      capacity: 'Open cargo bays · Style/Tech',
      fresh: '-',
      style: '142 / 480 min',
      weightPct: 68,
      fuel: '280 L / week',
      vanOnly: false,
      clearance: '-',
    },
    VEH002: {
      id: 'VEH002',
      chassisType: 'van_freezer',
      label: 'VEH002: 4T Reefer Van',
      model: 'Toyota Dyna Reefer',
      tare: '8,200 kg',
      payload: '3,990 kg',
      status: 'Loading',
      capacity: 'Van compartments · van_only',
      fresh: '98 / 270 min',
      style: '-',
      weightPct: 54,
      fuel: '410 L / week',
      vanOnly: true,
      clearance: '3.2 m curb',
    },
    VEH003: {
      id: 'VEH003',
      chassisType: 'truck_freezer',
      label: 'VEH003: 5.5T Reefer Truck',
      model: 'Isuzu FRR Reefer',
      tare: '12,400 kg',
      payload: '5,510 kg',
      status: 'Available for loading',
      capacity: '1 × 40ft Reefer box',
      fresh: '184 / 270 min',
      style: '-',
      weightPct: 72,
      fuel: '360 L / week',
      vanOnly: false,
      clearance: '-',
      temp: '−18°C to +4°C',
    },
    VEH004: {
      id: 'VEH004',
      chassisType: 'truck_freezer',
      label: 'VEH004: 16T Reefer Truck',
      model: 'Hino 700 Reefer',
      tare: '22,800 kg',
      payload: '68,400 kg',
      status: 'Available for loading',
      capacity: '2 × 40ft / 53ft Reefer',
      fresh: '184 / 270 min',
      style: '312 / 480 min',
      weightPct: 82,
      fuel: '430 L / week',
      vanOnly: false,
      clearance: '-',
      temp: '−18°C to +4°C',
    },
    VEH005: {
      id: 'VEH005',
      chassisType: 'truck_freezer',
      label: 'VEH005: 16T Reefer Truck',
      model: 'Hino 700 Reefer',
      tare: '22,800 kg',
      payload: '68,400 kg',
      status: 'Planned',
      capacity: '2 × 40ft Reefer',
      fresh: '201 / 270 min',
      style: '-',
      weightPct: 76,
      fuel: '390 L / week',
      vanOnly: false,
      clearance: '-',
      temp: '−18°C to +4°C',
    },
    VEH037: {
      id: 'VEH037',
      chassisType: 'van_freezer',
      label: 'VEH037: Reefer Van (Fresh)',
      model: 'Nissan Cabstar Reefer',
      tare: '4,100 kg',
      payload: '2,200 kg',
      status: 'On route R025229',
      capacity: 'Van: van_only stops',
      fresh: '156 / 270 min',
      style: '-',
      weightPct: 61,
      fuel: '120 L / week',
      vanOnly: true,
      clearance: '3.2 m curb',
      temp: '+2°C to +4°C',
    },
  };

  const FLEET_MAP_VEHICLES = [
    { id: 'VEH037', driver: 'Kamal Silva', route: 'R025229', stops: '2 / 4', online: true, x: 34, y: 42, chassisType: 'van_freezer' },
    { id: 'VEH001', driver: 'Sunil Mendis', route: 'R025230', stops: '3 / 6', online: true, x: 52, y: 38, chassisType: 'truck' },
    { id: 'VEH003', driver: 'Ruwan Dias', route: 'R025231', stops: '1 / 5', online: true, x: 68, y: 55, chassisType: 'truck_freezer' },
    { id: 'VEH002', driver: 'Niroshan Perera', route: 'R025232', stops: '4 / 4', online: false, x: 22, y: 58, chassisType: 'van_freezer' },
    { id: 'VEH004', driver: '-', route: 'Loading', stops: '0 / 8', online: true, x: 12, y: 28, chassisType: 'truck_freezer' },
    { id: 'VEH005', driver: '-', route: 'Planned', stops: '-', online: true, x: 78, y: 32, chassisType: 'truck_freezer' },
  ];

  const FLEET_MAP_STOPS = {
    VEH037: [
      { label: 'OUT003 · Delivered 05:42', status: 'done' },
      { label: 'OUT001 · En route', status: 'now' },
      { label: 'OUT014 · Planned 06:40', status: 'pending' },
      { label: 'OUT022 · Planned 07:15', status: 'pending' },
    ],
    VEH001: [
      { label: 'OUT020 · Delivered 06:10', status: 'done' },
      { label: 'OUT025 · En route', status: 'now' },
      { label: 'OUT030 · Planned 07:00', status: 'pending' },
    ],
    VEH003: [
      { label: 'OUT040 · En route', status: 'now' },
      { label: 'OUT041 · Planned 06:55', status: 'pending' },
    ],
    VEH002: [
      { label: 'OUT002 · Delivered 05:58', status: 'done' },
      { label: 'OUT005 · Delivered 06:22', status: 'done' },
    ],
    VEH004: [],
    VEH005: [],
  };

  function initAllocationBoard() {
    const board = document.getElementById('allocation-board');
    if (!board) return;

    const titleEl = document.getElementById('veh-title');
    const specEls = {
      model: document.getElementById('veh-model'),
      tare: document.getElementById('veh-tare'),
      payload: document.getElementById('veh-payload'),
      status: document.getElementById('veh-status'),
      capacity: document.getElementById('veh-capacity'),
      fresh: document.getElementById('veh-fresh'),
      style: document.getElementById('veh-style'),
      fuel: document.getElementById('veh-fuel'),
    };
    const meterEl = document.getElementById('veh-weight-meter');
    const matrixPct = document.getElementById('matrix-pct');

    let currentVehicleId = 'VEH004';
    const specsDrawer = document.getElementById('vehicle-specs-drawer');

    const stageEl = board.querySelector('.wp-vehicle-stage');

    function selectVehicle(id, markActive = false) {
      const v = VEHICLES[id];
      if (!v) return;
      currentVehicleId = id;
      if (titleEl) titleEl.textContent = v.label;
      Object.keys(specEls).forEach((k) => {
        if (specEls[k]) specEls[k].textContent = v[k] || '-';
      });
      if (meterEl) meterEl.style.width = `${v.weightPct}%`;
      if (matrixPct) matrixPct.textContent = `${v.weightPct}%`;
      if (stageEl && v.chassisType) {
        stageEl.dataset.chassis = v.chassisType;
      }
      const specsDrawerEl = document.getElementById('vehicle-specs-drawer');
      if (specsDrawerEl && v.chassisType) {
        specsDrawerEl.dataset.chassis = v.chassisType;
      }
      const tempEl = document.getElementById('veh-temp');
      const clearanceEl = document.getElementById('veh-clearance');
      const vanOnlyEl = document.getElementById('veh-van-only');
      if (tempEl) tempEl.textContent = v.temp || '-';
      if (clearanceEl) clearanceEl.textContent = v.clearance || '-';
      if (vanOnlyEl) vanOnlyEl.textContent = v.vanOnly ? 'Yes · curb eligible' : 'No';
      document.querySelectorAll('.wp-fleet-card').forEach((card) => {
        card.classList.toggle('active', markActive && card.dataset.vehicle === id);
      });
    }

    function openSpecsSidebar(vehicleId, markActive = false) {
      selectVehicle(vehicleId, markActive);
      if (specsDrawer && window.wpOpenDrawer) {
        window.wpOpenDrawer(specsDrawer);
      }
    }

    document.querySelectorAll('.wp-fleet-card').forEach((card) => {
      card.addEventListener('click', () => {
        selectVehicle(card.dataset.vehicle, true);
      });
    });

    document.querySelectorAll('[data-wp-drawer-open="vehicle-specs-drawer"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        openSpecsSidebar(currentVehicleId, false);
      });
    });

    if (specsDrawer) {
      specsDrawer.addEventListener('wp-drawer-close', () => {
        document.querySelectorAll('.wp-fleet-card').forEach((card) => {
          card.classList.remove('active');
        });
      });
    }

    selectVehicle(currentVehicleId, false);

    // Container Mounting action
    const assignBtn = document.getElementById('btn-assign-container');
    const emptySlot = document.getElementById('empty-container-slot');
    if (assignBtn && emptySlot) {
      assignBtn.addEventListener('click', () => {
        emptySlot.innerHTML = `
          <div class="wp-container-filled wp-container-corrugated" style="width:100%;height:100%;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;">
            <span class="wp-container-corner tl"></span><span class="wp-container-corner tr"></span>
            <span class="wp-container-corner bl"></span><span class="wp-container-corner br"></span>
            <span style="font-size:0.65rem;letter-spacing:0.06em;font-weight:700">WAYPOINT 40CN</span>
            <span class="font-mono" style="opacity:0.95;font-size:0.6rem">MSKU 793318</span>
          </div>
        `;
        emptySlot.classList.remove('wp-container-slot');
        emptySlot.style.border = 'none';
        assignBtn.textContent = 'Container Staged';
        assignBtn.disabled = true;
        assignBtn.classList.remove('wp-btn-primary');
        assignBtn.classList.add('wp-btn-ghost');
        if (matrixPct) matrixPct.textContent = '94%';
        if (meterEl) meterEl.style.width = '94%';
        const statusBadge = document.getElementById('alloc-plan-status');
        if (statusBadge) {
          statusBadge.textContent = '2/2 Mounted: Ready';
          statusBadge.className = 'wp-state wp-state-success';
        }
        const cogPointer = document.getElementById('cog-pointer');
        const frontAxle = document.getElementById('front-axle-weight');
        const rearAxle = document.getElementById('rear-axle-weight');
        if (cogPointer) cogPointer.style.left = '52%';
        if (frontAxle) frontAxle.textContent = '14,200 kg';
        if (rearAxle) rearAxle.textContent = '28,400 kg';
      });
    }
  }

  function initNetworkStatus() {
    const banner = document.getElementById('network-banner');
    if (!banner) return;
    const label = banner.querySelector('[data-network-label]');
    const queue = document.getElementById('sync-queue-count');
    const isOffline = navigator.onLine === false;
    const text = isOffline ? 'Offline: Queued' : 'Online';
    if (label) label.textContent = text;
    banner.classList.toggle('online', !isOffline);
    banner.classList.toggle('offline', isOffline);
    if (queue) queue.textContent = isOffline ? '3' : '0';
    window.addEventListener('online', () => {
      if (label) label.textContent = 'Online';
      banner.classList.add('online');
      banner.classList.remove('offline');
      if (queue) queue.textContent = '0';
    });
    window.addEventListener('offline', () => {
      if (label) label.textContent = 'Offline: Queued';
      banner.classList.remove('online');
      banner.classList.add('offline');
      if (queue) queue.textContent = '3';
    });
  }

  function initDaySwitcher() {
    document.querySelectorAll('[data-wp-day-switcher]').forEach((switcher) => {
      const scope = switcher.closest('[data-wp-day-scope]') || document;
      const panels = scope.querySelectorAll('[data-wp-day-panel]');
      const kpiEls = scope.querySelectorAll('[data-wp-day-kpi]');

      function setDay(day) {
        switcher.querySelectorAll('.wp-day-btn').forEach((btn) => {
          const on = btn.dataset.day === day;
          btn.classList.toggle('active', on);
          btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        panels.forEach((panel) => {
          const show = panel.dataset.wpDayPanel === day;
          panel.hidden = !show;
        });
        kpiEls.forEach((el) => {
          const val = el.dataset[`wpDay${day.charAt(0).toUpperCase()}${day.slice(1)}`];
          if (val) el.textContent = val;
        });
        initLucide();
      }

      switcher.querySelectorAll('.wp-day-btn').forEach((btn) => {
        btn.addEventListener('click', () => setDay(btn.dataset.day || 'today'));
      });

      setDay('today');
    });
  }

  function initOutletSwitcher() {
    const root = document.getElementById('outlet-detail-root');
    if (!root) return;

    const panels = root.querySelectorAll('.wp-outlet-panel');
    const buttons = root.querySelectorAll('.wp-outlet-type-btn');

    function setType(type) {
      buttons.forEach((btn) => {
        const on = btn.dataset.outletType === type;
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      panels.forEach((panel) => {
        panel.classList.toggle('active', panel.dataset.outletType === type);
      });
      initLucide();
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => setType(btn.dataset.outletType));
    });

    const initial = root.dataset.outletType || 'van_only';
    setType(initial);
  }

  function initFleetMap() {
    const root = document.getElementById('fleet-map-root');
    if (!root) return;

    const svg = root.querySelector('.wp-corridor-map__svg');
    const list = root.querySelector('.wp-fleet-list');
    const stopList = root.querySelector('.wp-fleet-stop-list');
    const titleEl = root.querySelector('[data-fleet-selected-title]');
    let selectedId = 'VEH037';

    function renderStops(id) {
      if (!stopList) return;
      const stops = FLEET_MAP_STOPS[id] || [];
      if (!stops.length) {
        stopList.innerHTML = '<p class="wp-subtext">No active stops, vehicle at depot or loading.</p>';
        return;
      }
      stopList.innerHTML = stops
        .map((stop) => {
          const chip =
            stop.status === 'done'
              ? '<span class="mc-status-chip mc-status-chip-ok">Done</span>'
              : stop.status === 'now'
                ? '<span class="mc-status-chip mc-status-chip-info">Now</span>'
                : '<span class="mc-status-chip mc-status-chip-muted">Pending</span>';
          return `<div class="screen-list-item"><span>${stop.label}</span>${chip}</div>`;
        })
        .join('');
    }

    function selectVehicle(id) {
      selectedId = id;
      const meta = FLEET_MAP_VEHICLES.find((v) => v.id === id);
      if (titleEl && meta) {
        titleEl.textContent = `${meta.id} · ${meta.route} · ${meta.stops} stops`;
      }
      list?.querySelectorAll('.wp-fleet-list-item').forEach((item) => {
        item.classList.toggle('active', item.dataset.vehicle === id);
      });
      svg?.querySelectorAll('.wp-fleet-map-vehicle').forEach((g) => {
        g.classList.toggle('is-selected', g.dataset.vehicle === id);
      });
      renderStops(id);
    }

    list?.querySelectorAll('.wp-fleet-list-item').forEach((item) => {
      item.addEventListener('click', () => selectVehicle(item.dataset.vehicle));
    });

    svg?.querySelectorAll('.wp-fleet-map-vehicle').forEach((g) => {
      g.addEventListener('click', () => selectVehicle(g.dataset.vehicle));
    });

    selectVehicle(selectedId);
  }

  function initRouteSheet() {
    const sheet = document.getElementById('route-sheet');
    if (!sheet) return;

    sheet.querySelectorAll('.cab-stop-head').forEach((head) => {
      head.addEventListener('click', () => {
        const stop = head.closest('.cab-stop');
        const open = stop.classList.toggle('is-open');
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    const search = document.getElementById('cab-search');
    const chips = sheet.querySelectorAll('[data-cab-filter]');
    let filter = 'all';

    function apply() {
      const query = (search?.value || '').trim().toLowerCase();
      sheet.querySelectorAll('.cab-stop').forEach((stop) => {
        const status = stop.dataset.status || '';
        const hay = stop.dataset.query || '';
        const statusOk = filter === 'all' || status === filter;
        const queryOk = !query || hay.includes(query);
        stop.classList.toggle('is-hidden', !(statusOk && queryOk));
      });
    }

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        filter = chip.dataset.cabFilter || 'all';
        chips.forEach((item) => {
          const on = item === chip;
          item.classList.toggle('is-on', on);
          item.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        apply();
      });
    });

    search?.addEventListener('input', apply);
  }

  function getHeadingColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--wp-heading').trim() || '#1A1C1C';
  }

  function refreshSignaturePadTheme() {
    const pad = document.getElementById('signature-pad');
    if (!pad) return;
    const ctx = pad.getContext('2d');
    if (ctx) ctx.strokeStyle = getHeadingColor();
  }

  function initSignaturePad() {
    const pad = document.getElementById('signature-pad');
    if (!pad) return;
    let drawing = false;
    const ctx = pad.getContext('2d');
    const rect = () => pad.getBoundingClientRect();

    function resize() {
      pad.width = pad.offsetWidth;
      pad.height = pad.offsetHeight;
      ctx.strokeStyle = getHeadingColor();
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    }
    resize();
    window.addEventListener('resize', resize);

    function pos(e) {
      const r = rect();
      const x = (e.clientX || e.touches?.[0]?.clientX) - r.left;
      const y = (e.clientY || e.touches?.[0]?.clientY) - r.top;
      return { x, y };
    }

    const start = (e) => {
      drawing = true;
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      e.preventDefault();
    };
    const move = (e) => {
      if (!drawing) return;
      const p = pos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      e.preventDefault();
    };
    const end = () => {
      drawing = false;
    };

    pad.addEventListener('mousedown', start);
    pad.addEventListener('mousemove', move);
    pad.addEventListener('mouseup', end);
    pad.addEventListener('mouseleave', end);
    pad.addEventListener('touchstart', start, { passive: false });
    pad.addEventListener('touchmove', move, { passive: false });
    pad.addEventListener('touchend', end);

    document.getElementById('clear-signature')?.addEventListener('click', () => {
      ctx.clearRect(0, 0, pad.width, pad.height);
    });
  }

  function initTableFilters() {
    const table = document.getElementById('order-queue-table');
    if (!table) return;
    const rows = table.querySelectorAll('tbody tr');
    const brand = document.getElementById('filter-brand');
    const district = document.getElementById('filter-district');
    const temp = document.getElementById('filter-temp');
    const constraint = document.getElementById('filter-constraint');
    const searchInput = document.getElementById('filter-search');

    function apply() {
      const b = brand?.value || '';
      const d = district?.value || '';
      const t = temp?.value || '';
      const c = constraint?.value || '';
      const q = searchInput?.value?.toLowerCase() || '';

      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        const show =
          (!b || row.dataset.brand === b) &&
          (!d || row.dataset.district === d) &&
          (!t || row.dataset.temp === t) &&
          (!c || row.dataset.constraint === c || (c === 'none' && !row.dataset.constraint)) &&
          (!q || text.includes(q));
        row.classList.toggle('wp-hidden', !show);
      });
    }

    [brand, district, temp, constraint].forEach((el) => el?.addEventListener('change', apply));
    searchInput?.addEventListener('input', apply);

    // Row click opens order detail drawer
    rows.forEach((row) => {
      row.addEventListener('click', (e) => {
        // don't trigger if clicked on checkbox
        if (e.target.tagName === 'INPUT' || e.target.closest('input')) return;
        const drawer = document.getElementById('order-detail-drawer');
        if (!drawer) return;

        // Populate drawer with row's details
        const orderId = row.querySelector('.order-id')?.textContent || 'ORD-9821';
        const outlet = row.querySelector('.order-outlet')?.textContent || 'OUT001 Fresh Galle Rd';
        const brand = row.dataset.brand || 'Fresh';
        const weight = row.querySelector('.order-weight')?.textContent || '1,420 kg';
        const temp = row.dataset.temp || 'ambient';
        const time = row.querySelector('.order-time')?.textContent || '14:22:10';

        const dId = document.getElementById('drawer-order-id');
        const dOutlet = document.getElementById('drawer-order-outlet');
        const dBrand = document.getElementById('drawer-order-brand');
        const dWeight = document.getElementById('drawer-order-weight');
        const dTemp = document.getElementById('drawer-order-temp');
        const dTime = document.getElementById('drawer-order-time');

        if (dId) dId.textContent = orderId;
        if (dOutlet) dOutlet.textContent = outlet;
        if (dBrand) dBrand.textContent = brand;
        if (dWeight) dWeight.textContent = weight;
        if (dTemp) dTemp.textContent = temp.toUpperCase();
        if (dTime) dTime.textContent = time;

        window.wpOpenDrawer(drawer);
      });
    });

    // Bulk selection counter
    const masterCb = document.getElementById('select-all-orders');
    const rowCbs = table.querySelectorAll('tbody input[type="checkbox"]');
    const countBadge = document.getElementById('selected-orders-count');
    const bulkBar = document.getElementById('bulk-action-bar');

    function updateCount() {
      const checked = table.querySelectorAll('tbody input[type="checkbox"]:checked').length;
      if (countBadge) countBadge.textContent = String(checked);
      if (bulkBar) bulkBar.classList.toggle('wp-hidden', checked === 0);
    }

    if (masterCb) {
      masterCb.addEventListener('change', () => {
        rowCbs.forEach((cb) => { cb.checked = masterCb.checked; });
        updateCount();
      });
    }
    rowCbs.forEach((cb) => cb.addEventListener('change', updateCount));
  }

  function initChecklist() {
    const loadList = document.getElementById('dock-load-list');
    if (!loadList) return;

    const checkboxes = loadList.querySelectorAll('input[type="checkbox"]');
    const progressBar = document.getElementById('load-progress-bar');
    const progressText = document.getElementById('load-progress-text');
    const signoffBtn = document.getElementById('departure-signoff');
    const slots = document.querySelectorAll('.wp-cargo-slot');

    function updateProgress() {
      const all = loadList.querySelectorAll('input[type="checkbox"]');
      if (!all.length) return;
      const checked = loadList.querySelectorAll('input[type="checkbox"]:checked').length;
      const pct = Math.round((checked / all.length) * 100);
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (progressText) progressText.textContent = `${checked}/${all.length}`;
      if (signoffBtn) signoffBtn.disabled = checked < all.length;
      updateDockVerificationChart(checked);

      loadList.querySelectorAll('.dock-load-line').forEach((line) => {
        const cb = line.querySelector('input[type="checkbox"]');
        line.classList.toggle('verified', cb?.checked);
      });

      slots.forEach((slot, idx) => {
        if (idx < checked) {
          slot.className = 'wp-cargo-slot loaded';
        } else if (idx === checked) {
          slot.className = 'wp-cargo-slot active';
        } else {
          slot.className = 'wp-cargo-slot pending';
        }
      });
    }

    checkboxes.forEach((cb) => {
      cb.addEventListener('change', updateProgress);
    });

    const scanBtn = document.getElementById('btn-simulate-scan');
    if (scanBtn) {
      scanBtn.addEventListener('click', () => {
        const unchecked = loadList.querySelector('input[type="checkbox"]:not(:checked)');
        if (unchecked) {
          unchecked.checked = true;
          updateProgress();
        }
      });
    }
    updateProgress();
  }

  function initQueueViewSwitcher() {
    const switcher = document.getElementById('queue-view-switcher');
    const tableView = document.getElementById('queue-table-view');
    const cardsView = document.getElementById('queue-cards-view');
    if (!switcher || !tableView || !cardsView) return;

    switcher.querySelectorAll('.wp-view-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        switcher.querySelectorAll('.wp-view-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        if (view === 'table') {
          tableView.classList.remove('wp-hidden');
          cardsView.classList.add('wp-hidden');
        } else {
          tableView.classList.add('wp-hidden');
          cardsView.classList.remove('wp-hidden');
        }
      });
    });

    document.querySelectorAll('#queue-cards-view .wp-corridor-card').forEach((card) => {
      card.addEventListener('click', () => {
        const orderId = card.dataset.orderId || 'DEL-88401';
        const row = document.querySelector(`tr[data-order-id="${orderId}"]`);
        if (row) {
          row.click();
        } else {
          const drawer = document.getElementById('order-detail-drawer');
          if (drawer) window.wpOpenDrawer(drawer);
        }
      });
    });
  }

  function initExceptionFilters() {
    const table = document.getElementById('exception-table');
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    const cards = document.querySelectorAll('#exception-cards-view .wp-corridor-card');
    const typeFilter = document.getElementById('exception-filter-type');
    const severityFilter = document.getElementById('exception-filter-severity');
    const searchInput = document.getElementById('exception-filter-search');

    function apply() {
      const t = typeFilter?.value || '';
      const s = severityFilter?.value || '';
      const q = searchInput?.value?.toLowerCase() || '';

      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        const show =
          (!t || row.dataset.type === t) &&
          (!s || row.dataset.severity === s) &&
          (!q || text.includes(q));
        row.classList.toggle('wp-hidden', !show);
      });

      cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        const show =
          (!t || card.dataset.type === t) &&
          (!s || card.dataset.severity === s) &&
          (!q || text.includes(q));
        card.classList.toggle('wp-hidden', !show);
      });
    }

    [typeFilter, severityFilter].forEach((el) => el?.addEventListener('change', apply));
    searchInput?.addEventListener('input', apply);

    rows.forEach((row) => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.exception-action')) return;
        const drawerId = row.dataset.drawer;
        if (!drawerId) return;
        const drawer = document.getElementById(drawerId);
        if (drawer) window.wpOpenDrawer(drawer);
      });
    });
  }

  function initExceptionViewSwitcher() {
    const switcher = document.getElementById('exception-view-switcher');
    const tableView = document.getElementById('exception-table-view');
    const cardsView = document.getElementById('exception-cards-view');
    if (!switcher || !tableView || !cardsView) return;

    switcher.querySelectorAll('.wp-view-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        switcher.querySelectorAll('.wp-view-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        if (view === 'table') {
          tableView.classList.remove('wp-hidden');
          cardsView.classList.add('wp-hidden');
        } else {
          tableView.classList.add('wp-hidden');
          cardsView.classList.remove('wp-hidden');
        }
      });
    });

    document.querySelectorAll('#exception-cards-view .wp-corridor-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.exception-action')) return;
        const drawerId = card.dataset.drawer;
        if (!drawerId) return;
        const drawer = document.getElementById(drawerId);
        if (drawer) window.wpOpenDrawer(drawer);
      });
    });
  }

  function closeAllExportMenus() {
    document.querySelectorAll('.wp-export-dropdown.open').forEach((menu) => {
      menu.classList.remove('open');
    });
  }

  function flattenCellText(cell) {
    const clone = cell.cloneNode(true);
    clone.querySelectorAll('button, img, input').forEach((el) => el.remove());
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  function getExportableColumns(table) {
    const headers = Array.from(table.querySelectorAll('thead th'));
    const skipIndices = new Set();

    headers.forEach((th, index) => {
      const text = th.textContent.trim().toLowerCase();
      if (th.querySelector('input[type="checkbox"]') || text === 'action' || text === '') {
        skipIndices.add(index);
      }
    });

    return { headers, skipIndices };
  }

  function getVisibleTableRows(table) {
    return Array.from(table.querySelectorAll('tbody tr')).filter((row) => !row.classList.contains('wp-hidden'));
  }

  function getTableExportData(table) {
    const { headers, skipIndices } = getExportableColumns(table);
    const headerLabels = headers
      .map((th, index) => (skipIndices.has(index) ? null : th.textContent.trim()))
      .filter(Boolean);

    const rows = getVisibleTableRows(table).map((row) => {
      const cells = Array.from(row.querySelectorAll('td'));
      return cells
        .map((cell, index) => (skipIndices.has(index) ? null : flattenCellText(cell)))
        .filter((value) => value !== null);
    });

    return { headerLabels, rows };
  }

  function getExportFilename(table) {
    const pageTitle = document.title.split('·')[0].trim() || 'export';
    const tableId = table.id || 'table';
    const date = new Date().toISOString().slice(0, 10);
    const slug = pageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `${slug}-${tableId}-${date}`;
  }

  function exportTableCSV(table) {
    const { headerLabels, rows } = getTableExportData(table);
    const escape = (value) => {
      const text = String(value ?? '');
      if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
      return text;
    };

    const lines = [headerLabels.map(escape).join(',')];
    rows.forEach((row) => lines.push(row.map(escape).join(',')));

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${getExportFilename(table)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function loadExportScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function showExportError(dropdown, message) {
    let errorEl = dropdown.querySelector('.wp-export-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'wp-export-error';
      dropdown.appendChild(errorEl);
    }
    errorEl.textContent = message;
    setTimeout(() => errorEl.remove(), 4000);
  }

  async function exportTablePDF(table) {
    await loadExportScript('https://unpkg.com/jspdf@2.5.2/dist/jspdf.umd.min.js');
    await loadExportScript('https://unpkg.com/jspdf-autotable@3.8.4/dist/jspdf.plugin.autotable.min.js');

    const { jsPDF } = window.jspdf;
    const { headerLabels, rows } = getTableExportData(table);
    const doc = new jsPDF({
      orientation: headerLabels.length > 5 ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const title = document.title.split('·')[0].trim() || 'Table Export';

    doc.setFontSize(14);
    doc.text(title, 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Exported ${new Date().toLocaleString()}`, 14, 22);

    doc.autoTable({
      head: [headerLabels],
      body: rows,
      startY: 28,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [55, 122, 139] },
    });

    doc.save(`${getExportFilename(table)}.pdf`);
  }

  const chartInstances = new Map();

  function getChartColor(token, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
    return value || fallback;
  }

  function getChartPalette() {
    return {
      primary: getChartColor('--wp-primary', '#377A8B'),
      success: getChartColor('--wp-success', '#16A34A'),
      error: getChartColor('--wp-error', '#DC2626'),
      warning: getChartColor('--wp-warning', '#D97706'),
      info: getChartColor('--wp-info', '#2563EB'),
      muted: getChartColor('--wp-muted', '#6B7280'),
      subtext: getChartColor('--wp-subtext', '#5C6464'),
      border: getChartColor('--wp-border-sub', '#E8E6E1'),
      heading: getChartColor('--wp-heading', '#1A1C1C'),
    };
  }

  function paletteForIndex(colors, index) {
    const order = [colors.primary, colors.info, colors.warning, colors.success, colors.error, colors.muted];
    return order[index % order.length];
  }

  function buildChartOptions(type, spec, colors) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const base = {
      responsive: true,
      maintainAspectRatio: false,
      animation: reducedMotion ? false : { duration: 500 },
      plugins: {
        legend: {
          display: type === 'doughnut' || type === 'radar' || spec.stacked || spec.dualAxis,
          position: type === 'doughnut' ? 'bottom' : 'top',
          labels: {
            color: colors.subtext,
            font: { family: "'Nunito Sans', sans-serif", size: 11 },
            boxWidth: 10,
            padding: 12,
          },
        },
        tooltip: {
          backgroundColor: colors.heading,
          titleFont: { family: "'Rubik', sans-serif", size: 12 },
          bodyFont: { family: "'Nunito Sans', sans-serif", size: 11 },
          padding: 10,
          cornerRadius: 6,
        },
      },
    };

    if (type === 'line') {
      base.scales = {
        x: {
          grid: { color: colors.border, drawBorder: false },
          ticks: { color: colors.muted, font: { size: 10 } },
        },
        y: {
          grid: { color: colors.border, drawBorder: false },
          ticks: { color: colors.muted, font: { size: 10 } },
        },
      };
      if (spec.dualAxis) {
        base.scales.y1 = {
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: colors.muted, font: { size: 10 } },
        };
      }
    }

    if (type === 'bar') {
      base.indexAxis = spec.horizontal ? 'y' : 'x';
      base.scales = {
        x: {
          stacked: !!spec.stacked,
          grid: { color: spec.horizontal ? 'transparent' : colors.border, drawBorder: false },
          ticks: { color: colors.muted, font: { size: 10 } },
        },
        y: {
          stacked: !!spec.stacked,
          grid: { color: spec.horizontal ? colors.border : 'transparent', drawBorder: false },
          ticks: { color: colors.muted, font: { size: 10 } },
        },
      };
    }

    if (type === 'radar') {
      base.scales = {
        r: {
          angleLines: { color: colors.border },
          grid: { color: colors.border },
          pointLabels: { color: colors.subtext, font: { size: 11 } },
          ticks: {
            display: false,
            backdropColor: 'transparent',
          },
          suggestedMin: 0,
          suggestedMax: 100,
        },
      };
    }

    if (type === 'doughnut') {
      base.cutout = '62%';
    }

    return base;
  }

  function buildChartData(spec, colors) {
    const type = spec.type;
    if (type === 'line') {
      const ds = spec.datasets[0];
      const datasets = spec.datasets.map((dataset, index) => ({
        label: dataset.label,
        data: dataset.data,
        borderColor: index === 0 ? colors.primary : colors.info,
        backgroundColor: spec.fill
          ? `${index === 0 ? colors.primary : colors.info}33`
          : `${index === 0 ? colors.primary : colors.info}22`,
        fill: !!spec.fill || false,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: index === 0 ? colors.primary : colors.info,
        yAxisID: dataset.yAxisID || 'y',
      }));
      if (ds.target !== undefined) {
        datasets.push({
          label: 'Target',
          data: spec.labels.map(() => ds.target),
          borderColor: colors.warning,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
        });
      }
      return { labels: spec.labels, datasets };
    }

    if (type === 'bar') {
      if (spec.stacked && spec.datasets.length > 1) {
        return {
          labels: spec.labels,
          datasets: spec.datasets.map((dataset, index) => ({
            label: dataset.label,
            data: dataset.data,
            backgroundColor: paletteForIndex(colors, index),
            borderRadius: 4,
            borderSkipped: false,
          })),
        };
      }
      const barColors = spec.labels.map((_, index) => {
        if (spec.horizontal && index === spec.labels.length - 1 && spec.labels.includes('Pending Deferrals')) {
          return colors.warning;
        }
        if (spec.horizontal && spec.labels.includes('Overrun') && index === 1) {
          return colors.error;
        }
        return paletteForIndex(colors, index);
      });
      return {
        labels: spec.labels,
        datasets: [{
          label: spec.datasets[0].label,
          data: spec.datasets[0].data,
          backgroundColor: barColors,
          borderRadius: 4,
          borderSkipped: false,
        }],
      };
    }

    if (type === 'doughnut') {
      return {
        labels: spec.labels,
        datasets: [{
          data: spec.datasets[0].data,
          backgroundColor: spec.labels.map((_, index) => paletteForIndex(colors, index)),
          borderWidth: 0,
        }],
      };
    }

    if (type === 'radar') {
      return {
        labels: spec.labels,
        datasets: [{
          label: spec.datasets[0].label,
          data: spec.datasets[0].data,
          borderColor: colors.primary,
          backgroundColor: `${colors.primary}33`,
          pointBackgroundColor: colors.primary,
        }],
      };
    }

    return { labels: spec.labels, datasets: [] };
  }

  function loadChartScript() {
    return new Promise((resolve, reject) => {
      if (typeof Chart !== 'undefined') {
        resolve();
        return;
      }
      const src = 'assets/chart.umd.min.js';
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Chart.js failed to load')), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Chart.js failed to load'));
      document.head.appendChild(script);
    });
  }

  function renderAnalyticsChart(canvas) {
    if (!canvas || typeof Chart === 'undefined' || !window.WP_ANALYTICS) return null;
    const key = canvas.dataset.chartKey;
    const spec = window.WP_ANALYTICS[key];
    if (!spec) return null;

    const existing = chartInstances.get(canvas);
    if (existing) existing.destroy();

    const colors = getChartPalette();
    const type = spec.type === 'doughnut' ? 'doughnut' : spec.type;
    const chart = new Chart(canvas, {
      type,
      data: buildChartData(spec, colors),
      options: buildChartOptions(type, spec, colors),
    });
    chartInstances.set(canvas, chart);
    return chart;
  }

  function renderAnalyticsChartSafe(canvas) {
    try {
      return renderAnalyticsChart(canvas);
    } catch (error) {
      console.error(`Waypoint chart failed (${canvas?.dataset?.chartKey || 'unknown'}):`, error);
      return null;
    }
  }

  function refreshChartsForTheme() {
    if (!window.WP_ANALYTICS || typeof Chart === 'undefined') return;
    chartInstances.forEach((chart) => chart.destroy());
    chartInstances.clear();
    document.querySelectorAll('[data-wp-chart], [data-wp-chart-defer]').forEach((canvas) => {
      delete canvas.dataset.chartInit;
    });
    document.querySelectorAll('[data-wp-chart]:not([data-wp-chart-defer])').forEach((canvas) => {
      canvas.dataset.chartInit = 'true';
      renderAnalyticsChartSafe(canvas);
    });
    document.querySelectorAll('[data-wp-chart-defer]').forEach((canvas) => {
      if (canvas.offsetParent !== null) {
        canvas.dataset.chartInit = 'true';
        renderAnalyticsChartSafe(canvas);
      }
    });
  }

  async function initAnalyticsCharts() {
    if (!window.WP_ANALYTICS) return;

    try {
      await loadChartScript();
    } catch (error) {
      console.warn('Waypoint analytics unavailable:', error.message);
      return;
    }

    document.querySelectorAll('[data-wp-chart]:not([data-wp-chart-defer])').forEach((canvas) => {
      if (canvas.dataset.chartInit) return;
      canvas.dataset.chartInit = 'true';
      if (canvas.dataset.chartAria) canvas.setAttribute('aria-label', canvas.dataset.chartAria);
      else if (window.WP_ANALYTICS[canvas.dataset.chartKey]?.ariaLabel) {
        canvas.setAttribute('aria-label', window.WP_ANALYTICS[canvas.dataset.chartKey].ariaLabel);
      }
      canvas.setAttribute('role', 'img');
      renderAnalyticsChartSafe(canvas);
    });

    document.querySelectorAll('[data-wp-chart-defer]').forEach((canvas) => {
      canvas.setAttribute('role', 'img');
      if (window.WP_ANALYTICS[canvas.dataset.chartKey]?.ariaLabel) {
        canvas.setAttribute('aria-label', window.WP_ANALYTICS[canvas.dataset.chartKey].ariaLabel);
      }
    });

    function initDeferredChartsInDrawer(drawer) {
      if (!drawer) return;
      window.setTimeout(() => {
        drawer.querySelectorAll('[data-wp-chart-defer]').forEach((canvas) => {
          if (!canvas.dataset.chartInit) {
            canvas.dataset.chartInit = 'true';
            renderAnalyticsChartSafe(canvas);
          } else {
            chartInstances.get(canvas)?.resize();
          }
        });
      }, 280);
    }

    if (typeof window.wpOpenDrawer === 'function') {
      const originalOpenDrawer = window.wpOpenDrawer;
      window.wpOpenDrawer = (drawer) => {
        originalOpenDrawer(drawer);
        initDeferredChartsInDrawer(drawer);
      };
    }

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const canvas = entry.target.querySelector('[data-wp-chart]');
          chartInstances.get(canvas)?.resize();
        });
      });
      document.querySelectorAll('.wp-chart-canvas-wrap').forEach((wrap) => observer.observe(wrap));
    }
  }

  function updateDockVerificationChart(checked) {
    const canvas = document.querySelector('[data-chart-key="dock-verification"]');
    if (!canvas) return;
    const data = [0, 1, 2, 3, 4, 5, 6].map((step) => Math.min(checked, step));
    const chart = chartInstances.get(canvas);
    if (chart) {
      chart.data.datasets[0].data = data;
      chart.update();
      return;
    }
    if (!canvas.dataset.chartInit) {
      canvas.dataset.chartInit = 'true';
      renderAnalyticsChartSafe(canvas);
      updateDockVerificationChart(checked);
    }
  }

  window.wpUpdateDockVerificationChart = updateDockVerificationChart;

  function initTableExport() {
    document.querySelectorAll('.wp-table-wrap').forEach((wrap) => {
      const table = wrap.querySelector('table.wp-table');
      if (!table || wrap.dataset.exportInit) return;
      wrap.dataset.exportInit = 'true';

      const toolbar = document.createElement('div');
      toolbar.className = 'wp-table-toolbar';

      const menu = document.createElement('div');
      menu.className = 'wp-export-menu';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'wp-btn wp-btn-outline wp-export-btn';
      button.style.cssText = 'padding:0.35rem 0.75rem;font-size:0.75rem';
      button.innerHTML = '<i data-lucide="download"></i><span>Export</span>';

      const dropdown = document.createElement('div');
      dropdown.className = 'wp-export-dropdown';
      dropdown.setAttribute('role', 'menu');
      dropdown.innerHTML =
        '<button type="button" data-export="csv" role="menuitem"><i data-lucide="file-spreadsheet"></i><span>CSV</span></button>' +
        '<button type="button" data-export="pdf" role="menuitem"><i data-lucide="file-text"></i><span>PDF</span></button>';

      menu.appendChild(button);
      menu.appendChild(dropdown);
      toolbar.appendChild(menu);

      const scroll = document.createElement('div');
      scroll.className = 'wp-table-scroll';
      table.parentNode.insertBefore(scroll, table);
      scroll.appendChild(table);
      wrap.insertBefore(toolbar, scroll);

      initLucide();

      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = dropdown.classList.contains('open');
        closeAllExportMenus();
        if (!isOpen) dropdown.classList.add('open');
      });

      dropdown.querySelector('[data-export="csv"]').addEventListener('click', (event) => {
        event.stopPropagation();
        exportTableCSV(table);
        dropdown.classList.remove('open');
      });

      dropdown.querySelector('[data-export="pdf"]').addEventListener('click', async (event) => {
        event.stopPropagation();
        try {
          await exportTablePDF(table);
        } catch (error) {
          showExportError(dropdown, 'PDF export failed. Check connection.');
        }
        dropdown.classList.remove('open');
      });
    });

    document.addEventListener('click', closeAllExportMenus);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeAllExportMenus();
    });
  }

  function isAgentLive() {
    try {
      return sessionStorage.getItem(AGENT_LIVE_KEY) === 'true';
    } catch (error) {
      return false;
    }
  }

  function getAgentStatus() {
    try {
      return sessionStorage.getItem(AGENT_STATUS_KEY) || '';
    } catch (error) {
      return '';
    }
  }

  function setAgentStatus(status) {
    try {
      if (status) sessionStorage.setItem(AGENT_STATUS_KEY, status);
      else sessionStorage.removeItem(AGENT_STATUS_KEY);
    } catch (error) {
      /* ignore */
    }
    updateAgentStatusChip();
  }

  function getCurrentPageLabel() {
    const page = getCurrentPage();
    if (page) return page.label;
    const title = document.querySelector('.wp-topbar-title');
    return title ? title.textContent.trim() : 'Waypoint';
  }

  function setAgentLive(live, status) {
    try {
      if (live) sessionStorage.setItem(AGENT_LIVE_KEY, 'true');
      else {
        sessionStorage.removeItem(AGENT_LIVE_KEY);
        sessionStorage.removeItem(AGENT_SPOTLIGHT_KEY);
      }
    } catch (error) {
      /* ignore */
    }

    if (live) {
      const nextStatus = status || `Watching ${getCurrentPageLabel()}`;
      setAgentStatus(nextStatus);
    } else {
      setAgentStatus('');
    }

    applyAgentLiveState();
  }

  function updateAgentToggleButton() {
    const toggle = document.querySelector('[data-wp-agent-toggle]');
    if (!toggle) return;
    const live = isAgentLive();
    toggle.classList.toggle('is-active', live);
    toggle.setAttribute('aria-pressed', live ? 'true' : 'false');
    toggle.setAttribute('aria-label', live ? 'Deactivate Waypoint Agent' : 'Activate Waypoint Agent');
    toggle.title = live ? 'Agent active — click to deactivate' : 'Activate Waypoint Agent';
  }

  function updateAgentStatusChip() {
    const chip = document.querySelector('[data-wp-agent-status]');
    if (!chip) return;
    const live = isAgentLive();
    const status = getAgentStatus();
    chip.hidden = !live;
    if (!live) return;
    const label = chip.querySelector('[data-wp-agent-status-label]');
    if (label) label.textContent = status || `Watching ${getCurrentPageLabel()}`;
  }

  function ensureAgentShell() {
    if (document.body.classList.contains('wp-login')) return;

    if (!document.querySelector('[data-wp-agent-glow]')) {
      const glow = document.createElement('div');
      glow.className = 'wp-agent-glow';
      glow.setAttribute('data-wp-agent-glow', '');
      glow.setAttribute('aria-hidden', 'true');
      document.body.appendChild(glow);
    }

    if (!document.querySelector('[data-wp-agent-status]')) {
      const chip = document.createElement('a');
      chip.href = 'agent.html';
      chip.className = 'wp-agent-status-chip';
      chip.setAttribute('data-wp-agent-status', '');
      chip.hidden = true;
      chip.innerHTML =
        '<span class="wp-agent-status-pulse" aria-hidden="true"></span>' +
        '<i data-lucide="bot"></i>' +
        '<span data-wp-agent-status-label>Agent active</span>' +
        '<i data-lucide="message-square" class="wp-agent-status-chat"></i>';
      document.body.appendChild(chip);
    }
  }

  function getAgentDegState() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    if (path !== 'agent.html') return 'ready';
    const state = new URLSearchParams(window.location.search).get('state');
    if (state === 'offline' || state === 'unavailable') return state;
    return 'ready';
  }

  function initAgentDegTabs() {
    const tabs = document.querySelector('[data-wp-agent-deg-tabs]');
    if (!tabs) return;
    const degState = getAgentDegState();
    tabs.querySelectorAll('[data-agent-deg]').forEach((tab) => {
      const active = tab.getAttribute('data-agent-deg') === degState;
      tab.classList.toggle('is-active', active);
      if (active) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });
  }

  function renderAgentDegBanner(thread, state) {
    const isOffline = state === 'offline';
    const bannerClass = isOffline ? 'wp-agent-deg-banner--offline' : 'wp-agent-deg-banner--unavailable';
    const icon = isOffline ? 'cloud-off' : 'bot-off';
    const title = isOffline ? 'Offline' : 'Model unavailable';
    const message = isOffline
      ? 'No connection. Waypoint Agent cannot reach the model. Chat and voice are paused until you are back online.'
      : 'The model is unavailable. Answers and site actions are paused.';
    const retryHtml = isOffline
      ? ''
      : '<a href="agent.html" class="wp-btn wp-btn-primary"><i data-lucide="refresh-cw"></i> Retry connection</a>';

    thread.innerHTML =
      `<div class="wp-agent-deg-banner ${bannerClass}" role="alert">` +
      `<div class="wp-agent-deg-banner-head"><i data-lucide="${icon}"></i><span>${title}</span></div>` +
      `<p>${message}</p>${retryHtml}</div>`;
    initLucide();
  }

  function updateAgentPageStatus() {
    const statusEl = document.querySelector('[data-wp-agent-page-status]');
    if (!statusEl) return;

    const degState = getAgentDegState();
    statusEl.classList.remove('is-live', 'is-offline', 'is-unavailable');

    if (degState === 'offline') {
      statusEl.textContent = 'Offline — cannot reach model';
      statusEl.classList.add('is-offline');
      return;
    }
    if (degState === 'unavailable') {
      statusEl.textContent = 'Model unavailable — retry to reconnect';
      statusEl.classList.add('is-unavailable');
      return;
    }
    if (isAgentLive()) {
      statusEl.textContent = 'Live on site — edge glow active';
      statusEl.classList.add('is-live');
      return;
    }
    statusEl.textContent = 'Ready to help with chat or voice';
  }

  function applyAgentLiveState() {
    if (document.body.classList.contains('wp-login')) return;
    ensureAgentShell();
    document.body.classList.toggle('wp-agent-live', isAgentLive());
    updateAgentToggleButton();
    updateAgentStatusChip();
    updateAgentPageStatus();
    initLucide();
  }

  function clearAgentSpotlights() {
    document.querySelectorAll('.wp-agent-spotlight').forEach((el) => {
      el.classList.remove('wp-agent-spotlight');
    });
  }

  function initAgentSpotlight() {
    if (!isAgentLive()) return;

    let spotlightPage = '';
    try {
      spotlightPage = sessionStorage.getItem(AGENT_SPOTLIGHT_KEY) || '';
    } catch (error) {
      spotlightPage = '';
    }

    if (!spotlightPage) return;

    const path = window.location.pathname.split('/').pop() || 'index.html';
    if (path !== spotlightPage) return;

    const selector = WP_AGENT_SPOTLIGHTS[spotlightPage];
    if (!selector) return;

    const target = document.querySelector(selector);
    if (!target) return;

    clearAgentSpotlights();
    target.classList.add('wp-agent-spotlight');
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
      sessionStorage.removeItem(AGENT_SPOTLIGHT_KEY);
    } catch (error) {
      /* ignore */
    }
  }

  function createAgentToggleButton() {
    const wrap = document.createElement('div');
    wrap.className = 'wp-agent-controls';

    const chatLink = document.createElement('a');
    chatLink.href = 'agent.html';
    chatLink.className = 'wp-icon-btn wp-agent-chat-link';
    chatLink.setAttribute('aria-label', 'Open Waypoint Agent chat');
    chatLink.title = 'Open Agent chat';
    chatLink.innerHTML = '<i data-lucide="message-square"></i>';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'wp-btn wp-btn-outline wp-agent-toggle';
    toggle.setAttribute('data-wp-agent-toggle', '');
    toggle.setAttribute('aria-pressed', 'false');
    toggle.innerHTML = '<i data-lucide="audio-waveform"></i><span>Agent</span>';
    toggle.addEventListener('click', () => {
      setAgentLive(!isAgentLive());
    });

    wrap.appendChild(chatLink);
    wrap.appendChild(toggle);
    return wrap;
  }

  function initAgentToggle() {
    if (document.body.classList.contains('wp-login')) return;

    ensureAgentShell();
    applyAgentLiveState();

    const topbarRight = document.querySelector('.wp-topbar-right');
    if (topbarRight && !topbarRight.querySelector('[data-wp-agent-toggle]')) {
      const controls = createAgentToggleButton();
      const themeToggle = topbarRight.querySelector('[data-wp-theme-toggle]');
      if (themeToggle) topbarRight.insertBefore(controls, themeToggle);
      else topbarRight.insertBefore(controls, topbarRight.firstChild);
      initLucide();
      updateAgentToggleButton();
    }

    initAgentSpotlight();
    syncAgentStatusForPage();
  }

  function syncAgentStatusForPage() {
    if (!isAgentLive()) return;
    try {
      if (sessionStorage.getItem(AGENT_SPOTLIGHT_KEY)) return;
    } catch (error) {
      /* ignore */
    }
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const current = getAgentStatus();
    if (current && current.startsWith('Opened')) {
      const actionDef = WP_AGENT_ACTIONS.find((item) => item.status === current);
      if (actionDef && actionDef.href === path) return;
    }
    setAgentStatus(`Watching ${getCurrentPageLabel()}`);
  }

  function shouldSpeakAgentReply() {
    try {
      return sessionStorage.getItem(AGENT_VOICE_REPLY_KEY) === 'true';
    } catch (error) {
      return false;
    }
  }

  function setSpeakAgentReply(enabled) {
    try {
      if (enabled) sessionStorage.setItem(AGENT_VOICE_REPLY_KEY, 'true');
      else sessionStorage.removeItem(AGENT_VOICE_REPLY_KEY);
    } catch (error) {
      /* ignore */
    }
  }

  function speakAgentReply(text) {
    if (!shouldSpeakAgentReply() || !window.speechSynthesis) return;
    const plain = text.replace(/<[^>]+>/g, '');
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }

  function dismissAgentWelcome(thread) {
    const welcome = thread.querySelector('[data-wp-agent-welcome]');
    if (welcome) welcome.remove();
  }

  function appendAgentMessage(thread, role, html, extraClass) {
    dismissAgentWelcome(thread);

    const row = document.createElement('div');
    const rowClass = extraClass ? ` ${extraClass}` : '';
    row.className = `wp-agent-msg-row wp-agent-msg-row--${role}${rowClass}`;

    if (role === 'agent') {
      row.innerHTML =
        '<span class="wp-agent-msg-avatar" aria-hidden="true"><i data-lucide="bot"></i></span>' +
        `<div class="wp-agent-msg wp-agent-msg--agent">${html}</div>`;
    } else {
      row.innerHTML = `<div class="wp-agent-msg wp-agent-msg--user">${html}</div>`;
    }

    thread.appendChild(row);
    thread.scrollTop = thread.scrollHeight;
    initLucide();
    return row;
  }

  function renderAgentWelcome(thread) {
    const welcome = document.createElement('div');
    welcome.className = 'wp-agent-welcome';
    welcome.setAttribute('data-wp-agent-welcome', '');
    welcome.innerHTML =
      '<div class="wp-agent-msg-row wp-agent-msg-row--agent">' +
      '<span class="wp-agent-msg-avatar" aria-hidden="true"><i data-lucide="bot"></i></span>' +
      '<div class="wp-agent-welcome-card">' +
      '<p>Hi — I\'m Waypoint Agent. Ask about today\'s operations or request a screen change. Navigation actions need your approval.</p>' +
      '<div class="wp-agent-suggestions" aria-label="Suggested prompts">' +
      '<button type="button" class="wp-agent-prompt" data-wp-agent-prompt="How many orders today?">Orders today</button>' +
      '<button type="button" class="wp-agent-prompt" data-wp-agent-prompt="What is the cutoff time?">Cutoff time</button>' +
      '<button type="button" class="wp-agent-prompt" data-wp-agent-prompt="Open exceptions">Open exceptions</button>' +
      '<button type="button" class="wp-agent-prompt" data-wp-agent-prompt="Open fleet allocation">Fleet allocation</button>' +
      '</div></div></div>';
    thread.appendChild(welcome);
    initLucide();
  }

  function renderAgentAuthCard(thread, actionDef, fromVoice) {
    const card = appendAgentMessage(
      thread,
      'agent',
      `<div class="wp-agent-auth-card">
        <div class="wp-agent-auth-head">
          <i data-lucide="shield-check"></i>
          <strong>Authorization required</strong>
        </div>
        <p class="wp-subtext">I can open <strong>${actionDef.label}</strong> for you.</p>
        <p class="wp-agent-auth-desc">${actionDef.description}</p>
        <div class="wp-agent-auth-actions">
          <button type="button" class="wp-btn wp-btn-primary" data-wp-agent-allow="${actionDef.id}">Allow</button>
          <button type="button" class="wp-btn wp-btn-outline" data-wp-agent-deny="${actionDef.id}">Deny</button>
        </div>
      </div>`,
      'wp-agent-msg-row--auth'
    );

    initLucide();

    card.querySelector('[data-wp-agent-allow]').addEventListener('click', () => {
      setAgentLive(true, actionDef.status);
      try {
        sessionStorage.setItem(AGENT_SPOTLIGHT_KEY, actionDef.href);
      } catch (error) {
        /* ignore */
      }
      setSpeakAgentReply(fromVoice);
      window.location.href = actionDef.href;
    });

    card.querySelector('[data-wp-agent-deny]').addEventListener('click', () => {
      appendAgentMessage(
        thread,
        'agent',
        'Understood — I won\'t navigate without your approval. Ask me anything else or try a different action.'
      );
      speakAgentReply('Action cancelled.');
    });
  }

  function handleAgentQuery(thread, query, fromVoice) {
    const text = (query || '').trim();
    if (!text) return;

    appendAgentMessage(thread, 'user', text.replace(/</g, '&lt;'));

    const actionDef = WP_AGENT_ACTIONS.find((item) => item.match.test(text));
    if (actionDef) {
      appendAgentMessage(
        thread,
        'agent',
        `I can take you to <strong>${actionDef.label}</strong>. Please confirm below.`
      );
      renderAgentAuthCard(thread, actionDef, fromVoice);
      speakAgentReply(`I can open ${actionDef.label}. Please confirm.`);
      return;
    }

    const answerDef = WP_AGENT_ANSWERS.find((item) => item.match.test(text));
    if (answerDef) {
      appendAgentMessage(thread, 'agent', answerDef.reply);
      speakAgentReply(answerDef.reply);
      return;
    }

    const fallback =
      'I can answer questions about <strong>orders today</strong>, <strong>cutoff time</strong>, <strong>active fleet</strong>, and <strong>open exceptions</strong>. ' +
      'I can also open Exceptions, Order Queue, Fleet Allocation, or Cutoff after you approve.';
    appendAgentMessage(thread, 'agent', fallback);
    speakAgentReply(fallback);
  }

  function initAgentChat() {
    const thread = document.querySelector('[data-wp-agent-thread]');
    const composer = document.querySelector('[data-wp-agent-composer]');
    const input = document.querySelector('[data-wp-agent-input]');
    const micBtn = document.querySelector('[data-wp-agent-mic]');
    const chatSection = document.querySelector('[data-wp-agent-chat]');
    if (!thread || !composer || !input) return;

    const degState = getAgentDegState();
    const isDegraded = degState !== 'ready';

    initAgentDegTabs();
    updateAgentPageStatus();

    if (chatSection) {
      chatSection.classList.toggle('is-degraded', isDegraded);
    }

    if (!thread.dataset.agentInit) {
      thread.dataset.agentInit = 'true';
      if (isDegraded) renderAgentDegBanner(thread, degState);
      else renderAgentWelcome(thread);
    }

    composer.addEventListener('submit', (event) => {
      event.preventDefault();
      if (getAgentDegState() !== 'ready') return;
      const value = input.value.trim();
      if (!value) return;
      handleAgentQuery(thread, value, false);
      input.value = '';
      input.focus();
    });

    thread.addEventListener('click', (event) => {
      if (getAgentDegState() !== 'ready') return;
      const promptBtn = event.target.closest('[data-wp-agent-prompt]');
      if (!promptBtn || !thread.contains(promptBtn)) return;
      const prompt = promptBtn.getAttribute('data-wp-agent-prompt');
      handleAgentQuery(thread, prompt, false);
    });

    if (isDegraded) {
      input.disabled = true;
      input.placeholder = degState === 'offline'
        ? 'Offline — messaging paused'
        : 'Model unavailable — retry to continue';
      const sendBtn = composer.querySelector('[type="submit"]');
      if (sendBtn) sendBtn.setAttribute('disabled', 'disabled');
      if (micBtn) {
        micBtn.disabled = true;
        micBtn.title = degState === 'offline'
          ? 'Voice unavailable while offline'
          : 'Voice unavailable while model is down';
        micBtn.setAttribute('aria-label', micBtn.title);
      }
      return;
    }

    if (!micBtn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      micBtn.disabled = true;
      micBtn.title = 'Voice input not supported in this browser — type your question instead';
      micBtn.setAttribute('aria-label', 'Voice input unavailable');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    let listening = false;

    recognition.addEventListener('start', () => {
      listening = true;
      micBtn.classList.add('is-listening');
      micBtn.setAttribute('aria-pressed', 'true');
      micBtn.setAttribute('aria-label', 'Listening…');
    });

    recognition.addEventListener('end', () => {
      listening = false;
      micBtn.classList.remove('is-listening');
      micBtn.setAttribute('aria-pressed', 'false');
      micBtn.setAttribute('aria-label', 'Ask with voice');
    });

    recognition.addEventListener('result', (event) => {
      const transcript = event.results[0][0].transcript;
      setSpeakAgentReply(true);
      handleAgentQuery(thread, transcript, true);
      setSpeakAgentReply(false);
    });

    recognition.addEventListener('error', () => {
      appendAgentMessage(
        thread,
        'agent',
        'I couldn\'t catch that. Please try again or type your question.'
      );
    });

    micBtn.addEventListener('click', () => {
      if (listening) {
        recognition.stop();
        return;
      }
      setSpeakAgentReply(true);
      recognition.start();
    });
  }

  const MC_LAYOUT_KEY = 'wp-mc-layout-v1';
  const MC_ZONES = ['metrics', 'main', 'rail', 'fullwidth'];
  const MC_GROUP_LABELS = {
    metrics: 'Metrics',
    charts: 'Charts',
    operations: 'Operations',
  };
  const MC_GROUP_ICONS = {
    metrics: 'bar-chart-2',
    charts: 'line-chart',
    operations: 'boxes',
  };
  const MC_WIDGET_ICONS = {
    'stat-orders': 'package',
    'stat-fleet': 'truck',
    'stat-sla': 'target',
    'stat-exceptions': 'alert-circle',
    'chart-sla': 'trending-up',
    'ops-dock': 'warehouse',
    'chart-cutoff': 'clock',
    'chart-intake': 'pie-chart',
    'chart-fleet-util': 'gauge',
    'metric-cutoff': 'timer',
    'chart-deferral': 'calendar-clock',
    'chart-forecast': 'activity',
    'ops-incidents': 'alert-triangle',
    'ops-feed': 'radio',
    'ops-runs': 'list-ordered',
    'ops-hubs': 'map-pin',
  };

  function initMissionWidgets() {
    const board = document.querySelector('[data-mc-board]');
    if (!board) return;

    const stage = document.querySelector('.wp-stage');
    const library = document.querySelector('[data-mc-library]');
    const libraryBody = document.querySelector('[data-mc-library-body]');
    const backdrop = document.querySelector('[data-mc-library-backdrop]');
    const customizeBtn = document.querySelector('[data-mc-customize-toggle]');
    const defaultLayout = captureMcLayout();
    let currentLayout = cloneMcLayout(loadMcLayout() || defaultLayout);

    ensureMcEditBars();
    buildMcLibrary(libraryBody);
    applyMcLayout(currentLayout);
    syncMcLibrary(currentLayout);
    updateMcMoveButtons(currentLayout);

    function getMcWidget(id) {
      return document.querySelector(`[data-mc-widget="${id}"]`);
    }

    function getMcZoneEl(zone) {
      return board.querySelector(`[data-mc-zone="${zone}"]`);
    }

    function captureMcLayout() {
      const layout = { zones: {} };
      MC_ZONES.forEach((zone) => {
        const zoneEl = getMcZoneEl(zone);
        if (!zoneEl) return;
        layout.zones[zone] = [];
        zoneEl.querySelectorAll(':scope > .mc-widget').forEach((widget) => {
          const id = widget.getAttribute('data-mc-widget');
          if (!widget.classList.contains('mc-widget--hidden')) {
            layout.zones[zone].push(id);
          }
        });
      });
      return layout;
    }

    function cloneMcLayout(layout) {
      const zones = {};
      MC_ZONES.forEach((zone) => {
        zones[zone] = Array.isArray(layout.zones?.[zone]) ? [...layout.zones[zone]] : [];
      });
      return { zones };
    }

    function loadMcLayout() {
      try {
        const raw = localStorage.getItem(MC_LAYOUT_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.zones) return null;
        return cloneMcLayout(parsed);
      } catch (error) {
        return null;
      }
    }

    function saveMcLayout(layout) {
      currentLayout = cloneMcLayout(layout);
      try {
        localStorage.setItem(MC_LAYOUT_KEY, JSON.stringify(currentLayout));
      } catch (error) {
        /* ignore */
      }
    }

    function applyMcLayout(layout) {
      MC_ZONES.forEach((zone) => {
        const zoneEl = getMcZoneEl(zone);
        const order = layout.zones[zone] || [];
        if (!zoneEl) return;

        order.forEach((id) => {
          const widget = getMcWidget(id);
          if (!widget || widget.getAttribute('data-mc-zone') !== zone) return;
          widget.classList.remove('mc-widget--hidden');
          zoneEl.appendChild(widget);
        });

        zoneEl.querySelectorAll(':scope > .mc-widget').forEach((widget) => {
          const id = widget.getAttribute('data-mc-widget');
          if (!order.includes(id)) {
            widget.classList.add('mc-widget--hidden');
          }
        });
      });
      updateMcMoveButtons(layout);
    }

    function isMcOnBoard(id, layout) {
      const widget = getMcWidget(id);
      if (!widget) return false;
      const zone = widget.getAttribute('data-mc-zone');
      return (layout.zones[zone] || []).includes(id);
    }

    function syncMcLibrary(layout) {
      if (!libraryBody) return;
      libraryBody.querySelectorAll('.mc-widget-library-item').forEach((item) => {
        const id = item.getAttribute('data-mc-library-id');
        const onBoard = isMcOnBoard(id, layout);
        item.classList.toggle('is-on-board', onBoard);
      });
    }

    function updateMcMoveButtons(layout) {
      MC_ZONES.forEach((zone) => {
        const order = layout.zones[zone] || [];
        order.forEach((id, index) => {
          const widget = getMcWidget(id);
          if (!widget) return;
          const upBtn = widget.querySelector('[data-mc-move="up"]');
          const downBtn = widget.querySelector('[data-mc-move="down"]');
          if (upBtn) upBtn.disabled = index === 0;
          if (downBtn) downBtn.disabled = index === order.length - 1;
        });
      });
    }

    function addMcWidget(id) {
      const widget = getMcWidget(id);
      if (!widget) return;
      const zone = widget.getAttribute('data-mc-zone');
      const layout = cloneMcLayout(currentLayout);
      if (!layout.zones[zone]) layout.zones[zone] = [];
      if (!layout.zones[zone].includes(id)) layout.zones[zone].push(id);
      applyMcLayout(layout);
      saveMcLayout(layout);
      syncMcLibrary(layout);
      initLucide();
    }

    function removeMcWidget(id) {
      const widget = getMcWidget(id);
      if (!widget) return;
      const zone = widget.getAttribute('data-mc-zone');
      const layout = cloneMcLayout(currentLayout);
      layout.zones[zone] = (layout.zones[zone] || []).filter((item) => item !== id);
      applyMcLayout(layout);
      saveMcLayout(layout);
      syncMcLibrary(layout);
      initLucide();
    }

    function moveMcWidget(id, direction) {
      const widget = getMcWidget(id);
      if (!widget) return;
      const zone = widget.getAttribute('data-mc-zone');
      const layout = cloneMcLayout(currentLayout);
      const order = layout.zones[zone] || [];
      const index = order.indexOf(id);
      if (index < 0) return;
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= order.length) return;
      order.splice(index, 1);
      order.splice(target, 0, id);
      layout.zones[zone] = order;
      applyMcLayout(layout);
      saveMcLayout(layout);
      syncMcLibrary(layout);
      initLucide();
    }

    function resetMcLayout() {
      const layout = cloneMcLayout(defaultLayout);
      applyMcLayout(layout);
      saveMcLayout(layout);
      syncMcLibrary(layout);
      initLucide();
    }

    function setMcCustomizing(active) {
      if (!stage) return;
      stage.classList.toggle('is-customizing', active);
      if (customizeBtn) customizeBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
      if (library) library.setAttribute('aria-hidden', active ? 'false' : 'true');
      const useBackdrop = window.innerWidth <= 1100;
      if (backdrop) {
        backdrop.classList.toggle('is-visible', active && useBackdrop);
        if (active && useBackdrop) backdrop.removeAttribute('hidden');
        else backdrop.setAttribute('hidden', '');
      }
      if (active) {
        syncMcLibrary(currentLayout);
        updateMcMoveButtons(currentLayout);
        initLucide();
      }
    }

    function ensureMcEditBars() {
      board.querySelectorAll('[data-mc-widget]').forEach((widget) => {
        if (widget.querySelector('.mc-widget-edit')) return;
        const name = widget.getAttribute('data-mc-name') || widget.getAttribute('data-mc-widget');
        const bar = document.createElement('div');
        bar.className = 'mc-widget-edit';
        bar.innerHTML =
          `<span class="mc-widget-edit-name">${name}</span>` +
          '<div class="mc-widget-edit-actions">' +
          '<button type="button" class="wp-icon-btn" data-mc-move="up" aria-label="Move up"><i data-lucide="chevron-up"></i></button>' +
          '<button type="button" class="wp-icon-btn" data-mc-move="down" aria-label="Move down"><i data-lucide="chevron-down"></i></button>' +
          '<button type="button" class="wp-icon-btn" data-mc-remove aria-label="Remove widget"><i data-lucide="x"></i></button>' +
          '</div>';
        widget.insertBefore(bar, widget.firstChild);
      });
    }

    function buildMcLibrary(container) {
      if (!container) return;
      const widgets = [...board.querySelectorAll('[data-mc-widget]')];
      const groups = {};

      widgets.forEach((widget) => {
        const group = widget.getAttribute('data-mc-group') || 'operations';
        if (!groups[group]) groups[group] = [];
        groups[group].push(widget);
      });

      container.innerHTML = '';
      Object.keys(MC_GROUP_LABELS).forEach((groupKey) => {
        if (!groups[groupKey]?.length) return;
        const section = document.createElement('section');
        section.className = 'mc-widget-library-group';
        section.innerHTML = `<h3 class="mc-widget-library-group-title">${MC_GROUP_LABELS[groupKey]}</h3>`;

        groups[groupKey].forEach((widget) => {
          const id = widget.getAttribute('data-mc-widget');
          const name = widget.getAttribute('data-mc-name') || id;
          const zone = widget.getAttribute('data-mc-zone');
          const icon = MC_WIDGET_ICONS[id] || MC_GROUP_ICONS[groupKey] || 'layout-grid';
          const item = document.createElement('div');
          item.className = 'mc-widget-library-item';
          item.setAttribute('data-mc-library-id', id);
          item.innerHTML =
            `<span class="mc-widget-library-item-icon"><i data-lucide="${icon}"></i></span>` +
            '<div class="mc-widget-library-item-body">' +
            `<span class="mc-widget-library-item-name">${name}</span>` +
            `<span class="mc-widget-library-item-meta">${MC_GROUP_LABELS[groupKey]} · ${zone}</span>` +
            '</div>' +
            '<span class="mc-widget-library-onboard">On board</span>' +
            `<button type="button" class="wp-btn wp-btn-outline" data-mc-add="${id}">Add</button>`;
          section.appendChild(item);
        });

        container.appendChild(section);
      });
    }

    customizeBtn?.addEventListener('click', () => {
      setMcCustomizing(!stage.classList.contains('is-customizing'));
    });

    document.querySelector('[data-mc-library-close]')?.addEventListener('click', () => {
      setMcCustomizing(false);
    });

    backdrop?.addEventListener('click', () => {
      setMcCustomizing(false);
    });

    document.querySelector('[data-mc-reset]')?.addEventListener('click', () => {
      resetMcLayout();
    });

    board.addEventListener('click', (event) => {
      const moveBtn = event.target.closest('[data-mc-move]');
      if (moveBtn) {
        event.preventDefault();
        const widget = moveBtn.closest('[data-mc-widget]');
        const id = widget?.getAttribute('data-mc-widget');
        if (id) moveMcWidget(id, moveBtn.getAttribute('data-mc-move'));
        return;
      }

      const removeBtn = event.target.closest('[data-mc-remove]');
      if (removeBtn) {
        event.preventDefault();
        const widget = removeBtn.closest('[data-mc-widget]');
        const id = widget?.getAttribute('data-mc-widget');
        if (id) removeMcWidget(id);
      }
    });

    library?.addEventListener('click', (event) => {
      const addBtn = event.target.closest('[data-mc-add]');
      if (!addBtn) return;
      event.preventDefault();
      const id = addBtn.getAttribute('data-mc-add');
      if (id) addMcWidget(id);
    });

    window.addEventListener('resize', () => {
      if (!stage.classList.contains('is-customizing')) return;
      const useBackdrop = window.innerWidth <= 1100;
      if (backdrop) {
        backdrop.classList.toggle('is-visible', useBackdrop);
        if (useBackdrop) backdrop.removeAttribute('hidden');
        else backdrop.setAttribute('hidden', '');
      }
    });
  }

  function initDebtLock() {
    document.querySelectorAll('[data-debt-lock]').forEach((form) => {
      const submitBtn = form.querySelector('[data-debt-submit]');
      const overrideCheck = form.querySelector('[data-debt-override]');
      const overrideReason = form.querySelector('[data-debt-override-reason]');
      if (!submitBtn || !overrideCheck) return;

      function syncDebtLock() {
        const unlocked = overrideCheck.checked && overrideReason?.value.trim().length > 0;
        submitBtn.disabled = !unlocked;
        if (overrideReason) overrideReason.disabled = !overrideCheck.checked;
      }

      overrideCheck.addEventListener('change', syncDebtLock);
      overrideReason?.addEventListener('input', syncDebtLock);
      syncDebtLock();
    });
  }

  function initDecisionChoices() {
    document.querySelectorAll('[data-decision-choices]').forEach((group) => {
      group.querySelectorAll('[data-decision-choice]').forEach((choice) => {
        choice.addEventListener('click', () => {
          group.querySelectorAll('[data-decision-choice]').forEach((item) => {
            item.setAttribute('aria-pressed', 'false');
          });
          choice.setAttribute('aria-pressed', 'true');
        });
      });
    });

    document.querySelectorAll('[data-legal-swap]').forEach((group) => {
      group.querySelectorAll('[data-legal-swap-choice]').forEach((choice) => {
        choice.addEventListener('click', () => {
          group.querySelectorAll('[data-legal-swap-choice]').forEach((item) => {
            item.setAttribute('aria-pressed', 'false');
          });
          choice.setAttribute('aria-pressed', 'true');
        });
      });
    });
  }

  function initDecisionAids() {
    initDebtLock();
    initDecisionChoices();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initLogoMark();
    initNavRegistry();
    initResponsiveShell();
    initLucide();
    initCutoffClock();
    initCommandPalette();
    initDrawers();
    initAllocationBoard();
    initNetworkStatus();
    initDaySwitcher();
    initOutletSwitcher();
    initFleetMap();
    initRouteSheet();
    initSignaturePad();
    initTableFilters();
    initChecklist();
    initQueueViewSwitcher();
    initExceptionFilters();
    initExceptionViewSwitcher();
    initTableExport();
    initAnalyticsCharts();
    initMissionWidgets();
    initDecisionAids();
    initAgentToggle();
    initAgentChat();
  });
})();
