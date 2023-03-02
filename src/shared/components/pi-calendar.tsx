import {useCallback, useEffect, useState} from "react";
import getWeek from "date-fns/getWeek";
import {format} from "date-fns";
import {PiButton} from "toll-ui-react";

interface Props {
    date?: any
    disablePastDates?: boolean
    onChange?: (value?: Date) => void
}

interface Week {
    dates: Date[];
    week: number;
}
export const PiCalendar = (prop: Props) => {
    const calendarView: 'month' | 'all month' | 'year' = 'month';
    const AllDays: any[] = [
        'SUNDAY',
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY'
    ];
    const AllMonths: string[] = [
        'JANUARY',
        'FEBRUARY',
        'MARCH',
        'APRIL',
        'MAY',
        'JUNE',
        'JULY',
        'AUGUST',
        'SEPTEMBER',
        'OCTOBER',
        'NOVEMBER',
        'DECEMBER',
    ];
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [getCalendarView, setCalendarView] = useState<string>(calendarView);
    const [selectedYear, setSelectedYear] = useState<any>();
    const [month, setMonth] = useState<any>();
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [today, setTodayDate] = useState<Date>(new Date());
    const [monthCount, setMonthCount] = useState<number>(0);
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [allDates, setAllDates] = useState<Date[]>([]);
    const [years, setYears] = useState<number[]>([]);

    const GetMonth = (date: Date) => {
        return AllMonths[date.getMonth()];
    }
    const getDaysInMonth = (year: number, month: number) => {
        const date = new Date(year, month, 1);
        const days = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }
    const GetWeeks = (dates: Date[]) => {
        const weeks: Week[] = [];
        dates.forEach((elements) => {
            // get week day
            const week = getWeek(elements);
            const getdayWeek = weeks.find((u) => u.week === week);
            if (getdayWeek === undefined) {
                // update weeks array
                weeks.push({
                    week,
                    dates: [elements],
                });
            } else {
                getdayWeek.dates.push(elements);
            }
        });

        const nMRT = weeks[0].dates;
        const n: Date[] | any = [];

        for (const item of nMRT) {
            if (item.getDay() > 0) {
                const newArray = new Array(item.getDay());
                let days: Date[] = [];
                if (item.getMonth() === 0) {
                    days = getDaysInMonth(item.getFullYear()- 1, 11)
                } else if (item.getMonth() === 11) {
                    days = getDaysInMonth(item.getFullYear()+ 1, 0)
                } else {
                    days = getDaysInMonth(item.getFullYear(), item.getMonth() - 1)
                }
                for (let x = 0; x < newArray.length; x++) {
                    const sub = newArray.length - x;
                    n.push(new Date(days[days.length - sub]));
                }
                nMRT.forEach((ele: any) => {
                    n.push(ele);
                });
                weeks[0].dates = n;
                break;
            } else {
                break;
            }
        }

        const lastWeek = weeks[weeks.length-1].dates;
        for (let i = 0; i < 7; i++) {
            if (lastWeek[i] === undefined) {
                const newArray = new Array(6 - lastWeek[i-1].getDay());
                let days: Date[] = [];
                if (lastWeek[i-1].getMonth() === 11) {
                    days = getDaysInMonth(lastWeek[i-1].getFullYear() + 1, 0)
                } else {
                    days = days = getDaysInMonth(lastWeek[i-1].getFullYear(), lastWeek[i-1].getMonth() + 1)
                }
                for (let x = 0; x < newArray.length; x++) {
                    lastWeek.push(new Date(days[x]));
                }
                weeks[weeks.length-1].dates = lastWeek;
                break;
            }
        }

        setWeeks([...weeks]);
    }
    const selectMonth = (month: string) => {
        const index = AllMonths.findIndex(u => u === month)
        setMonthCount(index);
        setSelectedDate(new Date(selectedDate.getFullYear(), index, 1))
        setCurrentDate(new Date(selectedDate.getFullYear(), index, 1));
    }

    const selectYear = (year: number) => {
        setSelectedYear(year);
        setSelectedDate(new Date(year, selectedDate.getMonth(), 1))
        setCurrentDate(new Date(year, selectedDate.getMonth(), 1))
    }
    const GetDefaultCalendar = () => {
        setMonth(GetMonth(currentDate));
        setMonthCount(currentDate.getMonth());
        setSelectedYear(currentDate.getFullYear())
        const tYears: number[] = [];
        for(let i = 0; i < 12; i++) {
            tYears.push(2016 + i)
        }
        setYears([...tYears]);
        const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())
        setAllDates(days);
    }
    const GetPreviousMonth = () => {
        setMonthCount(monthCount - 1);
        if (monthCount === -1) {
            setMonthCount(11);
            setCurrentDate(new Date(currentDate.getFullYear() - 1, 11, 1))
            setSelectedYear(currentDate.getFullYear())
        } else {
            currentDate.setMonth(currentDate.getMonth() - 1);
            setCurrentDate(currentDate);
        }
        GetDefaultCalendar();
    }

    const NextYears = useCallback(() => {
        const tYears: number[] = [];
        for(let i = 0; i < 12; i++) {
            tYears.push(years[years.length-1] + (i+1))
        }
        setYears([...tYears]);
    }, [years])

    const PrevYears = useCallback(() => {
        if (years[0] > 1800) {
            const tYears: number[] = [];
            for(let i = 0; i < 12; i++) {
                tYears.push(years[0] - (12 - i))
            }
            setYears([...tYears]);
        }
    }, [years])

    const GetNextMonth = () => {
        setMonthCount(monthCount + 1);
        if (monthCount === 12) {
            setMonthCount(0);
            setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1))
            setSelectedYear(currentDate.getFullYear());
        } else {
            currentDate.setMonth(currentDate.getMonth() + 1);
            setCurrentDate(currentDate);
        }
        GetDefaultCalendar();
    }
    const getToday = (date: Date) : boolean => {
        const today = format(new Date(), 'MM/dd/yyyy');
        const current = format(date, 'MM/dd/yyyy');
        return today === current;
    }
    const setToday = () => {
       setCurrentDate(new Date())
    }
    const selectDate = (date: Date) => {
        setSelectedDate(new Date(date));
        if (monthCount !== date.getMonth()) {
            if (date.getMonth() > monthCount) {
                GetNextMonth();
            } else {
                GetPreviousMonth();
            }
        }

        prop.onChange?.(date);
    }
    const compareDate = (date: Date): boolean => {
        return new Date(date) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }

    useEffect(() => {
        setInterval(() => {
            setTodayDate(new Date());
        }, 1000)
    })

    useEffect(() => {
        GetDefaultCalendar();
    }, [])

    useEffect(() => {
        if (allDates.length > 0) {
            GetWeeks(allDates);
        }
    }, [allDates])

    useEffect(() => {
        GetDefaultCalendar();
    }, [currentDate])

    return (
        <>
            <div className="relative flex w-[300px] p-2">
                {
                    getCalendarView === 'month' &&
                    <div>
                        <div className="flex justify-between px-2 mb-4">
                            <div className="flex space-x-2 items-center">
                                <label onClick={() => setCalendarView('all month')} className="cursor-pointer block text-[13px]">{month}</label>
                                <label onClick={() => setCalendarView('year')} className="cursor-pointer block text-[13px]">{selectedYear}</label>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <i onClick={GetPreviousMonth} className="cursor-pointer text-gray-500 text-[13px] pi pi-chevron-left"></i>
                                <i onClick={GetNextMonth} className="cursor-pointer text-gray-500 text-[13px] pi pi-chevron-right"></i>
                            </div>
                        </div>
                        <div className="h-auto flex items-center">
                            {
                                AllDays.map(days =>
                                    <div key={days} className="w-10 h-10 flex items-center justify-center">
                                        <span className="leading-none block text-gray-400 text-[12px]">{days.slice(0, 1)}</span>
                                    </div>
                                )
                            }
                        </div>
                        <div className="border-gray-300 overflow-hidden divide-y">
                            {
                                weeks.map((week, index) =>
                                    <div key={index}>
                                        {
                                            week.week !== null &&
                                            <div  className={'flex'}>
                                                {
                                                    week.dates.map((date) =>
                                                        <div key={`${date}`} className="w-10 h-10 flex items-center justify-center">
                                                            {
                                                                format(new Date(selectedDate), 'MM/dd/yyyy') !== format(new Date(date), 'MM/dd/yyyy') &&
                                                                <>
                                                                    {
                                                                        prop.disablePastDates &&
                                                                        <>
                                                                            {
                                                                                compareDate(date) &&
                                                                                <div
                                                                                    className="w-8 h-8 flex items-center justify-center hover:cursor-not-allowed">
                                                                                    <label className="text-[14px] leading-none text-gray-700 hover:cursor-not-allowed">
                                                                                        {format(new Date(date), 'dd')}
                                                                                    </label>
                                                                                </div>
                                                                            }
                                                                            {
                                                                                !compareDate(date) &&
                                                                                <div onClick={() => selectDate(date)} className={`w-8 h-8 flex items-center justify-center hover:cursor-pointer
                                                                                ${getToday(date) && 'rounded-full bg-blue-500'} ${format(new Date(selectedDate), 'MM/dd/yyyy') === format(new Date(date), 'MM/dd/yyyy') && 'rounded-full bg-blue-300'}`}>
                                                                                    <label className={`text-[14px] leading-none hover:cursor-pointer ${getToday(date) ? 'text-white' : (monthCount !== date.getMonth() && 'text-gray-500')}`}>
                                                                                        {format(new Date(date), 'dd')}
                                                                                    </label>
                                                                                </div>
                                                                            }
                                                                        </>
                                                                    }
                                                                    {
                                                                        !prop.disablePastDates &&
                                                                        <div onClick={() => selectDate(date)} className={`w-8 h-8 flex items-center justify-center hover:cursor-pointer 
                                                                        ${getToday(date) && 'rounded-full bg-blue-500'} ${format(new Date(selectedDate), 'MM/dd/yyyy') === format(new Date(date), 'MM/dd/yyyy') && 'rounded-full bg-blue-300'}`}>
                                                                            <label className={`${(monthCount !== date.getMonth() && 'text-gray-500')} text-[14px] leading-none hover:cursor-pointer`}>
                                                                                {format(new Date(date), 'dd')}
                                                                            </label>
                                                                        </div>

                                                                    }
                                                                </>
                                                            }
                                                            {
                                                                format(new Date(selectedDate), 'MM/dd/yyyy') === format(new Date(date), 'MM/dd/yyyy') &&
                                                                <div onClick={() => selectDate(date)} className={`w-8 h-8 flex items-center justify-center ${getToday(date) && 'rounded-full bg-blue-500'} 
                                                                ${format(new Date(selectedDate), 'MM/dd/yyyy') === format(new Date(date), 'MM/dd/yyyy') && 'rounded-full bg-blue-400'} hover:cursor-pointer`}>
                                                                    <label className={`
                                                            ${(monthCount !== date.getMonth()
                                                                        ? ((today.getMonth() < date.getMonth() && 'text-gray-500'))
                                                                        : ((today.getMonth() > date.getMonth() && 'text-gray-700')))} text-[14px] leading-none hover:cursor-pointer`}>
                                                                        {format(new Date(date), 'dd')}
                                                                    </label>
                                                                </div>
                                                            }
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        }
                                    </div>
                                )
                            }
                        </div>
                        <div className="flex justify-between px-2 mt-2 items-center">
                            <span className={'block text-[13px]'}>today: {format(new Date(), 'MM/dd/yyyy hh:mm:ss a')}</span>
                            <PiButton onClick={setToday} size={"extra small"} type={"primary"} rounded={"rounded"}>today</PiButton>
                        </div>
                    </div>
                }
                {
                    getCalendarView === 'all month' &&
                    <div className={'w-full'}>
                        <div className="flex justify-start px-4 mb-4">
                            <div className="flex space-x-2 items-center">
                                <label onClick={() => setCalendarView('month')} className="cursor-pointer block text-[13px]">BACK</label>
                            </div>
                        </div>
                        <div className="border-gray-300 overflow-hidden w-full divide-y">
                            <div className="grid grid-cols-3 w-full">
                                {
                                    AllMonths.map((month) =>
                                        <div key={month} className="w-full h-14 flex items-center justify-center hover:cursor-pointer hover:bg-blue-600 hover:rounded" onClick={() => {
                                            selectMonth(month);
                                            setCalendarView('month');
                                        }}>
                                            <div className="w-8 h-8 flex items-center justify-center">
                                                <span className="text-[14px] leading-none">{month.slice(0,3)}</span >
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                }
                {
                    getCalendarView === 'year' &&
                    <div className={'w-full'}>
                        <div className="flex justify-between px-4 mb-4 items-center">
                            <div className="flex space-x-2 items-center">
                                <label onClick={() => setCalendarView('month')} className="cursor-pointer block text-[13px]">BACK</label>
                            </div>
                            <div className="flex space-x-2 items-center">
                                <i onClick={PrevYears} className="cursor-pointer text-gray-500 text-[13px] pi pi-chevron-left"></i>
                                <i onClick={NextYears} className="cursor-pointer text-gray-500 text-[13px] pi pi-chevron-right"></i>
                            </div>
                        </div>
                        <div className="border-gray-300 overflow-hidden w-full divide-y">
                            <div className="grid grid-cols-4 w-full">
                                {
                                    years.map((year) =>
                                        <div key={year} className="w-full h-14 flex items-center justify-center hover:cursor-pointer hover:bg-blue-600 hover:rounded"
                                             onClick={() => {selectYear(year); setCalendarView('month');}}>
                                            <div className="w-8 h-8 flex items-center justify-center">
                                                <span className="text-[14px] leading-none">{year}</span >
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                }
            </div>
        </>
    )
}
