import { LRUCache } from 'lru-cache'

type RateLimitOptions = {
  interval: number
  uniqueTokenPerInterval: number
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  })

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const cached = tokenCache.get(token)
        const currentCount = cached && cached.length > 0 && cached[0] !== undefined ? cached[0] : 0
        const newCount = currentCount + 1
        const tokenCount: number[] = [newCount]
        
        tokenCache.set(token, tokenCount)

        const isRateLimited = newCount >= limit

        return isRateLimited ? reject() : resolve()
      }),
  }
}
