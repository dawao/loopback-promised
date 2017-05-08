/**
managing push notification.
Currently supports only for loopback servers build by [loopback-with-domain](https://github.com/cureapp/loopback-with-domain)
@class PushManager
 */


class PushManager {

  /**
  @constructor
  @param {LoopbackPromised} lbPromised
  @param {String} accessToken
  @param {Boolean} debug
   */
  constructor(lbPromised, accessToken, debug, appId) {
    this.appId = appId
    this.pushClient = lbPromised.createClient('push', {
      accessToken: accessToken,
      debug: debug
    })
    this.installationClient = lbPromised.createClient('installation', {
      accessToken: accessToken,
      debug: debug
    })
    if (this.appId == null) {
      this.appId = 'loopback-with-admin'
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

  subscribe(userId, deviceToken, deviceType) {
    // if the deviceToken already used, delete the existing one
    return this.installationClient.find({
      where: {
        deviceToken: deviceToken,
        deviceType: deviceType
      }
    }).then(
      (installations) => {
        let ins
        let promises = (() => {
          let results = []
          for (let ins of installations) {
            results.push(this.installationClient.destroyById(ins.id))
          }
          return results
        }).call(this)
        return Promise.all(promises)
      }).then(
      () => {
        // override userId if exists
        return this.installationClient.findOne({
          where: {
            userId: userId
          }
        }).then(installation => {
          if (installation == null) {
            installation = {
              userId: userId
            }
          }
          installation.deviceType = deviceType
          installation.deviceToken = deviceToken
          installation.appId = this.appId
          return this.installationClient.upsert(installation)
        })
      })
  }


  /**
  unsubcribe push notification
  
  @method unsubcribe
  @param {String} userId
  @return {Promise}
   */

  unsubscribe(userId) {
    return this.installationClient.find({
      where: {
        userId: userId
      }
    }).then(
      (installations) => {
        let ins
        let promises = (() => {
          let results = []
          for (let ins of installations) {
            results.push(this.installationClient.destroyById(ins.id))
          }
          return results
        }).call(this)
        return Promise.all(promises)
      })
  }


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

  notify(userId, notification) {
    if (notification == null) {
      notification = {}
    }
    return this.pushClient.request('?deviceQuery[userId]=' + userId, notification, 'POST')
  }
}
export default PushManager