/**
 *  Module variables
 */
var accessToken = null;        // contains the last oauth2 authorization token recieved
var gDocs = null;              // the object instance for the Google Drive interface
var lastResponse = null;       // the last response recieved from sendMessage
var lastWindow = null;         // the last popup view window
var lastMetaData = null;       // the last set of file metadata retrieved
var lastDOM = null;            // the last document object model recieved from the popup view

/**
 * Force the initialization function to run when the background file is loaded
 */
initialize();

function updatedHandler(tabId, changeInfo, tab) {
  if (changeInfo.hasOwnProperty("status") && changeInfo.status == 'complete') {
    if (tab.url.indexOf("drive.google.com/drive/u/0") != -1) {
      // inject content script
      chrome.tabs.executeScript(tabId, {file: "app/content.js"}, function(results) {
        return;
      });
    }
  }
}

/**
 * Initialize the background script and Google Drive service object
 */
function initialize() {
  if (!gDocs) {
    gDocs = new GDocs();
  }

  authorize(true);

  chrome.runtime.onMessage.addListener(messageHandler);
  chrome.tabs.onUpdated.addListener(updatedHandler);
}


/**
 * Main message handler for the background file.
 * 
 * @param {Object} request - extension request message object
 * @param {MessageSender} sender - object containing information about the script that sent the request
 * @param {function} sendResponse - response callback from the sender
 */
function messageHandler(request, sender, sendResponse) {
  switch(request.message) {
    case "showFile":
      showFile(request.fileId);
      sendResponse({response: "success", request: request});
      break;

    default:
      sendResponse({response: "error", request: request, error: "Unknown request message"});
      break;
  }
}

/**
 * Generic response handler
 * 
 * @param {Object} response - JSON response object
 */
function responseHandler(response) {
  if (response) {
    lastResponse = response;
  } else {
    Utl.logError("background.js.responseHandler", chrome.runtime.lastError.message);
  }
}

/**
 * Initiate Oauth2 authorization for Google Drive
 * 
 * @param {boolean} interactive -
 */
function authorize(interactive) {
  if (!gDocs) {
    initialize();
  }

  if (!accessToken) {
    gDocs.auth(interactive, function() {
      accessToken = gDocs.accessToken;
    });
  }
}

/**
 * Display the SVG file and it's metadata in a popup window.
 * 
 * @param {string} fileId - Google Drive file id
 */
function showFile(fileId) {
  gDocs.getFileMetaData(fileId, function(response, e) {
    metadata = JSON.parse(response);
    if (metadata.mimeType == "image/svg+xml") {
      lastMetaData = metadata;
      // If the view window is already open just replace the contents otherwise 
      // create a new view window.
      if (!lastWindow) {
        var createData = {"url": "app/view.html", "width": 800, "height": 400, "type": "popup"};
        chrome.windows.create(createData, function(window) {
          lastWindow = window;
        });
      } else {
        renderView(lastDOM);
      }
    }
  });
}

/**
 * Load content of the given Google Drive file as XML.
 * 
 * @param {string} fileId - Google Drive file identifier
 * @param {function} callback - function to call with XML of the file
 */
function loadFile(fileId, callback) {
  gDocs.loadFile(fileId, function(response, e) {
    callback(e.target.responseXML);
  });
}

/**
 * Return the Javascript Window for the specified extention page URL.
 * 
 * @param {string} url - app relative url of an extension HTML page
 */
function findView(url) {
  var views = chrome.extension.getViews();
  for (var i = 0; i < views.length; i++) {
    var view = views[i];
    if (view.location.href == url) {
      return view;
    }
  }

  return null;
}

/**
 * Return the extension URL of the given relative page path.
 * 
 * @param {string} viewFilename - app directory replative path of an extension page
 */
function getViewUrl(viewFilename) {
  // Example: url = getViewUrl("app/view.html") where app is a sub-directory.
  return chrome.runtime.getURL(viewFilename);
}

/**
 * Return the linkable display URL for the given Google Drive file ID.
 * 
 * @param {string} fileId - a Google Drive file id
 */
function getFileUrl(fileId) {
  return "https://drive.google.com/uc?id=" + fileId;
}

/**
 * Load the information about the current Google Drive file into popup view DOM.
 * 
 * @param {document} doc - HTML document of the popup view
 */
function renderView(doc) {
  var fileId = lastMetaData.id;
  var fileUrl = getFileUrl(fileId);

  lastDOM = doc;

  loadFile(fileId, function(xmlDoc) {
    var svgMetaData = Svg.getMetaData(xmlDoc);

    // Google Drive metadata
    $(doc).find("#svg_img").attr("src", fileUrl);
    $(doc).find("#drive_owner").text(lastMetaData.owners[0].displayName);
    $(doc).find("#drive_created").text(lastMetaData.createdTime);
    $(doc).find("#drive_modified").text(lastMetaData.modifiedTime);

    // SVG metadata
    $(doc).find("#svg_title").text(svgMetaData.title);
    $(doc).find("#svg_viewbox").text(svgMetaData.viewbox);
    $(doc).find("#svg_width").text(svgMetaData.width);
    $(doc).find("#svg_height").text(svgMetaData.height);
    $(doc).find("#svg_date").text(svgMetaData.date);
    $(doc).find("#svg_creator").text(svgMetaData.creator);
    $(doc).find("#svg_rights").text(svgMetaData.rights);
    $(doc).find("#svg_publisher").text(svgMetaData.publisher);
    $(doc).find("#svg_keywords").text(svgMetaData.keywords);
  });
}

/**
 * Perform any cleanup needed when the view window is closed.
 */
function removeView() {
  lastWindow = null;
  lastDOM = null;
}