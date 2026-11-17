import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import { NavigationProvider } from '@/components/providers/navigation-provider'
import { BreadcrumbProvider } from '@/contexts/breadcrumb-context'
import { RouteLoading } from '@/components/ui/route-loading'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
})

export const metadata: Metadata = {
  title: {
    default: 'Login SSO App',
    template: '%s | Login SSO App',
  },
  description: 'Aplicação de login com suporte a SSO',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={roboto.variable}>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <NavigationProvider>
          <BreadcrumbProvider>
            <RouteLoading />
            {children}
          </BreadcrumbProvider>
        </NavigationProvider>
      </body>
    </html>
  )
}
