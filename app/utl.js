
var Utl = Utl || {};

Utl.log = function(message) {
  var ts = '[' + new Date().toISOString() + '] ';
  console.log(ts + message);
};

Utl.logResponse = function(module, response) {
  var msg = module;
  if (response) {
    msg = msg + ": response=" + JSON.stringify(response);
  }

  Utl.log(msg);
};

Utl.logError = function(module, message) {
  Utl.log(module + " Error: " + message);
};
