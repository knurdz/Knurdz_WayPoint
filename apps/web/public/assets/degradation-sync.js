/**
 * Shared degradation state tabs: reads/writes ?state= query param.
 */
(function () {
  const VALID_STATES = ['offline', 'queued', 'syncing', 'synced', 'conflict', 'resolved'];

  function getStateFromUrl(defaultState) {
    const state = new URLSearchParams(window.location.search).get('state');
    return VALID_STATES.includes(state) ? state : defaultState;
  }

  function setStateInUrl(state) {
    const url = new URL(window.location.href);
    url.searchParams.set('state', state);
    window.history.replaceState({}, '', url);
  }

  window.DegSync = {
    VALID_STATES,
    getStateFromUrl,
    setStateInUrl,
    init: function init(options) {
      const defaultState = options.defaultState || 'offline';
      const tabs = document.querySelectorAll('[data-deg-state]');
      const panels = document.querySelectorAll('[data-deg-panel]');

      function apply(state) {
        tabs.forEach(function (tab) {
          const active = tab.getAttribute('data-deg-state') === state;
          tab.classList.toggle('is-active', active);
          tab.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        panels.forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-deg-panel') !== state;
        });
        if (typeof options.onStateChange === 'function') {
          options.onStateChange(state);
        }
        setStateInUrl(state);
      }

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          apply(tab.getAttribute('data-deg-state'));
        });
      });

      apply(getStateFromUrl(defaultState));
      return { apply };
    },
  };
})();
