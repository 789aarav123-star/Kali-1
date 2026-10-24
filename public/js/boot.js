/* Marks the document as JS-enabled before first paint so reveal animations
   never leave content hidden when JavaScript is unavailable.
   If the main bundle never boots, the flag is dropped again so everything
   stays visible. */
document.documentElement.classList.add('js');

window.setTimeout(function () {
  if (!document.documentElement.classList.contains('reveal-ready')) {
    document.documentElement.classList.remove('js');
  }
}, 2500);
