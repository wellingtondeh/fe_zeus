'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CalendarViewProps {
  selectedDate: Date | null
  onDateSelect: (date: Date | null) => void
  dailyOccupancy?: Record<string, { occupied: number; total: number }> // chave: YYYY-MM-DD
  onMonthChange?: (year: number, month: number) => void // Callback quando o mês muda
}

export function CalendarView({ selectedDate, onDateSelect, dailyOccupancy = {}, onMonthChange }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day)
    date.setHours(0, 0, 0, 0)
    
    // Não permitir selecionar datas passadas
    if (date < today) {
      return
    }

    onDateSelect(date)
  }

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false
    const date = new Date(year, month, day)
    date.setHours(0, 0, 0, 0)
    return (
      date.getTime() === selectedDate.getTime()
    )
  }

  const isDatePast = (day: number) => {
    const date = new Date(year, month, day)
    date.setHours(0, 0, 0, 0)
    return date < today
  }

  const isDateToday = (day: number) => {
    const date = new Date(year, month, day)
    date.setHours(0, 0, 0, 0)
    return date.getTime() === today.getTime()
  }

  const goToPreviousMonth = () => {
    const newMonth = new Date(year, month - 1, 1)
    setCurrentMonth(newMonth)
    if (onMonthChange) {
      onMonthChange(newMonth.getFullYear(), newMonth.getMonth())
    }
  }

  const goToNextMonth = () => {
    const newMonth = new Date(year, month + 1, 1)
    setCurrentMonth(newMonth)
    if (onMonthChange) {
      onMonthChange(newMonth.getFullYear(), newMonth.getMonth())
    }
  }

  const days = []
  
  // Dias vazios no início do mês
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }

  // Dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <div className="w-full">
      {/* Header do Calendário */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Mês anterior"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h3>

        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Próximo mês"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Dias da Semana */}
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-700 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Dias do Mês */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-14" />
          }

          const isPast = isDatePast(day)
          const isSelected = isDateSelected(day)
          const isToday = isDateToday(day)

          // Obter ocupação do dia se disponível
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayOccupancy = dailyOccupancy[dateKey]
          
          // Calcular porcentagem e cor
          let occupancyColor = ''
          let occupancyGradient = ''
          if (dayOccupancy && !isPast) {
            const percentage = (dayOccupancy.occupied / dayOccupancy.total) * 100
            if (percentage >= 75) {
              occupancyColor = 'bg-red-500'
              occupancyGradient = 'from-red-400 to-red-600'
            } else if (percentage >= 50) {
              occupancyColor = 'bg-yellow-500'
              occupancyGradient = 'from-yellow-400 to-yellow-600'
            } else {
              occupancyColor = 'bg-green-500'
              occupancyGradient = 'from-green-400 to-green-600'
            }
          }

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDateClick(day)}
              disabled={isPast}
              className={cn(
                'h-14 rounded-lg border-2 transition-all font-medium text-sm relative overflow-hidden',
                'flex flex-col items-center justify-center',
                isPast
                  ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                  : isSelected
                    ? 'border-blue-600 bg-blue-600 text-white shadow-lg scale-105'
                    : isToday
                      ? 'border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              )}
              aria-label={`Selecionar dia ${day}`}
              aria-pressed={isSelected}
            >
              <span className={cn('z-10 relative', isSelected && 'text-white')}>{day}</span>
              {dayOccupancy && !isPast && (
                <>
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200 rounded-b-lg overflow-hidden">
                    <div
                      className={cn(`h-full bg-gradient-to-r ${occupancyGradient}`)}
                      style={{ 
                        width: `${(dayOccupancy.occupied / dayOccupancy.total) * 100}%` 
                      }}
                    />
                  </div>
                  {!isSelected && (
                    <div className="absolute top-1 right-1 z-10">
                      <div className={cn('w-2 h-2 rounded-full border border-white shadow-sm', occupancyColor)} />
                    </div>
                  )}
                </>
              )}
            </button>
          )
        })}
      </div>

      {/* Legenda */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-blue-300 bg-blue-50" />
          <span className="text-gray-600">Hoje</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-blue-600 bg-blue-600" />
          <span className="text-gray-600">Selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-gray-100 bg-gray-50" />
          <span className="text-gray-600">Indisponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 border border-white shadow-sm" />
          <span className="text-gray-600">&lt; 50% ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500 border border-white shadow-sm" />
          <span className="text-gray-600">50-75% ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 border border-white shadow-sm" />
          <span className="text-gray-600">&gt; 75% ocupado</span>
        </div>
      </div>
    </div>
  )
}
