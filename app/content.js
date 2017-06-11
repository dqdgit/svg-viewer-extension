/**
 * 
 */
var lastResponse = null;

/**
 * Function call to trigger the initialization process
 */
initContent();

/**
 * Initialize the javascript that will be injected into the Google Drive page
 */
function initContent() {
  fileNodes = document.getElementsByClassName("a-t-J");
  for (var i = 0; i < fileNodes.length; i++) {
    fileNodes[i].addEventListener('click', fileClickHandler, false);
  }
}

/**
 * Handle clicks on Google Drive file elements
 * 
 * @param {Event} e 
 */
function fileClickHandler(e) {
  if (e.ctrlKey) {
    var fileName = this.getElementsByClassName("l-Ab-T-r")[0].innerText;
    if (fileName.endsWith(".svg")) {
      chrome.runtime.sendMessage({message: "showFile", fileId: this.getAttribute("data-id")}, function(response) {
        lastResponse = response;
      });
    }
  }

  return false;
}
