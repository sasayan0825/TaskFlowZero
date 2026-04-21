// ================================================================
//  plugin/plugins.js  - TaskFlowZero プラグインマニフェスト
//  このファイルはプラグイン管理UIから自動生成されます。
// ================================================================

(function () {
  'use strict';

  const PLUGINS = [
    'plugin_lang.js',
  ];

  var base = (function () {
    var scripts = document.querySelectorAll('script[src]');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src;
      if (src.indexOf('plugins.js') !== -1) {
        return src.substring(0, src.lastIndexOf('/') + 1);
      }
    }
    return 'plugin/';
  })();

  function loadNext(index) {
    if (index >= PLUGINS.length) return;
    var s = document.createElement('script');
    s.src = base + PLUGINS[index];
    s.onload  = function () { loadNext(index + 1); };
    s.onerror = function () {
      console.warn('[plugins.js] not found: ' + PLUGINS[index]);
      loadNext(index + 1);
    };
    document.head.appendChild(s);
  }

  loadNext(0);
})();
