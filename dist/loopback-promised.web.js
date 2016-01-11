(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var exportedLog, ffSupport, formats, getOrderedMatches, hasMatches, isFF, isIE, isOpera, isSafari, log, makeArray, operaSupport, safariSupport, stringToArgs, _log;

  if (!(window.console && window.console.log)) {
    return;
  }

  log = function() {
    var args;
    args = [];
    makeArray(arguments).forEach(function(arg) {
      if (typeof arg === 'string') {
        return args = args.concat(stringToArgs(arg));
      } else {
        return args.push(arg);
      }
    });
    return _log.apply(window, args);
  };

  _log = function() {
    return console.log.apply(console, makeArray(arguments));
  };

  makeArray = function(arrayLikeThing) {
    return Array.prototype.slice.call(arrayLikeThing);
  };

  formats = [
    {
      regex: /\*([^\*]+)\*/,
      replacer: function(m, p1) {
        return "%c" + p1 + "%c";
      },
      styles: function() {
        return ['font-style: italic', ''];
      }
    }, {
      regex: /\_([^\_]+)\_/,
      replacer: function(m, p1) {
        return "%c" + p1 + "%c";
      },
      styles: function() {
        return ['font-weight: bold', ''];
      }
    }, {
      regex: /\`([^\`]+)\`/,
      replacer: function(m, p1) {
        return "%c" + p1 + "%c";
      },
      styles: function() {
        return ['background: rgb(255, 255, 219); padding: 1px 5px; border: 1px solid rgba(0, 0, 0, 0.1)', ''];
      }
    }, {
      regex: /\[c\=(?:\"|\')?((?:(?!(?:\"|\')\]).)*)(?:\"|\')?\]((?:(?!\[c\]).)*)\[c\]/,
      replacer: function(m, p1, p2) {
        return "%c" + p2 + "%c";
      },
      styles: function(match) {
        return [match[1], ''];
      }
    }
  ];

  hasMatches = function(str) {
    var _hasMatches;
    _hasMatches = false;
    formats.forEach(function(format) {
      if (format.regex.test(str)) {
        return _hasMatches = true;
      }
    });
    return _hasMatches;
  };

  getOrderedMatches = function(str) {
    var matches;
    matches = [];
    formats.forEach(function(format) {
      var match;
      match = str.match(format.regex);
      if (match) {
        return matches.push({
          format: format,
          match: match
        });
      }
    });
    return matches.sort(function(a, b) {
      return a.match.index - b.match.index;
    });
  };

  stringToArgs = function(str) {
    var firstMatch, matches, styles;
    styles = [];
    while (hasMatches(str)) {
      matches = getOrderedMatches(str);
      firstMatch = matches[0];
      str = str.replace(firstMatch.format.regex, firstMatch.format.replacer);
      styles = styles.concat(firstMatch.format.styles(firstMatch.match));
    }
    return [str].concat(styles);
  };

  isSafari = function() {
    return /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
  };

  isOpera = function() {
    return /OPR/.test(navigator.userAgent) && /Opera/.test(navigator.vendor);
  };

  isFF = function() {
    return /Firefox/.test(navigator.userAgent);
  };

  isIE = function() {
    return /MSIE/.test(navigator.userAgent);
  };

  safariSupport = function() {
    var m;
    m = navigator.userAgent.match(/AppleWebKit\/(\d+)\.(\d+)(\.|\+|\s)/);
    if (!m) {
      return false;
    }
    return 537.38 <= parseInt(m[1], 10) + (parseInt(m[2], 10) / 100);
  };

  operaSupport = function() {
    var m;
    m = navigator.userAgent.match(/OPR\/(\d+)\./);
    if (!m) {
      return false;
    }
    return 15 <= parseInt(m[1], 10);
  };

  ffSupport = function() {
    return window.console.firebug || window.console.exception;
  };

  if (isIE() || (isFF() && !ffSupport()) || (isOpera() && !operaSupport()) || (isSafari() && !safariSupport())) {
    exportedLog = _log;
  } else {
    exportedLog = log;
  }

  exportedLog.l = _log;

  if (typeof define === 'function' && define.amd) {
    define(exportedLog);
  } else if (typeof exports !== 'undefined') {
    module.exports = exportedLog;
  } else {
    window.log = exportedLog;
  }

}).call(this);

},{}],2:[function(require,module,exports){
var LoopbackClient, removeUndefinedKey;

require('es6-promise').polyfill();


/**
Loopback Client to access to PersistedModel (or extenders)

see http://docs.strongloop.com/display/public/LB/PersistedModel+REST+API
see also http://apidocs.strongloop.com/loopback/#persistedmodel

@class LoopbackClient
@module loopback-promised
 */

LoopbackClient = (function() {

  /**
  
  @constructor
  @param {LoopbackPromised} lbPromised
  @param {String} pluralModelName
  @param {String} [accessToken] Access Token
  @param {Number} [timeout] msec to timeout
  @param {Boolean} [debug] shows debug log if true
   */
  function LoopbackClient(lbPromised, pluralModelName, accessToken, timeout, debug) {
    this.lbPromised = lbPromised;
    this.pluralModelName = pluralModelName;
    this.accessToken = accessToken;
    this.timeout = timeout;
    this.debug = debug;
  }


  /**
  sets Access Token
  
  @method setAccessToken
  @param {String} [accessToken] Access Token
  @return {Promise(Object)}
   */

  LoopbackClient.prototype.setAccessToken = function(accessToken) {
    this.accessToken = accessToken;
  };


  /**
  sends request to Loopback
  
  @method request
  @private
  @param {String} path
  @param {Object} params request parameters
  @param {String} http_method {GET|POST|PUT|DELETE}
  @return {Promise(Object)}
   */

  LoopbackClient.prototype.request = function(path, params, http_method) {
    if (params == null) {
      params = {};
    }
    return this.lbPromised.request(this.pluralModelName, path, params, http_method, this);
  };


  /**
  Return the number of records that match the optional "where" filter.
  
  @method count
  @param {Object} [where]
  @return {Promise(Number)}
   */

  LoopbackClient.prototype.count = function(where) {
    var http_method, params, path;
    if (where == null) {
      where = {};
    }
    path = '/count';
    http_method = 'GET';
    params = {};
    if (Object.keys(where)) {
      params.where = where;
    }
    return this.request(path, params, http_method).then(function(result) {
      return result.count;
    });
  };


  /**
  Create new instance of Model class, saved in database
  
  @method create
  @param {Object} data
  @return {Promise(Object)}
   */

  LoopbackClient.prototype.create = function(data) {
    var d, http_method, params, path;
    if (data == null) {
      data = {};
    }
    if (Array.isArray(data)) {
      return Promise.all((function() {
        var i, len, results;
        results = [];
        for (i = 0, len = data.length; i < len; i++) {
          d = data[i];
          results.push(this.create(d));
        }
        return results;
      }).call(this));
    }
    path = '';
    http_method = 'POST';
    params = data;
    return this.request(path, params, http_method);
  };


  /**
  Update or insert a model instance
  The update will override any specified attributes in the request data object. It won’t remove  existing ones unless the value is set to null.
  
  @method upsert
  @param {Object} data
  @return {Promise(Object)}
   */

  LoopbackClient.prototype.upsert = function(data) {
    var http_method, params, path;
    if (data == null) {
      data = {};
    }
    path = '';
    http_method = 'PUT';
    params = data;
    return this.request(path, params, http_method);
  };


  /**
  Check whether a model instance exists in database.
  
  @method exists
  @param {String} id
  @return {Promise(Object)}
   */

  LoopbackClient.prototype.exists = function(id) {
    var http_method, params, path;
    path = "/" + id + "/exists";
    http_method = 'GET';
    params = null;
    return this.request(path, params, http_method);
  };


  /**
  Find object by ID.
  
  @method findById
  @param {String} id
  @return {Promise(Object)}
   */

  LoopbackClient.prototype.findById = function(id) {
    var http_method, params, path;
    path = "/" + id;
    http_method = 'GET';
    params = null;
    return this.request(path, params, http_method);
  };


  /**
  Find all model instances that match filter specification.
  
  @method find
  @param {Object} filter
  @return {Promise(Array(Object))}
   */

  LoopbackClient.prototype.find = function(filter) {
    var http_method, params, path, where;
    if (filter != null ? filter.where : void 0) {
      where = removeUndefinedKey(filter.where);
      if (!where) {
        filter.where = null;
      }
    }
    if ((filter != null) && filter.where === null) {
      if (this.debug) {
        console.log("returns empty array, as \"where\" is null.");
      }
      return Promise.resolve([]);
    }
    path = '';
    http_method = 'GET';
    params = {
      filter: filter
    };
    return this.request(path, params, http_method);
  };


  /**
  Find one model instance that matches filter specification. Same as find, but limited to one result
  
  @method findOne
  @param {Object} filter
  @return {Promise(Object)}
   */

  LoopbackClient.prototype.findOne = function(filter) {
    var http_method, params, path;
    path = '/findOne';
    http_method = 'GET';
    params = {
      filter: filter
    };
    return this.request(path, params, http_method)["catch"](function(err) {
      if (err.isLoopbackResponseError && err.code === 'MODEL_NOT_FOUND') {
        return null;
      } else {
        throw err;
      }
    });
  };


  /**
  Destroy model instance with the specified ID.
  
  @method destroyById
  @param {String} id
  @return {Promise}
   */

  LoopbackClient.prototype.destroyById = function(id) {
    var http_method, params, path;
    path = "/" + id;
    http_method = 'DELETE';
    params = null;
    return this.request(path, params, http_method);
  };


  /**
  Destroy model instance
  
  @method destroy
  @param {Object} data
  @return {Promise}
   */

  LoopbackClient.prototype.destroy = function(data) {
    return this.destroyById(data.id);
  };


  /**
  Update set of attributes.
  
  @method updateAttributes
  @param {Object} data
  @return {Promise(Object)}
   */

  LoopbackClient.prototype.updateAttributes = function(id, data) {
    var http_method, params, path;
    path = "/" + id;
    http_method = 'PUT';
    params = data;
    return this.request(path, params, http_method);
  };


  /**
  Update multiple instances that match the where clause
  
  @method updateAll
  @param {Object} where
  @param {Object} data
  @return {Promise}
   */

  LoopbackClient.prototype.updateAll = function(where, data) {
    var http_method, params, path;
    path = "/update?where=" + (JSON.stringify(where));
    http_method = 'POST';
    params = data;
    return this.request(path, params, http_method);
  };

  return LoopbackClient;

})();

removeUndefinedKey = function(obj) {
  var deletedKeynum, key, keynum, value;
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (typeof (obj != null ? obj.toISOString : void 0) === 'function') {
    return obj.toISOString();
  }
  keynum = 0;
  deletedKeynum = 0;
  for (key in obj) {
    value = obj[key];
    value = removeUndefinedKey(value);
    if (value === void 0) {
      delete obj[key];
      deletedKeynum++;
    }
    keynum++;
  }
  if (keynum === deletedKeynum) {
    return void 0;
  } else {
    return obj;
  }
};

module.exports = LoopbackClient;

},{"es6-promise":8}],3:[function(require,module,exports){
(function (process){
var DebugLogger, LoopbackClient, LoopbackPromised, LoopbackRelatedClient, LoopbackUserClient, PushManager, superagent;

LoopbackClient = require('./loopback-client');

LoopbackUserClient = require('./loopback-user-client');

LoopbackRelatedClient = require('./loopback-related-client');

PushManager = require('./push-manager');

require('es6-promise').polyfill();

superagent = require('superagent');

DebugLogger = require('./util/debug-logger');


/**
LoopbackPromised

@class LoopbackPromised
@module loopback-promised
 */

LoopbackPromised = (function() {

  /**
  creates an instance
  
  @static
  @method createInstance
  @param {LoopbackPromised|Object} lbPromisedInfo
  @param {String} lbPromisedInfo.baseURL base URL of Loopback
  @param {Object} [lbPromisedInfo.logger] logger with info(), warn(), error(), trace().
  @param {String} [lbPromisedInfo.version] version of Loopback API to access
  @return {LoopbackPromised}
   */
  LoopbackPromised.createInstance = function(lbPromisedInfo) {
    if (lbPromisedInfo == null) {
      lbPromisedInfo = {};
    }
    return new LoopbackPromised(lbPromisedInfo.baseURL, lbPromisedInfo.logger, lbPromisedInfo.version);
  };


  /**
  
  @constructor
  @private
   */

  function LoopbackPromised(baseURL1, logger1, version1) {
    this.baseURL = baseURL1;
    this.logger = logger1;
    this.version = version1;
  }


  /**
  sends request to Loopback
  
  @method request
  @param {String} pluralModelName
  @param {String} path
  @param {Object} params request parameters
  @param {String} http_method {GET|POST|PUT|DELETE|HEAD}
  @param {LoopbackClient|Object} [clientInfo]
  @param {String}  [clientInfo.accessToken] Access Token
  @param {Boolean} [clientInfo.debug] shows debug log if true
  @return {Promise(Object)}
   */

  LoopbackPromised.prototype.request = function(pluralModelName, path, params, http_method, clientInfo) {
    var endpoint;
    if (params == null) {
      params = {};
    }
    if (clientInfo == null) {
      clientInfo = {};
    }
    endpoint = "/" + pluralModelName + path;
    return this.constructor.requestStatic(endpoint, params, http_method, clientInfo, this);
  };


  /**
  calls rest api directly
  
  @static
  @method requestStatic
  @param {String} endpoint
  @param {Object} [params]
  @param {String} http_method {GET|POST|PUT|DELETE|HEAD}
  @param {LoopbackClient|Object} [clientInfo]
  @param {String}  [clientInfo.accessToken] Access Token
  @param {Boolean} [clientInfo.debug] shows debug log if true
  @param {LoopbackPromised|Object}  lbPromisedInfo
  @param {String} lbPromisedInfo.baseURL base URL of Loopback
  @param {String} [lbPromisedInfo.version] version of Loopback API to access
  @param {Object} [lbPromisedInfo.logger] logger with info(), warn(), error(), trace().
  
  @return {Promise(Object)}
   */

  LoopbackPromised.requestStatic = function(endpoint, params, http_method, clientInfo, lbPromisedInfo) {
    var accessToken, agentMethod, baseURL, debug, debugLogger, logger, timeout, version;
    if (params == null) {
      params = {};
    }
    if (clientInfo == null) {
      clientInfo = {};
    }
    accessToken = clientInfo.accessToken, debug = clientInfo.debug, timeout = clientInfo.timeout;
    baseURL = lbPromisedInfo.baseURL, logger = lbPromisedInfo.logger, version = lbPromisedInfo.version;
    debug = this.isDebugMode(debug);
    if (debug) {
      debugLogger = new DebugLogger(endpoint, params, http_method, clientInfo, lbPromisedInfo);
    }
    agentMethod = this.agentMethodMap[http_method];
    if (!baseURL) {
      return Promise.reject('baseURL is required.');
    }
    if (agentMethod == null) {
      return Promise.reject(new Error("no agent method for http_method:  " + http_method));
    }
    if (debug) {
      debugLogger.showRequestInfo();
    }
    return new Promise(function(resolve, reject) {
      var flattenParams, k, req, url, v;
      url = version != null ? baseURL + '/' + version + endpoint : baseURL + endpoint;
      req = superagent[agentMethod](url);
      if (accessToken) {
        req.set('Authorization', accessToken);
      }
      if (agentMethod === 'get') {
        flattenParams = {};
        for (k in params) {
          v = params[k];
          if (typeof v === 'function') {
            continue;
          }
          flattenParams[k] = typeof v === 'object' ? JSON.stringify(v) : v;
        }
        req.query(flattenParams);
      } else if (Object.keys(params).length) {
        req.send(JSON.stringify(params));
        req.set('Content-Type', 'application/json');
      }
      if (timeout != null) {
        req.timeout(timeout);
      }
      return req.end(function(err, res) {
        var e, ref, responseBody;
        if (err) {
          if (debug) {
            debugLogger.showErrorInfo(err);
          }
          reject(err);
          return;
        }
        try {
          if (res.statusCode === 204) {
            responseBody = {};
          } else {
            responseBody = JSON.parse(res.text);
          }
        } catch (_error) {
          e = _error;
          responseBody = {
            error: res.text
          };
        }
        if (debug) {
          debugLogger.showResponseInfo(responseBody, res);
        }
        if (responseBody.error) {
          if (typeof responseBody.error === 'object') {
            err = new Error();
            ref = responseBody.error;
            for (k in ref) {
              v = ref[k];
              err[k] = v;
            }
            err.isLoopbackResponseError = true;
          } else {
            err = new Error(responseBody.error);
          }
          return reject(err);
        } else {
          return resolve(responseBody);
        }
      });
    });
  };


  /**
  creates client for Loopback
  
  @method createClient
  @param {String} pluralModelName
  @param {Object}  [options]
  @param {Object}  [options.belongsTo] key: pluralModelName (the "one" side of one-to-many relation), value: id
  @param {Boolean} [options.isUserModel] true if user model
  @param {String}  [options.accessToken] Access Token
  @param {Boolean} [options.debug] shows debug log if true
  @return {LoopbackClient}
   */

  LoopbackPromised.prototype.createClient = function(pluralModelName, options) {
    var id, pluralModelNameOne;
    if (options == null) {
      options = {};
    }
    if (options.belongsTo) {
      pluralModelNameOne = Object.keys(options.belongsTo)[0];
      id = options.belongsTo[pluralModelNameOne];
      return this.createRelatedClient({
        one: pluralModelNameOne,
        many: pluralModelName,
        id: id,
        timeout: options.timeout,
        accessToken: options.accessToken,
        debug: options.debug
      });
    } else if (options.isUserModel) {
      return this.createUserClient(pluralModelName, options);
    }
    return new LoopbackClient(this, pluralModelName, options.accessToken, options.timeout, options.debug);
  };


  /**
  creates user client for Loopback
  
  @method createUserClient
  @param {String} pluralModelName
  @param {Object} [clientInfo]
  @param {String}  [clientInfo.accessToken] Access Token
  @param {Boolean} [clientInfo.debug] shows debug log if true
  @return {LoopbackClient}
   */

  LoopbackPromised.prototype.createUserClient = function(pluralModelName, clientInfo) {
    if (clientInfo == null) {
      clientInfo = {};
    }
    return new LoopbackUserClient(this, pluralModelName, clientInfo.accessToken, clientInfo.timeout, clientInfo.debug);
  };


  /**
  creates related client (one-to-many relation)
  
  @method createRelatedClient
  @param {Object} options
  @param {String} options.one the "one" side plural model of one-to-many relationship
  @param {String} options.many the "many" side plural model of one-to-many relationship
  @param {any} options.id the id of the "one" model
  @param {String}  [options.accessToken] Access Token
  @param {Boolean} [options.debug] shows debug log if true
  @return {LoopbackClient}
   */

  LoopbackPromised.prototype.createRelatedClient = function(options) {
    return new LoopbackRelatedClient(this, options.one, options.many, options.id, options.accessToken, options.timeout, options.debug);
  };


  /**
  creates push manager
  
  @method createPushManager
  @public
  @param {Object} [clientInfo]
  @param {String}  [clientInfo.accessToken] Access Token
  @param {Boolean} [clientInfo.debug] shows debug log if true
  @return {PushManager}
   */

  LoopbackPromised.prototype.createPushManager = function(clientInfo) {
    if (clientInfo == null) {
      clientInfo = {};
    }
    return new PushManager(this, clientInfo.accessToken, clientInfo.debug);
  };


  /**
  check environment variable concerning debug
  
  @private
  @static
  @method isDebugMode
  @param {Boolean} debug
  @return {Boolean} shows debug log or not
   */

  LoopbackPromised.isDebugMode = function(debug) {
    var ref;
    return debug || !!(typeof process !== "undefined" && process !== null ? (ref = process.env) != null ? ref.LBP_DEBUG : void 0 : void 0);
  };


  /**
  HTTP methods => superagent methods
  
  @private
  @static
  @property agentMethodMap
  @type {Object}
   */

  LoopbackPromised.agentMethodMap = {
    DELETE: 'del',
    PUT: 'put',
    GET: 'get',
    POST: 'post',
    HEAD: 'head'
  };

  return LoopbackPromised;

})();

LoopbackPromised.Promise = Promise;

LoopbackPromised.LoopbackClient = LoopbackClient;

LoopbackPromised.LoopbackUserClient = LoopbackUserClient;

LoopbackPromised.LoopbackRelatedClient = LoopbackRelatedClient;

module.exports = LoopbackPromised;

}).call(this,require('_process'))
},{"./loopback-client":2,"./loopback-related-client":4,"./loopback-user-client":5,"./push-manager":6,"./util/debug-logger":7,"_process":9,"es6-promise":8,"superagent":10}],4:[function(require,module,exports){
var LoopbackClient, LoopbackRelatedClient,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

require('es6-promise').polyfill();

LoopbackClient = require('./loopback-client');


/**
Loopback Client to access to PersistedModel (or extenders) via one-to-many relation

@class LoopbackRelatedClient
@extends LoopbackClient
@module loopback-promised
 */

LoopbackRelatedClient = (function(superClass) {
  extend(LoopbackRelatedClient, superClass);


  /**
  
  @constructor
  @param {LoopbackPromised} lbPromised
  @param {String} pluralModelName the "one" side plural model of one-to-many relationship
  @param {String} pluralModelNameMany the "many" side plural model of one-to-many relationship
  @param {any} id the id of the "one" model
  @param {String} [accessToken] Access Token
  @param {Number} [timeout] msec to timeout
  @param {Boolean} [debug] shows debug log if true
  @return {LoopbackClient}
   */

  function LoopbackRelatedClient(lbPromised, pluralModelName, pluralModelNameMany, id1, accessToken, timeout, debug) {
    this.lbPromised = lbPromised;
    this.pluralModelName = pluralModelName;
    this.pluralModelNameMany = pluralModelNameMany;
    this.id = id1;
    this.accessToken = accessToken;
    this.timeout = timeout;
    this.debug = debug;
  }


  /**
  set id of the "one" model
  
  @method setAccessToken
  @param {any} id
  @return {Promise(Object)}
   */

  LoopbackRelatedClient.prototype.setId = function(id1) {
    this.id = id1;
  };


  /**
  sends request to Loopback
  
  @method request
  @private
  @param {String} path
  @param {Object} params request parameters
  @param {String} http_method {GET|POST|PUT|DELETE}
  @return {Promise(Object)}
   */

  LoopbackRelatedClient.prototype.request = function(path, params, http_method) {
    if (params == null) {
      params = {};
    }
    path = "/" + this.id + "/" + this.pluralModelNameMany + path;
    return this.lbPromised.request(this.pluralModelName, path, params, http_method, this);
  };


  /**
  Update or insert a model instance
  The update will override any specified attributes in the request data object. It won’t remove  existing ones unless the value is set to null.
  
  @method upsert
  @param {Object} data
  @return {Promise(Object)}
   */

  LoopbackRelatedClient.prototype.upsert = function(data) {
    var k, params, v;
    if (data == null) {
      data = {};
    }
    if (data.id != null) {
      params = {};
      for (k in data) {
        v = data[k];
        if (k !== 'id') {
          params[k] = v;
        }
      }
      return this.updateAttributes(data.id, params);
    } else {
      return this.create(data);
    }
  };


  /**
  Check whether a model instance exists in database.
  
  @method exists
  @param {String} id
  @return {Promise(Object)}
   */

  LoopbackRelatedClient.prototype.exists = function(id) {
    return this.findById(id).then(function(data) {
      return {
        exists: true
      };
    })["catch"](function(err) {
      if (err.isLoopbackResponseError) {
        return {
          exists: false
        };
      }
      throw err;
    });
  };


  /**
  Find one model instance that matches filter specification. Same as find, but limited to one result
  
  @method findOne
  @param {Object} filter
  @return {Promise(Object)}
   */

  LoopbackRelatedClient.prototype.findOne = function(filter) {
    return this.find(filter).then(function(results) {
      return results[0];
    });
  };


  /**
  Update multiple instances that match the where clause
  
  @method updateAll
  @param {Object} where
  @param {Object} data
  @return {Promise(Array(Object))}
   */

  LoopbackRelatedClient.prototype.updateAll = function(where, data) {
    return this.find({
      where: where,
      fields: 'id'
    }).then((function(_this) {
      return function(results) {
        var result;
        return Promise.all((function() {
          var i, len, results1;
          results1 = [];
          for (i = 0, len = results.length; i < len; i++) {
            result = results[i];
            results1.push(this.updateAttributes(result.id, data));
          }
          return results1;
        }).call(_this));
      };
    })(this));
  };

  return LoopbackRelatedClient;

})(LoopbackClient);

module.exports = LoopbackRelatedClient;

},{"./loopback-client":2,"es6-promise":8}],5:[function(require,module,exports){
var LoopbackClient, LoopbackUserClient,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

LoopbackClient = require('./loopback-client');


/**
Loopback User Client to access to UserModel (or extenders)

see http://docs.strongloop.com/display/public/LB/PersistedModel+REST+API
see also http://apidocs.strongloop.com/loopback/#persistedmodel

@class LoopbackUserClient
@module loopback-promised
 */

LoopbackUserClient = (function(superClass) {
  extend(LoopbackUserClient, superClass);

  function LoopbackUserClient() {
    return LoopbackUserClient.__super__.constructor.apply(this, arguments);
  }


  /**
  Confirm the user's identity.
  
  @method confirm
  @param {String} userId
  @param {String} token The validation token
  @param {String} redirect URL to redirect the user to once confirmed
  @return {Promise(Object)}
   */

  LoopbackUserClient.prototype.confirm = function(userId, token, redirect) {
    var http_method, params, path;
    path = '/confirm';
    http_method = 'GET';
    params = {
      uid: userId,
      token: token,
      redirect: redirect
    };
    return this.request(path, params, http_method);
  };


  /**
  Login a user by with the given credentials
  
  @method login
  @param {Object} credentials email/password
  @param {String} include Optionally set it to "user" to include the user info
  @return {Promise(Object)}
   */

  LoopbackUserClient.prototype.login = function(credentials, include) {
    var http_method, params, path;
    path = '/login';
    if (include) {
      path += "?include=" + include;
    }
    http_method = 'POST';
    params = credentials;
    return this.request(path, params, http_method);
  };


  /**
  Logout a user with the given accessToken id.
  
  @method logout
  @param {String} accessTokenID
  @return {Promise}
   */

  LoopbackUserClient.prototype.logout = function(accessTokenID) {
    var http_method, params, path;
    path = "/logout?access_token=" + accessTokenID;
    http_method = 'POST';
    params = null;
    return this.request(path, params, http_method);
  };


  /**
  Create a short lived acess token for temporary login. Allows users to change passwords if forgotten.
  
  @method resetPassword
  @param {String} email
  @return {Promise}
   */

  LoopbackUserClient.prototype.resetPassword = function(email) {
    var http_method, params, path;
    path = "/logout?access_token=" + accessTokenID;
    http_method = 'POST';
    params = {
      email: email
    };
    return this.request(path, params, http_method);
  };

  return LoopbackUserClient;

})(LoopbackClient);

module.exports = LoopbackUserClient;

},{"./loopback-client":2}],6:[function(require,module,exports){
var PushManager;

require('es6-promise').polyfill();


/**
managing push notification.
Currently supports only for loopback servers build by [loopback-with-domain](https://github.com/cureapp/loopback-with-domain)

@class PushManager
 */

PushManager = (function() {

  /**
  @constructor
  @param {LoopbackPromised} lbPromised
  @param {String} accessToken
  @param {Boolean} debug
   */
  function PushManager(lbPromised, accessToken, debug, appId) {
    this.appId = appId;
    this.pushClient = lbPromised.createClient('push', {
      accessToken: accessToken,
      debug: debug
    });
    this.installationClient = lbPromised.createClient('installation', {
      accessToken: accessToken,
      debug: debug
    });
    if (this.appId == null) {
      this.appId = 'loopback-with-admin';
    }
  }


  /**
  start subscribing push notification
  
  @method subscribe
  @param {String} userId
  @param {String} deviceToken
  @param {String} deviceType (ios|android)
  @return {Promise}
   */

  PushManager.prototype.subscribe = function(userId, deviceToken, deviceType) {
    return this.installationClient.find({
      where: {
        deviceToken: deviceToken,
        deviceType: deviceType
      }
    }).then((function(_this) {
      return function(installations) {
        var ins, promises;
        promises = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = installations.length; i < len; i++) {
            ins = installations[i];
            results.push(this.installationClient.destroyById(ins.id));
          }
          return results;
        }).call(_this);
        return Promise.all(promises);
      };
    })(this)).then((function(_this) {
      return function() {
        return _this.installationClient.findOne({
          where: {
            userId: userId
          }
        }).then(function(installation) {
          if (installation == null) {
            installation = {
              userId: userId
            };
          }
          installation.deviceType = deviceType;
          installation.deviceToken = deviceToken;
          installation.appId = _this.appId;
          return _this.installationClient.upsert(installation);
        });
      };
    })(this));
  };


  /**
  unsubcribe push notification
  
  @method unsubcribe
  @param {String} userId
  @return {Promise}
   */

  PushManager.prototype.unsubscribe = function(userId) {
    return this.installationClient.find({
      where: {
        userId: userId
      }
    }).then((function(_this) {
      return function(installations) {
        var ins, promises;
        promises = (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = installations.length; i < len; i++) {
            ins = installations[i];
            results.push(this.installationClient.destroyById(ins.id));
          }
          return results;
        }).call(_this);
        return Promise.all(promises);
      };
    })(this));
  };


  /**
  send push notification
  
      notification =
          alert: 'hello, world!'
          sound: 'default.aiff'
          badge: 1
  
  @param {String} userId
  @param {Object} notification
  @return {Promise}
   */

  PushManager.prototype.notify = function(userId, notification) {
    if (notification == null) {
      notification = {};
    }
    return this.pushClient.request("?deviceQuery[userId]=" + userId, notification, 'POST');
  };

  return PushManager;

})();

module.exports = PushManager;

},{"es6-promise":8}],7:[function(require,module,exports){
var DebugLogger, colorize, colors, colorsArr, defaultLogger, env, i, log, tabs,
  slice = [].slice,
  hasProp = {}.hasOwnProperty;

tabs = (function() {
  var j, results;
  results = [];
  for (i = j = 0; j <= 20; i = ++j) {
    results.push('    ');
  }
  return results;
})();

colors = {
  'red': '31',
  'green': '32',
  'yellow': '33',
  'blue': '34',
  'purple': '35',
  'cyan': '36'
};

colorsArr = Object.keys(colors);

env = typeof Ti !== "undefined" && Ti !== null ? 'ti' : typeof window !== "undefined" && window !== null ? 'web' : 'node';

colorize = (function() {
  switch (env) {
    case 'ti':
    case 'node':
      return function(str, color) {
        var colorNum;
        if (!color || !colors[color]) {
          return str;
        }
        colorNum = colors[color];
        return "\u001b[" + colorNum + "m" + str + "\u001b[39m";
      };
    case 'web':
      return function(str, color) {
        return "[c=\"color: " + color + "\"]" + str + "[c]";
      };
  }
})();

defaultLogger = (function() {
  switch (env) {
    case 'ti':
      return {
        info: function(v) {
          return Ti.API.info(v);
        },
        warn: function(v) {
          return Ti.API.info(v);
        },
        error: function(v) {
          return Ti.API.info(v);
        },
        trace: function(v) {
          return Ti.API.trace(v);
        }
      };
    case 'web':
      log = require('../../../bower_components/log/log');
      return {
        info: function(v) {
          return log(v);
        },
        warn: function(v) {
          return log('[WARN] ' + v);
        },
        error: function(v) {
          return log('[ERROR] ' + v);
        },
        trace: function(v) {
          return log('[TRACE] ' + v);
        }
      };
    default:
      return console;
  }
})();

DebugLogger = (function() {
  DebugLogger.counter = 0;

  function DebugLogger(endpoint, params, http_method, clientInfo, lbPromisedInfo) {
    var count, ref, ref1;
    this.endpoint = endpoint;
    this.params = params;
    this.http_method = http_method;
    this.clientInfo = clientInfo;
    this.lbPromisedInfo = lbPromisedInfo;
    ref = this.clientInfo, this.accessToken = ref.accessToken, this.debug = ref.debug;
    ref1 = this.lbPromisedInfo, this.baseURL = ref1.baseURL, this.logger = ref1.logger, this.version = ref1.version;
    if (this.logger == null) {
      this.logger = defaultLogger;
    }
    this.logger.now = (function(_this) {
      return function() {
        var col, d, msec;
        if (!_this.startDate) {
          _this.startDate = new Date();
          return _this.startDate.toString();
        } else {
          d = new Date();
          msec = d.getTime() - _this.startDate.getTime();
          col = msec < 50 ? 'green' : msec < 250 ? 'yellow' : 'red';
          return (d.toString()) + " " + (colorize(msec + 'ms', col));
        }
      };
    })(this);
    count = this.constructor.counter = (this.constructor.counter + 1) % colorsArr.length;
    this.color = colorsArr[count];
    this.mark = colorize('●', this.color);
  }

  DebugLogger.prototype.log = function() {
    var ref, vals;
    vals = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return (ref = this.logger).info.apply(ref, [this.mark].concat(slice.call(vals)));
  };

  DebugLogger.prototype.showHeader = function(title) {
    var tab;
    tab = tabs[0];
    this.logger.info("\n");
    this.logger.info("┏────────────────────────────────────────────────────────────────────────────────");
    this.logger.info("┃ " + this.mark + " " + (this.logger.now()));
    this.logger.info("┃ loopback-promised  " + this.baseURL);
    this.logger.info("┃ " + title + "  [" + this.http_method + "]: " + this.endpoint);
    this.logger.info("┃ " + tab + "accessToken: " + (this.accessToken ? this.accessToken.slice(0, 20) + '...' : null));
  };

  DebugLogger.prototype.showFooter = function() {
    this.logger.info("┗────────────────────────────────────────────────────────────────────────────────");
  };

  DebugLogger.prototype.showParams = function(key, value, tabnum, maxTab) {
    var j, k, l, len, len1, line, lines, ref, tab, tab1, v;
    if (tabnum == null) {
      tabnum = 1;
    }
    if (maxTab == null) {
      maxTab = 4;
    }
    tab = tabs.slice(0, tabnum).join('');
    tab1 = tabs[0];
    if (Array.isArray(value)) {
      if (value.length === 0) {
        this.logger.info("┃ " + tab + key + ": []");
      } else {
        this.logger.info("┃ " + tab + key + ": [");
        for (i = j = 0, len = value.length; j < len; i = ++j) {
          v = value[i];
          this.showParams("[" + i + "]", v, tabnum + 1, maxTab);
        }
        this.logger.info("┃ " + tab + "]");
      }
    } else if (typeof (value != null ? value.toISOString : void 0) === 'function') {
      this.logger.info("┃ " + tab + key + ": [" + ((ref = value.constructor) != null ? ref.name : void 0) + "] " + (value.toISOString()));
    } else if (key === 'error' && typeof value === 'object' && typeof (value != null ? value.stack : void 0) === 'string') {
      this.logger.info("┃ " + tab + key + ":");
      for (k in value) {
        if (!hasProp.call(value, k)) continue;
        v = value[k];
        if (k === 'stack') {
          lines = v.split('\n');
          this.logger.info("┃ " + tab + tab1 + "stack:");
          for (l = 0, len1 = lines.length; l < len1; l++) {
            line = lines[l];
            this.logger.info("┃ " + tab + tab1 + tab1 + line);
          }
          continue;
        }
        this.showParams(k, v, tabnum + 1, maxTab);
      }
    } else if ((value != null) && typeof value === 'object' && Object.keys(value).length > 0 && tabnum <= maxTab) {
      this.logger.info("┃ " + tab + key + ":");
      for (k in value) {
        if (!hasProp.call(value, k)) continue;
        v = value[k];
        this.showParams(k, v, tabnum + 1, maxTab);
      }
    } else {
      this.logger.info("┃ " + tab + key + ": " + (JSON.stringify(value)));
    }
  };

  DebugLogger.prototype.showRequestInfo = function() {
    var tab;
    tab = tabs[0];
    this.showHeader(">> " + (colorize('REQUEST', 'purple')));
    this.showParams('params', this.params, 1);
    this.showFooter();
  };

  DebugLogger.prototype.showErrorInfo = function(err) {
    var tab;
    tab = tabs[0];
    this.showHeader("<< " + (colorize('ERROR', 'red')));
    this.showParams('Error', err, 1);
    this.showFooter();
  };

  DebugLogger.prototype.showResponseInfo = function(responseBody, res) {
    var status, tab;
    tab = tabs[0];
    status = responseBody.error ? colorize(res.status, 'red') : colorize(res.status, 'green');
    this.showHeader("<< " + (colorize('RESPONSE', 'cyan')));
    this.logger.info("┃ " + tab + "status: " + status);
    this.showParams('responseBody', responseBody, 1);
    this.showFooter();
  };

  return DebugLogger;

})();

module.exports = DebugLogger;

},{"../../../bower_components/log/log":1}],8:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   2.3.0
 */

(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
      lib$es6$promise$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$toString = {}.toString;
    var lib$es6$promise$asap$$vertxNext;
    var lib$es6$promise$asap$$customSchedulerFn;

    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
      lib$es6$promise$asap$$len += 2;
      if (lib$es6$promise$asap$$len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (lib$es6$promise$asap$$customSchedulerFn) {
          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
        } else {
          lib$es6$promise$asap$$scheduleFlush();
        }
      }
    }

    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
    }

    function lib$es6$promise$asap$$setAsap(asapFn) {
      lib$es6$promise$asap$$asap = asapFn;
    }

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
      var nextTick = process.nextTick;
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // setImmediate should be used instead instead
      var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
      if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
        nextTick = setImmediate;
      }
      return function() {
        nextTick(lib$es6$promise$asap$$flush);
      };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
      return function() {
        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
      };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$es6$promise$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$es6$promise$asap$$flush, 1);
      };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
        var callback = lib$es6$promise$asap$$queue[i];
        var arg = lib$es6$promise$asap$$queue[i+1];

        callback(arg);

        lib$es6$promise$asap$$queue[i] = undefined;
        lib$es6$promise$asap$$queue[i+1] = undefined;
      }

      lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertex() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$es6$promise$asap$$useVertxTimer();
      } catch(e) {
        return lib$es6$promise$asap$$useSetTimeout();
      }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertex();
    } else {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFullfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
        return lib$es6$promise$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
       lib$es6$promise$asap$$asap(function(promise) {
        var sealed = false;
        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$es6$promise$$internal$$resolve(promise, value);
          } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$es6$promise$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$es6$promise$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, thenable._result);
      } else {
        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = lib$es6$promise$$internal$$getThen(maybeThenable);

        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$es6$promise$utils$$isFunction(then)) {
          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFullfillment());
      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
        lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
      } else {
        lib$es6$promise$$internal$$fulfill(promise, value);
      }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$es6$promise$$internal$$FULFILLED;

      if (promise._subscribers.length !== 0) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
      }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
      promise._state = lib$es6$promise$$internal$$REJECTED;
      promise._result = reason;

      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
      }
    }

    function lib$es6$promise$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$es6$promise$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$es6$promise$$internal$$reject(promise, error);
      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, value);
      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$es6$promise$$internal$$reject(promise, e);
      }
    }

    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
      var enumerator = this;

      enumerator._instanceConstructor = Constructor;
      enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (enumerator._validateInput(input)) {
        enumerator._input     = input;
        enumerator.length     = input.length;
        enumerator._remaining = input.length;

        enumerator._init();

        if (enumerator.length === 0) {
          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
        } else {
          enumerator.length = enumerator.length || 0;
          enumerator._enumerate();
          if (enumerator._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
          }
        }
      } else {
        lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
      }
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return lib$es6$promise$utils$$isArray(input);
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
      var enumerator = this;

      var length  = enumerator.length;
      var promise = enumerator.promise;
      var input   = enumerator._input;

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        enumerator._eachEntry(input[i], i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var enumerator = this;
      var c = enumerator._instanceConstructor;

      if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
          entry._onerror = null;
          enumerator._settledAt(entry._state, i, entry._result);
        } else {
          enumerator._willSettleAt(c.resolve(entry), i);
        }
      } else {
        enumerator._remaining--;
        enumerator._result[i] = entry;
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var enumerator = this;
      var promise = enumerator.promise;

      if (promise._state === lib$es6$promise$$internal$$PENDING) {
        enumerator._remaining--;

        if (state === lib$es6$promise$$internal$$REJECTED) {
          lib$es6$promise$$internal$$reject(promise, value);
        } else {
          enumerator._result[i] = value;
        }
      }

      if (enumerator._remaining === 0) {
        lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
      });
    };
    function lib$es6$promise$promise$all$$all(entries) {
      return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (!lib$es6$promise$utils$$isArray(entries)) {
        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$resolve$$resolve(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
    function lib$es6$promise$promise$reject$$reject(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

    var lib$es6$promise$promise$$counter = 0;

    function lib$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
      this._id = lib$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if (lib$es6$promise$$internal$$noop !== resolver) {
        if (!lib$es6$promise$utils$$isFunction(resolver)) {
          lib$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof lib$es6$promise$promise$$Promise)) {
          lib$es6$promise$promise$$needsNew();
        }

        lib$es6$promise$$internal$$initializePromise(this, resolver);
      }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

    lib$es6$promise$promise$$Promise.prototype = {
      constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection) {
        var parent = this;
        var state = parent._state;

        if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
          return this;
        }

        var child = new this.constructor(lib$es6$promise$$internal$$noop);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          lib$es6$promise$asap$$asap(function(){
            lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    function lib$es6$promise$polyfill$$polyfill() {
      var local;

      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }

      var P = local.Promise;

      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
      }

      local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
      'Promise': lib$es6$promise$promise$$default,
      'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":9}],9:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],10:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.req.method !='HEAD' 
     ? this.xhr.responseText 
     : null;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse && str && str.length
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self); 
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
    }

    self.callback(err, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":11,"reduce":12}],11:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],12:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],13:[function(require,module,exports){
window.LoopbackPromised = require('./dist/lib/loopback-promised');

},{"./dist/lib/loopback-promised":3}]},{},[13]);
