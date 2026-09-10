export class ApiError extends Error {
  constructor(message, { status, body, headers, method, url } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.headers = headers;
    this.method = method;
    this.url = url;
  }
}

export function getLocaleAndTimeZone() {
  const resolvedOptions = new Intl.DateTimeFormat().resolvedOptions();

  return {
    locale: resolvedOptions.locale,
    timeZone: resolvedOptions.timeZone,
  };
}

export class DeviceClient {
  constructor({
    baseUrl,
    token,
    fetch: fetchImpl = globalThis.fetch,
    createPath = '/api/devices/create',
    updatePath = '/api/devices',
    updateMethod = 'PUT',
    defaultHeaders = {},
  } = {}) {
    if (!baseUrl) {
      throw new Error('`baseUrl` is required.');
    }

    if (typeof fetchImpl !== 'function') {
      throw new Error('A Fetch API implementation is required.');
    }

    this.baseUrl = stripTrailingSlash(baseUrl);
    this.token = token;
    this.fetch = fetchImpl;
    this.createPath = normalizePath(createPath);
    this.updatePath = normalizePath(updatePath);
    this.updateMethod = normalizeMethod(updateMethod, ['PATCH', 'PUT']);
    this.defaultHeaders = { ...defaultHeaders };
  }

  async createDevice(deviceParams, options = {}) {
    return this.#request({
      path: this.createPath,
      method: 'POST',
      body: deviceParams,
      useToken: false,
      headers: options.headers,
      signal: options.signal,
    });
  }

  async updateDevice(id, deviceParams, options = {}) {
    if (id === null || id === undefined || id === '') {
      throw new Error('`id` is required.');
    }

    return this.#request({
      path: `${this.updatePath}/${encodeURIComponent(String(id))}`,
      method: options.method ? normalizeMethod(options.method, ['PATCH', 'PUT']) : this.updateMethod,
      body: deviceParams,
      useToken: false,
      headers: options.headers,
      signal: options.signal,
    });
  }

  async updateDeviceAttributes(deviceId, attributes, options = {}) {
    if (deviceId === null || deviceId === undefined || deviceId === '') {
      throw new Error('`deviceId` is required.');
    }

    return this.#request({
      path: `${this.updatePath}/${encodeURIComponent(String(deviceId))}/attributes`,
      method: 'POST',
      body: { attributes },
      useToken: false,
      headers: options.headers,
      signal: options.signal,
    });
  }

  async postDeliveryStatus(deviceId, notificationId, payload, options = {}) {
    if (deviceId === null || deviceId === undefined || deviceId === '') {
      throw new Error('`deviceId` is required.');
    }

    if (notificationId === null || notificationId === undefined || notificationId === '') {
      throw new Error('`notificationId` is required.');
    }

    await this.#request({
      path: '/api/deliveries/status',
      method: 'PUT',
      body: {
        deviceId,
        notificationId,
        ...payload,
      },
      useToken: false,
      headers: options.headers,
      signal: options.signal,
    });
  }

  async #request({ path, method, body, token, useToken = true, headers = {}, signal }) {
    const url = `${this.baseUrl}${path}`;
    const resolvedToken = useToken ? await resolveToken(token ?? this.token) : null;

    const requestHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
      ...headers,
    };

    if (resolvedToken) {
      requestHeaders.Authorization = `Bearer ${resolvedToken}`;
    }

    const response = await this.fetch(url, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });

    const parsedBody = await parseResponseBody(response);

    if (!response.ok) {
      throw new ApiError(buildErrorMessage(method, url, response.status, parsedBody), {
        status: response.status,
        body: parsedBody,
        headers: response.headers,
        method,
        url,
      });
    }

    return parsedBody;
  }
}

function stripTrailingSlash(value) {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function normalizePath(value) {
  if (!value) {
    throw new Error('A path value is required.');
  }

  return value.startsWith('/') ? value : `/${value}`;
}

function normalizeMethod(value, allowed) {
  const normalized = String(value).toUpperCase();

  if (!allowed.includes(normalized)) {
    throw new Error(`Invalid HTTP method \`${value}\`. Allowed values: ${allowed.join(', ')}.`);
  }

  return normalized;
}

async function resolveToken(token) {
  if (typeof token === 'function') {
    return token();
  }

  return token;
}

async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text.length > 0 ? text : null;
}

function buildErrorMessage(method, url, status, body) {
  const detail = body && typeof body === 'object'
    ? body.message || body.error || JSON.stringify(body)
    : body;

  return detail
    ? `${method} ${url} failed with ${status}: ${detail}`
    : `${method} ${url} failed with ${status}`;
}
