
tabs = ('    ' for i in [0..20])

colors =
  'red'    : '31'
  'green'  : '32'
  'yellow' : '33'
  'blue'   : '34'
  'purple' : '35'
  'cyan'   : '36'

colorsArr = Object.keys(colors)

env =
    if Ti?
        'ti'
    else if window?
        'web'
    else
        'node'


colorize =
    switch env
        when 'ti', 'node'
            (str, color) ->
                return str if not color or not colors[color]
                colorNum = colors[color]
                return "\u001b[#{colorNum}m#{str}\u001b[39m"

        when 'web'
            (str, color) ->
                return "[c=\"color: #{color}\"]#{str}[c]"



defaultLogger =
    switch env
        when 'ti'
            info  : (v) -> Ti.API.info(v)
            warn  : (v) -> Ti.API.info(v)
            error : (v) -> Ti.API.info(v)
            trace : (v) -> Ti.API.trace(v)

        when 'web'

            info  : (v) -> console.log(v)
            warn  : (v) -> console.log('[WARN] ',  v)
            error : (v) -> console.log('[ERROR] ', v)
            trace : (v) -> console.log('[TRACE] ', v)

        else
            console



class DebugLogger

    @counter : 0

    constructor: (@endpoint, @params, @http_method, @clientInfo, @lbPromisedInfo) ->

        { @accessToken, @debug } = @clientInfo

        { @baseURL, @logger, @version } = @lbPromisedInfo

        @logger ?= defaultLogger

        @logger.now = =>
            if not @startDate
                @startDate = new Date()
                return @startDate.toString()
            else
                d = new Date()
                msec = d.getTime() - @startDate.getTime()
                col=
                    if msec < 50
                        'green'
                    else if msec < 250
                        'yellow'
                    else
                        'red'

                return "#{d.toString()} #{colorize msec + 'ms', col}"



        count = @constructor.counter = (@constructor.counter + 1) % colorsArr.length
        @color = colorsArr[count]
        @mark = colorize('●', @color)


    log: (vals...) ->
        @logger.info(@mark, vals...)

    showHeader: (title) ->
        tab = tabs[0]

        @logger.info "\n"
        @logger.info "┏────────────────────────────────────────────────────────────────────────────────"
        @logger.info "┃ #{@mark} #{@logger.now()}"
        @logger.info "┃ loopback-promised  #{@baseURL}"
        @logger.info "┃ #{title}  [#{@http_method}]: #{@endpoint}"
        @logger.info "┃ #{tab}accessToken: #{if @accessToken then @accessToken.slice(0, 20) + '...' else null}"
        return


    showFooter: ->
        @logger.info "┗────────────────────────────────────────────────────────────────────────────────"
        return



    showParams: (key, value, tabnum = 1, maxTab = 4) ->

        tab = tabs.slice(0, tabnum).join('')
        tab1 = tabs[0]

        # array
        if Array.isArray value
            if value.length is 0
                @logger.info "┃ #{tab}#{key}: []"

            else
                @logger.info "┃ #{tab}#{key}: ["
                for v,i in value
                    @showParams("[#{i}]", v, tabnum + 1, maxTab)
                @logger.info "┃ #{tab}]"

        # date, moment
        else if typeof value?.toISOString is 'function'
            @logger.info "┃ #{tab}#{key}: [#{value.constructor?.name}] #{value.toISOString()}"


        # error
        else if key is 'error' and typeof value is 'object' and typeof value?.stack is 'string'
            @logger.info "┃ #{tab}#{key}:"
            for own k, v of value
                if k is 'stack'
                    lines = v.split('\n')
                    @logger.info "┃ #{tab}#{tab1}stack:"
                    for line in lines
                        @logger.info "┃ #{tab}#{tab1}#{tab1}#{line}"
                    continue

                @showParams(k, v, tabnum + 1, maxTab)




        # object
        else if value? and typeof value is 'object' and Object.keys(value).length > 0 and tabnum <= maxTab
            @logger.info "┃ #{tab}#{key}:"
            for own k, v of value
                @showParams(k, v, tabnum + 1, maxTab)


        # others
        else
            @logger.info "┃ #{tab}#{key}: #{JSON.stringify value}"

        return


    showRequestInfo : ->

        tab = tabs[0]

        @showHeader ">> #{colorize('REQUEST', 'purple')}"
        @showParams('params', @params, 1)
        @showFooter()
        return


    showErrorInfo: (err) ->

        tab = tabs[0]

        @showHeader "<< #{colorize('ERROR', 'red')}"
        @showParams('Error', err, 1)
        @showFooter()
        return



    showResponseInfo: (responseBody, status) ->

        tab = tabs[0]
        status = if responseBody.error then colorize(status, 'red') else colorize(status, 'green')

        @showHeader "<< #{colorize('RESPONSE', 'cyan')}"
        @logger.info "┃ #{tab}status: #{status}"
        @showParams('responseBody', responseBody, 1)
        @showFooter()
        return


module.exports = DebugLogger
