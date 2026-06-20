'use client'

import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerInputProps {
  name: string
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string
  required?: boolean
}

export default function DatePickerInput({
  name,
  value,
  onChange,
  placeholder = 'Pick a date',
  required,
}: DatePickerInputProps) {
  return (
    <>
      {/* Hidden input carries the value through form submission to server actions */}
      <input
        type="hidden"
        name={name}
        value={value ? format(value, 'yyyy-MM-dd') : ''}
        required={required}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, 'PPP') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
          />
        </PopoverContent>
      </Popover>
    </>
  )
}
