const MockAdapter = require('axios-mock-adapter')
const fs = require('fs')
const ticketPath = __dirname + '/ticket.txt'
const ticket = fs.existsSync(ticketPath) ? fs.readFileSync(ticketPath, 'utf8') : null

module.exports = mock

mock.expiresIn = 1.2
mock.appId = process.env.APP_ID || 'ww073d566727158bca'
mock.appSecret = process.env.APP_SECRET || 'test'
mock.appTicket = process.env.APP_TICKET || ticket || 't'
mock.accessToken = 'abcd'

function mock(axios) {
  if (process.env.APP_SECRET) return

  const adapter = new MockAdapter(axios)
  let expiredAt = Date.now() + mock.expiresIn * 1000

  function invalidToken(config) {
    let errcode = 0
    let errmsg = 'ok'
    if (!config.params.access_token) {
      errcode = 41001
      errmsg = 'access_token missing'
    } else if (config.params.access_token != mock.accessToken) {
      errcode = 40014
      errmsg = 'invalid access_token'
    } else if (Date.now() > expiredAt) {
      errcode = 42001
      errmsg = 'access_token expired'
    }
    if (errcode)
      return [
        200,
        {
          errcode: errcode,
          errmsg: errmsg,
        },
      ]
  }

  adapter.onPost('cgi-bin/media/upload').reply(function (config) {
    let errcode = 0
    let errmsg = 'ok'
    let ret = invalidToken(config)
    if (ret) return ret
    if (!config.data || !config.data.pipe) {
      errcode = 1
      errmsg = 'missing media'
    }

    return [
      200,
      {
        errcode: errcode,
        errmsg: errmsg,
        media_id: 'id',
      },
    ]
  })

  adapter.onGet('cgi-bin/media/get').reply(function (config) {
    let ret = invalidToken(config)
    if (ret) return ret
    if (config.params.media_id != 'id')
      return [
        200,
        {
          errcode: 40007,
          errmsg: 'invalid media_id',
        },
        {
          connection: 'close',
          'error-code': '40007',
          'error-msg': 'invalid media_id',
          'content-type': 'application/json; charset=UTF-8',
          'content-length': '168',
        },
      ]
    return [200, Buffer.from('media')]
  })

  adapter.onGet('cgi-bin/user/get').reply(function (config) {
    let errcode = 0
    let errmsg = 'ok'
    let ret = invalidToken(config)
    if (ret) return ret
    if (config.params.userid != 'arron') {
      errcode = 40013
      errmsg = 'userid not found'
    }

    return [
      200,
      {
        errcode: errcode,
        errmsg: errmsg,
        userid: 'arron',
        name: 'Arron',
      },
    ]
  })

  adapter.onGet('cgi-bin/user/getuserinfo').reply(function (config) {
    let errcode = 0
    let errmsg = 'ok'
    let ret = invalidToken(config)
    if (ret) return ret
    if (config.params.code != 't') {
      errcode = 40013
      errmsg = 'invalid code'
    }
    return [
      200,
      {
        errcode: errcode,
        errmsg: errmsg,
        UserId: 'arron',
        DeviceId: '',
      },
    ]
  })

  adapter.onGet('cgi-bin/gettoken').reply(function (config) {
    expiredAt = Date.now() + mock.expiresIn * 1000
    let errcode = 0
    let errmsg = 'ok'

    if (!config.params.corpsecret) {
      errcode = 41004
      errmsg = 'corpsecret missing'
    }

    if (config.params.corpid != mock.appId) {
      errcode = 40013
      errmsg = 'invalid corpid'
    }

    return [
      200,
      {
        errcode: errcode,
        errmsg: errmsg,
        access_token: mock.accessToken,
        expires_in: mock.expiresIn,
      },
    ]
  })

  adapter.onPost('cgi-bin/menu/create').reply(function () {
    return [
      200,
      {
        errcode: 0,
        errmsg: 'ok',
      },
    ]
  })

  // Provider
  adapter.onPost('cgi-bin/service/get_provider_token').reply(function (config) {
    config.data = JSON.parse(config.data)
    expiredAt = Date.now() + mock.expiresIn * 1000
    let errcode = 0
    let errmsg = 'ok'

    if (!config.data.provider_secret) {
      errcode = 41004
      errmsg = 'provider_secret missing'
    }

    if (config.data.corpid != mock.appId) {
      errcode = 40013
      errmsg = 'invalid corpid'
    }

    return [
      200,
      {
        errcode: errcode,
        errmsg: errmsg,
        provider_access_token: mock.accessToken,
        expires_in: mock.expiresIn,
      },
    ]
  })

  adapter.onPost('cgi-bin/service/get_login_info').reply(function (config) {
    config.data = JSON.parse(config.data)
    let errcode = 0
    let errmsg = 'ok'
    let ret = invalidToken(config)
    if (ret) return ret
    if (config.data.auth_code != 't') {
      errcode = 40013
      errmsg = 'invalid auth_code'
    }
    return [
      200,
      {
        errcode: errcode,
        errmsg: errmsg,
        user_info: { userid: 'arron' },
        DeviceId: '',
      },
    ]
  })

  // Suite
  adapter.onPost('cgi-bin/service/get_suite_token').reply(function (config) {
    config.data = JSON.parse(config.data)
    expiredAt = Date.now() + mock.expiresIn * 1000
    let errcode = 0
    let errmsg = 'ok'

    if (!config.data.suite_secret) {
      errcode = 41004
      errmsg = 'suite_secret missing'
    }

    if (config.data.suite_id != mock.appId) {
      errcode = 40013
      errmsg = 'invalid suiteid'
    }

    if (!config.data.suite_ticket) {
      errcode = 41004
      errmsg = 'suite_ticket missing'
    }

    return [
      200,
      {
        errcode: errcode,
        errmsg: errmsg,
        suite_access_token: mock.accessToken,
        expires_in: mock.expiresIn,
      },
    ]
  })
}
