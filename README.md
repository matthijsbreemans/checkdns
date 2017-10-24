Checkdnsjson
========

node.js - Resolution of domain names or IP addresses given in JSON.

## Installation
```
$ npm install --save checkdnsjson
```


## Usage

```
var checkdns = require('checkdnsjson');
```

Resolve a domain:
```
checkdnsjson.nslookup(domain, rtype);
```
