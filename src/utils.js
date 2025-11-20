/**
 * Preloads images by selector and resolves when all are loaded
 * @param {string} selector - CSS selector for images to preload
 * @returns {Promise<void>}
 */
export const preloadImages = (selector) => {
  return new Promise((resolve) => {
    const images = document.querySelectorAll(selector);
    let loaded = 0;
    const total = images.length;

    if (total === 0) {
      resolve();
      return;
    }

    const checkComplete = () => {
      loaded++;
      if (loaded === total) {
        resolve();
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        checkComplete();
      } else {
        img.onload = checkComplete;
        img.onerror = checkComplete;
      }
    });
  });
};
