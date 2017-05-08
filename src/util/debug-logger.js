let i
let tabs = (() => {
  let j
  let results = []
  for (i = j = 0; j <= 20; i = ++j) {
    results.push('    ')
  }
  return results
})()
let colors = {
  'red': '31',
  'green': '32',
  'yellow': '33',
  'blue': '34',
  'purple': '35',
  'cyan': '36'
}
let colorsArr = Object.keys(colors)
let env = typeof Ti !== 'undefined' && Ti !== null ? 'ti' : typeof window !== 'undefined' && window !== null ? 'web' : 'node'
let colorize = (() => {
  switch (env) {
    case 'ti':
    case 'node':
      return (str, color) => {
        if (!color || !colors[color]) {
          return str
        }
        let colorNum = colors[color]
        return '\u001b[' + colorNum + 'm' + str + '\u001b[39m'
      }
    case 'web':
      return (str, color) => '[c=\"color: ' + color + '\"]' + str + '[c]'
  }
})()
let defaultLogger = (() => {
  switch (env) {
    case 'ti':
      return {
        info(v) {
          return Ti.API.info(v)
        },
        warn(v) {
          return Ti.API.info(v)
        },
        error(v) {
          return Ti.API.info(v)
        },
        trace(v) {
          return Ti.API.trace(v)
        }
      }
    case 'web':
      return {
        info(v) {
          return console.log(v)
        },
        warn(v) {
          return console.log('[WARN] ', v)
        },
        error(v) {
          return console.log('[ERROR] ', v)
        },
        trace(v) {
          return console.log('[TRACE] ', v)
        }
      }
    default:
      return console
  }
})()

class DebugLogger {
  static get counter() { return 0 }

  constructor(endpoint, params, http_method, clientInfo, lbPromisedInfo) {
    this.endpoint = endpoint
    this.params = params
    this.http_method = http_method
    this.clientInfo = clientInfo
    this.lbPromisedInfo = lbPromisedInfo
    let ref = this.clientInfo
    this.accessToken = ref.accessToken
    this.debug = ref.debug
    let ref1 = this.lbPromisedInfo
    this.baseURL = ref1.baseURL
    this.logger = ref1.logger
    this.version = ref1.version
    if (this.logger == null) {
      this.logger = defaultLogger
    }
    this.logger.now =
      () => {
        let col, d, msec
        if (!this.startDate) {
          this.startDate = new Date()
          return this.startDate.toString()
        } else {
          d = new Date()
          msec = d.getTime() - this.startDate.getTime()
          col = msec < 50 ? 'green' : msec < 250 ? 'yellow' : 'red'
          return (d.toString()) + ' ' + (colorize(msec + 'ms', col))
        }
      }
    let count = this.constructor.bind(this).counter = (this.constructor.bind(this).counter + 1) % colorsArr.length
    this.color = colorsArr[count]
    this.mark = colorize('●', this.color)
  }

  log(...vals) {
    let ref

    return (ref = this.logger).info(this.mark, ...vals)
  }

  showHeader(title) {
    let tab = tabs[0]
    this.logger.info('\n')
    this.logger.info('┏────────────────────────────────────────────────────────────────────────────────')
    this.logger.info('┃ ' + this.mark + ' ' + (this.logger.now()))
    this.logger.info('┃ loopback-promised  ' + this.baseURL)
    this.logger.info('┃ ' + title + '  [' + this.http_method + ']: ' + this.endpoint)
    this.logger.info('┃ ' + tab + 'accessToken: ' + (this.accessToken ? this.accessToken.slice(0, 20) + '...' : null))
  }

  showFooter() {
    this.logger.info('┗────────────────────────────────────────────────────────────────────────────────')
  }

  showParams(key, value, tabnum, maxTab) {
    let j, k, l, len, len1, line, lines, ref, v
    if (tabnum == null) {
      tabnum = 1
    }
    if (maxTab == null) {
      maxTab = 4
    }
    let tab = tabs.slice(0, tabnum).join('')
    let tab1 = tabs[0]
    // array
    if (Array.isArray(value)) {
      if (value.length === 0) {
        this.logger.info('┃ ' + tab + key + ': []')
      } else {
        this.logger.info('┃ ' + tab + key + ': [')
        for (i = j = 0, len = value.length; j < len; i = ++j) {
          v = value[i]
          this.showParams('[' + i + ']', v, tabnum + 1, maxTab)
        }
        this.logger.info('┃ ' + tab + ']')
      }
    // date, moment
    } else if (typeof (value != null ? value.toISOString : undefined) === 'function') {
      this.logger.info('┃ ' + tab + key + ': [' + (value.constructor && value.constructor.name) + '] ' + (value.toISOString()))
    // error
    } else if (key === 'error' && typeof value === 'object' && typeof (value != null ? value.stack : undefined) === 'string') {
      this.logger.info('┃ ' + tab + key + ':')
      for (k in value) {
        if (!hasProp.call(value, k)) continue
        v = value[k]
        if (k === 'stack') {
          lines = v.split('\n')
          this.logger.info('┃ ' + tab + tab1 + 'stack:')
          for (let line of lines) {
            this.logger.info('┃ ' + tab + tab1 + tab1 + line)
          }
          continue
        }
        this.showParams(k, v, tabnum + 1, maxTab)
      }
    // object
    } else if ((value != null) && typeof value === 'object' && Object.keys(value).length > 0 && tabnum <= maxTab) {
      this.logger.info('┃ ' + tab + key + ':')
      for (k in value) {
        if (!hasProp.call(value, k)) continue
        v = value[k]
        this.showParams(k, v, tabnum + 1, maxTab)
      }
    } else {
      // others
      this.logger.info('┃ ' + tab + key + ': ' + (JSON.stringify(value)))
    }
  }

  showRequestInfo() {
    let tab = tabs[0]
    this.showHeader('>> ' + (colorize('REQUEST', 'purple')))
    this.showParams('params', this.params, 1)
    this.showFooter()
  }

  showErrorInfo(err) {
    let tab = tabs[0]
    this.showHeader('<< ' + (colorize('ERROR', 'red')))
    this.showParams('Error', err, 1)
    this.showFooter()
  }

  showResponseInfo(responseBody, status) {
    let tab = tabs[0]
    status = responseBody.error ? colorize(status, 'red') : colorize(status, 'green')
    this.showHeader('<< ' + (colorize('RESPONSE', 'cyan')))
    this.logger.info('┃ ' + tab + 'status: ' + status)
    this.showParams('responseBody', responseBody, 1)
    this.showFooter()
  }
}
export default DebugLogger