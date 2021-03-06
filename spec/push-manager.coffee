
PushManager = require '../src/push-manager'
LoopbackPromised = require '../src/loopback-promised'

createPushManager = ->
    lbPromised = LoopbackPromised.createInstance
        baseURL: 'localhost:4157/test-api'

    accessToken = 'test'

    return new PushManager(lbPromised, accessToken, true)

before (done) ->
    @timeout 5000
    require('./init').then -> done()


userId = 'xx'

describe 'PushManager', ->

    describe 'subscribe', ->
        it 'registers patient-device information', (done) ->

            deviceToken = 'abc'
            deviceType = 'android'

            pushManager = createPushManager()

            pushManager.subscribe(userId, deviceToken, deviceType).then (result) ->
                assert result.appId is 'loopback-with-admin'
                assert result.userId is userId.toString()
                assert result.deviceToken is deviceToken
                assert result.deviceType is deviceType
                done()

            .catch (err) ->
                done err

        it 'deletes information of the same deviceToken', (done) ->
            deviceToken = 'abc'
            deviceType = 'android'

            pushManager = createPushManager()
            pushManager.subscribe(userId, deviceToken, deviceType).then (result) ->
                pushManager.installationClient.find(where: deviceToken: deviceToken).then (results) ->
                    assert results.length is 1
                    done()

            .catch (err) ->
                done err


        it 'updates information of the same deviceToken', (done) ->
            deviceToken = 'dummy'
            deviceType = 'ios'

            pushManager = createPushManager()
            pushManager.subscribe(userId, deviceToken, deviceType).then (result) ->
                pushManager.installationClient.find(where: userId: userId).then (results) ->
                    assert results.length is 1
                    done()

            .catch (err) ->
                done err



    describe 'notify', ->
        @timeout 4000
        it 'pushes notification to patient (ios)', (done) ->

            notification =
                alert: 'push notification test for iOS'
                sound: 'default.aiff'
                badge: 1

            pushManager = createPushManager()
            pushManager.notify(userId, notification).then (result)->
                console.log 'waiting for ios push notification to be delivered...'
                setTimeout ->
                    done()
                , 2000

            .catch (err) ->
                done err

        it 'pushes notification to patient (android)', (done) ->

            deviceToken = 'dummy'
            deviceType = 'android'

            pushManager = createPushManager()
            pushManager.subscribe(userId, deviceToken, deviceType).then (result) ->

                notification =
                    alert: 'push notification test for android'
                    sound: 'default.aiff'
                    badge: 1

                pushManager.notify(userId, notification).then (result)->
                    console.log 'waiting for android push notification to be delivered...'
                    setTimeout ->
                        done()
                    , 2000

            .catch (err) ->
                done err




    describe 'unsubscribe', ->
        it 'unregisters patient, devices', (done) ->

            pushManager = createPushManager()
            pushManager.unsubscribe(userId).then ->
                pushManager.installationClient.findOne(where: userId: userId).then (result) ->
                    assert not result?
                    done()

            .catch (err) ->
                done err
