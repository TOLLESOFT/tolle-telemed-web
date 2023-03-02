import {useEffect, useRef, useState} from "react";
import getWeek from "date-fns/getWeek";
import {format} from "date-fns";
import {PiButton, PiIconButton} from "toll-ui-react";
import {BaseService} from "../base.service";

interface Week {
    dates: Date[];
    week: number;
}
export const PiCalendar = () => {
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
    const [monthYear, setMonthYear] = useState<any>();
    const [month, setMonth] = useState<any>();
    const [currentWeek, setCurrentWeek] = useState<Week>();
    const [currentMonth, setCurrentMonth] = useState<Week[]>([]);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const today = new Date();
    const [useUTC, setUseUTC] = useState<boolean>(false);
    const [disablePastDates, setDisablePastDates] = useState<boolean>(false);
    const [monthCount, setMonthCount] = useState<number>(0);
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [allDates, setAllDates] = useState<Date[]>([]);
    const gridRef = useRef(null);
    const [boxHeight, setBoxHeight] = useState<any>(0);

    const GetMonth = (date: Date) => {
        return AllMonths[date.getMonth()];
    }
    const DaysInMonth = (year: number, month: number) => {
        const date = new Date(year, month, 1);
        setMonthYear(`${GetMonth(date)} ${year}`)
        setMonth( GetMonth(date));
        setMonthCount(month);
        setSelectedYear(year)
        const days = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }
    const DaysInMonthUTC = (year: number, month: number) => {
        const date = new Date(Date.UTC(year, month, 1));
        setMonthYear(`${GetMonth(date)} ${year}`)
        setMonth( GetMonth(date))
        setMonth(month)
        setSelectedYear(year);
        const days = [];
        while (date.getUTCMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getUTCDate() + 1);
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
                    days = DaysInMonth(item.getFullYear()- 1, 11)
                } else if (item.getMonth() === 11) {
                    days = DaysInMonth(item.getFullYear()+ 1, 0)
                } else {
                    days = DaysInMonth(item.getFullYear(), item.getMonth() - 1)
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
                    days = DaysInMonth(lastWeek[i-1].getFullYear() + 1, 0)
                } else {
                    days = days = DaysInMonth(lastWeek[i-1].getFullYear(), lastWeek[i-1].getMonth() + 1)
                }
                for (let x = 0; x < newArray.length; x++) {
                    lastWeek.push(new Date(days[x]));
                }
                weeks[weeks.length-1].dates = lastWeek;
                break;
            }
        }

        weeks.forEach((week) => {
            week.dates.forEach((date) => {
                if (format(new Date(date), 'MM/dd/yyyy') === format(new Date(), 'MM/dd/yyyy')) {
                    setCurrentWeek(week);
                    return;
                }
            })
        });

        setWeeks([...weeks]);

        const getWeeks: Week[] = [];

        const days = DaysInMonth(currentDate.getFullYear(), currentDate.getMonth())

        days.forEach((date) => {
            let findDayInWeeks: Week | undefined = undefined;
            weeks.forEach((week) => {
                week.dates.forEach((myDate) => {
                    if (format(new Date(myDate), 'MM/dd/yyyy') === format(new Date(date), 'MM/dd/yyyy')) {
                        findDayInWeeks = week;
                        return;
                    }
                })
            })

            if ((findDayInWeeks as unknown as Week)?.dates.length > 0) {
                const findweek = getWeeks.find(u => u.week === (findDayInWeeks as unknown as Week).week);

                if (!findweek) {
                    getWeeks.push((findDayInWeeks as unknown as Week))
                }
            }
        })

        if (gridRef.current) {
            const boxes = (gridRef.current as HTMLDivElement).clientHeight / getWeeks.length;
            setBoxHeight(boxes);
        }
        setCurrentMonth(getWeeks);
    }
    const GetDate = (date: Date) =>{
        return date.getDate();
    }
    const GetDefaultCalendar = () => {
        setAllDates(DaysInMonth(
            currentDate.getFullYear(),
            currentDate.getMonth()
        ));
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

    const View = (view: 'full' | 'list') => {
        setCalendarView(view);
    }

    const getToday = (date: Date) : boolean => {
        const today = format(new Date(), 'MM/dd/yyyy');
        const current = format(date, 'MM/dd/yyyy');
        return today === current;
    }

    useEffect(() => {
        setSelectedYear(selectedDate.getFullYear());
        GetDefaultCalendar();
    }, [])

    useEffect(() => {
        if (allDates.length > 0) {
            GetWeeks(allDates);
        }
    }, [allDates])


    return (
        <div className="relative flex w-[300px] p-2">
            {
                getCalendarView === 'month' &&
                <div>
                    <div className="flex justify-between px-2 mb-4">
                        <div className="flex space-x-2 items-center">
                            <label onClick={() => setCalendarView('all month')} className="cursor-pointer block text-[13px]">{month}</label>
                            <div></div>
                        </div>
                        <div className="flex space-x-2 items-center">
                            <i onClick={GetPreviousMonth} className="cursor-pointer text-gray-500 text-[13px] pi pi-chevron-left"></i>
                            <i onClick={GetNextMonth} className="cursor-pointer text-gray-500 text-[13px] pi pi-chevron-right"></i>
                        </div>
                    </div>
                    <div className="h-auto flex items-center">
                        {
                            AllDays.map(days =>
                                <div className="w-10 h-10 flex items-center justify-center">
                                    <span className="leading-none block text-gray-400 text-[12px]">{days.slice(0, 1)}</span>
                                </div>
                            )
                        }
                    </div>
                    <div className="border-gray-300 overflow-hidden divide-y">
                        
                    </div>
                </div>
            }
        </div>
    )
}
