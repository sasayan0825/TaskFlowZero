// ================================================================
//  plugin/plugins.js  - TaskFlow プラグインマニフェスト
//
//  このファイルを編集してプラグインを追加・削除してください。
//  taskflow.html の編集は不要です。
//
//  【追加方法】
//    1. plugin_xxx.js をこのフォルダ（plugin/）に置く
//    2. 下の PLUGINS 配列にファイル名を追記する
//
//  【削除・無効化方法】
//    該当行を削除するか、先頭に // を付けてコメントアウトする
// ================================================================

(function () {
  'use strict';

  // ロードするプラグインファイル名の一覧（plugin/ フォルダからの相対パス）
  const PLUGINS = [
    'plugin_lang.js',         // 言語切り替え（日本語 ⇔ 英語）
  ];

  // ── 以下は編集不要 ──────────────────────────────────────
  // ロード順を保証しながら順次読み込む
  var base = (function () {
    // このスクリプト自身のパスから plugin/ フォルダのベースURLを算出
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
