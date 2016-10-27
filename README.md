
browserify --standalone loopback-promised lib/loopback-promised.js > loopback-promised.js
```js
if (http_method === 'GET') {
      flattenParams = {};
      for (k in params) {
        v = params[k];
        if (typeof v === 'function'<font color=#0099ff size=5 face="黑体"> || !Object.keys(v).length</font>) {
          continue;
        }
        flattenParams[k] = typeof v === 'object' ? JSON.stringify(v) : v;
      }
      queryString = qs.stringify(flattenParams);
      if (queryString) {
        url += '?' + queryString;
      }
    } else if (Object.keys(params).length) {
      fetchParams.body = JSON.stringify(params);
      fetchParams.headers['Content-Type'] = 'application/json';
    }
    responseStatus = null;
    fetched = <font color=#0099ff size=5 face="黑体">fetch.</font>fetch(url, fetchParams).then(function(response) {
```
var a =loopbackPromised.createInstance({
  baseURL: 'http://localhost:3000/api'
});

var c = a.createClient('Reviews');

c.count().then(function(res){console.log(res)});

# loopback-promised

  loopback-promised is an HTTP client for StrongLoop Loopback using Promise.

## Universal JS
This project is universal (in past, called "isomorphic").
Bundle into your project and it runs.

[latest API documentation Page](http://cureapp.github.io/loopback-promised/index.html)

## Installation

```bash
$ npm install loopback-promised
```

## Usage

```js
var LoopbackPromised = require('loopback-promised')

var lbPromised = LoopbackPromised.createInstance({
  baseURL: 'http://localhost:3000'
});

var client = lbPromised.createClient('notebooks')

client.create({name: 'Biology'}).then(function(notebook) {
  console.log(notebook.id)
  console.log(notebook.name)
})
```

## License

  MIT

