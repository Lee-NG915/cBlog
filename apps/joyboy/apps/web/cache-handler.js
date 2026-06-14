const { CacheHandler } = require('@neshca/cache-handler');
const createRedisHandler = require('@neshca/cache-handler/redis-strings').default;
const createLruHandler = require('@neshca/cache-handler/local-lru').default;
const { createClient } = require('redis');

CacheHandler.onCreation(async ({ buildId }) => {
  let client;
  // console.log('🚀 ~ CacheHandler.onCreation ~ client:', client);
  try {
    // Create a Redis client.
    let isReady = false;
    client = createClient({
      url:
        process.env.NODE_ENV === 'production'
          ? process.env.REDIS_URL || 'redis://joyboy-web-test-apse1-redis.nqwqun.ng.0001.apse1.cache.amazonaws.com:6379'
          : 'redis://127.0.0.1:6379', // https://castlery.atlassian.net/wiki/spaces/TEC/pages/2350841867
      socket: {
        reconnectStrategy: () => (isReady ? 5000 : false),
      },
    });
    // Redis won't work without error handling. https://github.com/redis/node-redis?tab=readme-ov-file#events
    client.on('error', (error) => {
      if (process.env.NEXT_PRIVATE_DEBUG_CACHE === '1') {
        // Use logging with caution in production. Redis will flood your logs. Hide it behind a flag.
        console.error(JSON.stringify({ message: 'Redis client error:', error }));
      }
    });
    client.on('ready', () => {
      isReady = true;
    });
  } catch (error) {
    console.warn(JSON.stringify({ message: 'Failed to create Redis client:', error }));
  }

  if (client && buildId) {
    try {
      console.info(JSON.stringify({ message: 'Connecting Redis client...' }));

      // Wait for the client to connect.
      // Caveat: This will block the server from starting until the client is connected.
      // And there is no timeout. Make your own timeout if needed.
      await client.connect();
      // client.set('hello', { value: 'world' });
      console.info(JSON.stringify({ message: 'Redis client connected.' }));
    } catch (error) {
      console.warn(JSON.stringify({ message: 'Failed to connect Redis client:', error }));

      console.warn(JSON.stringify({ message: 'Disconnecting the Redis client...' }));
      // Try to disconnect the client to stop it from reconnecting.
      client
        .disconnect()
        .then(() => {
          console.info(JSON.stringify({ message: 'Redis client disconnected.' }));
        })
        .catch(() => {
          console.warn(JSON.stringify({ message: 'Failed to quit the Redis client after failing to connect.' }));
        });
    }
  }

  /** @type {import("@neshca/cache-handler").Handler | null} */
  let handler;

  if (client?.isReady && buildId) {
    // Create the `redis-stack` Handler if the client is available and connected.
    handler = await createRedisHandler({
      client,
      keyPrefix: `${process.env.APPLICATION_ENV}-${buildId}:`,
      timeoutMs: 1000,
    });
  } else {
    // Fallback to LRU handler if Redis client is not available.
    // The application will still work, but the cache will be in memory only and not shared.
    handler = createLruHandler();
    console.warn(JSON.stringify({ message: 'Falling back to LRU handler because Redis client is not available.' }));
  }

  return {
    handlers: [handler],
    ttl: {
      // estimateExpireAge: (staleAge) => staleAge * 2,
      estimateExpireAge: (staleAge) => 3600,
    },
  };
});

// export default CacheHandler;
module.exports = CacheHandler;
