var dns = require('dns');
var fs = require('fs');

var rtypeValid = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'PTR'];


var parseFile = function (file, callback) {
  fs.readFile(file, function (err, data) {
    if (err) {
      displayError(err);
      return;
    }

    var domains = data.toString().split(/\n|;/);
    callback(domains);
  });
}

var formatLine = function (el1, el2, offset) {
  var offset = offset ? offset : 0,
    lengthEl1 = displayCol1Size,
    nbSp = lengthEl1 - el1.length + offset,
    addSp = '\t';

  if (nbSp > 0) {
    addSp = '';
    for (var i = 0; i < nbSp; i++) {
      addSp += ' ';
    }
  }

  return el1 + addSp + el2;
}

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

var nslookup = function (domain, rtype) {
  var rtype = rtype ? rtype : 'A',
    isIP = isIPAddress(domain),
    message = {};

  if (!isValidType(rtype)) {
    return ({ error: 'Error: Type not vaild.' });

  }

  if (isIP) {
    rtype = 'PTR';
  } else if (rtype === 'PTR') {
    rtype = 'A';
  }

  dns.resolve(domain, rtype, function (err, addresses) {
    if (err) {
      return ({ error: err });
    }

    switch (rtype) {
      case 'PTR':
        message = { address: domain, domain: addresses }
        break;
      case 'MX':
      message = { address: domain, mx: [] }
      let servers = []
        addresses.forEach(function (i_srv, i) {
          message.mx.push( {server: i_srv.exchange, priority: i_srv.priority});
        });
        break;
      case 'CNAME':
      message = { address: domain, host: addresses }
        break;
      case 'TXT':
      message = { address: domain, txt: addresses }
        break;
      case 'NS':
      message = { address: domain, ns: addresses }
        break;
      default:
      message = { address: domain, domain: addresses }
    }
return message;
  });
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

module.exports = checkDNS = {
  nslookup: nslookup,
  nslookupFromFile: nslookupFromFile
};
