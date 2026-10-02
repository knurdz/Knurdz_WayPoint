/* Waypoint Logistics: mock analytics datasets (dispatcher-forecast only) */
(function () {
  'use strict';

  window.WP_ANALYTICS = {
    'forecast-capacity': {
      type: 'bar',
      ariaLabel: 'Next week forecast volume cubic metres by depot',
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        { label: 'Peliyagoda m³', data: [420, 445, 510, 480, 620, 390, 360] },
        { label: 'Kandy m³', data: [88, 92, 105, 98, 118, 76, 72] },
      ],
    },
  };
})();
