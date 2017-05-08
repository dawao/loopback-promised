import LoopbackClient from './loopback-client'

/**
Loopback User Client to access to UserModel (or extenders)
see http://docs.strongloop.com/display/public/LB/PersistedModel+REST+API
see also http://apidocs.strongloop.com/loopback/#persistedmodel
@class LoopbackUserClient
@module loopback-promised
 */


//persistedmodel

class LoopbackUserClient extends LoopbackClient {

  /**
  Confirm the user's identity.
  
  @method confirm
  @param {String} userId
  @param {String} token The validation token
  @param {String} redirect URL to redirect the user to once confirmed
  @return {Promise(Object)}
   */

  confirm(userId, token, redirect) {
    let path = '/confirm'
    let http_method = 'GET'
    let params = {
      uid: userId,
      token: token,
      redirect: redirect
    }
    return this.request(path, params, http_method)
  }


  /**
  Login a user by with the given credentials
  
  @method login
  @param {Object} credentials email/password
  @param {String} include Optionally set it to "user" to include the user info
  @return {Promise(Object)}
   */

  login(credentials, include) {
    let path = '/login'
    if (include) {
      path += '?include=' + include
    }
    let http_method = 'POST'
    let params = credentials
    // TODO handle include option
    return this.request(path, params, http_method)
  }


  /**
  Logout a user with the given accessToken id.
  
  @method logout
  @param {String} accessTokenID
  @return {Promise}
   */

  logout(accessTokenID) {
    let path = '/logout?access_token=' + accessTokenID
    let http_method = 'POST'
    let params = null
    return this.request(path, params, http_method)
  }


  /**
  Create a short lived acess token for temporary login. Allows users to change passwords if forgotten.
  
  @method resetPassword
  @param {String} email
  @return {Promise}
   */

  resetPassword(email) {
    let path = '/logout?access_token=' + accessTokenID
    let http_method = 'POST'
    let params = {
      email: email
    }
    // TODO handle include option
    return this.request(path, params, http_method)
  }
}
export default LoopbackUserClient