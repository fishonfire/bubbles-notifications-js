# bubbles-device-client

A small zero-dependency npm package for interacting with a bearer-authenticated device API.

It currently supports:

- `createDevice` — create a device
- `updateDevice` — update a device

## Install

```bash
npm install bubbles-device-client
```

## API assumptions

Based on the OpenAPI-style snippets you shared, this package assumes:

- create endpoint: `POST /devices`
- update endpoint: `PATCH /devices/:id`
- bearer authentication via `Authorization: Bearer <token>`
- JSON request and response bodies

If your API uses a different path or uses `PUT` instead of `PATCH` for updates, you can configure that.

## Usage

```js
import { DeviceClient } from 'bubbles-device-client';

const client = new DeviceClient({
  baseUrl: 'https://api.example.com',
  token: 'your-jwt-or-access-token',
});

const created = await client.createDevice({
  device_token: 'abc123',
  platform: 'ios',
});

const updated = await client.updateDevice(created.id, {
  platform: 'android',
});
```

## Custom update method

```js
const client = new DeviceClient({
  baseUrl: 'https://api.example.com',
  token: 'your-token',
  updateMethod: 'PUT',
});
```

You can also override it per request:

```js
await client.updateDevice(123, { platform: 'android' }, { method: 'PUT' });
```

## Custom device path

If your endpoints live under a versioned path, configure `devicePath`:

```js
const client = new DeviceClient({
  baseUrl: 'https://api.example.com',
  token: 'your-token',
  devicePath: '/api/devices',
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
