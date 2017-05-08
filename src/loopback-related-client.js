import LoopbackClient from './loopback-client'

/**
Loopback Client to access to PersistedModel (or extenders) via one-to-many relation
@class LoopbackRelatedClient
@extends LoopbackClient
@module loopback-promised
 */


class LoopbackRelatedClient extends LoopbackClient {


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

  constructor(lbPromised, pluralModelName, pluralModelNameMany, id1, accessToken, timeout, debug) {
    super(lbPromised, pluralModelName, accessToken, timeout, debug);
    this.pluralModelNameMany = pluralModelNameMany
    this.id = id1
  }


  /**
  set id of the "one" model
  
  @method setAccessToken
  @param {any} id
  @return {Promise(Object)}
   */

  setId(id1) {
    this.id = id1
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
    path = '/' + this.id + '/' + this.pluralModelNameMany + path
    return this.lbPromised.request(this.pluralModelName, path, params, http_method, this)
  }


  /**
  Update or insert a model instance
  The update will override any specified attributes in the request data object. It won’t remove  existing ones unless the value is set to null.
  
  @method upsert
  @param {Object} data
  @return {Promise(Object)}
   */

  upsert(data) {
    let k, params, v
    if (data == null) {
      data = {}
    }
    if (data.id != null) {
      params = {}
      for (k in data) {
        v = data[k]
        if (k !== 'id') {
          params[k] = v
        }
      }
      return this.updateAttributes(data.id, params)
    } else {
      return this.create(data)
    }
  }


  /**
  Check whether a model instance exists in database.
  
  @method exists
  @param {String} id
  @return {Promise(Object)}
   */

  exists(id) {
    return this.findById(id).then(data => {
      return {
        exists: true
      }
    })['catch'](err => {
      if (err.isLoopbackResponseError) {
        return {
          exists: false
        }
      }
      throw err
    })
  }


  /**
  Find one model instance that matches filter specification. Same as find, but limited to one result
  
  @method findOne
  @param {Object} filter
  @return {Promise(Object)}
   */

  findOne(filter) {
    return this.find(filter).then(results => results[0])
  }


  /**
  Update multiple instances that match the where clause
  
  @method updateAll
  @param {Object} where
  @param {Object} data
  @return {Promise(Array(Object))}
   */

  updateAll(where, data) {
    return this.find({
      where: where,
      fields: 'id'
    }).then(
      (results) => {
        let result
        return Promise.all((() => {
          let results1 = []
          for (let result of results) {
            results1.push(this.updateAttributes(result.id, data))
          }
          return results1
        }).call(this))
      })
  }
}
export default LoopbackRelatedClient