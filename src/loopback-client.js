/**
Loopback Client to access to PersistedModel (or extenders)
see http://docs.strongloop.com/display/public/LB/PersistedModel+REST+API
see also http://apidocs.strongloop.com/loopback/#persistedmodel
@class LoopbackClient
@module loopback-promised
 */


//persistedmodel

class LoopbackClient {

  /**
  
  @constructor
  @param {LoopbackPromised} lbPromised
  @param {String} pluralModelName
  @param {String} [accessToken] Access Token
  @param {Number} [timeout] msec to timeout
  @param {Boolean} [debug] shows debug log if true
   */
  constructor(lbPromised, pluralModelName, accessToken, timeout, debug) {
    this.lbPromised = lbPromised
    this.pluralModelName = pluralModelName
    this.accessToken = accessToken
    this.timeout = timeout
    this.debug = debug
  }


  /**
  sets Access Token
  
  @method setAccessToken
  @param {String} [accessToken] Access Token
  @return {Promise(Object)}
   */

  setAccessToken(accessToken) {
    this.accessToken = accessToken
  }


  /**
  sends request to Loopback
  
  @method request
  @private
  @param {String} path
  @param {Object} params request parameters
  @param {String} http_method {GET|POST|PUT|DELETE}
  @return {Promise(Object)}
   */

  request(path, params, http_method) {
    if (params == null) {
      params = {}
    }
    return this.lbPromised.request(this.pluralModelName, path, params, http_method, this)
  }


  /**
  Return the number of records that match the optional "where" filter.
  
  @method count
  @param {Object} [where]
  @return {Promise(Number)}
   */

  count(where) {
    if (where == null) {
      where = {}
    }
    let path = '/count'
    let http_method = 'GET'
    let params = {}
    if (Object.keys(where)) {
      params.where = where
    }
    return this.request(path, params, http_method).then(result => result.count)
  }


  /**
  Create new instance of Model class, saved in database
  
  @method create
  @param {Object} data
  @return {Promise(Object)}
   */

  create(data) {
    // when array is given, creates each data
    let d
    if (data == null) {
      data = {}
    }
    if (Array.isArray(data)) {
      return Promise.all((() => {
        let results = []
        for (let d of data) {
          results.push(this.create(d))
        }
        return results
      }).call(this))
    }
    let path = ''
    let http_method = 'POST'
    let params = data
    return this.request(path, params, http_method)
  }


  /**
  Update or insert a model instance
  The update will override any specified attributes in the request data object. It won’t remove  existing ones unless the value is set to null.
  
  @method upsert
  @param {Object} data
  @return {Promise(Object)}
   */

  upsert(data) {
    if (data == null) {
      data = {}
    }
    let path = ''
    let http_method = 'PUT'
    let params = data
    return this.request(path, params, http_method)
  }


  /**
  Check whether a model instance exists in database.
  
  @method exists
  @param {String} id
  @return {Promise(Object)}
   */

  exists(id) {
    let path = '/' + id + '/exists'
    let http_method = 'GET'
    let params = null
    return this.request(path, params, http_method)
  }


  /**
  Find object by ID.
  
  @method findById
  @param {String} id
  @return {Promise(Object)}
   */

  findById(id) {
    let path = '/' + id
    let http_method = 'GET'
    let params = null
    return this.request(path, params, http_method)
  }


  /**
  Find all model instances that match filter specification.
  
  @method find
  @param {Object} filter
  @return {Promise(Array(Object))}
   */

  find(filter) {
    let where
    if (filter != null ? filter.where : undefined) {
      where = removeUndefinedKey(filter.where)
      if (!where) {
        filter.where = null
      }
    }
    if ((filter != null) && filter.where === null) {
      if (this.debug) {
        console.log('returns empty array, as \"where\" is null.')
      }
      return Promise.resolve([])
    }
    let path = ''
    let http_method = 'GET'
    let params = {
      filter: filter
    }
    return this.request(path, params, http_method)
  }


  /**
  Find one model instance that matches filter specification. Same as find, but limited to one result
  
  @method findOne
  @param {Object} filter
  @return {Promise(Object)}
   */

  findOne(filter) {
    let path = '/findOne'
    let http_method = 'GET'
    let params = {
      filter: filter
    }
    return this.request(path, params, http_method)['catch'](err => {
      if (err.isLoopbackResponseError && err.code === 'MODEL_NOT_FOUND') {
        return null
      } else {
        throw err
      }
    })
  }


  /**
  Destroy model instance with the specified ID.
  
  @method destroyById
  @param {String} id
  @return {Promise}
   */

  destroyById(id) {
    let path = '/' + id
    let http_method = 'DELETE'
    let params = null
    return this.request(path, params, http_method)
  }


  /**
  Destroy model instance
  
  @method destroy
  @param {Object} data
  @return {Promise}
   */

  destroy(data) {
    return this.destroyById(data.id)
  }


  /**
  Update set of attributes.
  
  @method updateAttributes
  @param {Object} data
  @return {Promise(Object)}
   */

  updateAttributes(id, data) {
    let path = '/' + id
    let http_method = 'PUT'
    let params = data
    return this.request(path, params, http_method)
  }


  /**
  Update multiple instances that match the where clause
  
  @method updateAll
  @param {Object} where
  @param {Object} data
  @return {Promise}
   */

  updateAll(where, data) {
    let path = '/update?where=' + (JSON.stringify(where))
    let http_method = 'POST'
    let params = data
    return this.request(path, params, http_method)
  }
}
// remove keys whose value is undefined
// except Date, Moment
let removeUndefinedKey = obj => {
  let key, value
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  if (typeof (obj != null ? obj.toISOString : undefined) === 'function') { // Date, Moment
    return obj.toISOString()
  }
  let keynum = 0
  let deletedKeynum = 0
  for (key in obj) {
    value = obj[key]
    value = removeUndefinedKey(value)
    if (value === undefined) {
      delete obj[key]
      deletedKeynum++
    }
    keynum++
  }
  if (keynum === deletedKeynum) {
    return undefined
  } else {
    return obj
  }
}
export default LoopbackClient