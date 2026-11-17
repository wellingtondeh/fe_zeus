'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { mobileAppointmentSchema, fixedAppointmentSchema, simpleMobileAppointmentSchema } from '@/lib/validations/appointment'
import { applyPhoneMask } from '@/lib/utils/phone'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CalendarView } from './calendar-view'
import { type AreaType } from '@/types/dashboard'

interface AppointmentFormProps {
  area: AreaType
}

interface Professional {
  id: string
  name: string
  maxCapacity: number
}


type ScheduleType = 'fixed' | 'mobile' | null

// Tipo de agendamento móvel
type MobileAppointmentType = 'experimental' | 'renovacao' | 'aula-inaugural' | 'reposicao' | 'convenio' | null

// Tipo de agendamento fixo
type FixedAppointmentType = 'particular' | 'convenio' | null

// Tipo para armazenar ocupação: chave = "professionalId-time" ou "professionalId-time-dayIndex"
type OccupancyMap = Record<string, number>

export function AppointmentForm({ area }: AppointmentFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Verificar se é PILATES para mostrar opções de agenda fixa/móvel
  const isPilates = area === 'pilates'
  const fromParam = searchParams.get('from') ?? undefined
  /** Textos de capacidade: alunos (Pilates / from=pilates) vs pacientes (demais rotas) */
  const useAlunosCapacityWording = isPilates || fromParam === 'pilates'
  
  // Inicializar scheduleType como 'mobile' se não for Pilates
  const [scheduleType, setScheduleType] = useState<ScheduleType>(isPilates ? null : 'mobile')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null)
  const [selectedDays, setSelectedDays] = useState<number[]>([]) // Para agenda fixa (dias da semana)
  const [mobileAppointmentType, setMobileAppointmentType] = useState<MobileAppointmentType>(null)
  const [fixedAppointmentType, setFixedAppointmentType] = useState<FixedAppointmentType>(null)
  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [patientEmail, setPatientEmail] = useState('')
  const [patientId, setPatientId] = useState<string>('')
  const [patientSearchQuery, setPatientSearchQuery] = useState('')
  const [patientSearchResults, setPatientSearchResults] = useState<Array<{ id: string; name: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  // Estado para armazenar ocupação dos horários (evita recálculo aleatório)
  const [occupancyMap, setOccupancyMap] = useState<OccupancyMap>({})
  // Estado para armazenar ocupação diária (chave: YYYY-MM-DD)
  const [dailyOccupancyMap, setDailyOccupancyMap] = useState<Record<string, { occupied: number; total: number }>>({})
  // Estado para armazenar ocupação semanal por profissional (vem do backend)
  // Formato: { professionalId: { occupied: number, total: number, percentage: number } }
  const [professionalWeeklyOccupancyMap, setProfessionalWeeklyOccupancyMap] = useState<Record<string, { occupied: number; total: number; percentage: number }>>({})

  // Mock de profissionais - em produção viria do backend
  const professionals: Professional[] = [
    { id: '1', name: 'Prof. Ana Silva', maxCapacity: 5 },
    { id: '2', name: 'Prof. João Santos', maxCapacity: 4 },
    { id: '3', name: 'Prof. Maria Costa', maxCapacity: 3 },
  ]

  // Mock de horários disponíveis
  const availableTimes = [
    '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ]

  // Horas de trabalho por dia (mock - em produção viria do backend)
  const hoursPerDay = 8

  // Obter ocupação diária de um profissional específico
  const getProfessionalDailyOccupancy = (professionalId: string, date: Date | null): { occupied: number; total: number } | null => {
    if (!date || !professionalId) return null
    
    const dateKey = date.toISOString().split('T')[0]
    const professional = professionals.find(p => p.id === professionalId)
    if (!professional) return null
    
    // Total de vagas do profissional no dia = capacidade por hora × horas por dia
    const totalSlots = professional.maxCapacity * hoursPerDay
    
    // Busca ocupação específica do profissional neste dia
    // Em produção, isso viria do backend com os pesos já calculados
    const key = `${professionalId}-${dateKey}`
    if (occupancyMap[key] !== undefined) {
      return {
        occupied: occupancyMap[key],
        total: totalSlots
      }
    }
    
    // Gera ocupação aleatória (mock)
    const mockOccupied = Math.floor(Math.random() * totalSlots * 0.85)
    
    setOccupancyMap(prev => ({
      ...prev,
      [key]: mockOccupied
    }))
    
    return {
      occupied: mockOccupied,
      total: totalSlots
    }
  }


  // Se não for PILATES, garantir que scheduleType seja 'mobile' (já inicializado acima)
  useEffect(() => {
    if (!isPilates && scheduleType === null) {
      setScheduleType('mobile')
    }
  }, [isPilates, scheduleType])

  // Mock de pacientes para busca (em produção viria do backend)
  const mockPatients = [
    { id: '1', name: 'Maria Silva' },
    { id: '2', name: 'João Santos' },
    { id: '3', name: 'Ana Costa' },
    { id: '4', name: 'Pedro Oliveira' },
    { id: '5', name: 'Carla Mendes' },
    { id: '6', name: 'Roberto Alves' },
    { id: '7', name: 'Juliana Ferreira' },
    { id: '8', name: 'Marcos Souza' },
  ]

  // Buscar pacientes quando digitar no campo de busca
  useEffect(() => {
    if (patientSearchQuery.trim().length > 0) {
      const filtered = mockPatients.filter(patient =>
        patient.name.toLowerCase().includes(patientSearchQuery.toLowerCase())
      )
      setPatientSearchResults(filtered)
    } else {
      setPatientSearchResults([])
    }
  }, [patientSearchQuery])

  // Resetar seleções quando mudar o tipo de agenda
  useEffect(() => {
    if (scheduleType === 'fixed') {
      setSelectedDate(null)
      setSelectedTime(null)
      setSelectedDays([])
      setMobileAppointmentType(null)
      setFixedAppointmentType(null)
      setPatientName('')
      setPatientPhone('')
      setPatientEmail('')
      setPatientId('')
      setPatientSearchQuery('')
      setFieldErrors({})
    } else if (scheduleType === 'mobile') {
      setSelectedDays([])
      setFixedAppointmentType(null)
      setFieldErrors({})
    }
  }, [scheduleType])

  // Buscar ocupação semanal do profissional quando agenda fixa é selecionada
  // Em produção, isso viria de uma chamada ao backend
  useEffect(() => {
    if (scheduleType === 'fixed') {
      // Buscar ocupação semanal para todos os profissionais
      // MOCK: Simulando dados do backend
      professionals.forEach(prof => {
        if (!professionalWeeklyOccupancyMap[prof.id]) {
          // Calcular total semanal (assumindo 5 dias de trabalho por semana)
          // Em produção, esses valores viriam do backend
          const daysPerWeek = 5 // Em produção viria do backend
          const totalSlotsPerDay = prof.maxCapacity * hoursPerDay
          const totalSlotsPerWeek = totalSlotsPerDay * daysPerWeek
          
          // MOCK: Gerar uma porcentagem aleatória entre 40% e 80% (simulando backend)
          // Em produção, isso viria do backend: { occupied: 110, total: 160, percentage: 68.75 }
          const percentage = 40 + Math.random() * 40 // Entre 40% e 80%
          const occupied = Math.round((totalSlotsPerWeek * percentage) / 100)
          
          setProfessionalWeeklyOccupancyMap(prev => ({
            ...prev,
            [prof.id]: {
              occupied,
              total: totalSlotsPerWeek,
              percentage
            }
          }))
        }
      })
    }
  }, [scheduleType, professionals, hoursPerDay])

  // Pré-gerar valores de ocupação por horário e dia da semana quando profissional é selecionado (agenda fixa)
  // Isso garante que cada horário tenha sua própria ocupação para cada dia da semana
  useEffect(() => {
    if (scheduleType === 'fixed' && selectedProfessional) {
      setOccupancyMap(prev => {
        const updates: OccupancyMap = {}
        let needsUpdate = false

        // Gerar ocupação para cada horário em cada dia da semana (0-6)
        availableTimes.forEach(time => {
          for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const key = `${selectedProfessional}-${time}-${dayIndex}`
            if (prev[key] === undefined) {
              const maxCapacity = professionals.find(p => p.id === selectedProfessional)?.maxCapacity || 4
              // Gerar ocupação aleatória por horário e dia (em produção viria do backend)
              updates[key] = Math.floor(Math.random() * maxCapacity)
              needsUpdate = true
            }
          }
        })

        if (!needsUpdate) {
          return prev
        }

        return {
          ...prev,
          ...updates
        }
      })
    }
  }, [scheduleType, selectedProfessional, professionals, availableTimes])

  // Pré-gerar valores de ocupação por horário quando profissional é selecionado (agenda móvel)
  // Gera valores para todos os dias da semana quando profissional é selecionado
  useEffect(() => {
    if (scheduleType === 'mobile' && selectedProfessional) {
      setOccupancyMap(prev => {
        const updates: OccupancyMap = {}
        let needsUpdate = false

        // Gerar ocupação para cada horário em cada dia da semana (0-6)
        availableTimes.forEach(time => {
          for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const key = `${selectedProfessional}-${time}-${dayIndex}`
            if (prev[key] === undefined) {
              const maxCapacity = professionals.find(p => p.id === selectedProfessional)?.maxCapacity || 4
              // Gerar ocupação aleatória por horário e dia (em produção viria do backend)
              updates[key] = Math.floor(Math.random() * maxCapacity)
              needsUpdate = true
            }
          }
        })

        if (!needsUpdate) {
          return prev
        }

        return {
          ...prev,
          ...updates
        }
      })
    }
  }, [scheduleType, selectedProfessional, professionals, availableTimes])

  // Resetar campos de paciente quando mudar tipo de agendamento móvel
  useEffect(() => {
    if (scheduleType === 'mobile') {
      setPatientName('')
      setPatientPhone('')
      setPatientEmail('')
      setPatientId('')
      setPatientSearchQuery('')
      setPatientSearchResults([])
      setFieldErrors({})
    }
  }, [mobileAppointmentType, scheduleType])

  // Resetar campos de paciente quando mudar tipo de agendamento fixo
  useEffect(() => {
    if (scheduleType === 'fixed') {
      // Limpar campos quando mudar o tipo de aluno
      if (!fixedAppointmentType) {
        setPatientName('')
        setPatientPhone('')
        setPatientEmail('')
        setPatientId('')
        setPatientSearchQuery('')
        setPatientSearchResults([])
      }
    }
  }, [fixedAppointmentType, scheduleType])

  // Selecionar data de hoje automaticamente quando escolher tipo de agendamento móvel (Pilates)
  // ou quando não for Pilates (agenda móvel simples)
  useEffect(() => {
    if (scheduleType === 'mobile') {
      if (isPilates && mobileAppointmentType && !selectedDate) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        setSelectedDate(today)
      } else if (!isPilates && !selectedDate) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        setSelectedDate(today)
      }
    }
  }, [scheduleType, mobileAppointmentType, selectedDate, isPilates])

  // Função auxiliar para garantir que uma data tenha ocupação gerada
  const ensureDateOccupancy = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0] || ''
    if (!dateKey) return
    
    setDailyOccupancyMap(prev => {
      // Se já existe, não recalcula
      if (prev[dateKey]) {
        return prev
      }
      
      const totalSlots = professionals.length * (professionals[0]?.maxCapacity || 4) * hoursPerDay
      const mockOccupied = Math.floor(Math.random() * totalSlots * 0.9)
      
      return {
        ...prev,
        [dateKey]: {
          occupied: mockOccupied,
          total: totalSlots
        }
      }
    })
  }

  // Calcular ocupação quando uma data é selecionada (agenda móvel)
  useEffect(() => {
    if (scheduleType === 'mobile' && selectedDate) {
      ensureDateOccupancy(selectedDate)
    }
  }, [selectedDate, scheduleType, professionals.length, hoursPerDay])

  // Gerar ocupação diária para o calendário quando necessário (agenda móvel)
  useEffect(() => {
    if (scheduleType === 'mobile') {
      // Gerar ocupação para os próximos 90 dias (cobre 3 meses completos)
      // Usa uma flag para evitar gerar múltiplas vezes
      setDailyOccupancyMap(prev => {
        // Se já tem dados suficientes, não regenera tudo
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const newOccupancy: Record<string, { occupied: number; total: number }> = {}
        let needsGeneration = false
        
        // Verifica se precisa gerar dados para os próximos 90 dias
        for (let i = 0; i < 90; i++) {
          const date = new Date(today)
          date.setDate(today.getDate() + i)
          const dateKey = date.toISOString().split('T')[0]
          if (!dateKey) continue
          
          // Se não existe, marca que precisa gerar
          if (!prev[dateKey]) {
            needsGeneration = true
            
            // Calcula total de vagas disponíveis no dia
            const totalSlots = professionals.length * (professionals[0]?.maxCapacity || 4) * hoursPerDay
            
            // Gera ocupação aleatória (mock - em produção viria do backend)
            const mockOccupied = Math.floor(Math.random() * totalSlots * 0.9)
            
            newOccupancy[dateKey] = {
              occupied: mockOccupied,
              total: totalSlots
            }
          }
        }
        
        // Se não precisa gerar nada novo, retorna o estado anterior
        if (!needsGeneration) {
          return prev
        }
        
        return {
          ...prev,
          ...newOccupancy
        }
      })
    }
  }, [scheduleType, professionals.length, hoursPerDay])

  const handleDayToggle = (dayIndex: number) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayIndex)) {
        return prev.filter((d) => d !== dayIndex)
      }
      return [...prev, dayIndex].sort()
    })
  }

  const getDayName = (dayIndex: number) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    return days[dayIndex]
  }

  const getOccupancyColor = (occupied: number, maxCapacity: number) => {
    const percentage = (occupied / maxCapacity) * 100
    if (percentage >= 75) {
      return 'bg-red-500'
    } else if (percentage >= 50) {
      return 'bg-yellow-500'
    }
    return 'bg-green-500'
  }

  const getOccupancyGradient = (occupied: number, maxCapacity: number) => {
    const percentage = (occupied / maxCapacity) * 100
    if (percentage >= 75) {
      return 'from-red-400 to-red-600'
    } else if (percentage >= 50) {
      return 'from-yellow-400 to-yellow-600'
    }
    return 'from-green-400 to-green-600'
  }

  // Calcular peso do agendamento (experimental e aula inaugural ocupam 2 vagas)
  const getAppointmentWeight = (): number => {
    if (scheduleType === 'mobile' && 
        (mobileAppointmentType === 'experimental' || mobileAppointmentType === 'aula-inaugural')) {
      return 2
    }
    return 1
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Validações
    if (!scheduleType) {
      setError('Selecione o tipo de agendamento')
      return
    }

    if (scheduleType === 'fixed') {
      // Preparar dados para validação
      const dataToValidate = {
        fixedAppointmentType: fixedAppointmentType!,
        selectedDays,
        selectedTime: selectedTime || '',
        selectedProfessional: selectedProfessional || '',
        patientName: patientName || '',
        patientEmail: patientEmail || '',
        patientId: patientId || '',
      }

      // Validação usando Zod schema
      const result = fixedAppointmentSchema.safeParse(dataToValidate)
      if (!result.success) {
        const errors: Record<string, string> = {}
        result.error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          errors[path] = issue.message
        })
        setFieldErrors(errors)
        setError('Por favor, corrija os erros acima')
        return
      }
    } else if (scheduleType === 'mobile') {
      if (isPilates) {
        // Validação para Pilates (com tipos de agendamento)
        const dataToValidate = {
          mobileAppointmentType: mobileAppointmentType!,
          selectedDate: selectedDate!,
          selectedTime: selectedTime || '',
          selectedProfessional: selectedProfessional || '',
          patientName: patientName || '',
          patientPhone: patientPhone || '',
          patientEmail: patientEmail || '',
          patientId: patientId || '',
        }

        const result = mobileAppointmentSchema.safeParse(dataToValidate)
        if (!result.success) {
        const errors: Record<string, string> = {}
        result.error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          errors[path] = issue.message
        })
        setFieldErrors(errors)
          setError('Por favor, corrija os erros acima')
          return
        }
      } else {
        // Validação para outras áreas (agenda móvel simples)
        const dataToValidate = {
          selectedDate: selectedDate!,
          selectedTime: selectedTime || '',
          selectedProfessional: selectedProfessional || '',
          patientName: patientName || '',
          patientPhone: patientPhone || '',
          patientEmail: patientEmail || '',
        }

        const result = simpleMobileAppointmentSchema.safeParse(dataToValidate)
        if (!result.success) {
        const errors: Record<string, string> = {}
        result.error.issues.forEach((issue) => {
          const path = issue.path.join('.')
          errors[path] = issue.message
        })
        setFieldErrors(errors)
          setError('Por favor, corrija os erros acima')
          return
        }
      }
    }

    setIsSubmitting(true)

    try {
      // Mock da chamada à API
      const appointmentData = {
        area,
        scheduleType,
        mobileAppointmentType: scheduleType === 'mobile' && isPilates ? mobileAppointmentType : null,
        fixedAppointmentType: scheduleType === 'fixed' ? fixedAppointmentType : null,
        patientName,
        patientPhone: scheduleType === 'mobile' && (
          (isPilates && (mobileAppointmentType === 'experimental' || mobileAppointmentType === 'convenio')) ||
          !isPilates
        ) ? patientPhone : null,
        patientEmail: scheduleType === 'mobile' && !isPilates ? patientEmail : 
                      (scheduleType === 'fixed' && fixedAppointmentType === 'convenio' ? patientEmail : null),
        patientId: (scheduleType === 'mobile' && isPilates && (mobileAppointmentType === 'renovacao' || mobileAppointmentType === 'aula-inaugural' || mobileAppointmentType === 'reposicao')) ||
                   (scheduleType === 'fixed' && fixedAppointmentType === 'particular')
                   ? patientId : null,
        professionalId: selectedProfessional,
        weight: getAppointmentWeight(), // Peso do agendamento (1 ou 2 vagas)
        ...(scheduleType === 'fixed'
          ? {
              daysOfWeek: selectedDays,
              time: selectedTime,
            }
          : {
              date: selectedDate?.toISOString(),
              time: selectedTime,
            }),
      }

      // Aqui faria a chamada real à API
      console.log('Dados do agendamento:', appointmentData)

      // Simular delay da API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirecionar de volta para a área
      const fromQuery = searchParams.get('from')
      const fromParam = fromQuery ? `?from=${fromQuery}` : ''
      router.push(`/dashboard/${area}${fromParam}`)
    } catch (err) {
      setError('Erro ao criar agendamento. Tente novamente.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de Agendamento (apenas para PILATES) */}
      {isPilates && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tipo de Agendamento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setScheduleType('fixed')}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                scheduleType === 'fixed'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      scheduleType === 'fixed'
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}
                    style={{ aspectRatio: '1 / 1' }}
                  >
                    {scheduleType === 'fixed' && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Agenda Fixa
                  </h3>
                  <p className="text-sm text-gray-600">
                    Agendamento recorrente em dias e horários fixos da semana
                    (ex: todas as terças e quintas às 20h)
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setScheduleType('mobile')}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                scheduleType === 'mobile'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      scheduleType === 'mobile'
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}
                    style={{ aspectRatio: '1 / 1' }}
                  >
                    {scheduleType === 'mobile' && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Agenda Móvel
                  </h3>
                  <p className="text-sm text-gray-600">
                    Agendamento único para uma data e horário específicos
                  </p>
                </div>
              </div>
            </button>
          </div>
        </Card>
      )}

      {scheduleType && (
        <>
          {/* Tipo de Agendamento Móvel (apenas para agenda móvel e Pilates) - Sempre visível */}
          {scheduleType === 'mobile' && isPilates && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Tipo de Agendamento Móvel
                </h2>
                {!mobileAppointmentType && (
                  <button
                    type="button"
                    onClick={() => setScheduleType(null)}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Voltar
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setMobileAppointmentType('experimental')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    mobileAppointmentType === 'experimental'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-gray-900">Experimental</div>
                    <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                      2 vagas
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">Novo paciente experimental</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileAppointmentType('renovacao')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    mobileAppointmentType === 'renovacao'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 mb-1">Renovação</div>
                  <div className="text-sm text-gray-600">Aluno existente</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileAppointmentType('aula-inaugural')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    mobileAppointmentType === 'aula-inaugural'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-gray-900">Aula Inaugural</div>
                    <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                      2 vagas
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">Primeira aula do aluno</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileAppointmentType('reposicao')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    mobileAppointmentType === 'reposicao'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 mb-1">Reposição</div>
                  <div className="text-sm text-gray-600">Aluno existente</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileAppointmentType('convenio')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    mobileAppointmentType === 'convenio'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 mb-1">Convênio</div>
                  <div className="text-sm text-gray-600">Novo paciente</div>
                </button>
              </div>
            </Card>
          )}


          {/* Agenda Móvel - Calendário ANTES do Profissional */}
          {scheduleType === 'mobile' && ((isPilates && mobileAppointmentType) || !isPilates) && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Selecionar Data
              </h2>
              <CalendarView
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                dailyOccupancy={dailyOccupancyMap}
                onMonthChange={(year, month) => {
                  // Gerar ocupação para todos os dias do mês quando o usuário navega
                  const lastDay = new Date(year, month + 1, 0)
                  const daysInMonth = lastDay.getDate()
                  
                  setDailyOccupancyMap(prev => {
                    const newOccupancy: Record<string, { occupied: number; total: number }> = {}
                    let needsGeneration = false
                    
                    for (let day = 1; day <= daysInMonth; day++) {
                      const date = new Date(year, month, day)
                      const dateKey = date.toISOString().split('T')[0]
                      if (!dateKey) continue
                      
                      // Só gera se não existe e não é data passada
                      if (!prev[dateKey] && date >= new Date(new Date().setHours(0, 0, 0, 0))) {
                        needsGeneration = true
                        const totalSlots = professionals.length * (professionals[0]?.maxCapacity || 4) * hoursPerDay
                        const mockOccupied = Math.floor(Math.random() * totalSlots * 0.9)
                        
                        newOccupancy[dateKey] = {
                          occupied: mockOccupied,
                          total: totalSlots
                        }
                      }
                    }
                    
                    if (!needsGeneration) {
                      return prev
                    }
                    
                    return {
                      ...prev,
                      ...newOccupancy
                    }
                  })
                }}
              />
            </Card>
          )}

          {/* Seleção de Profissional */}
          {(scheduleType === 'fixed' || (scheduleType === 'mobile' && ((isPilates && mobileAppointmentType) || !isPilates))) && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Selecionar Profissional
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {professionals.map((prof) => {
                  // Obter ocupação diária se dia selecionado (agenda móvel)
                  const professionalDailyOccupancy = scheduleType === 'mobile' && selectedDate
                    ? getProfessionalDailyOccupancy(prof.id, selectedDate)
                    : null

                  // Obter ocupação semanal (agenda fixa)
                  // IMPORTANTE: Os marcadores do profissional SEMPRE mostram os dados completos da semana do backend
                  // NÃO devem recalcular quando os dias são selecionados - isso evita re-renderização
                  let professionalWeeklyOccupancy: { occupied: number; total: number; percentage: number } | null = null
                  if (scheduleType === 'fixed') {
                    const weeklyData = professionalWeeklyOccupancyMap[prof.id]
                    
                    if (weeklyData) {
                      // SEMPRE mostra os dados completos da semana do backend
                      // A porcentagem e valores não mudam quando selectedDays muda
                      professionalWeeklyOccupancy = {
                        occupied: weeklyData.occupied,
                        total: weeklyData.total,
                        percentage: weeklyData.percentage
                      }
                    } else {
                      // Se ainda não carregou do backend, mostra valores zerados temporariamente
                      const totalSlotsPerDay = prof.maxCapacity * hoursPerDay
                      const totalSlotsPerWeek = totalSlotsPerDay * 5 // 5 dias padrão
                      
                      professionalWeeklyOccupancy = {
                        occupied: 0,
                        total: totalSlotsPerWeek,
                        percentage: 0
                      }
                    }
                  }

                  return (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => setSelectedProfessional(prof.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedProfessional === prof.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{prof.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Capacidade: {prof.maxCapacity}{' '}
                        {useAlunosCapacityWording ? 'alunos' : 'pacientes'}/hora
                      </div>
                      {professionalDailyOccupancy && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-gray-600">
                              Ocupação do dia: {professionalDailyOccupancy.occupied}/{professionalDailyOccupancy.total}
                            </span>
                            <div
                              className={`w-3 h-3 rounded-full ${getOccupancyColor(
                                professionalDailyOccupancy.occupied,
                                professionalDailyOccupancy.total
                              )}`}
                            />
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${getOccupancyGradient(
                                professionalDailyOccupancy.occupied,
                                professionalDailyOccupancy.total
                              )}`}
                              style={{ 
                                width: `${(professionalDailyOccupancy.occupied / professionalDailyOccupancy.total) * 100}%` 
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {prof.maxCapacity}{' '}
                            {useAlunosCapacityWording ? 'alunos' : 'pacientes'}/hora × {hoursPerDay}h ={' '}
                            {professionalDailyOccupancy.total} vagas/dia
                          </div>
                        </div>
                      )}
                      {professionalWeeklyOccupancy && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-gray-600">
                              Ocupação semanal: {professionalWeeklyOccupancy.occupied}/{professionalWeeklyOccupancy.total}
                            </span>
                            <div
                              className={`w-3 h-3 rounded-full ${getOccupancyColor(
                                professionalWeeklyOccupancy.occupied,
                                professionalWeeklyOccupancy.total
                              )}`}
                            />
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${getOccupancyGradient(
                                professionalWeeklyOccupancy.occupied,
                                professionalWeeklyOccupancy.total
                              )}`}
                              style={{ 
                                width: `${(professionalWeeklyOccupancy.occupied / professionalWeeklyOccupancy.total) * 100}%` 
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {prof.maxCapacity}{' '}
                            {useAlunosCapacityWording ? 'alunos' : 'pacientes'}/hora × {hoursPerDay}h × 5 dias
                            {' '}
                            (semana completa) = {professionalWeeklyOccupancy.total} vagas (
                            {professionalWeeklyOccupancy.percentage.toFixed(1)}%)
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Agenda Fixa - Seleção de Dias e Horário */}
          {scheduleType === 'fixed' && (
            <>
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Selecionar Dias da Semana
                </h2>
                <div className="flex flex-wrap gap-3 mb-6">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                    <button
                      key={dayIndex}
                      type="button"
                      onClick={() => handleDayToggle(dayIndex)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedDays.includes(dayIndex)
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {getDayName(dayIndex)}
                    </button>
                  ))}
                </div>
                {/* Ocultado temporariamente para visualização */}
                {false && selectedDays.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-600">
                      <strong>Dias selecionados:</strong>{' '}
                      {selectedDays.map(dayIndex => getDayName(dayIndex)).join(', ')}
                    </div>
                  </div>
                )}
              </Card>

              {selectedDays.length > 0 && selectedProfessional && (() => {
                const professional = professionals.find(p => p.id === selectedProfessional)
                const maxCapacity = professional?.maxCapacity || 4
                
                return (
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Selecionar Horário
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-lg border-2 transition-all relative ${
                            selectedTime === time
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-gray-900 mb-3">{time}</div>
                          <div className="space-y-2">
                            {selectedDays.map((dayIndex) => {
                              // Ocupação específica para este horário e dia da semana
                              const key = `${selectedProfessional}-${time}-${dayIndex}`
                              const occupancyForDay = occupancyMap[key] ?? 0
                              const percentage = maxCapacity > 0 
                                ? (occupancyForDay / maxCapacity) * 100 
                                : 0

                              return (
                                <div key={dayIndex} className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-gray-700">
                                      {getDayName(dayIndex)} - {occupancyForDay}/{maxCapacity}
                                    </span>
                                    <div
                                      className={`w-2 h-2 rounded-full ${getOccupancyColor(
                                        occupancyForDay,
                                        maxCapacity
                                      )}`}
                                    />
                                  </div>
                                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full bg-gradient-to-r ${getOccupancyGradient(
                                        occupancyForDay,
                                        maxCapacity
                                      )}`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>
                )
              })()}

              {/* Tipo de Aluno - Agenda Fixa */}
              {scheduleType === 'fixed' && selectedProfessional && selectedTime && selectedDays.length > 0 && !fixedAppointmentType && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Tipo de Aluno
                    </h2>
                    <button
                      type="button"
                      onClick={() => setSelectedTime(null)}
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Voltar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFixedAppointmentType('particular')}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        fixedAppointmentType === 'particular'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">Particular</div>
                      <div className="text-sm text-gray-600">Aluno particular</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFixedAppointmentType('convenio')}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        fixedAppointmentType === 'convenio'
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">Convênio</div>
                      <div className="text-sm text-gray-600">Aluno com convênio</div>
                    </button>
                  </div>
                </Card>
              )}

              {/* Formulário para particular (agenda fixa) - Busca de aluno */}
              {scheduleType === 'fixed' && selectedProfessional && fixedAppointmentType === 'particular' && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Buscar Aluno Particular
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setFixedAppointmentType(null)
                        setPatientName('')
                        setPatientId('')
                        setPatientSearchQuery('')
                        setPatientSearchResults([])
                      }}
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Alterar tipo
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        label="Buscar Aluno"
                        value={patientSearchQuery}
                        onChange={(e) => {
                          setPatientSearchQuery(e.target.value)
                          // Limpar erro ao digitar
                          if (fieldErrors.patientId) {
                            setFieldErrors(prev => {
                              const newErrors = { ...prev }
                              delete newErrors.patientId
                              return newErrors
                            })
                          }
                          // Se limpar o campo, limpar também a seleção
                          if (e.target.value === '') {
                            setPatientId('')
                            setPatientName('')
                          }
                        }}
                        onFocus={() => {
                          // Mostrar resultados novamente se houver texto
                          if (patientSearchQuery.trim().length > 0 && !patientId) {
                            const filtered = mockPatients.filter(patient =>
                              patient.name.toLowerCase().includes(patientSearchQuery.toLowerCase())
                            )
                            setPatientSearchResults(filtered)
                          }
                        }}
                        {...(fieldErrors.patientId && { error: fieldErrors.patientId })}
                        placeholder="Digite o nome do aluno"
                      />
                      {patientSearchResults.length > 0 && !patientId && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {patientSearchResults.map((patient) => (
                            <button
                              key={patient.id}
                              type="button"
                              onMouseDown={(e) => {
                                // Usar onMouseDown em vez de onClick para evitar conflito com onBlur
                                e.preventDefault()
                                setPatientId(patient.id)
                                setPatientName(patient.name)
                                setPatientSearchQuery(patient.name)
                                setPatientSearchResults([])
                                // Limpar erro ao selecionar aluno
                                if (fieldErrors.patientId) {
                                  setFieldErrors(prev => {
                                    const newErrors = { ...prev }
                                    delete newErrors.patientId
                                    return newErrors
                                  })
                                }
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{patient.name}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      {patientSearchQuery && patientSearchResults.length === 0 && patientSearchQuery.length > 0 && !patientId && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
                          Nenhum aluno encontrado
                        </div>
                      )}
                    </div>
                    {patientId && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                        <div className="text-sm text-blue-800">
                          <strong>Aluno selecionado:</strong> {patientName}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPatientId('')
                            setPatientName('')
                            setPatientSearchQuery('')
                            setPatientSearchResults([])
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Limpar
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Formulário para convênio (agenda fixa) - Nome e Email */}
              {scheduleType === 'fixed' && selectedProfessional && fixedAppointmentType === 'convenio' && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Dados do Aluno - Convênio
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setFixedAppointmentType(null)
                        setPatientName('')
                        setPatientEmail('')
                      }}
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Alterar tipo
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Nome"
                      value={patientName}
                      onChange={(e) => {
                        setPatientName(e.target.value)
                        if (fieldErrors.patientName) {
                          setFieldErrors(prev => {
                            const newErrors = { ...prev }
                            delete newErrors.patientName
                            return newErrors
                          })
                        }
                      }}
                      {...(fieldErrors.patientName && { error: fieldErrors.patientName })}
                      placeholder="Digite o nome completo"
                    />
                    <Input
                      label="Email"
                      value={patientEmail}
                      onChange={(e) => {
                        setPatientEmail(e.target.value)
                        if (fieldErrors.patientEmail) {
                          setFieldErrors(prev => {
                            const newErrors = { ...prev }
                            delete newErrors.patientEmail
                            return newErrors
                          })
                        }
                      }}
                      {...(fieldErrors.patientEmail && { error: fieldErrors.patientEmail })}
                      placeholder="email@exemplo.com"
                      type="email"
                    />
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Agenda Móvel - Horário */}
          {scheduleType === 'mobile' && ((isPilates && mobileAppointmentType) || !isPilates) && selectedDate && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Selecionar Horário -{' '}
                {selectedDate.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {availableTimes.map((time) => {
                  if (!selectedProfessional) {
                    return (
                      <button
                        key={time}
                        type="button"
                        disabled
                        className="p-3 rounded-lg border-2 border-gray-200 opacity-50 cursor-not-allowed"
                      >
                        <div className="font-medium text-gray-900">{time}</div>
                      </button>
                    )
                  }

                  // Ocupação do profissional neste horário para a data selecionada
                  // Para agenda móvel, usa dayIndex baseado na data selecionada
                  const dayIndex = selectedDate ? selectedDate.getDay() : 0
                  const key = `${selectedProfessional}-${time}-${dayIndex}`
                  const mockOccupancy = occupancyMap[key] ?? 0 // Lê do mapa ou usa 0 se não existir
                  const maxCapacity = professionals.find(
                    (p) => p.id === selectedProfessional
                  )?.maxCapacity || 4
                  const percentage = maxCapacity > 0 ? (mockOccupancy / maxCapacity) * 100 : 0

                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-lg border-2 transition-all relative ${
                        selectedTime === time
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{time}</div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            {mockOccupancy}/{maxCapacity}
                          </span>
                          <div
                            className={`w-3 h-3 rounded-full ${getOccupancyColor(
                              mockOccupancy,
                              maxCapacity
                            )}`}
                          />
                        </div>
                        <div className="mt-1 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getOccupancyGradient(
                              mockOccupancy,
                              maxCapacity
                            )}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Informações do Paciente - Pilates - Aparece após seleção de horário */}
          {scheduleType === 'mobile' && isPilates && mobileAppointmentType && selectedTime && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Informações do Paciente
                </h2>
                <button
                  type="button"
                  onClick={() => setMobileAppointmentType(null)}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Alterar tipo
                </button>
              </div>
              
              {/* Mostrar tipo selecionado */}
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-sm text-gray-600">
                  Tipo selecionado: <strong className="text-gray-900">
                    {mobileAppointmentType === 'experimental' && 'Experimental'}
                    {mobileAppointmentType === 'renovacao' && 'Renovação'}
                    {mobileAppointmentType === 'aula-inaugural' && 'Aula Inaugural'}
                    {mobileAppointmentType === 'reposicao' && 'Reposição'}
                    {mobileAppointmentType === 'convenio' && 'Convênio'}
                  </strong>
                  {(mobileAppointmentType === 'experimental' || mobileAppointmentType === 'aula-inaugural') && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                      2 vagas
                    </span>
                  )}
                </div>
              </div>
              
              {/* Busca de paciente para renovação, aula inaugural ou reposição */}
              {(mobileAppointmentType === 'renovacao' || 
                mobileAppointmentType === 'aula-inaugural' || 
                mobileAppointmentType === 'reposicao') && (
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      label="Buscar Paciente/Aluno"
                      value={patientSearchQuery}
                      onChange={(e) => {
                        setPatientSearchQuery(e.target.value)
                        // Limpar erro ao digitar
                        if (fieldErrors.patientId) {
                          setFieldErrors(prev => {
                            const newErrors = { ...prev }
                            delete newErrors.patientId
                            return newErrors
                          })
                        }
                        // Se limpar o campo, limpar também a seleção
                        if (e.target.value === '') {
                          setPatientId('')
                          setPatientName('')
                        }
                      }}
                      onFocus={() => {
                        // Mostrar resultados novamente se houver texto
                        if (patientSearchQuery.trim().length > 0 && !patientId) {
                          const filtered = mockPatients.filter(patient =>
                            patient.name.toLowerCase().includes(patientSearchQuery.toLowerCase())
                          )
                          setPatientSearchResults(filtered)
                        }
                      }}
                      {...(fieldErrors.patientId && { error: fieldErrors.patientId })}
                      placeholder="Digite o nome do paciente/aluno"
                    />
                    {patientSearchResults.length > 0 && !patientId && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {patientSearchResults.map((patient) => (
                          <button
                            key={patient.id}
                            type="button"
                            onMouseDown={(e) => {
                              // Usar onMouseDown em vez de onClick para evitar conflito com onBlur
                              e.preventDefault()
                              setPatientId(patient.id)
                              setPatientName(patient.name)
                              setPatientSearchQuery(patient.name)
                              setPatientSearchResults([])
                              // Limpar erro ao selecionar paciente
                              if (fieldErrors.patientId) {
                                setFieldErrors(prev => {
                                  const newErrors = { ...prev }
                                  delete newErrors.patientId
                                  return newErrors
                                })
                              }
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{patient.name}</div>
                          </button>
                        ))}
                      </div>
                    )}
                    {patientSearchQuery && patientSearchResults.length === 0 && patientSearchQuery.length > 0 && !patientId && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
                        Nenhum paciente encontrado
                      </div>
                    )}
                  </div>
                  {patientId && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                      <div className="text-sm text-blue-800">
                        <strong>Paciente selecionado:</strong> {patientName}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPatientId('')
                          setPatientName('')
                          setPatientSearchQuery('')
                          setPatientSearchResults([])
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Limpar
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Formulário para experimental ou convênio */}
              {(mobileAppointmentType === 'experimental' || mobileAppointmentType === 'convenio') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome"
                    value={patientName}
                    onChange={(e) => {
                      setPatientName(e.target.value)
                      if (fieldErrors.patientName) {
                        setFieldErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.patientName
                          return newErrors
                        })
                      }
                    }}
                    {...(fieldErrors.patientName && { error: fieldErrors.patientName })}
                    placeholder="Digite o nome completo"
                  />
                  <Input
                    label="Telefone"
                    value={patientPhone}
                    onChange={(e) => {
                      setPatientPhone(applyPhoneMask(e.target.value))
                      if (fieldErrors.patientPhone) {
                        setFieldErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.patientPhone
                          return newErrors
                        })
                      }
                    }}
                    {...(fieldErrors.patientPhone && { error: fieldErrors.patientPhone })}
                    placeholder="(00) 00000-0000"
                    type="tel"
                  />
                </div>
              )}
            </Card>
          )}

          {/* Dados do Paciente - Outras áreas (não Pilates) - Aparece após seleção de horário */}
          {scheduleType === 'mobile' && !isPilates && selectedTime && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Dados do Paciente
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  value={patientName}
                  onChange={(e) => {
                    setPatientName(e.target.value)
                    if (fieldErrors.patientName) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.patientName
                        return newErrors
                      })
                    }
                  }}
                  {...(fieldErrors.patientName && { error: fieldErrors.patientName })}
                  placeholder="Digite o nome completo"
                />
                <Input
                  label="Telefone"
                  value={patientPhone}
                  onChange={(e) => {
                    setPatientPhone(applyPhoneMask(e.target.value))
                    if (fieldErrors.patientPhone) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.patientPhone
                        return newErrors
                      })
                    }
                  }}
                  {...(fieldErrors.patientPhone && { error: fieldErrors.patientPhone })}
                  placeholder="(00) 00000-0000"
                  type="tel"
                />
                <Input
                  label="Email"
                  value={patientEmail}
                  onChange={(e) => {
                    setPatientEmail(e.target.value)
                    if (fieldErrors.patientEmail) {
                      setFieldErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.patientEmail
                        return newErrors
                      })
                    }
                  }}
                  {...(fieldErrors.patientEmail && { error: fieldErrors.patientEmail })}
                  placeholder="email@exemplo.com"
                  type="email"
                />
              </div>
            </Card>
          )}

          {/* Erro */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const fromParam = searchParams.get('from')
                  ? `?from=${searchParams.get('from')}`
                  : ''
                router.push(`/dashboard/${area}${fromParam}`)
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Criar Agendamento
            </Button>
          </div>
        </>
      )}
    </form>
  )
}
