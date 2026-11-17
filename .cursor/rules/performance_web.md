# Performance Web - OtimizaÃ§Ãµes Modernas

Especialista em performance web com foco em Core Web Vitals e experiÃªncia do usuÃ¡rio.

## Core Web Vitals - Metas 2026

- **LCP** (Largest Contentful Paint): < 2.5s
- **INP** (Interaction to Next Paint): < 200ms (substitui FID)
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TTFB** (Time to First Byte): < 600ms

## OtimizaÃ§Ã£o de Imagens

### Next.js Image Component
```tsx
import Image from 'next/image'

// LCP image - prioridade mÃ¡xima
export function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1200}
      height={600}
      priority // Carrega imediatamente!
      placeholder="blur"
      blurDataURL="data:image/..." // Ou gere automaticamente
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  )
}

// Images abaixo do fold
export function Gallery({ images }) {
  return images.map(img => (
    <Image
      key={img.id}
      src={img.url}
      alt={img.alt}
      width={400}
      height={300}
      loading="lazy" // Lazy load automÃ¡tico
      sizes="(max-width: 768px) 100vw, 33vw"
    />
  ))
}
```

### Formatos Modernos
```js
// next.config.js
export default {
  images: {
    formats: ['image/avif', 'image/webp'], // AVIF primeiro (melhor compressÃ£o)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

## Font Optimization

### next/font (AutomÃ¡tico)
```tsx
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // FOIT prevention
  preload: true,
  variable: '--font-inter',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

## Code Splitting EstratÃ©gico

### Dynamic Imports
```tsx
import dynamic from 'next/dynamic'

// Lazy load componente pesado
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false, // NÃ£o renderiza no servidor
})

// Lazy load condicional
const AdminPanel = dynamic(() => import('@/components/AdminPanel'), {
  ssr: false,
})

export function Dashboard({ isAdmin }) {
  return (
    <div>
      <Stats />
      {isAdmin && <AdminPanel />}
    </div>
  )
}
```

### Route-based Code Splitting (AutomÃ¡tico no App Router)
```
app/
â”œâ”€â”€ page.tsx           # Bundle separado
â”œâ”€â”€ about/
â”‚   â””â”€â”€ page.tsx       # Bundle separado
â””â”€â”€ dashboard/
    â””â”€â”€ page.tsx       # Bundle separado
```

## Streaming SSR (React Suspense)

```tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <>
      {/* Shell renderiza imediatamente */}
      <Header />
      
      {/* Dados lentos fazem stream quando prontos */}
      <Suspense fallback={<Skeleton />}>
        <SlowDataComponent />
      </Suspense>
      
      {/* MÃºltiplos suspense boundaries para granularidade */}
      <div className="grid grid-cols-2 gap-4">
        <Suspense fallback={<Skeleton />}>
          <UserStats />
        </Suspense>
        <Suspense fallback={<Skeleton />}>
          <RecentActivity />
        </Suspense>
      </div>
      
      <Footer />
    </>
  )
}
```

## Partial Prerendering (PPR) - Experimental

```js
// next.config.js
export default {
  experimental: {
    ppr: true, // Mescla static + dynamic automaticamente
  },
}
```

```tsx
// Componentes static sÃ£o pre-rendered
// Componentes dynamic fazem stream
export default function ProductPage() {
  return (
    <>
      <ProductInfo /> {/* Static */}
      <Suspense fallback={<Skeleton />}>
        <ProductReviews /> {/* Dynamic */}
      </Suspense>
    </>
  )
}
```

## Bundle Optimization

### Turbopack (Next.js 15)
```js
// next.config.js
export default {
  experimental: {
    turbo: {}, // 700x mais rÃ¡pido que Webpack
  },
}

// Ou use no dev:
// package.json
{
  "scripts": {
    "dev": "next dev --turbo"
  }
}
```

### Million.js (React Optimizer)
```js
// next.config.js
import million from 'million/compiler'

export default million.next({
  auto: true, // OtimizaÃ§Ã£o automÃ¡tica
})
```

### Bundle Analyzer
```js
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

export default {
  webpack(config, { dev, isServer }) {
    if (!dev && !isServer) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      )
    }
    return config
  },
}
```

## Third-Party Scripts

### Partytown (Web Worker Offloading)
```tsx
import { GoogleTagManager } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleTagManager 
          gtmId="GTM-XXXXX" 
          partytown={true} // Executa em Web Worker!
        />
      </body>
    </html>
  )
}
```

### Script Component
```tsx
import Script from 'next/script'

export default function Page() {
  return (
    <>
      {/* beforeInteractive - crÃ­tico */}
      <Script
        src="https://example.com/critical.js"
        strategy="beforeInteractive"
      />
      
      {/* afterInteractive - nÃ£o crÃ­tico (padrÃ£o) */}
      <Script
        src="https://example.com/analytics.js"
        strategy="afterInteractive"
      />
      
      {/* lazyOnload - muito menos importante */}
      <Script
        src="https://example.com/chat.js"
        strategy="lazyOnload"
      />
    </>
  )
}
```

## Caching Strategies

### React cache() API
```tsx
import { cache } from 'react'

// Dedupe requests automÃ¡tico
export const getUser = cache(async (id: string) => {
  return await db.user.findUnique({ where: { id } })
})

// MÃºltiplas chamadas = 1 request!
async function Component() {
  const user1 = await getUser('123')
  const user2 = await getUser('123') // Cache hit!
  return <div>{user1.name}</div>
}
```

### Next.js Caching
```tsx
// Revalidate cada 60 segundos
export const revalidate = 60

// Ou por request
export async function getData() {
  const res = await fetch('https://...', {
    next: { revalidate: 3600 } // 1 hora
  })
  return res.json()
}

// Force cache (padrÃ£o)
fetch('https://...', { cache: 'force-cache' })

// No cache
fetch('https://...', { cache: 'no-store' })
```

## CLS Prevention (Cumulative Layout Shift)

### Reserve espaÃ§o para imagens
```tsx
// âœ… BOM - width/height previnem CLS
<Image src="/image.jpg" width={800} height={600} alt="..." />

// âŒ RUIM - causa CLS
<img src="/image.jpg" alt="..." />
```

### Reserve espaÃ§o para ads/embeds
```tsx
// âœ… BOM - container com aspect ratio
<div className="aspect-video">
  <iframe src="..." className="w-full h-full" />
</div>

// âŒ RUIM - height nÃ£o definida
<iframe src="..." />
```

### Font loading
```tsx
// âœ… BOM - display: swap previne FOIT
const font = Inter({ display: 'swap' })

// âœ… BOM - fallback font similar
font-family: Inter, -apple-system, system-ui, sans-serif;
```

## Monitoring e Analytics

### Web Vitals Reporting
```tsx
'use client'
import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // LCP, INP, CLS, FCP, TTFB
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify(metric),
    })
  })
  return null
}
```

### Vercel Speed Insights
```tsx
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

## Prefetching Inteligente

```tsx
import Link from 'next/link'

// Prefetch automÃ¡tico (viewport)
<Link href="/about">About</Link>

// Disable prefetch
<Link href="/heavy-page" prefetch={false}>
  Heavy Page
</Link>

// Prefetch programÃ¡tico
import { prefetch } from 'next/navigation'

function Component() {
  return (
    <div 
      onMouseEnter={() => prefetch('/dashboard')}
    >
      Hover to prefetch
    </div>
  )
}
```

## Regras de Performance

1. âœ… Images LCP com priority
2. âœ… Fonts com display: swap
3. âœ… Lazy load abaixo do fold
4. âœ… Code split routes automÃ¡tico
5. âœ… Streaming SSR com Suspense
6. âœ… Cache agressivo com revalidaÃ§Ã£o
7. âœ… Third-party scripts com Partytown
8. âœ… Monitore Web Vitals constantemente
9. âŒ NUNCA carregue tudo de uma vez
10. âŒ NUNCA ignore CLS
