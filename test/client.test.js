import test from 'node:test'
import assert from 'node:assert/strict'

import { ApiError, DeviceClient, getLocaleAndTimeZone } from '../src/index.js'

const API_BASE_URL = 'https://api.example.com'
const API_BASE_URL_WITH_SLASH = 'https://api.example.com/'
const CONTENT_TYPE_HEADER = 'Content-Type'
const JSON_CONTENT_TYPE = 'application/json'
const DEVICE_ID_WITH_SPACE = 'device 123'
const DEVICE_ID = 'device-123'
const NOTIFICATION_ID = 'notification-456'

test('getLocaleAndTimeZone returns locale and timeZone from Intl', () => {
  const result = getLocaleAndTimeZone()

  assert.equal(typeof result.locale, 'string')
  assert.ok(result.locale.length > 0)

  if (result.timeZone !== undefined) {
    assert.equal(typeof result.timeZone, 'string')
    assert.ok(result.timeZone.length > 0)
  }
})

test('createDevice sends POST request to /api/devices/create with JSON body and no bearer token', async () => {
  const calls = []
  const client = new DeviceClient({
    baseUrl: API_BASE_URL_WITH_SLASH,
    token: 'token-123',
    fetch: async (url, options) => {
      calls.push({ url, options })

      return mockJsonResponse(201, { id: 42, name: 'Jane\'s Phone' })
    }
  })

  const result = await client.createDevice({ platform: 'ios', token: 'abc' })

  assert.deepEqual(result, { id: 42, name: 'Jane\'s Phone' })
  assert.equal(calls[0].url, 'https://api.example.com/api/devices/create')
  assert.equal(calls[0].options.method, 'POST')
  assert.equal(calls[0].options.headers.Authorization, undefined)
  assert.equal(calls[0].options.headers[CONTENT_TYPE_HEADER], JSON_CONTENT_TYPE)
  assert.equal(calls[0].options.body, JSON.stringify({ platform: 'ios', token: 'abc' }))
})

test('updateDevice uses configured PUT method and /api/devices/:id by default', async () => {
  const calls = []
  const client = new DeviceClient({
    baseUrl: API_BASE_URL,
    fetch: async (url, options) => {
      calls.push({ url, options })

      return mockJsonResponse(200, { id: 7, enabled: true })
    }
  })

  await client.updateDevice(7, { enabled: true })

  assert.equal(calls[0].url, 'https://api.example.com/api/devices/7')
  assert.equal(calls[0].options.method, 'PUT')
})

test('updateDevice can override method to PATCH', async () => {
  const calls = []
  const client = new DeviceClient({
    baseUrl: API_BASE_URL,
    fetch: async (url, options) => {
      calls.push({ url, options })

      return mockJsonResponse(200, { id: 9, enabled: false })
    }
  })

  await client.updateDevice(9, { enabled: false }, { method: 'PATCH' })

  assert.equal(calls[0].options.method, 'PATCH')
})

test('updateDeviceAttributes sends POST request to /api/devices/:device_id/attributes', async () => {
  const calls = []
  const client = new DeviceClient({
    baseUrl: API_BASE_URL_WITH_SLASH,
    fetch: async (url, options) => {
      calls.push({ url, options })

      return mockJsonResponse(200, { id: DEVICE_ID_WITH_SPACE })
    }
  })

  const result = await client.updateDeviceAttributes(DEVICE_ID_WITH_SPACE, {
    app_version: '1.2.3',
    enabled: true,
    preferences: { alerts: ['mentions'] }
  })

  assert.deepEqual(result, { id: DEVICE_ID_WITH_SPACE })
  assert.equal(calls[0].url, 'https://api.example.com/api/devices/device%20123/attributes')
  assert.equal(calls[0].options.method, 'POST')
  assert.equal(calls[0].options.headers.Authorization, undefined)
  assert.equal(calls[0].options.headers[CONTENT_TYPE_HEADER], JSON_CONTENT_TYPE)
  assert.equal(
    calls[0].options.body,
    JSON.stringify({
      attributes: {
        app_version: '1.2.3',
        enabled: true,
        preferences: { alerts: ['mentions'] }
      }
    })
  )
})

test('postDeliveryStatus sends PUT request to /api/deliveries/status with deviceId and notificationId', async () => {
  const calls = []
  const client = new DeviceClient({
    baseUrl: API_BASE_URL_WITH_SLASH,
    fetch: async (url, options) => {
      calls.push({ url, options })

      return mockJsonResponse(204, null)
    }
  })

  const result = await client.postDeliveryStatus(DEVICE_ID, NOTIFICATION_ID, {
    status: 'delivered'
  })

  assert.equal(result, undefined)
  assert.equal(calls[0].url, 'https://api.example.com/api/deliveries/status')
  assert.equal(calls[0].options.method, 'PUT')
  assert.equal(calls[0].options.headers[CONTENT_TYPE_HEADER], JSON_CONTENT_TYPE)
  assert.equal(
    calls[0].options.body,
    JSON.stringify({
      deviceId: DEVICE_ID,
      notificationId: NOTIFICATION_ID,
      status: 'delivered'
    })
  )
})

test('throws ApiError for unauthorized responses', async () => {
  const client = new DeviceClient({
    baseUrl: API_BASE_URL,
    fetch: async () => mockJsonResponse(401, { error: 'Unauthorized' })
  })

  await assert.rejects(
    client.createDevice({ token: 'abc' }),
    (error) => {
      assert.ok(error instanceof ApiError)
      assert.equal(error.status, 401)
      assert.deepEqual(error.body, { error: 'Unauthorized' })

      return true
    }
  )
})

test('postDeliveryStatus supports async token providers', async () => {
  const calls = []
  const client = new DeviceClient({
    baseUrl: API_BASE_URL,
    token: async () => 'dynamic-token',
    fetch: async (url, options) => {
      calls.push({ url, options })

      return mockJsonResponse(201, { id: 15 })
    }
  })

  await client.postDeliveryStatus(DEVICE_ID, NOTIFICATION_ID, { status: 'delivered' })

  assert.equal(calls[0].options.headers.Authorization, undefined)
})

function mockJsonResponse (status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': JSON_CONTENT_TYPE }),
    async json () {
      return body
    },
    async text () {
      return JSON.stringify(body)
    }
  }
}
