import type { Metadata } from 'next'
import { Suspense } from 'react'
import { RegisterForm } from '@/components/features/register/register-form'

export const metadata: Metadata = {
  title: 'Cadastro | Crie sua conta',
  description: 'Crie sua conta para acessar o sistema',
}

function RegisterFormSkeleton() {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-8" />
      <div className="h-10 bg-gray-200 rounded mb-4" />
      <div className="h-10 bg-gray-200 rounded mb-4" />
      <div className="h-10 bg-gray-200 rounded mb-4" />
      <div className="h-10 bg-gray-200 rounded mb-4" />
      <div className="h-10 bg-gray-200 rounded" />
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Suspense fallback={<RegisterFormSkeleton />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
