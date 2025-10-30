import { CaretLeftIcon, CaretRightIcon, GlobeHemisphereWestIcon } from '@phosphor-icons/react';
import cn from 'clsx';
import { useCallback, useState } from 'react';

enum DateRangeCellMode {
    OUT_OF_RANGE,
    ENABLED,
    SELECTED_START_NODE,
    SELECTED_END_NODE,
    SELECTED,
    SELECTED_OUT_OF_RANGE,
}
const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface DateRangePickerProps {
    onStartDateChange: (date: Date | null) => void;
    onEndDateChange: (date: Date | null) => void;
}
  
export default function DateRangePicker({onStartDateChange, onEndDateChange}: DateRangePickerProps) {
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)
    const [viewingMonth, setViewingMonth] = useState<Date>(new Date())
    const [hoveringDate, setHoveringDate] = useState<Date | null>(null)

    const handleStartDateChange = (date: Date | null) => {
        setStartDate(date);
        onStartDateChange(date); // Pass the updated startDate to the parent component
      };
    
      const handleEndDateChange = (date: Date | null) => {
        setEndDate(date);
        onEndDateChange(date); // Pass the updated endDate to the parent component
      };
    
    const getMonthName = useCallback((date: Date, monthOffset?: number) => {
        const copyDate = new Date(date)
        copyDate.setMonth(copyDate.getMonth() + (monthOffset || 0))
        return copyDate.toLocaleString('default', { month: 'long' })
    }, [])

    const getDateYear = useCallback((date: Date, monthOffset?: number) => {
        const copyDate = new Date(date)
        copyDate.setMonth(copyDate.getMonth() + (monthOffset || 0))
        return copyDate.getFullYear()
    }, [])

    const getMonthsStartingDay = useCallback((date: Date, monthOffset?: number) => {
        const copyDate = new Date(date)
        copyDate.setDate(1)
        copyDate.setMonth(copyDate.getMonth() + (monthOffset || 0))
        return copyDate.getDay()
    }, [])

    const getNumberOfDaysInMonth = useCallback((date: Date, monthOffset?: number) => {
        const copyDate = new Date(date)
        copyDate.setDate(1)
        copyDate.setMonth(copyDate.getMonth() + (monthOffset || 0))
        copyDate.setMonth(copyDate.getMonth() + 1)
        copyDate.setDate(0)
        return copyDate.getDate()
    }, [])

    const adjustMonth = useCallback((monthOffset: number) => {
        setViewingMonth((prev) => {
            const newDate = new Date(prev)
            newDate.setMonth(newDate.getMonth() + monthOffset)
            return newDate
        })
    }, [])

    const getDateFromIndex = useCallback((date: Date, monthOffset: number, index: number) => {
        const startingDay = getMonthsStartingDay(date, monthOffset)

        if (index < startingDay) {
            // Get the last day of the previous month
            const previousMonth = new Date(date)
            previousMonth.setMonth(previousMonth.getMonth() + monthOffset)
            previousMonth.setDate(1);
            previousMonth.setDate(previousMonth.getDate() - (startingDay - index));
            return previousMonth
        } else if (index > getNumberOfDaysInMonth(date, monthOffset) + startingDay - 1) {
            // Get the first day of the next month
            const nextMonth = new Date(date)
            nextMonth.setMonth(nextMonth.getMonth() + monthOffset)
            nextMonth.setMonth(nextMonth.getMonth() + 1)
            nextMonth.setDate(index - getNumberOfDaysInMonth(date, monthOffset) - startingDay + 1)
            return nextMonth
        } else {
            // Get the current month's date
            const newDate = new Date(date)
            newDate.setMonth(newDate.getMonth() + monthOffset)
            newDate.setDate(index - startingDay + 1)
            return newDate
        }
    }, [getMonthsStartingDay, getNumberOfDaysInMonth])

    const isDateEqual = useCallback((date1: Date | null, date2: Date | null) => {
        if (!date1 || !date2) return false
        return date1.toDateString() === date2.toDateString()
    }, [])

    return (
        <div className="flex flex-col gap-2.5 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-900 select-none">
            <div className="flex gap-4">
                <div className="relative w-[196px]">
                    <div 
                        className="absolute left-0 top-0 cursor-pointer rounded bg-neutral-300/85 hover:bg-neutral-300 dark:bg-neutral-700/85 hover:dark:bg-neutral-700 p-1.5"
                        onClick={() => adjustMonth(-1)}
                    >
                        <CaretLeftIcon size={16} />
                    </div>

                    <DateRangeMonthHeader 
                        month={getMonthName(viewingMonth)} 
                        year={getDateYear(viewingMonth)}
                        updateCurrentMonth={(dateString) => {
                            setViewingMonth(new Date(dateString))
                        }}
                    />

                    <div className="grid grid-cols-7 gap-0 gap-y-0.5">
                        {Array.from({ length: 42 }).map((_, index) => (
                            <DateRangeDayCell
                                key={index}
                                date={getDateFromIndex(viewingMonth, 0, index)}
                                mode={
                                    // After current month range
                                    (startDate && endDate && 
                                        getDateFromIndex(viewingMonth, 0, index) >= startDate &&
                                        getDateFromIndex(viewingMonth, 0, index) <= endDate &&
                                        index > getNumberOfDaysInMonth(viewingMonth, 0) + getMonthsStartingDay(viewingMonth, 0) - 1) ||
                                    // Before current month range
                                    (startDate && endDate && 
                                        getDateFromIndex(viewingMonth, 0, index) >= startDate &&
                                        getDateFromIndex(viewingMonth, 0, index) <= endDate &&
                                        index < getMonthsStartingDay(viewingMonth, 0))
                                        ? DateRangeCellMode.SELECTED_OUT_OF_RANGE :
                                    // Before current month range
                                    index < getMonthsStartingDay(viewingMonth, 0) ? DateRangeCellMode.OUT_OF_RANGE : 
                                    // After current month range
                                    index > getNumberOfDaysInMonth(viewingMonth, 0) + getMonthsStartingDay(viewingMonth, 0) - 1 ? DateRangeCellMode.OUT_OF_RANGE :
                                    // Selected start date
                                    isDateEqual(getDateFromIndex(viewingMonth, 0, index), startDate) ? DateRangeCellMode.SELECTED_START_NODE :
                                    // Selected end date
                                    isDateEqual(getDateFromIndex(viewingMonth, 0, index), endDate) ? DateRangeCellMode.SELECTED_END_NODE :
                                    // Selected date range
                                    startDate && getDateFromIndex(viewingMonth, 0, index) >= startDate && endDate && getDateFromIndex(viewingMonth, 0, index) <= endDate ? DateRangeCellMode.SELECTED :
                                    // Hovering past a starting date and no end date selected
                                    startDate && !endDate && hoveringDate && hoveringDate > startDate && getDateFromIndex(viewingMonth, 0, index) <= hoveringDate && getDateFromIndex(viewingMonth, 0, index) > startDate ? DateRangeCellMode.SELECTED :
                                    // Default to enabled date
                                    DateRangeCellMode.ENABLED
                                }
                                onClick={(date) => {
                                    if (!startDate || date < startDate) {
                                        handleStartDateChange(date)
                                        setHoveringDate(date)
                                    } else {
                                        handleEndDateChange(date)
                                    }
                                }}
                                isHoveringDate={(date) => {
                                    if (startDate && !endDate && date > startDate) {
                                        setHoveringDate(date)
                                    }
                                }}
                            />
                        ))}
                    </div>
                </div>
                <div className="relative w-[196px]">
                    <div 
                        className="absolute right-0 top-0 cursor-pointer rounded bg-neutral-300/85 hover:bg-neutral-300 dark:bg-neutral-700/85 hover:dark:bg-neutral-700 p-1.5"
                        onClick={() => adjustMonth(1)}
                    >
                        <CaretRightIcon size={16} />
                    </div>

                    <DateRangeMonthHeader 
                        month={getMonthName(viewingMonth, 1)} 
                        year={getDateYear(viewingMonth, 1)}
                        updateCurrentMonth={(dateString) => {
                            const date = new Date(dateString)
                            date.setMonth(date.getMonth() - 1)
                            setViewingMonth(date)
                        }}
                    />

                    <div className="grid grid-cols-7 gap-0 gap-y-0.5">
                        {Array.from({ length: 42 }).map((_, index) => (
                            <DateRangeDayCell
                                key={index}
                                date={getDateFromIndex(viewingMonth, 1, index)}
                                mode={
                                    // After current month range
                                    (startDate && endDate && 
                                        getDateFromIndex(viewingMonth, 1, index) >= startDate &&
                                        getDateFromIndex(viewingMonth, 1, index) <= endDate &&
                                        index > getNumberOfDaysInMonth(viewingMonth, 1) + getMonthsStartingDay(viewingMonth, 1) - 1) ||
                                    // Before current month range
                                    (startDate && endDate && 
                                        getDateFromIndex(viewingMonth, 1, index) >= startDate &&
                                        getDateFromIndex(viewingMonth, 1, index) <= endDate &&
                                        index < getMonthsStartingDay(viewingMonth, 1))
                                        ? DateRangeCellMode.SELECTED_OUT_OF_RANGE :
                                    // Before current month range
                                        index < getMonthsStartingDay(viewingMonth, 1) ? DateRangeCellMode.OUT_OF_RANGE : 
                                    // After current month range
                                    index > getNumberOfDaysInMonth(viewingMonth, 1) + getMonthsStartingDay(viewingMonth, 1) - 1 ? DateRangeCellMode.OUT_OF_RANGE :
                                    // Selected start date
                                    isDateEqual(getDateFromIndex(viewingMonth, 1, index), startDate) ? DateRangeCellMode.SELECTED_START_NODE :
                                    // Selected end date
                                    isDateEqual(getDateFromIndex(viewingMonth, 1, index), endDate) ? DateRangeCellMode.SELECTED_END_NODE :
                                    // Selected date range
                                    startDate && getDateFromIndex(viewingMonth, 1, index) >= startDate && endDate && getDateFromIndex(viewingMonth, 1, index) <= endDate ? DateRangeCellMode.SELECTED :
                                    // Hovering past a starting date and no end date selected
                                    startDate && !endDate && hoveringDate && hoveringDate > startDate && getDateFromIndex(viewingMonth, 1, index) <= hoveringDate && getDateFromIndex(viewingMonth, 1, index) > startDate ? DateRangeCellMode.SELECTED :
                                    // Default to enabled date
                                    DateRangeCellMode.ENABLED
                                }
                                onClick={(date) => {
                                    if (!startDate || date < startDate) {
                                        setStartDate(date)
                                        setHoveringDate(date)
                                    } else {
                                        handleEndDateChange(date)
                                    }
                                }}
                                isHoveringDate={(date) => {
                                    if (startDate && !endDate && date > startDate) {
                                        setHoveringDate(date)
                                    }
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <DateRangeFooter reset={() => {
                handleStartDateChange(null)
                handleEndDateChange(null)
            }} />
        </div>
    )
}

function DateRangeDayCell({
    date,
    mode,
    onClick,
    isHoveringDate
}: {
    date: Date
    mode?: DateRangeCellMode
    onClick?: (date: Date) => void
    isHoveringDate?: (date: Date) => void
}) {
    const getDateNumberFromDate = useCallback((date: Date) => {
        return date.getDate()
    }, [])

    const getBackgroundColor = useCallback(() => {
        switch (mode) {
            case DateRangeCellMode.OUT_OF_RANGE:
                return 'bg-transparent'
            case DateRangeCellMode.ENABLED:
                return 'bg-transparent'
            case DateRangeCellMode.SELECTED_START_NODE:
                return '!bg-neutral-950 dark:!bg-neutral-50 rounded-tl-[5px] rounded-bl-[5px]'
            case DateRangeCellMode.SELECTED_END_NODE:
                return '!bg-neutral-950 dark:!bg-neutral-50 rounded-tr-[5px] rounded-br-[5px]'
            case DateRangeCellMode.SELECTED:
                return 'bg-neutral-300 dark:bg-neutral-700'
            case DateRangeCellMode.SELECTED_OUT_OF_RANGE:
                return 'bg-neutral-200 dark:bg-neutral-800'
        }
    }, [mode])

    const getTextColor = useCallback(() => {
        switch (mode) {
            case DateRangeCellMode.OUT_OF_RANGE:
            case DateRangeCellMode.SELECTED_OUT_OF_RANGE:
                return '!text-neutral-300 dark:!text-neutral-700'
            case DateRangeCellMode.SELECTED_START_NODE:
            case DateRangeCellMode.SELECTED_END_NODE:
                return '!text-neutral-200 dark:!text-neutral-800'
            default:
                return 'text-neutral-900 dark:text-neutral-100'
        }
    }, [mode])

    return (
        <div
            id={date.toDateString()}
            className={cn(
                `h-[26px] w-7 transition-all duration-[50] cursor-pointer text-center text-sm leading-[26px] text-neutral-900 dark:text-neutral-100`,
                mode !== DateRangeCellMode.OUT_OF_RANGE && mode !== DateRangeCellMode.SELECTED_OUT_OF_RANGE
                    ? 'hover:bg-neutral-300 hover:dark:bg-neutral-700'
                    : '',
                getBackgroundColor(),
                getTextColor()
            )}
            onClick={() => onClick?.(date)}
            onMouseOver={() => isHoveringDate?.(date)}
        >
            {/* {text} */}
            {getDateNumberFromDate(date)}
        </div>
    )
}

function DateRangeMonthHeader({
    month,
    year,
    updateCurrentMonth
}: {
    month?: string
    year?: number
    updateCurrentMonth?: (dateString: string) => void
}) {
    return (
        <div>
            <div className="mb-3 text-center">
                <div 
                    contentEditable 
                    suppressContentEditableWarning 
                    className="py-1.5 text-sm rounded-md font-semibold text-neutral-900 dark:text-neutral-100 select-none focus:outline-none hover:dark:bg-neutral-300/10 transition-all duration-200"
                    onBlur={(e) => {
                        if (e.currentTarget.textContent?.length === 0) return
                        updateCurrentMonth?.(e.currentTarget.textContent || '')
                    }}
                >
                    {month} {year}
                </div>
            </div>

            <div className="mt-2 grid grid-cols-7 gap-1">
                {DAYS_OF_WEEK.map((day) => (
                    <div
                        key={day}
                        className="h-[22px] w-7 text-center text-sm text-neutral-500"
                    >
                        {day}
                    </div>
                ))}
            </div>
        </div>
    )
}

function DateRangeFooter({ reset }: { reset?: () => void }) {
    return (
        <div className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            <GlobeHemisphereWestIcon size={16} />
            <span className="flex-1">Timezone: New York, NY, USA (GMT-4)</span>
            <span onClick={reset} className="cursor-pointer font-semibold text-neutral-800 underline underline-offset-2 dark:text-neutral-200">
                Reset Dates
            </span>
        </div>
    )
}