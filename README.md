# bubbles-device-client

A small zero-dependency npm package for interacting with a bearer-authenticated device API.

It currently supports:

- `createDevice` — create a device
- `updateDevice` — update a device
- `postDeliveryStatus` — post delivery status updates

## Install

```bash
npm install bubbles-device-client
```

## API defaults

Based on the concrete routes you shared, this package now defaults to:

- create endpoint: `POST /api/devices/create`
- update endpoint: `PUT /api/devices/:id`
- bearer authentication via `Authorization: Bearer <token>`
- JSON request and response bodies

If your API paths change later, you can configure them.

## Usage

```js
import { DeviceClient } from 'bubbles-device-client';

const client = new DeviceClient({
  baseUrl: 'https://api.example.com',
  token: 'your-jwt-or-access-token',
});

// create -> POST /api/devices/create
// update -> PUT /api/devices/:id
// delivery status -> PUT /api/deliveries/:id/status

const created = await client.createDevice({
  device_token: 'abc123',
  platform: 'ios',
});

const updated = await client.updateDevice(created.id, {
  platform: 'android',
});

await client.postDeliveryStatus('delivery-123', {
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

## Async token provider

If you refresh tokens dynamically:

```js
const client = new DeviceClient({
  baseUrl: 'https://api.example.com',
  token: async () => getAccessToken(),
});
```

## Error handling

Non-2xx responses throw `ApiError`.

```js
import { ApiError } from 'bubbles-device-client';

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
import { DeviceClient } from 'bubbles-device-client';

interface Device {
  id: number;
  platform: string;
}

const client = new DeviceClient({
  baseUrl: 'https://api.example.com',
  token: 'secret',
});

const device = await client.createDevice<Device>({
  platform: 'ios',
});
```

## Scripts

```bash
npm test
```
