// 独白 (Soliloquy) — 本地存储管理
// 兼容 Firefox Extension Storage API 与普通浏览器 LocalStorage Fallback

const hasExtensionStorage = typeof browser !== 'undefined' && browser.storage && browser.storage.local;
const hasChromeStorage = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

export const storage = {
  /**
   * 获取存储的值
   * @param {Array<string>|Object} keys
   * @returns {Promise<Object>}
   */
  get: async (keys) => {
    return new Promise((resolve) => {
      if (hasExtensionStorage) {
        browser.storage.local.get(keys).then(resolve);
      } else if (hasChromeStorage) {
        chrome.storage.local.get(keys, resolve);
      } else {
        // LocalStorage Fallback
        const result = {};
        const keyList = Array.isArray(keys) ? keys : Object.keys(keys);
        keyList.forEach(key => {
          const val = localStorage.getItem(key);
          if (val !== null) {
            try {
              result[key] = JSON.parse(val);
            } catch {
              result[key] = val;
            }
          } else if (typeof keys === 'object' && !Array.isArray(keys)) {
            result[key] = keys[key];
          }
        });
        resolve(result);
      }
    });
  },

  /**
   * 设置存储的值
   * @param {Object} data
   * @returns {Promise<void>}
   */
  set: async (data) => {
    return new Promise((resolve) => {
      if (hasExtensionStorage) {
        browser.storage.local.set(data).then(resolve);
      } else if (hasChromeStorage) {
        chrome.storage.local.set(data, resolve);
      } else {
        // LocalStorage Fallback
        Object.keys(data).forEach(key => {
          localStorage.setItem(key, JSON.stringify(data[key]));
        });
        resolve();
      }
    });
  }
};
