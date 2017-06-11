
var Svg = Svg || {};

var SVG_NS = "http://www.w3.org/2000/svg";
var SVG_DC_NS = "http://purl.org/dc/elements/1.1/";
var SVG_RDF_NS = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
var SVG_CC_NS = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";


Svg.getValue = function(node, namespace, element) {
  if (node.getElementsByTagNameNS(namespace, element).length > 0) {
    return node.getElementsByTagNameNS(namespace, element)[0].childNodes[0].nodeValue;
  } else {
    return "";
  }
}

Svg.getChildValue = function(node, namespace, parent, child) {
  if (node.getElementsByTagNameNS(namespace, parent).length > 0) {
    var parentNode = node.getElementsByTagNameNS(namespace, parent)[0];
    return Svg.getValue(parentNode, namespace, child);
  } else {
    return "";
  }  
}

Svg.getKeywords = function(node) {
  var keywords = "";

  if (node.getElementsByTagNameNS(SVG_DC_NS, "subject").length > 0) {
    var subjectNode = node.getElementsByTagNameNS(SVG_DC_NS, "subject")[0];
    var keywordNodes = subjectNode.getElementsByTagNameNS(SVG_RDF_NS, "li");
    for (var i = 0; i < keywordNodes.length; i++) {
      keywords = keywords + (i == 0 ? "" : ", ") + keywordNodes[i].textContent;
    }
  }

  return keywords;
}

Svg.getMetaData = function(xmlDoc) {
  var metadata = {};

  var svgNode = xmlDoc.getElementsByTagName("svg")[0];
  metadata.viewbox = svgNode.getAttribute("viewBox");
  metadata.width = svgNode.getAttribute("width");
  metadata.height = svgNode.getAttribute("height");

  metadata.title = Svg.getValue(svgNode, SVG_NS, "title");

  // Parsing the SVG metadata is more difficult because it uses multiple
  // namespaces and is nested.
  var metaNode = xmlDoc.getElementsByTagName("metadata")[0];

  metadata.format = Svg.getValue(metaNode, SVG_DC_NS, "format");
  metadata.date = Svg.getValue(metaNode, SVG_DC_NS, "date");
  metadata.description = Svg.getValue(metaNode, SVG_DC_NS, "description");

  metadata.creator = Svg.getChildValue(metaNode, SVG_DC_NS, "creator", "title");
  metadata.publisher = Svg.getChildValue(metaNode, SVG_DC_NS, "publisher", "title");
  metadata.rights = Svg.getChildValue(metaNode, SVG_DC_NS, "rights", "title");
  metadata.keywords = Svg.getKeywords(metaNode);

  return metadata;
}