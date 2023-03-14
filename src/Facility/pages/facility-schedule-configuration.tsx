import {environment} from "../../shared/environment";
import React, {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../store/auth-provider";
import {ContextInterface} from "../../shared/models/context-interface";
import {ScheduleType} from "../../shared/models/schedule-type";
import {HttpProvider} from "../../store/http-provider";
import {ApiResponse} from "../../shared/models/ApiResponse";
import {finalize} from "rxjs";
import {FormObject} from "../../shared/FormBuilder/form-object";
import {FormDate} from "../../shared/FormBuilder/form-date";
import {FormSelect} from "../../shared/FormBuilder/form-select";
import {FormInput} from "../../shared/FormBuilder/form-input";
import {FormTextArea} from "../../shared/FormBuilder/form-text-area";
import {FormImage} from "../../shared/FormBuilder/form-image";
import {PiButton, PiMessage, PiModal} from "toll-ui-react";
import {format} from "date-fns";
import {Builder} from "../../shared/FormBuilder/builder";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {PiLoader} from "../../shared/components/pi-loader";
import {FormTime} from "../../shared/FormBuilder/form-time";

export default function FacilityScheduleConfiguration() {
    const context = useContext(AuthContext);
    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false };
    const [auth, setAuth] = useState<ContextInterface>(getDefault);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openWalkInModal, setWalkInOpenModal] = useState<boolean>(false);
    const [openScheduleTimesFormModal, setOpenScheduleTimesFormModal] = useState<boolean>(false);
    const [openDurationWaitingTimeFormModal, setOpenDurationWaitingTimeFormFormModal] = useState<boolean>(false);
    const [scheduleTypes, setScheduleTypes] = useState<ScheduleType[]>([]);
    const [scheduleTimes, setScheduleTimes] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(false);
    const [editState, setEditState] = useState<boolean>(false);
    const messageDialog: MessageProps = {
        open: false,
        message: '',
        type: "success"
    }
    const [openDialog, setOpenDialog] = useState(messageDialog);
    const scheduleForm: FormObject[] = [
        {
            id: 'name',
            type: 'text',
            props: {
                required: true,
                label: 'Schedule Type'
            } as FormInput
        }
    ]
    const defaultScheduleTimesForm: FormObject[] = [
        {
            id: 'scheduleTypeId',
            type: 'select',
            props: {
                required: true,
                label: 'Select Schedule Type',
                data: scheduleTypes
            } as FormSelect
        },
        {
            id: 'startTime',
            type: 'time',
            props: {
                required: true,
                label: 'Select Start Time'
            } as FormTime
        },
        {
            id: 'endTime',
            type: 'time',
            props: {
                required: true,
                label: 'Select End Time'
            } as FormTime
        }
    ]
    const defaultWalkInSlotForm: FormObject[] = [
        {
            id: 'scheduleTypeId',
            type: 'select',
            props: {
                required: true,
                label: 'Select Schedule Type For Walk-In Slots',
                data: scheduleTypes
            } as FormSelect
        }
    ]
    const defaultDurationWaitingTimeForm: FormObject[] = [
        {
            id: 'consultationLength',
            type: 'text',
            props: {
                required: true,
                label: 'Consultation Duration',
                type: "number"
            } as FormInput
        },
        {
            id: 'waitingTime',
            type: 'text',
            props: {
                required: true,
                label: 'Waiting Time',
                type: "number"
            } as FormInput
        }
    ]
    const [forms, setForm] = useState<FormObject[]>(scheduleForm);
    const [walkInSlotForm, setWalkInSlotForm] = useState<FormObject[]>(defaultWalkInSlotForm);
    const [walkInSlots, SetWalkInSlots] = useState<any[]>([]);
    const [scheduleTimesForm, setScheduleTimesForm] = useState<FormObject[]>(defaultScheduleTimesForm);
    const [durationWaitingTimeForm, setDurationWaitingTimeForm] = useState<FormObject[]>(defaultDurationWaitingTimeForm);
    const [consultationDurationWaitingTime, setConsultationDurationWaitingTime] = useState<{consultationLength: number, waitingTime: number}>({consultationLength: 0, waitingTime: 0})
    const [formId, setFormId] = useState<string>('');

    const clearDefaultForm = (form: FormObject[]): FormObject[] => {
        setFormId('');
        form.forEach((item) => {
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
            if (item.type === 'time') {
                (item.props as FormDate).date = new Date()
            }
        });

        return form;
    }

    const editScheduleTypeForm = (data: any) => {
        setEditState(true);
        scheduleForm.forEach((item) => {
            (item.props as FormInput).value = data.scheduleType.name;
        });
        setForm([...scheduleForm]);
        setFormId(data.scheduleTypeId);
        setOpenModal(true);
    }

    const editScheduleTimesForm = (data: any) => {
        setEditState(true);
        scheduleTimesForm.forEach((item) => {
            // if (item.type === 'text') {
            //     if (item.id === Object.values([item.id])[0]) {
            //         (item.props as FormInput).value = data[item.id].name;
            //     }
            // }
            // if (item.type === 'textarea') {
            //     if (item.id === Object.values([item.id])[0]) {
            //         (item.props as FormTextArea).value = data[item.id];
            //     }
            // }
            if (item.type === 'select') {
                if (item.id === Object.values([item.id])[0]) {
                    (item.props as FormSelect).value = data[item.id];
                }
            }
            // if (item.type === 'image') {
            //     if (item.id === Object.values([item.id])[0]) {
            //         (item.props as FormImage).image = data[item.id];
            //     }
            // }
            if (item.type === 'time') {
                if (item.id === Object.values([item.id])[0]) {
                    (item.props as FormTime).date = new Date(data[item.id]);
                }
            }
        });

        console.log(scheduleTimesForm, data);
        setScheduleTimesForm([...scheduleTimesForm]);
        setFormId(data.scheduleTypeId);
        setOpenScheduleTimesFormModal(true);
    }

    const updateConsultationDurationWaitingTimeForm = (data: any) => {
        durationWaitingTimeForm.forEach((item) => {
            if (item.id === Object.values([item.id])[0]) {
                (item.props as FormInput).value = data[item.id];
            }
        });

        console.log(durationWaitingTimeForm, data);
        setDurationWaitingTimeForm([...durationWaitingTimeForm]);
    }

    const openDurationWaitingTimeModal = () => {
        setOpenDurationWaitingTimeFormFormModal(true);
    }

    const closeDurationWaitingTimeModal = () => {
        setOpenDurationWaitingTimeFormFormModal(false);
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

    const openModalHandler = () => {
        setOpenModal(true);
    }

    const closeModalHandler = () => {
        setOpenModal(false);
        setForm([...clearDefaultForm(scheduleForm)]);
        setEditState(false);
        setFormId('');
    }

    const closeScheduleTimesFormModalHandler = () => {
        setOpenScheduleTimesFormModal(false);
        setScheduleTimesForm([...clearDefaultForm(scheduleTimesForm)]);
        setEditState(false);
        setFormId('');
    }

    const closeWalkInFormModalHandler = () => {
        setWalkInOpenModal(false);
        setWalkInSlotForm([...clearDefaultForm(walkInSlotForm)]);
        setEditState(false);
        setFormId('');
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

    const getConsultationDurationWaitingTime = () => {
        setLoading(true);
        HttpProvider.get<ApiResponse<{consultationLength: number, waitingTime: number}>>('Schedule/GetSlotInterval', {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false)))
            .subscribe((result) => {
                setConsultationDurationWaitingTime(prevState => {
                    return { ...prevState, waitingTime: result.data.waitingTime, consultationLength: result.data.consultationLength }
                });
            })
    }

    const getScheduleTimes = () => {
        setLoading(true);
        HttpProvider.get<ApiResponse<Array<any>>>('Schedule/GetTimeByScheduleTimes', {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false)))
            .subscribe((result) => {
                setScheduleTimes([...result.data]);
            })
    }

    const getWalkInSlot = () => {
        setLoading(true);
        HttpProvider.get<ApiResponse<Array<any>>>('Configuration/GetWalkinSlotConfiguration', {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false)))
            .subscribe((result) => {
                SetWalkInSlots([...result.data]);
            })
    }

    const saveScheduleType = (form: any) => {
        setLoading(true);
        HttpProvider.post<ApiResponse<any>>('Schedule/NewScheduletype', JSON.stringify(form), {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false))).subscribe((result) => {
            if (result.status === 100) {
                getScheduleTypes();
                closeModalHandler();
                openMessageHandler({type: "success", message: result.message, open: true});
            } else {
                openMessageHandler({type: "error", message: result.message, open: true});
            }
        })
    }

    const saveWalkInSlots = () => {
        setLoading(true);
        HttpProvider.post<ApiResponse<any>>('Configuration/WalkinSlotConfiguration', JSON.stringify(walkInSlots.map(u => u.id)), {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false))).subscribe((result) => {
            if (result.status === 100) {
                getWalkInSlot();
                closeWalkInFormModalHandler();
                openMessageHandler({type: "success", message: result.message, open: true});
            } else {
                openMessageHandler({type: "error", message: result.message, open: true});
            }
        })
    }

    const editScheduleType = (form: any) => {
        setLoading(true);
        form.id = formId;
        HttpProvider.put<ApiResponse<any>>('Schedule/EditScheduleType', JSON.stringify(form), {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false))).subscribe((result) => {
            if (result.status === 100) {
                getScheduleTypes();
                getScheduleTimes();
                closeModalHandler();
                openMessageHandler({type: "success", message: result.message, open: true});
            } else {
                openMessageHandler({type: "error", message: result.message, open: true});
            }
        })
    }

    const saveScheduleTypeHandler = (form: any) => {
        if (editState) {
            editScheduleType(form);
        } else {
            saveScheduleType(form);
        }
    }

    const saveScheduleTimes = (form: any) => {
        setLoading(true);
        HttpProvider.post<ApiResponse<any>>('Schedule/SetScheduleTime', JSON.stringify(form), {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false))).subscribe((result) => {
            if (result.status === 100) {
                getScheduleTimes();
                closeScheduleTimesFormModalHandler();
                openMessageHandler({type: "success", message: result.message, open: true});
            } else {
                openMessageHandler({type: "error", message: result.message, open: true});
            }
        })
    }

    const saveConsultationDurationWaitTime = (form: any) => {
        setLoading(true);
        HttpProvider.post<ApiResponse<any>>('Schedule/SetSlotInterval', JSON.stringify(form), {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false))).subscribe((result) => {
            if (result.status === 100) {
                getConsultationDurationWaitingTime();
                closeDurationWaitingTimeModal();
                openMessageHandler({type: "success", message: result.message, open: true});
            } else {
                openMessageHandler({type: "error", message: result.message, open: true});
            }
        })
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
            getScheduleTimes();
            getConsultationDurationWaitingTime();
            getWalkInSlot();
        }
    }, [auth]);

    useEffect(() => {
        updateConsultationDurationWaitingTimeForm(consultationDurationWaitingTime);
    }, [consultationDurationWaitingTime])

    useEffect(() => {
        if (scheduleTypes.length > 0) {
            const newForm = scheduleTimesForm.find(u => u.id === 'scheduleTypeId');
            if(newForm) {
                (newForm.props as FormSelect).data = scheduleTypes;
                setScheduleTimesForm([...scheduleTimesForm]);
            }
            const walkinForm = walkInSlotForm.find(u => u.id === 'scheduleTypeId');
            if(walkinForm) {
                (walkinForm.props as FormSelect).data = scheduleTypes;
                setWalkInSlotForm([...walkInSlotForm]);
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
                    <div className={'min-h-[400px] w-full'}>
                        <Builder title={'Schedule Type Form'} loading={loading} form={[...forms]} onFormSubmit={saveScheduleTypeHandler}/>
                    </div>
                </PiModal>
            }
            {
                openScheduleTimesFormModal &&
                <PiModal fullScreen={false} onClose={closeScheduleTimesFormModalHandler}>
                    <div className={'min-h-[600px] w-full'}>
                        <Builder title={'Schedule Times Form'} loading={loading} form={[...scheduleTimesForm]} onFormSubmit={saveScheduleTimes}/>
                    </div>
                </PiModal>
            }
            {
                openWalkInModal &&
                <PiModal fullScreen={false} onClose={closeWalkInFormModalHandler}>
                    <div className={'min-h-[600px] w-full'}>
                        <Builder title={'Set Walk-In Slot'} loading={loading} form={[...walkInSlotForm]} onFormSubmit={(e)=> {

                            const find = scheduleTypes.find((u) => u.id === e["scheduleTypeId"]);
                            if (find) {
                                const check = walkInSlots.find(u => u.id === find.id);
                                if (!check) {
                                    walkInSlots.push(find);
                                    SetWalkInSlots([...walkInSlots]);
                                }
                            }
                        }}/>
                        <div className={'w-full py-4'}>
                            {
                                walkInSlots.map((slot) =>
                                    <div key={slot.id} id="badge-dismiss-default"
                                                                className="inline-flex items-center px-2 py-1 mr-2 text-sm font-medium text-blue-800 bg-blue-100 rounded dark:bg-blue-900 dark:text-blue-300">
                                        {slot.name}
                                    <button onClick={() => {
                                        walkInSlots.splice(walkInSlots.findIndex(u => u.id === slot.id), 1);
                                        SetWalkInSlots([...walkInSlots]);

                                    }} type="button"
                                            className="inline-flex items-center p-0.5 ml-2 text-sm text-blue-400 bg-transparent rounded-sm hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300"
                                            data-dismiss-target="#badge-dismiss-default" aria-label="Remove">
                                        <svg aria-hidden="true" className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"
                                             xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd"
                                                                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                                                      clipRule="evenodd"></path></svg>
                                    </button>
                                </div>)
                            }
                        </div>
                        <PiButton onClick={saveWalkInSlots} block={true} type={'primary'} size={'normal'} rounded={'rounded'}>
                            Save walk in schedule type
                        </PiButton>
                    </div>
                </PiModal>
            }
            {
                openDurationWaitingTimeFormModal &&
                <PiModal fullScreen={false} onClose={closeDurationWaitingTimeModal}>
                    <div className={'min-h-[600px] w-full'}>
                        <Builder title={'Consultation Duration And Waiting Time Form'} loading={loading} form={[...durationWaitingTimeForm]} onFormSubmit={saveConsultationDurationWaitTime}/>
                    </div>
                </PiModal>
            }
            <div className="flex flex-col w-full h-full relative">
                <PiLoader loading={loading} />
                <div className="flex justify-center w-full h-full">
                    <div className="max-xl:w-full xl:w-full gap-4">
                        <div className="flex w-full h-full overflow-auto">
                            <div className={'grow h-full overflow-auto feed p-2'}>
                                <table className={'border-collapse w-full text-sm'}>
                                    <thead>
                                    <tr className="noWrap">
                                        <th className={'border border-slate-600'}>SCHEDULE</th>
                                        <th className={'border border-slate-600'}>START TIME</th>
                                        <th className={'border border-slate-600'}>END TIME</th>
                                        <th className={'border border-slate-600'}></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        loading &&
                                        <tr>
                                            <td colSpan={3}>
                                                <div className={'flex justify-center w-full'}>
                                                    <h1>loading ...</h1>
                                                </div>
                                            </td>
                                        </tr>
                                    }
                                    {
                                        scheduleTimes.length > 0 && !loading &&
                                        <>
                                            {
                                                scheduleTimes.map((times) =>
                                                    <tr key={times.id}>
                                                        <td className={'border-slate-700 border p-1'}>{times.scheduleType?.name}</td>
                                                        <td className={'border-slate-700 border p-1'}>{format(new Date(times.startTime), 'HH:mm a')}</td>
                                                        <td className={'border-slate-700 border p-1'}>{format(new Date(times.endTime), 'HH:mm a')}</td>
                                                        <td className={'border-slate-700 border p-1'}>
                                                            <div className={'flex space-x-2'}>
                                                                <PiButton rounded={'rounded'} size={'extra small'} type={'success'} onClick={() => editScheduleTimesForm(times)}>EDIT TIME</PiButton>
                                                                <PiButton rounded={'rounded'} size={'extra small'} type={'primary'} onClick={() => editScheduleTypeForm(times)}>EDIT SCHEDULE NAME</PiButton>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                        </>
                                    }
                                    </tbody>
                                </table>
                            </div>
                            <div className={'flex-none w-[300px] bg-gray-200 dark:bg-gray-800 border-r dark:border-r-gray-800 p-2 space-y-4'}>
                                <PiButton onClick={openModalHandler} block={true} type={'primary'} size={'small'} rounded={'rounded'}>
                                    Add Schedule Type
                                </PiButton>
                                <PiButton onClick={() => {setOpenScheduleTimesFormModal(true)}} block={true} type={'primary'} size={'small'} rounded={'rounded'}>
                                    Setup Schedule Times
                                </PiButton>
                                <PiButton onClick={openDurationWaitingTimeModal} block={true} type={'primary'} size={'small'} rounded={'rounded'}>
                                    Set Consultation Duration & Waiting Time
                                </PiButton>
                                <PiButton onClick={() => setWalkInOpenModal(true)} block={true} type={'primary'} size={'small'} rounded={'rounded'}>
                                    Setup Walk in Slot Config
                                </PiButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}
