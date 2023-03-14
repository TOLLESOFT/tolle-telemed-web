import {useEffect, useRef, useState} from "react";
import getWeek from "date-fns/getWeek";
import {PiButton, PiIconButton} from "toll-ui-react";
import {BaseService} from "../base.service";
import {format} from "date-fns";

interface Props {
    date?: any
    onChange?: (value?: Date) => void
    events?: Events[]
    customListView?: boolean
    onViewChange?: (view: any) => void
    onEventClick?: (event: Events) => void
    showViewButtons?: boolean
}

interface Week {
    dates: Date[];
    week: number;
}

export interface Events {
    id: string
    name: string
    date: Date
}
export const PiFullCalendar = (prop: Props) => {
    const fullCalendarView: 'full' | 'list'  = 'full';
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
    const [getCalendarView, setCalendarView] = useState<string>(fullCalendarView);
    const [selectedYear, setSelectedYear] = useState<any>();
    const [month, setMonth] = useState<any>();
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [monthCount, setMonthCount] = useState<number>(0);
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [allDates, setAllDates] = useState<Date[]>([]);
    const gridRef = useRef(null);
    const [boxHeight, setBoxHeight] = useState<any>(0);
    const [events, setEvents] = useState<Array<Events>>([])
    const GetMonth = (date: Date) => {
        return AllMonths[date.getMonth()];
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

        const getWeeks: Week[] = [];

        const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())

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
    }
    const GetDate = (date: Date) =>{
        return date.getDate();
    }
    const GetDefaultCalendar = () => {
        setMonth(GetMonth(currentDate));
        setMonthCount(currentDate.getMonth());
        setSelectedYear(currentDate.getFullYear())
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

    const setDate = (date: Date) => {
        setCurrentDate(new Date(date));
        setSelectedDate(new Date(date));
    }

    const setToday = () => {
        setCurrentDate(new Date())
    }

    useEffect(() => {
        GetDefaultCalendar();
    }, [])

    useEffect(() => {
        if (allDates.length > 0) {
            GetWeeks(allDates);
        }
    }, [allDates])

    useEffect(() => {
        if (prop.date) {
            setDate(new Date(prop.date));
        }
    }, [prop.date])

    useEffect(() => {
        GetDefaultCalendar();
    }, [currentDate])

    useEffect(() => {
        setEvents(prop.events as Events[]);
    }, [prop.events])

    return (
        <div className="relative flex flex-col w-full h-full">
            <div className={'h-auto w-full p-4'}>
                <div className="flex justify-between items-center">
                    <div className="space-x-1 flex items-center">
                        <PiIconButton onClick={GetPreviousMonth} icon={'pi pi-arrow-left'} size={'small'} type={'primary'} rounded={'rounded'}/>
                        <PiIconButton onClick={GetNextMonth} icon={'pi pi-arrow-right'} size={'small'} type={'primary'} rounded={'rounded'}/>
                        <PiButton onClick={setToday} size={'small'} type={'primary'} rounded={'rounded'}>today</PiButton>
                    </div>
                    <span className={'block font-bold'}>{month} {selectedYear}</span>
                    <div className="space-x-1 flex items-center">
                        {
                            prop.showViewButtons &&
                           <>
                               <PiButton onClick={() => View('full')} size={'small'} type={'primary'} rounded={'rounded'}>calendar</PiButton>
                               <PiButton onClick={() => View('list')} size={'small'} type={'primary'} rounded={'rounded'}>list</PiButton>
                           </>
                        }
                    </div>
                </div>
            </div>
            {
                getCalendarView === 'full' &&
                <div className={'grow w-full h-full'}>
                    <div className="relative flex flex-col w-full h-full rounded">
                        <div className={'h-auto w-full'}>
                            <div className={'grid grid-cols-7'}>
                                {
                                    AllDays.map((day: string, index) =>
                                        <div key={index} className="min-w-full h-10 border flex items-center justify-center">
                                            <span className="text-xs font-bold">{day.slice(0,3)}</span>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <div className={'grow h-full w-full overflow-auto feed'}>
                            <div ref={gridRef} className={'flex flex-col h-full w-full'}>
                                {
                                    weeks.map((dates) =>
                                        <div key={BaseService.uuid()}>
                                            {
                                                dates.week !== null &&
                                                <div className="grid grid-cols-7 w-full">
                                                    {
                                                        dates.dates.map((date) =>
                                                            <div
                                                                key={BaseService.uuid()}
                                                                className={`min-w-full border group`}
                                                                style={{minHeight : `${boxHeight}px`}}>
                                                                {
                                                                    date !== null &&
                                                                    <div onClick={() => selectDate(date)} className={`flex flex-col w-full h-full group-hover:cursor-pointer
                                                                    ${format(new Date(selectedDate), 'MM/dd/yyyy') === format(new Date(date), 'MM/dd/yyyy') ? 'bg-blue-500/50' : (monthCount !== date.getMonth() && 'bg-gray-700/50')}`}>
                                                                        <div className={`flex justify-end p-3 group-hover:cursor-pointer h-auto`}>
                                                                            <div className={`flex w-10 h-10 justify-center items-center block rounded-full ${getToday(date) && 'bg-blue-200 dark:bg-blue-500'}`}>
                                                                                <label>
                                                                                    {GetDate(date)}
                                                                                </label>
                                                                            </div>
                                                                        </div>

                                                                        <>
                                                                            {
                                                                                events.length > 0 &&
                                                                                <div className={'grow w-full h-full feed overflow-auto p-1'}>
                                                                                    {
                                                                                        events.map((event) =>
                                                                                            <div key={event.id}>
                                                                                                {
                                                                                                    format(event.date, 'MM/dd/yyyy') === format(date, 'MM/dd/yyyy') &&
                                                                                                    <small onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        prop.onEventClick?.(event)
                                                                                                    }} className={'w-full p-1.5 bg-blue-600 rounded block'}>
                                                                                                        {event.name}
                                                                                                    </small>
                                                                                                }
                                                                                            </div>
                                                                                        )
                                                                                    }
                                                                                </div>
                                                                            }
                                                                        </>
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
                        </div>
                    </div>
                </div>
            }
            {
                getCalendarView === 'list' &&
                <div className={'grow w-full h-full'}>

                </div>
            }
        </div>
    )
}
