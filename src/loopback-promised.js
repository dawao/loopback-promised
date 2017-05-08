import LoopbackClient from './loopback-client'
import LoopbackUserClient from './loopback-user-client'
import LoopbackRelatedClient from './loopback-related-client'
import PushManager from './push-manager'
import DebugLogger from './util/debug-logger'
const fetch = require('fetch-ponyfill')({
  Promise: Promise,
  XMLHttpRequest: typeof XMLHttpRequest === 'function' ? XMLHttpRequest : undefined
})

import qs from 'qs'
let timeoutLimit = (msec, promise) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('timeout of ' + msec + 'ms exceeded')), msec)
    return promise.then(resolve, reject)
  })
}

/**
LoopbackPromised
@class LoopbackPromised
@module loopback-promised
 */


class LoopbackPromised {

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
  static createInstance(lbPromisedInfo) {
    if (lbPromisedInfo == null) {
      lbPromisedInfo = {}
    }
    return new LoopbackPromised(lbPromisedInfo.baseURL, lbPromisedInfo.logger, lbPromisedInfo.version)
  }


  /**
  
  @constructor
  @private
   */

  constructor(baseURL1, logger1, version1) {
    this.baseURL = baseURL1
    this.logger = logger1
    this.version = version1
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

  request(pluralModelName, path, params, http_method, clientInfo) {
    if (params == null) {
      params = {}
    }
    if (clientInfo == null) {
      clientInfo = {}
    }
    let endpoint = '/' + pluralModelName + path
    return LoopbackPromised.requestStatic(endpoint, params, http_method, clientInfo, this)
  }


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

  static requestStatic(endpoint, params, http_method, clientInfo, lbPromisedInfo) {
    let debugLogger, flattenParams, k, queryString, v
    if (params == null) {
      params = {}
    }
    if (clientInfo == null) {
      clientInfo = {}
    }
    let accessToken = clientInfo.accessToken, timeout = clientInfo.timeout
    let baseURL = lbPromisedInfo.baseURL, logger = lbPromisedInfo.logger, version = lbPromisedInfo.version
    let debug = this.isDebugMode(clientInfo.debug)
    if (debug) {
      debugLogger = new DebugLogger(endpoint, params, http_method, clientInfo, lbPromisedInfo)
    }
    if (!baseURL) {
      return Promise.reject('baseURL is required.')
    }
    if (baseURL.slice(0, 4) !== 'http') {
      baseURL = 'http://' + baseURL
    }
    if (debug) {
      debugLogger.showRequestInfo()
    }
    let url = version != null ? baseURL + '/' + version + endpoint : baseURL + endpoint
    let fetchParams = {
      method: http_method,
      headers: {}
    }
    if (accessToken) {
      fetchParams.headers.Authorization = accessToken
    }
    if (http_method === 'GET') {
      flattenParams = {}
      for (k in params) {
        v = params[k]
        if (typeof v === 'function') {
          continue
        }
        flattenParams[k] = typeof v === 'object' ? JSON.stringify(v) : v
      }
      queryString = qs.stringify(flattenParams)
      if (queryString) {
        url += '?' + queryString
      }
    } else if (Object.keys(params).length) {
      fetchParams.body = JSON.stringify(params)
      fetchParams.headers['Content-Type'] = 'application/json'
    }
    let responseStatus = null
    let fetched = fetch(url, fetchParams).then(response => {
      responseStatus = response.status
      if (responseStatus === 204) { // No Contents
        return '{}'
      } else {
        return response.text()
      }
    }, err => {
      if (debug) {
        debugLogger.showErrorInfo(err)
      }
      throw err
    }).then(text => {
      let e, err, error, ref, responseBody
      try {
        responseBody = JSON.parse(text)
      } catch (error) {
        e = error
        responseBody = {
          error: text
        }
      }
      if (debug) {
        debugLogger.showResponseInfo(responseBody, responseStatus)
      }
      if (responseBody.error) {
        if (typeof responseBody.error === 'object') {
          err = new Error()
          ref = responseBody.error
          for (k in ref) {
            v = ref[k]
            err[k] = v
          }
          err.isLoopbackResponseError = true
        } else {
          err = new Error(responseBody.error)
        }
        // err.isLoopbackResponseError = true
        throw err
      } else {
        return responseBody
      }
    })
    if (timeout != null) {
      return timeoutLimit(timeout, fetched)
    } else {
      return fetched
    }
  }


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

  createClient(pluralModelName, options) {
    let id, pluralModelNameOne
    if (options == null) {
      options = {}
    }
    if (options.belongsTo) {
      pluralModelNameOne = Object.keys(options.belongsTo)[0]
      id = options.belongsTo[pluralModelNameOne]
      return this.createRelatedClient({
        one: pluralModelNameOne,
        many: pluralModelName,
        id: id,
        timeout: options.timeout,
        accessToken: options.accessToken,
        debug: options.debug
      })
    } else if (options.isUserModel) {
      return this.createUserClient(pluralModelName, options)
    }
    return new LoopbackClient(this, pluralModelName, options.accessToken, options.timeout, options.debug)
  }


  /**
  creates user client for Loopback
  
  @method createUserClient
  @param {String} pluralModelName
  @param {Object} [clientInfo]
  @param {String}  [clientInfo.accessToken] Access Token
  @param {Boolean} [clientInfo.debug] shows debug log if true
  @return {LoopbackClient}
   */

  createUserClient(pluralModelName, clientInfo) {
    if (clientInfo == null) {
      clientInfo = {}
    }
    return new LoopbackUserClient(this, pluralModelName, clientInfo.accessToken, clientInfo.timeout, clientInfo.debug)
  }


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

  createRelatedClient(options) {
    return new LoopbackRelatedClient(this, options.one, options.many, options.id, options.accessToken, options.timeout, options.debug)
  }


  /**
  creates push manager
  
  @method createPushManager
  @public
  @param {Object} [clientInfo]
  @param {String}  [clientInfo.accessToken] Access Token
  @param {Boolean} [clientInfo.debug] shows debug log if true
  @return {PushManager}
   */

  createPushManager(clientInfo) {
    if (clientInfo == null) {
      clientInfo = {}
    }
    return new PushManager(this, clientInfo.accessToken, clientInfo.debug)
  }


  /**
  check environment variable concerning debug
  
  @private
  @static
  @method isDebugMode
  @param {Boolean} debug
  @return {Boolean} shows debug log or not
   */

  static isDebugMode(debug) {
    return debug || !!(typeof process !== 'undefined' && process !== null ? process.env && process.env.LBP_DEBUG : undefined)
  }
}
LoopbackPromised.Promise = Promise
LoopbackPromised.LoopbackClient = LoopbackClient
LoopbackPromised.LoopbackUserClient = LoopbackUserClient
LoopbackPromised.LoopbackRelatedClient = LoopbackRelatedClient
export default LoopbackPromised