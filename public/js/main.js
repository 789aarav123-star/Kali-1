/**
 * Kali Hotel & Restaurant — front-end behaviour.
 *
 *  1. Mobile navigation (accessible open/close, Escape to dismiss)
 *  2. Header shadow + back-to-top button on scroll
 *  3. Menu category tabs (roving tabindex, arrow-key navigation, live region)
 *  4. Scroll reveal for content blocks
 *  5. Toast notifications
 */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ *
   * 1. Mobile navigation
   * ------------------------------------------------------------------ */
  function initMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('mobile-menu');
    var openIcon = document.getElementById('nav-icon-open');
    var closeIcon = document.getElementById('nav-icon-close');
    if (!toggle || !menu) return;

    function setOpen(isOpen) {
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
      menu.classList.toggle('hidden', !isOpen);
      if (openIcon) openIcon.classList.toggle('hidden', isOpen);
      if (closeIcon) closeIcon.classList.toggle('hidden', !isOpen);
    }

    setOpen(false);

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------ *
   * 2. Header shadow + back to top
   * ------------------------------------------------------------------ */
  function initScrollChrome() {
    var header = document.getElementById('site-header');
    var toTop = document.getElementById('back-to-top');

    function onScroll() {
      var scrolled = window.scrollY > 24;
      if (header) header.classList.toggle('shadow-lg', scrolled);
      if (toTop) {
        toTop.classList.toggle('hidden', !scrolled);
        toTop.classList.toggle('flex', scrolled);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    }
  }

  /* ------------------------------------------------------------------ *
   * 3. Menu category tabs
   * ------------------------------------------------------------------ */
  function initMenuTabs() {
    var tablist = document.getElementById('menu-tabs');
    var grid = document.getElementById('menu-grid');
    var status = document.getElementById('menu-status');
    if (!tablist || !grid) return;

    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-category]'));
    if (!tabs.length) return;

    function labelFor(filter) {
      for (var i = 0; i < tabs.length; i += 1) {
        if (tabs[i].getAttribute('data-filter') === filter) {
          return tabs[i].textContent.trim();
        }
      }
      return '';
    }

    function activate(filter, options) {
      var visible = 0;
      cards.forEach(function (card) {
        var show = filter === 'all' || card.getAttribute('data-category') === filter;
        card.classList.toggle('is-hidden', !show);
        if (show) visible += 1;
      });

      tabs.forEach(function (tab) {
        var isActive = tab.getAttribute('data-filter') === filter;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      if (grid.hasAttribute('aria-labelledby')) {
        grid.setAttribute('aria-labelledby', 'tab-' + filter);
      }

      if (status) {
        status.textContent =
          filter === 'all'
            ? 'Showing all ' + visible + ' dishes.'
            : 'Showing ' + visible + (visible === 1 ? ' dish' : ' dishes') + ' in ' + labelFor(filter) + '.';
      }

      if (options && options.focus) {
        var active = tabs.filter(function (tab) {
          return tab.getAttribute('data-filter') === filter;
        })[0];
        if (active) active.focus();
      }
    }

    tablist.addEventListener('click', function (event) {
      var tab = event.target.closest('[role="tab"]');
      if (!tab) return;
      activate(tab.getAttribute('data-filter'));
    });

    tablist.addEventListener('keydown', function (event) {
      var current = tabs.indexOf(document.activeElement);
      if (current === -1) return;
      var next = null;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          next = (current + 1) % tabs.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          next = (current - 1 + tabs.length) % tabs.length;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = tabs.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      activate(tabs[next].getAttribute('data-filter'), { focus: true });
    });
  }

  /* ------------------------------------------------------------------ *
   * 4. Scroll reveal
   * ------------------------------------------------------------------ */
  function initReveal() {
    var targets = document.querySelectorAll(
      '#menu .menu-card, #celebrations li, #reviews article, #visit iframe, #visit .rounded-2xl'
    );
    if (!targets.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var siblings = Array.prototype.slice.call(
            entry.target.parentElement ? entry.target.parentElement.children : []
          );
          var index = Math.min(siblings.indexOf(entry.target), 5);
          entry.target.style.transitionDelay = index * 70 + 'ms';
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    targets.forEach(function (el) {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------ *
   * 5. Toasts
   * ------------------------------------------------------------------ */
  var TOAST_ICONS = {
    success:
      '<svg class="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 1.8l2.35 4.76 5.25.77-3.8 3.7.9 5.23L10 13.94l-4.7 2.32.9-5.23-3.8-3.7 5.25-.77L10 1.8Z"/></svg>',
    error:
      '<svg class="mt-0.5 h-5 w-5 shrink-0 text-red-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 1.6 1.9 17.2h16.2L10 1.6Zm0 4.9c.5 0 .9.4.9.9v4.2a.9.9 0 1 1-1.8 0V7.4c0-.5.4-.9.9-.9Zm0 8.2a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/></svg>',
    info:
      '<svg class="mt-0.5 h-5 w-5 shrink-0 text-gold-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 1.8a8.2 8.2 0 1 0 0 16.4 8.2 8.2 0 0 0 0-16.4Zm1 12.6H9v-6h2v6Zm0-7.6H9V4.6h2v2.2Z"/></svg>',
  };

  function showToast(type, title, message, timeout) {
    var region = document.getElementById('toast-region');
    if (!region) return;

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'info');
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

    var icon = document.createElement('span');
    icon.innerHTML = TOAST_ICONS[type] || TOAST_ICONS.info;

    var body = document.createElement('div');
    var titleEl = document.createElement('span');
    titleEl.className = 'toast-title';
    titleEl.textContent = title;
    var msgEl = document.createElement('span');
    msgEl.className = 'toast-message';
    msgEl.textContent = message || '';
    body.appendChild(titleEl);
    if (message) body.appendChild(msgEl);

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast-close';
    close.setAttribute('aria-label', 'Dismiss notification');
    close.innerHTML =
      '<svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>';
    close.addEventListener('click', function () {
      toast.remove();
    });

    toast.appendChild(icon);
    toast.appendChild(body);
    toast.appendChild(close);
    region.appendChild(toast);

    var duration = timeout || (type === 'error' ? 9000 : 7000);
    window.setTimeout(function () {
      if (toast.parentNode) toast.remove();
    }, duration);
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  function init() {
    document.documentElement.classList.add('reveal-ready');
    initMobileNav();
    initScrollChrome();
    initMenuTabs();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.KaliHotel = { showToast: showToast };
})();
