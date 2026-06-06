// カラーテーマの定数（6種類）
const THEMES = ['light', 'dark', 'spring', 'summer', 'autumn', 'winter'];

// テーマを適用し、ブラウザ（LocalStorage）に保存する関数
function applyTheme(themeName) {
  // 定数リストに存在しないテーマが指定された場合はlightをデフォルトとする
  if (!THEMES.includes(themeName)) {
    themeName = 'light';
  }
  
  // bodyタグのデータ属性にテーマ名を設定（CSSでこれを基準に色を変える）
  document.body.setAttribute('data-theme', themeName);
  
  // 次回アクセス時のために保存
  localStorage.setItem('calendar_theme', themeName);
}

// ページ読み込み時に、保存されていたテーマを復元する処理
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('calendar_theme') || 'light';
  applyTheme(savedTheme);
});