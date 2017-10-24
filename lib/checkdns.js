var dns = require('dns');
var fs = require('fs');

var rtypeValid = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'PTR'];

var isIPAddress = function (address) {
  var r = '^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])$',
    ipRE = new RegExp(r);

  return ipRE.test(address);
}

var isValidType = function (type) {
  if (rtypeValid.indexOf(type) < 0) {
    return false;
  }
  return true;
}

/* 
  Export
*/

var nslookup = function (domain, rtype, callback) {
  var rtype = rtype ? rtype : 'A',
    isIP = isIPAddress(domain),
    message = {};

  rtype = rtype.toUpperCase();

  if (!isValidType(rtype)) {
    callback({ "error": 'Error: Type not vaild.' });
    return;
  }

  if (isIP) {
    rtype = 'PTR';
  } else if (rtype === 'PTR') {
    rtype = 'A';
  }

  if (isIP)
    var resolve = dns.reverse;
  else
    var resolve = dns.resolve;

  resolve(domain, rtype, function (err, addresses) {

    if (err) {
      var error = { error: err };

      if (err.code == "ENOTFOUND") {
        error.notfound = true;
      }
      callback(error);
      return;
    }

    switch (rtype) {
      case 'PTR':
        message = { address: domain, domain: addresses }
        break;
      case 'MX':
        message = { address: domain, mx: [] }
        let servers = []
        addresses.forEach(function (i_srv, i) {
          message.mx.push({ server: i_srv.exchange, priority: i_srv.priority });
        });
        break;
      case 'CNAME':
        message = { address: domain, host: addresses }
        break;
      case 'TXT':
        message = { address: domain, txt: [].concat.apply([], addresses) }
        break;
      case 'NS':
        message = { address: domain, ns: addresses }
        break;
      default:
        message = { address: domain, domain: addresses }
    }
    callback(message);
    return;
  }

  )
}
var nslookupFromFile = function (file, rtype) {
  var rtype = rtype ? rtype : 'A';

  if (!isValidType(rtype)) {
    return ({ error: 'Error: Type not vaild.' });
  }

  fs.exists(file, function (exists) {
    if (!exists) {
      return ({ error: 'Error: file not vaild.' });
    }

    parseFile(file, function (domains) {
      domains.forEach(function (domain) {
        if (domain.length) nslookup(domain, rtype);
      });
    });
  });
}

module.exports = checkDNSJSON = {
  nslookup: nslookup
};
