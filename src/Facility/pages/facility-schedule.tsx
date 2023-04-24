import {Events, PiFullCalendar} from "../../shared/components/pi-full-calendar";
import React, {useContext, useEffect, useState} from "react";
import {PiButton, PiCheckbox, PiCalendar, PiMessage, PiModal} from "toll-ui-react";
import {environment} from "../../shared/environment";
import {AuthContext} from "../../store/auth-provider";
import {ContextInterface} from "../../shared/models/context-interface";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {ScheduleType} from "../../shared/models/schedule-type";
import {FormObject} from "../../shared/FormBuilder/form-object";
import {FormInput} from "../../shared/FormBuilder/form-input";
import {FormDate} from "../../shared/FormBuilder/form-date";
import {FormTextArea} from "../../shared/FormBuilder/form-text-area";
import {FormSelect} from "../../shared/FormBuilder/form-select";
import {FormImage} from "../../shared/FormBuilder/form-image";
import {Builder} from "../../shared/FormBuilder/builder";
import {ApiResponse} from "../../shared/models/ApiResponse";
import {addDays, differenceInDays, format} from "date-fns";
import {finalize, forkJoin, Observable} from "rxjs";
import {HttpProvider} from "../../store/http-provider";
import morning from '../../assets/cloudy-day.svg';
import afternoon from '../../assets/sun.svg';
import night from '../../assets/night.svg';
import {Slot} from "../../shared/models/slot";
import {PiLoader} from "../../shared/components/pi-loader";

export default function FacilitySchedule() {
    const url = environment.apiUrl;
    const context = useContext(AuthContext);
    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false };
    const [auth, setAuth] = useState<ContextInterface>(getDefault);
    const [loading, setLoading] = useState<boolean>(false);
    const messageDialog: MessageProps = {
        open: false,
        message: '',
        type: "success"
    }
    const [openDialog, setOpenDialog] = useState(messageDialog);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [scheduleTypes, setScheduleTypes] = useState<ScheduleType[]>([]);
    const [scheduleTimes, setScheduleTimes] = useState<any[]>([]);
    const [editState, setEditState] = useState<boolean>(false);
    const scheduleForm: FormObject[] = [
        {
            id: 'startDate',
            type: "date",
            props: {
                date: new Date(),
                required: true,
                label: 'Start Date',
                disablePastDates: true
            }
        },
        {
            id: 'endDate',
            type: "date",
            props: {
                date: new Date(),
                required: true,
                label: 'End Date',
                disablePastDates: true
            }
        },
        {
            id: 'scheduleType',
            type: 'select',
            props: {
                required: true,
                data: scheduleTypes,
                label: 'Schedule Types'
            }
        }
    ]
    const [forms, setForm] = useState<FormObject[]>(scheduleForm);
    const [formId, setFormId] = useState<string>('');
    const [view, setView] = useState<string>('calendar');
    const [selectedEvent, setSelectedEvent] = useState<any>()
    const [slots, setSlots] = useState<Slot[]>([]);
    const [selectedSlots, setSelectedSlots] = useState<{available: Slot[], unAvailable: Slot[]}>({available: [], unAvailable: []})
    const clearDefaultForm = () => {
        setFormId('');
        scheduleForm.forEach((item) => {
            if (item.type === 'text') {
                (item.props as FormInput).value = ''
            }
            if (item.type === 'textarea') {
                (item.props as FormTextArea).value = ''
            }
            if (item.type === 'select') {
                (item.props as FormSelect).value = ''
            }
            if (item.type === 'image') {
                (item.props as FormImage).image = ''
            }
            if (item.type === 'date') {
                (item.props as FormDate).date = new Date()
            }
        });
        setForm([...scheduleForm]);
    }
    const getScheduleTypes = () => {
        setLoading(true);
        HttpProvider.get<ApiResponse<Array<ScheduleType>>>('Schedule/GetScheduleType', {
            'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false)))
            .subscribe((result) => {
                setScheduleTypes([...result.data]);
            })
    }

    const getDoctorSchedule = () => {
        setLoading(true);
        fetch(`${url}Schedule/GetDoctorSchedule`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<Array<any>>) => {
                setScheduleTimes([...result.data]);
            }).finally(() => {
                setLoading(false);
            });

        }).catch((reason) => {

        });
    }
    const openMessageHandler = (options: MessageProps) => {
        setOpenDialog((prevState) => {
            return {...prevState, open: options.open, message: options.message, type: options.type }
        });
    }
    const closeMessageHandler = () => {
        setOpenDialog((prevState) => {
            return {...prevState, open: false }
        });
    }
    const saveSchedule = (form: any) => {
        setLoading(true);
        HttpProvider.post<ApiResponse<any>>('Schedule/SetUpSchedule', JSON.stringify(form), {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false))).subscribe((result) => {
            if (result.status === 100) {
                getDoctorSchedule();
                closeModalHandler();
                openMessageHandler({type: "success", message: result.message, open: true});
            } else {
                openMessageHandler({type: "error", message: result.message, open: true});
            }
        })
    }
    const saveUnAvailable = () => {
        slots.forEach(slot => {
            const find = selectedSlots.available.find(u => u.startTime === slot.startTime && u.endTime === slot.endTime);
            if (find) {
                slot.available = false;
            }
        })

        saveAvailabilitySchedule({id: selectedEvent.id, times: slots.filter(u => !u.available).map( u => u.startTime)});
    }
    const saveAvailable = () => {
        slots.forEach(slot => {
            const find = selectedSlots.unAvailable.find(u => u.startTime === slot.startTime && u.endTime === slot.endTime);
            if (find) {
                slot.available = true;
            }
        })

        saveAvailabilitySchedule({id: selectedEvent.id, times: slots.filter(u => !u.available).map( u => u.startTime)});
    }
    const saveAvailabilitySchedule = (data: any) => {
        setLoading(true);
        HttpProvider.post<ApiResponse<any>>('Schedule/SetUpScheduleUnAvailabilityTimes', JSON.stringify(data), {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false))).subscribe((result) => {
            if (result.status === 100) {
                getScheduleSlots();
                setSelectedSlots(prevState => {
                    return {...prevState, unAvailable: [], available: []}
                });
                openMessageHandler({type: "success", message: result.message, open: true});
            } else {
                openMessageHandler({type: "error", message: result.message, open: true});
            }
        })
    }
    const getScheduleSlots = () => {
        openSlots(selectedEvent.id).subscribe((res) => {
            const finalSlots: Slot[] = [];
            res.slots.data.forEach((slot: any) => {
                const hrs = new Date(slot.startTime).getHours();

                if (hrs < 12) {
                    slot.timeOfDay = 'morning';
                } else if (hrs >= 12 && hrs <= 17) {
                    slot.timeOfDay = 'afternoon';
                } else if (hrs >= 17 && hrs <= 24){
                    slot.timeOfDay = 'evening';
                }

                const checkAvailability = res.unavailable.data.filter((date: any) => new Date(date.time).getTime() === new Date(slot.startTime).getTime());
                slot.available = checkAvailability <= 0;
                finalSlots.push(slot);
            })
            setSlots([...finalSlots])
        })
    }
    const dateRange = (startDate: Date, endDate: Date) => {
        const days = differenceInDays(endDate, startDate);
        const Arr: any[] = [];

        for(let i = 0; i < days+1; i++) {
            Arr.push(addDays(startDate, i));
        }
        return Arr;
    }
    const getDate = (date: Date) => {
        return `${new Date(date).getDate()} ${new Date(date).getMonth() + 1} ${new Date(date).getFullYear()}`;
    }
    const setSelected = (form: any) => {
        const dates = dateRange(form["startDate"], form["endDate"]);
        const selected: {scheduleTypeId: any, date: Date, name: string}[] = [];
        dates.forEach(date => {
            const find = selected.find(u => getDate(u.date) === getDate(date));
            if (find) {
                openMessageHandler(
                    {
                        message: `Schedule type cannot be set twice for the same date: ${format(date, 'MM/dd/yyyy')}`,
                        type: "warning",
                        open: true
                    })
            } else {
                selected.push({
                    scheduleTypeId: form["scheduleType"],
                    date,
                    name: scheduleTypes.find(u => u.id === form["scheduleType"])?.name as string
                })
            }
        })

        if (selected.length > 0) {
            saveSchedule(selected);
        }
    }
    const openModalHandler = () => {
        setOpenModal(true);
    }
    const updateForm = (date: Date) => {
        const newDate = scheduleForm.find(u => u.id === 'startDate');
        if(newDate) {
            (newDate.props as FormDate).date = date;
        }
        const endDate = scheduleForm.find(u => u.id === 'endDate');
        if(endDate) {
            (endDate.props as FormDate).date = date;
        }
        setForm([...scheduleForm]);
        setOpenModal(true);
    }
    const checkSelectedAvailableSlots = (slot: Slot): boolean => {
        const data = selectedSlots.available.find(u => u === slot);
        return !!data;
    }
    const checkSelectedUnAvailableSlots = (slot: Slot): boolean => {
        const data = selectedSlots.unAvailable.find(u => u === slot);
        return !!data;
    }
    const closeModalHandler = () => {
        clearDefaultForm();
        setEditState(false);
        setOpenModal(false);
    }

    const openSlots = (id: string): Observable<{slots: ApiResponse<any>, unavailable: ApiResponse<any>}> => {
        return forkJoin({
            slots: HttpProvider.get<ApiResponse<any>>(`Schedule/GetSlots/${id}`,
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth?.accessToken?.token}`
                }),
            unavailable :HttpProvider.get<ApiResponse<any>>(`Schedule/GetScheduleUnAvailabilityTimes/${id}`,
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth?.accessToken?.token}`
                }),
            })
    }

    const getEventClick = (event: Events) => {
        setSelectedEvent(event);
        setSlots([...[]]);
        setView('slots');
        setLoading(true);
        openSlots(event.id)
            .pipe(finalize(() => setLoading(false)))
            .subscribe((res) => {
            const finalSlots: Slot[] = [];
            res.slots.data.forEach((slot: any) => {
                const hrs = new Date(slot.startTime).getHours();

                if (hrs < 12) {
                    slot.timeOfDay = 'morning';
                } else if (hrs >= 12 && hrs <= 17) {
                    slot.timeOfDay = 'afternoon';
                } else if (hrs >= 17 && hrs <= 24){
                    slot.timeOfDay = 'evening';
                }

                const checkAvailability = res.unavailable.data.filter((date: any) => new Date(date.time).getTime() === new Date(slot.startTime).getTime());
                slot.available = checkAvailability <= 0;
                finalSlots.push(slot);
            })
            setSlots([...finalSlots])
        })
    }

    const selectAvailableSlots = (slot: Slot, checked: boolean) => {
        if (!checked) {
            selectedSlots.available.splice(selectedSlots.available.findIndex(u => u === slot), 1);
        } else {
            selectedSlots.available.push(slot);
        }

        setSelectedSlots(prevState => {
            return {...prevState, available: [...selectedSlots.available]}
        });
    }

    const selectUnAvailableSlots = (slot: Slot, checked: boolean) => {
        if (!checked) {
            selectedSlots.unAvailable.splice(selectedSlots.unAvailable.findIndex(u => u === slot), 1);
        } else {
            selectedSlots.unAvailable.push(slot);
        }
        setSelectedSlots(prevState => {
            return {...prevState, unAvailable: [...selectedSlots.unAvailable]}
        });
    }

    useEffect(() => {
        setAuth((prevState) => {
            return {...prevState, user: context.user, accessToken: context.accessToken }
        });
    }, [context]);

    // update auth value
    useEffect(() => {
        if (auth.accessToken?.token) {
            HttpProvider.apiUrl = environment.apiUrl;
            getScheduleTypes();
            getDoctorSchedule();
        }
    }, [auth]);

    useEffect(() => {
        if (scheduleTypes.length > 0) {
            const newForm = scheduleForm.find(u => u.id === 'scheduleType');
            if(newForm) {
                (newForm.props as FormSelect).data = scheduleTypes;
                setForm([...scheduleForm]);
            }
        }
    }, [scheduleTypes]);

    return (
        <>
            {
                openDialog.open &&
                <PiMessage onClose={closeMessageHandler} message={openDialog.message} type={openDialog.type}/>
            }
            {
                openModal &&
                <PiModal fullScreen={false} onClose={closeModalHandler}>
                    <div className={'min-h-[600px] w-full'}>
                        <Builder title={'Schedule Form'} loading={loading} form={[...forms]} onFormSubmit={setSelected}/>
                    </div>
                </PiModal>
            }
            <div className="flex flex-col w-full h-full">
                <div className={'h-auto w-full flex justify-between p-2'}>
                    <div className="space-x-1 flex items-center">
                        {
                            view === 'calendar' &&
                            <>
                                <PiButton onClick={openModalHandler} type={'primary'} size={'small'} rounded={'rounded'}>
                                    <i className={'pi pi-calendar-plus'}></i> <span className={'ml-2'}>New Schedule</span>
                                </PiButton>
                                <PiButton onClick={getDoctorSchedule} type={'primary'} size={'small'} rounded={'rounded'}>
                                    <i className={'pi pi-replay'}></i> <span className={'ml-2'}>Refresh</span>
                                </PiButton>
                            </>
                        }
                    </div>
                    <div className="space-x-1 flex items-center">
                        <PiButton onClick={() => setView('calendar')} type={'primary'} size={'small'} rounded={'rounded'}>
                            Calendar
                        </PiButton>
                        <PiButton onClick={() => setView('slots')} type={'primary'} size={'small'} rounded={'rounded'}>
                            Slots
                        </PiButton>
                    </div>
                </div>
                <div className={'grow h-full w-full overflow-auto'}>
                    {
                        view === 'calendar' &&
                        <PiFullCalendar events={scheduleTimes.map((u) => {
                            return { name: u.scheduleType.name, date: new Date(u.date), id: u.id}
                        })}
                                        onChange={(e) =>  {
                                            updateForm(e as Date)
                                        }}
                                        onEventClick={getEventClick}/>
                    }
                    {
                        view === 'slots' &&
                        <div className={'flex flex-col h-full relative'}>
                            <PiLoader loading={loading} />
                            <div className={'h-auto w-full'}>
                                <h1 className={'px-10 pb-5 text-3xl'}>
                                    {
                                        selectedEvent &&
                                        format((selectedEvent as Events).date, 'EEEE do, MMMM yyyy')
                                    }
                                    {
                                        !selectedEvent &&
                                        format(new Date(), 'EEEE do, MMMM yyyy')
                                    }
                                </h1>
                            </div>
                            <div className={'grow h-full overflow-auto'}>
                                <div className={'grid grid-cols-3 w-full h-full gap-2'}>
                                    <div className={'flex justify-center'}>
                                        <PiCalendar onChange={(e) => {
                                            const find = scheduleTimes.find((time) => format(new Date(time.date), 'MM/dd/yyyy') === format(new Date(e as Date), 'MM/dd/yyyy'));
                                            if (find) {
                                                getEventClick({ name: find.scheduleType.name, date: new Date(find.date), id: find.id});
                                            } else {
                                                setSelectedEvent({ name: '', date: e, id: '1'});
                                                setSlots([...[]]);
                                                setSelectedSlots(prevState => {
                                                    return {...prevState, unAvailable: [], available: []}
                                                });
                                            }
                                        }} date={(selectedEvent as Events)?.date ?? new Date()}/>
                                    </div>

                                    {/*Available slots*/}
                                    <div className={'flex flex-col h-full w-full overflow-auto'}>
                                        <div className={'h-auto flex justify-between items-center'}>
                                            Available Slots
                                        </div>
                                        <div className={'grow w-full h-full overflow-auto'}>
                                            {
                                                slots.filter(slot => slot.available ).length === 0 &&
                                                <div className={'flex flex-wrap content-center justify-center w-full h-full'}>
                                                    <div className={'text-center'}>
                                                        <i className={'pi pi-calendar-minus text-6xl'}></i>
                                                        <span className={'block'}>list is empty.</span>
                                                    </div>
                                                </div>
                                            }
                                            {
                                                slots.filter(slot => slot.available ).length > 0 &&
                                                <div className={'flex flex-col h-full w-full overflow-auto'}>
                                                    <div className={'h-10 flex justify-between items-center'}>
                                                        {
                                                            selectedSlots.available.length > 0 &&
                                                            <>
                                                                <span className={'block font-bold'}>{selectedSlots.available.length} slot{selectedSlots.available.length > 1 && 's'} selected.</span>
                                                                <PiButton onClick={() => saveUnAvailable()} type={'primary'} size={'small'} rounded={'rounded'}>
                                                                    Update Un-Availability
                                                                </PiButton>
                                                            </>
                                                        }

                                                    </div>
                                                    <div className={'grow h-full w-full overflow-auto'}>
                                                        {
                                                            slots.filter(slot => slot.timeOfDay === "morning" && slot.available).length > 0 &&
                                                            <div className={'py-3 w-full'}>
                                                                <div className={'flex space-x-2 items-center pb-3'}>
                                                                    <img src={morning} className={'w-10'}/>  <span className={'block font-bold'}>Morning</span>
                                                                </div>
                                                                <div className={'grid grid-cols-2 gap-2 w-full'}>
                                                                    {
                                                                        slots.filter(slot => slot.timeOfDay === "morning" && slot.available ).map((slot, index) =>
                                                                            <div className={'flex justify-center'} key={index}>
                                                                                <PiCheckbox value={checkSelectedAvailableSlots(slot)} onChange={(e) => {selectAvailableSlots(slot, e.target.checked)}} label={`${format(new Date(slot.startTime), 'hh:mm a')} - ${format(new Date(slot.endTime), 'hh:mm a')}`} position={"right"}/>
                                                                            </div>)
                                                                    }
                                                                </div>
                                                            </div>
                                                        }
                                                        {
                                                            slots.filter(slot => slot.timeOfDay === "afternoon"  && slot.available).length > 0 &&
                                                            <div className={'py-3 w-full'}>
                                                                <div className={'flex space-x-2 items-center pb-3'}>
                                                                    <img src={afternoon} className={'w-10'}/>  <span className={'block font-bold'}>Afternoon</span>
                                                                </div>
                                                                <div className={'grid grid-cols-2 gap-2 w-full'}>
                                                                    {
                                                                        slots.filter(slot => slot.timeOfDay === "afternoon"  && slot.available).map((slot, index) =>
                                                                            <div className={'flex justify-center'} key={index}>
                                                                                <PiCheckbox value={checkSelectedAvailableSlots(slot)} onChange={(e) => {selectAvailableSlots(slot, e.target.checked)}} label={`${format(new Date(slot.startTime), 'hh:mm a')} - ${format(new Date(slot.endTime), 'hh:mm a')}`} position={"right"}/>
                                                                            </div>)
                                                                    }
                                                                </div>
                                                            </div>
                                                        }
                                                        {
                                                            slots.filter(slot => slot.timeOfDay === "evening"  && slot.available).length > 0 &&
                                                            <div className={'py-3 w-full'}>
                                                                <div className={'flex space-x-2 items-center pb-3'}>
                                                                    <img src={night} className={'w-10'}/>  <span className={'block font-bold'}>Evening</span>
                                                                </div>
                                                                <div className={'grid grid-cols-2 gap-2 w-full'}>
                                                                    {
                                                                        slots.filter(slot => slot.timeOfDay === "evening"  && slot.available).map((slot, index) =>
                                                                            <div className={'flex justify-center'} key={index}>
                                                                                <PiCheckbox value={checkSelectedAvailableSlots(slot)} onChange={(e) => {selectAvailableSlots(slot, e.target.checked)}} label={`${format(new Date(slot.startTime), 'hh:mm a')} - ${format(new Date(slot.endTime), 'hh:mm a')}`} position={"right"}/>
                                                                            </div>)
                                                                    }
                                                                </div>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>

                                    {/*UnAvailable slots*/}
                                    <div className={'flex flex-col h-full w-full overflow-auto'}>
                                        <div className={'h-auto flex justify-between items-center'}>
                                            Un-Available Slots
                                        </div>
                                        <div className={'grow w-full h-full overflow-auto'}>
                                            {
                                                slots.filter(slot => !slot.available ).length === 0 &&
                                                <div className={'flex flex-wrap content-center justify-center w-full h-full'}>
                                                    <div className={'text-center'}>
                                                        <i className={'pi pi-calendar-minus text-6xl'}></i>
                                                        <span className={'block'}>list is empty.</span>
                                                    </div>
                                                </div>
                                            }
                                            {
                                                slots.filter(slot => !slot.available ).length > 0 &&
                                                <div className={'flex flex-col h-full w-full overflow-auto'}>
                                                    <div className={'h-10 flex justify-between items-center'}>
                                                        {
                                                            selectedSlots.unAvailable.length > 0 &&
                                                            <>
                                                                <span className={'block font-bold'}>{selectedSlots.unAvailable.length} slot{selectedSlots.unAvailable.length > 1 && 's'} selected.</span>
                                                                <PiButton onClick={() => saveAvailable()} type={'primary'} size={'small'} rounded={'rounded'}>
                                                                    Update Availability
                                                                </PiButton>
                                                            </>
                                                        }
                                                    </div>
                                                    <div className={'grow h-full w-full overflow-auto'}>
                                                        {
                                                            slots.filter(slot => slot.timeOfDay === "morning" && !slot.available).length > 0 &&
                                                            <div className={'py-3 w-full'}>
                                                                <div className={'flex space-x-2 items-center pb-3'}>
                                                                    <img src={morning} className={'w-10'}/>  <span className={'block font-bold'}>Morning</span>
                                                                </div>
                                                                <div className={'grid grid-cols-2 gap-2 w-full'}>
                                                                    {
                                                                        slots.filter(slot => slot.timeOfDay === "morning" && !slot.available).map((slot, index) =>
                                                                            <div className={'flex justify-center'} key={index}>
                                                                                <PiCheckbox value={checkSelectedUnAvailableSlots(slot)} onChange={(e) => {selectUnAvailableSlots(slot, e.target.checked)}} label={`${format(new Date(slot.startTime), 'hh:mm a')} - ${format(new Date(slot.endTime), 'hh:mm a')}`} position={"right"}/>
                                                                            </div>)
                                                                    }
                                                                </div>
                                                            </div>
                                                        }
                                                        {
                                                            slots.filter(slot => slot.timeOfDay === "afternoon" && !slot.available).length > 0 &&
                                                            <div className={'py-3 w-full'}>
                                                                <div className={'flex space-x-2 items-center pb-3'}>
                                                                    <img src={afternoon} className={'w-10'}/>  <span className={'block font-bold'}>Afternoon</span>
                                                                </div>
                                                                <div className={'grid grid-cols-2 gap-2 w-full'}>
                                                                    {
                                                                        slots.filter(slot => slot.timeOfDay === "afternoon" && !slot.available).map((slot, index) =>
                                                                            <div className={'flex justify-center'} key={index}>
                                                                                <PiCheckbox value={checkSelectedUnAvailableSlots(slot)} onChange={(e) => {selectUnAvailableSlots(slot, e.target.checked)}} label={`${format(new Date(slot.startTime), 'hh:mm a')} - ${format(new Date(slot.endTime), 'hh:mm a')}`} position={"right"}/>
                                                                            </div>)
                                                                    }
                                                                </div>
                                                            </div>
                                                        }
                                                        {
                                                            slots.filter(slot => slot.timeOfDay === "evening" && !slot.available).length > 0 &&
                                                            <div className={'py-3 w-full'}>
                                                                <div className={'flex space-x-2 items-center pb-3'}>
                                                                    <img src={night} className={'w-10'}/>  <span className={'block font-bold'}>Evening</span>
                                                                </div>
                                                                <div className={'grid grid-cols-2 gap-2 w-full'}>
                                                                    {
                                                                        slots.filter(slot => slot.timeOfDay === "evening" && !slot.available).map((slot, index) =>
                                                                            <div className={'flex justify-center'} key={index}>
                                                                                <PiCheckbox value={checkSelectedUnAvailableSlots(slot)} onChange={(e) => {selectUnAvailableSlots(slot, e.target.checked)}} label={`${format(new Date(slot.startTime), 'hh:mm a')} - ${format(new Date(slot.endTime), 'hh:mm a')}`} position={"right"}/>
                                                                            </div>)
                                                                    }
                                                                </div>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </>
    )
}
