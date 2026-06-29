const Module = require('module')

const originalRequire = Module.prototype.require

Module.prototype.require = function patchedRequire(request) {
  const normalized = String(request).replace(/\\/g, '/')

  if (
    normalized.endsWith('cache/cachestorage') ||
    normalized.endsWith('cache/cachestorage.js') ||
    normalized.endsWith('web/cache/cachestorage') ||
    normalized.endsWith('web/cache/cachestorage.js')
  ) {
    class CacheStorage {
      constructor() {}

      open() {
        return Promise.resolve({
          match: async () => undefined,
          put: async () => {},
          delete: async () => false,
        })
      }

      has() {
        return Promise.resolve(false)
      }

      delete() {
        return Promise.resolve(false)
      }

      keys() {
        return Promise.resolve([])
      }

      match() {
        return Promise.resolve(undefined)
      }
    }

    return { CacheStorage }
  }

  return originalRequire.apply(this, arguments)
}
