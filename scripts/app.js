import { quotes } from './quotes.js';
import { palettes } from './palettes.js';
import { storage } from './storage.js';
import { WaterShader } from './shader.js';

// Simplified to Traditional Chinese mapping for color names and sources
const s2tDict = {
  '黄': '黃', '绿': '綠', '蓝': '藍', '红': '紅', '兰': '蘭',
  '麦': '麥', '壳': '殼', '榄': '欖', '驼': '駝', '鸡': '雞',
  '阳': '陽', '罂': '罌', '树': '樹', '经典': '經典', '传统': '傳統',
  '国': '國', '浅': '淺', '经典色': '經典色', '传统色': '傳統色',
  '东': '東', '西': '西', '南': '南', '北': '北', '风': '風',
  '叶': '葉', '双': '雙', '无': '無', '华': '華', '秋': '秋',
  '鱼': '魚', '龙': '龍', '大': '大', '银': '銀', '赭': '赭',
  '绛': '絳', '余': '餘', '极': '極', '光': '光', '欢': '歡',
  '艳': '艷', '顶': '頂', '鹅': '鵝', '满': '滿', '枣': '棗',
  '猪': '豬', '头': '頭', '鹞': '鷂', '温': '溫', '锦': '錦',
  '蝇': '蠅', '鸟': '鳥', '莱': '萊', '螺': '螺', '网': '網',
  '赛': '賽', '车': '車', '铁': '鐵', '桥': '橋', '尘': '塵',
  '烂': '爛', '晓': '曉', '盖': '蓋', '万': '萬', '烬': '燼',
  '初': '初', '粉': '粉', '玉': '玉', '可': '可', '沙': '沙',
  '罗': '羅', '满': '滿', '枣': '棗', '肝': '肝', '苋': '莧',
  '菜': '菜', '温': '溫', '桲': '桲', '豇': '豇', '豆': '豆',
  '葵': '葵', '背': '背', '灰': '灰', '蝇': '蠅', '卵': '卵',
  '李': '李', '茄': '茄', '皮': '皮', '吊': '吊', '钟': '鐘',
  '草': '草', '珠': '珠', '黎': '黎', '背': '背', '糖': '糖',
  '莱': '萊', '松': '松', '螺': '螺', '法': '法', '落': '落',
  '播': '播', '奥': '奧', '克': '克', '莱': '萊', '德': '德',
  '塞': '塞', '内': '內', '卡': '卡', '爱': '愛', '因': '因',
  '斯': '斯', '坦': '坦', '莎': '莎', '士': '士', '比': '比',
  '亚': '亞', '纽': '紐', '约': '約', '丽': '麗', '铁': '鐵',
  '珊瑚': '珊瑚', '经典色': '經典色', '传统色': '傳統色', '霁': '霽',
  '缥': '縹', '秆': '稈', '钴': '鈷', '绯': '緋', '泰': '泰',
  '尔': '爾', '薰': '薰', '蝥': '蝥', '酱': '醬', '睛': '睛',
  '鳃': '鰓', '竹': '竹', '茶': '茶', '海棠': '海棠', '夕': '夕',
  '覆': '覆', '盆': '盆', '子': '子', '貂': '貂'
};

function toTraditional(str) {
  if (!str) return '';
  return str.split('').map(c => s2tDict[c] || c).join('');
}

// Calculate subtle 5.5% theme color wash for background paper
function getTintedBgHex(hexColor) {
  hexColor = hexColor.replace('#', '');
  if (hexColor.length === 3) {
    hexColor = hexColor.split('').map(c => c + c).join('');
  }
  const num = parseInt(hexColor, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  const bgR = Math.round(252 * 0.945 + r * 0.055);
  const bgG = Math.round(252 * 0.945 + g * 0.055);
  const bgB = Math.round(251 * 0.945 + b * 0.055);

  return `#${bgR.toString(16).padStart(2, '0')}${bgG.toString(16).padStart(2, '0')}${bgB.toString(16).padStart(2, '0')}`;
}

// DOM elements
const quoteText = document.getElementById('quote-text');
const quoteAuthor = document.getElementById('quote-author');
const quoteTranslation = document.getElementById('quote-translation');

const colorBadge = document.getElementById('color-badge');
const colorOriginEl = document.getElementById('color-origin');
const colorNameZhEl = document.getElementById('color-name-zh');
const colorNameEnEl = document.getElementById('color-name-en');
const colorHexEl = document.getElementById('color-hex');

const nextBtn = document.getElementById('next-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsDrawer = document.getElementById('settings-drawer');
const settingsCloseBtn = document.getElementById('settings-close-btn');
const drawerOverlay = document.getElementById('drawer-overlay');

const searchEngineSelect = document.getElementById('search-engine-select');
const animationToggle = document.getElementById('animation-toggle');

const shaderCanvas = document.getElementById('shader-canvas');

// State variables
let currentQuoteIndex = 0;
let currentColorIndex = 0;
let searchEngine = 'https://www.google.com/search?q=';
let animationsEnabled = true;
let waterShader = null;

// Initialize app
async function init() {
  // Initialize WebGL Water Shader
  if (shaderCanvas) {
    waterShader = new WaterShader(shaderCanvas);
  }

  // Load saved preferences
  const prefs = await storage.get({
    searchEngine: 'https://www.google.com/search?q=',
    animationsEnabled: true
  });

  searchEngine = prefs.searchEngine;
  animationsEnabled = prefs.animationsEnabled;

  // Apply preferences to UI elements
  if (searchEngineSelect) searchEngineSelect.value = searchEngine;
  if (animationToggle) animationToggle.checked = animationsEnabled;

  // Always randomize quote and color on page load/refresh
  currentQuoteIndex = Math.floor(Math.random() * quotes.length);
  currentColorIndex = Math.floor(Math.random() * palettes.length);

  // Apply state
  applyAnimationState(animationsEnabled);
  displayQuote(currentQuoteIndex);
  displayColor(currentColorIndex);

  // Set up event listeners
  setupEventListeners();
}

function formatQuoteContent(text) {
  if (!text) return '';
  return `“ ${text.trim()} ”`;
}

// Display quote with animations
function displayQuote(index) {
  const quote = quotes[index];
  if (!quote) return;

  const container = document.querySelector('.quote-container');
  container.classList.remove('quote-fade-in');
  void container.offsetWidth; // Trigger reflow to restart CSS animation
  container.classList.add('quote-fade-in');

  quoteText.textContent = formatQuoteContent(quote.content);
  quoteAuthor.textContent = `— ${quote.author}`;
  quoteTranslation.textContent = quote.english || '';

  // Save current quote index
  storage.set({ lastQuoteIndex: index });
}

// Display single theme color and update custom property & WebGL shader
function displayColor(index) {
  const color = palettes[index];
  if (!color) return;

  colorBadge.classList.remove('badge-fade-in');
  void colorBadge.offsetWidth; // Trigger reflow to restart CSS animation
  colorBadge.classList.add('badge-fade-in');

  // Convert origin text to Traditional Chinese
  let originText = "傳統色彩";
  if (color.origin === "China") originText = "中國傳統色";
  else if (color.origin === "Japan") originText = "日本傳統色";
  else if (color.origin === "Western") originText = "西洋經典色";

  colorOriginEl.textContent = originText;
  
  // Use traditional character color name
  if (colorNameZhEl) colorNameZhEl.textContent = toTraditional(color.name);

  // Layout for the subtext line under color name
  if (colorNameEnEl) {
    if (color.origin === "China" || color.origin === "Japan") {
      // Hide subtext (no Pinyin) for Chinese and Japanese colors
      colorNameEnEl.textContent = '';
      colorNameEnEl.style.display = 'none';
    } else {
      // For Western colors, show original English name in the subtext slot (e.g. "Burgundy")
      colorNameEnEl.textContent = color.pinyin || '';
      colorNameEnEl.style.display = 'block';
    }
  }

  if (colorHexEl) colorHexEl.textContent = color.hex.toUpperCase();

  // Apply hex code to theme color & background paper tint wash
  document.documentElement.style.setProperty('--theme-color', color.hex);
  document.documentElement.style.setProperty('--bg-color', getTintedBgHex(color.hex));

  // Pass theme color hex code into WebGL FBM Water Shader
  if (waterShader) {
    waterShader.setThemeColor(color.hex);
  }

  // Save current color index
  storage.set({ lastColorIndex: index });
}

// Apply color mode (OS, Light, Dark)
function applyColorMode(mode) {
  const root = document.documentElement;
  if (mode === 'os') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', mode);
  }
}

// Apply background animation state
function applyAnimationState(enabled) {
  if (enabled) {
    document.body.classList.remove('animations-paused');
  } else {
    document.body.classList.add('animations-paused');
  }
  if (waterShader) {
    waterShader.setAnimationState(enabled);
  }
}

// Actions
function nextQuote() {
  currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
  displayQuote(currentQuoteIndex);
}

function prevQuote() {
  currentQuoteIndex = (currentQuoteIndex - 1 + quotes.length) % quotes.length;
  displayQuote(currentQuoteIndex);
}

function nextColor() {
  currentColorIndex = (currentColorIndex + 1) % palettes.length;
  displayColor(currentColorIndex);
}

function prevColor() {
  currentColorIndex = (currentColorIndex - 1 + palettes.length) % palettes.length;
  displayColor(currentColorIndex);
}

function nextQuoteAndColor() {
  nextQuote();
  nextColor();
}

// Event Listeners setup
function setupEventListeners() {
  // Clicking next btn
  nextBtn.addEventListener('click', nextQuoteAndColor);

  // Navigation shortcuts via keyboard
  window.addEventListener('keydown', (e) => {
    // If setting drawer is focused, don't trigger global shortcuts
    if (settingsDrawer.classList.contains('open') && settingsDrawer.contains(document.activeElement)) {
      return;
    }

    let handled = false;
    if (e.code === 'Space') {
      nextQuoteAndColor();
      handled = true;
    } else if (e.key === 'ArrowRight') {
      nextColor();
      handled = true;
    } else if (e.key === 'ArrowLeft') {
      prevColor();
      handled = true;
    } else if (e.key === 'ArrowDown') {
      nextQuote();
      handled = true;
    } else if (e.key === 'ArrowUp') {
      prevQuote();
      handled = true;
    }

    if (handled) {
      e.preventDefault();
    }
  });

  // Clicking Quote -> Search Quote text
  quoteText.addEventListener('click', () => {
    const quote = quotes[currentQuoteIndex];
    if (!quote) return;
    const query = `"${quote.content}" ${quote.author}`;
    window.open(searchEngine + encodeURIComponent(query), '_blank');
  });

  // Clicking Author -> Search Author
  quoteAuthor.addEventListener('click', () => {
    const quote = quotes[currentQuoteIndex];
    if (!quote) return;
    window.open(searchEngine + encodeURIComponent(quote.author), '_blank');
  });

  // Settings Drawer Toggle
  settingsBtn.addEventListener('click', openDrawer);
  settingsCloseBtn.addEventListener('click', closeDrawer);
  drawerOverlay.addEventListener('click', closeDrawer);

  // Preferred Search Engine Change
  if (searchEngineSelect) {
    searchEngineSelect.addEventListener('change', (e) => {
      searchEngine = e.target.value;
      storage.set({ searchEngine });
    });
  }

  // Visual Effect Mode Change
  if (effectModeSelect) {
    effectModeSelect.addEventListener('change', (e) => {
      effectMode = e.target.value;
      if (waterShader) {
        waterShader.setEffectMode(effectMode);
      }
      storage.set({ effectMode });
    });
  }



  // Animation Toggle Change
  animationToggle.addEventListener('change', (e) => {
    animationsEnabled = e.target.checked;
    applyAnimationState(animationsEnabled);
    storage.set({ animationsEnabled });
  });

  // Listen for system theme changes when 'os' is selected
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (colorMode === 'os') {
      applyColorMode('os');
    }
  });
}

function openDrawer() {
  settingsDrawer.classList.add('open');
  drawerOverlay.classList.add('open');
}

function closeDrawer() {
  settingsDrawer.classList.remove('open');
  drawerOverlay.classList.remove('open');
}

// Start app
document.addEventListener('DOMContentLoaded', init);
