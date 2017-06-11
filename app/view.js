
document.addEventListener("DOMContentLoaded", function() {
  var bkg = chrome.extension.getBackgroundPage();
  bkg.renderView(document);
});

window.addEventListener("unload", function() {
  var bkg = chrome.extension.getBackgroundPage();
  bkg.removeView();
});

