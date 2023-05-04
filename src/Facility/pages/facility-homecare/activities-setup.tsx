import {environment} from "../../../shared/environment";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../../store/auth-provider";
import {ContextInterface} from "../../../shared/models/context-interface";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {Paging} from "../../../shared/models/paging";
import {FormObject} from "../../../shared/FormBuilder/form-object";
import {HttpProvider} from "../../../store/http-provider";
import {ApiResponse} from "../../../shared/models/ApiResponse";
import {finalize} from "rxjs";
import {FormInput} from "../../../shared/FormBuilder/form-input";
import {FormCheckBox} from "../../../shared/FormBuilder/form-check-box";
import {PiButton, PiMessage, PiModal, PiSelectList} from "toll-ui-react";
import {Builder} from "../../../shared/FormBuilder/builder";
import {PiPagination} from "../../../shared/components/pi-pagination";
import {FormSelect} from "../../../shared/FormBuilder/form-select";

export default function ActivitiesSetup() {
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
    const [editState, setEditState] = useState<boolean>(false);
    const [activities, setActivities] = useState<any[]>([]);
    const [formId, setFormId] = useState<string>('');
    const [paging, setPaging] = useState<Paging>({ pageSize: 10, pageNumber: 1, totalPages: 0, totalRecords: 0, currentSize: 0 });
    const activityForm: FormObject[] = [
        {
            id: 'name',
            type: "text",
            props: {
                required: true,
                label: 'Activity Name',
                value: ''
            }
        },
        {
            id: 'isActive',
            type: "checkbox",
            props: {
                label: 'Active',
                value: false
            }
        }
    ]
    const [form, setForm] = useState<FormObject[]>(activityForm);

    const clearDefaultForm = () => {
        setFormId('');
        activityForm.forEach((item) => {
            if (item.type === 'text') {
                (item.props as FormInput).value = ''
            }
            if(item.type === 'checkbox') {
                (item.props as FormCheckBox).value = false
            }
        });
        setForm([...activityForm]);
    }

    const openModalHandler = () => {
        setOpenModal(true);
    }

    const closeModalHandler = () => {
        clearDefaultForm();
        setEditState(false);
        setOpenModal(false);
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
    const getActivities = () => {
        setLoading(true);
        HttpProvider.get<ApiResponse<Array<any>>>(`HomeCare/GetActivities`, {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false)))
            .subscribe((result) => {
                setActivities([...result.data]);
            })
    }

    const editActivity = (data: any) => {
        setEditState(true);
        form.forEach((item) => {
            if (item.type === 'checkbox') {
                if (item.id === Object.values([item.id])[0]) {
                    (item.props as FormSelect).value = data[item.id];
                }
            }
            if (item.type === 'text') {
                if (item.id === Object.values([item.id])[0]) {
                    (item.props as FormInput).value = data[item.id];
                }
            }
        });
        setForm([...form]);
        setFormId(data.id);
        setOpenModal(true);
    }

    const submitHandler = (form: any) => {
        if (editState) {
            editHandler(form);
        } else {
            saveHandler(form);
        }
    }

    const saveHandler = (form: any) => {
        setLoading(true);
        HttpProvider.post<ApiResponse<any>>('HomeCare/PostActivities',
            JSON.stringify(form), {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }).pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: result => {
                    if (result.status === 100) {
                        getActivities();
                        closeModalHandler();
                        openMessageHandler({type: "success", message: result.message, open: true});
                    } else {
                        openMessageHandler({type: "error", message: result.message, open: true});
                    }
                }
            })
    }

    const editHandler = (form: any) => {
        setLoading(true);
        form.id = formId;
        HttpProvider.put<ApiResponse<any>>('HomeCare/PutActivities',
            JSON.stringify(form), {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }).pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: result => {
                    if (result.status === 100) {
                        getActivities();
                        closeModalHandler();
                        openMessageHandler({type: "success", message: result.message, open: true});
                    } else {
                        openMessageHandler({type: "error", message: result.message, open: true});
                    }
                }
            })
    }

    useEffect(() => {
        setAuth((prevState) => {
            return {...prevState, user: context.user, accessToken: context.accessToken }
        });
    }, [context]);

    useEffect(() => {
        if (auth.accessToken?.token) {
            HttpProvider.apiUrl = environment.apiUrl;
            getActivities();
        }
    }, [auth])
    return (
        <>
            {
                openDialog.open &&
                <PiMessage onClose={closeMessageHandler} message={openDialog.message} type={openDialog.type}/>
            }
            {
                openModal &&
                <PiModal fullScreen={false} onClose={closeModalHandler}>
                    <Builder loading={loading} form={form} onFormSubmit={submitHandler}/>
                </PiModal>
            }
            <div className={'flex flex-col w-full h-full space-y-4 p-2'}>
                <div className={'h-auto w-full flex justify-between'}>
                    <PiButton onClick={openModalHandler} type={'primary'} size={'small'} rounded={'rounded'}>
                        <i className={'pi pi-plus'}></i> <span className={'ml-2'}>Add Activities</span>
                    </PiButton>

                    <PiPagination
                        pageSize={paging.pageSize}
                        pageNumber={paging.pageNumber}
                        totalPages={paging.totalPages}
                        pageNumberChangeHandler={(e) => setPaging(prevState => {
                            return { ...prevState, pageNumber: e}
                        })}
                        pageSizeChangeHandler={(e) => setPaging(prevState => {
                            return { ...prevState, pageSize: e}
                        })}
                        totalRecords={paging.totalRecords}
                        currentSize={paging.currentSize}/>
                </div>
                <div className={'grow w-full h-full overflow-auto'}>
                    <table className={'border-collapse w-full text-sm'}>
                        <thead>
                        <tr className="noWrap">
                            <th className={'border border-slate-600'}>NAME</th>
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
                            activities.length > 0 && !loading &&
                            <>
                                {
                                    activities.map((activity) =>
                                        <tr key={activity.id}>
                                            <td className={'border-slate-700 border p-1'}>{activity.name}</td>
                                            <td className={'border-slate-700 border p-1'}>
                                                <div className={'flex space-x-2'}>
                                                    <PiButton rounded={'rounded'} size={'extra small'} type={'success'} onClick={() => editActivity(activity)}>EDIT</PiButton>
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
            </div>
        </>
    )
}
