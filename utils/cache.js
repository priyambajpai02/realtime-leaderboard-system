import memoryCache from 'memory-cache';

const cache = new memoryCache.Cache();

// Enhanced cache with automatic timeout
export default {
  get: (key) => cache.get(key),
  put: (key, value, duration) => cache.put(key, value, duration),
  del: (key) => cache.del(key),
  clear: () => cache.clear(),
  keys: () => cache.keys()
};