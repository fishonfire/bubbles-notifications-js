# @fishonfire/bubbles-js

A small zero-dependency npm package for interacting with a device API.

It currently supports:

- `createDevice` — create a device
- `updateDevice` — update a device
- `updateDeviceAttributes` — update device attributes
- `postDeliveryStatus` — post delivery status updates
- `getLocaleAndTimeZone` — read the current device locale and time zone

## Install

```bash
npm install @fishonfire/bubbles-js
```

## API defaults

Based on the concrete routes you shared, this package now defaults to:

- create endpoint: `POST /api/devices/create`
- update endpoint: `PUT /api/devices/:id`
- attributes endpoint: `POST /api/devices/:device_id/attributes`
- JSON request and response bodies

If your API paths change later, you can configure them.

## Usage

```js
import { DeviceClient, getLocaleAndTimeZone } from '@fishonfire/bubbles-js';

const client = new DeviceClient({
  baseUrl: 'https://api.example.com',
});

const { locale, timeZone } = getLocaleAndTimeZone();

// create -> POST /api/devices/create
// update -> PUT /api/devices/:id
// attributes -> POST /api/devices/:device_id/attributes
// delivery status -> PUT /api/deliveries/status

const created = await client.createDevice({
  device_token: 'abc123',
  platform: 'ios',
});

const updated = await client.updateDevice(created.id, {
  platform: 'android',
});

await client.updateDeviceAttributes(created.id, {
  app_version: '1.2.3',
  notifications_enabled: true,
});

await client.postDeliveryStatus('device-123', 'notification-456', {
  status: 'delivered',
});
```

## Custom update method

`PUT` is the default update method.

If you ever need to override it:

```js
const client = new DeviceClient({
  baseUrl: 'https://api.example.com',
  token: 'your-token',
  updateMethod: 'PATCH',
});
```

You can also override it per request:

```js
await client.updateDevice(123, { platform: 'android' }, { method: 'PATCH' });
```

## Custom paths

If your endpoints live somewhere else, configure them separately:

```js
const client = new DeviceClient({
  baseUrl: 'https://api.example.com',
  token: 'your-token',
  createPath: '/api/devices/create',
  updatePath: '/api/devices',
});
```

## Optional token support

If an endpoint still needs bearer auth, you can provide a token or async token provider:

```js
const client = new DeviceClient({
  baseUrl: 'https://api.example.com',
  token: async () => getAccessToken(),
});
```

## Error handling

Non-2xx responses throw `ApiError`.

```js
import { ApiError } from '@fishonfire/bubbles-js';

try {
  await client.createDevice({ device_token: 'abc123' });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.status);
    console.error(error.body);
  }
}
```

## TypeScript

Type declarations are included in `src/index.d.ts`.

```ts
import { DeviceClient } from '@fishonfire/bubbles-js';

interface Device {
  id: number;
  platform: string;
}

const client = new DeviceClient({
  baseUrl: 'https://api.example.com',
});

const device = await client.createDevice<Device>({
  platform: 'ios',
});
```

## Scripts

```bash
npm test
```

## Contributors
- Simon de la Court (https://github.com/simondelacourt)
- Jan Deen (https://github.com/Jan-F15H)
- Menno Jongejan (https://github.com/mennolpFoF)

## Copyright and Licence
Copyright (c) 2026, Fish on Fire.

Source code is licensed under the [`GPL License`](https://github.com/fishonfire/bubbles-notifications-js/blob/develop/LICENSE).