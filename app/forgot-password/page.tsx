import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ForgotPasswordForm } from '@/components/features/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Recuperar senha | Esqueci minha senha',
  description: 'Recupere sua senha através do email',
}

function ForgotPasswordFormSkeleton() {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-8" />
      <div className="h-10 bg-gray-200 rounded mb-4" />
      <div className="h-10 bg-gray-200 rounded" />
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Suspense fallback={<ForgotPasswordFormSkeleton />}>
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
