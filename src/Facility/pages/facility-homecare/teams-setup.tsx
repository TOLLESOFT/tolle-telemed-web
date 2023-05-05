import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../../store/auth-provider";
import {ContextInterface} from "../../../shared/models/context-interface";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {Paging} from "../../../shared/models/paging";
import {FormObject} from "../../../shared/FormBuilder/form-object";
import {FormInput} from "../../../shared/FormBuilder/form-input";
import {FormSelect} from "../../../shared/FormBuilder/form-select";
import {PiButton, PiLoading, PiMessage, PiModal} from "toll-ui-react";
import {Builder} from "../../../shared/FormBuilder/builder";
import {PiPagination} from "../../../shared/components/pi-pagination";
import {HttpProvider} from "../../../store/http-provider";
import {ApiResponse} from "../../../shared/models/ApiResponse";
import {finalize} from "rxjs";
import {environment} from "../../../shared/environment";
import {UserModel} from "../../../shared/models/UserModel";
import {PagedResponse} from "../../../shared/models/PagedResponse";

export default function TeamsSetup() {
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
    const [teams, setTeams] = useState<any[]>([]);
    const [formId, setFormId] = useState<string>('');
    const [paging, setPaging] = useState<Paging>({ pageSize: 10, pageNumber: 1, totalPages: 0, totalRecords: 0, currentSize: 0 });
    const [users, setUsers] = useState<any[]>([]);
    const teamForm: FormObject[] = [
        {
            id: 'name',
            type: "text",
            props: {
                required: true,
                label: 'Team Name',
                value: ''
            }
        },
        {
            id: 'teamLead',
            type: "select",
            props: {
                type: 'single',
                required: true,
                label: 'Team Lead',
                data: users,
                value: ''
            }
        },
        {
            id: 'teamMembers',
            type: "select",
            props: {
                type: 'multiple',
                required: true,
                label: 'Team Members (this is a multi select)',
                data: users,
                value: []
            }
        }
    ]
    const [form, setForm] = useState<FormObject[]>(teamForm);

    const clearDefaultForm = () => {
        setFormId('');
        teamForm.forEach((item) => {
            if (item.type === 'text') {
                (item.props as FormInput).value = ''
            }
            if (item.type === 'select') {
                if ((item.props as FormSelect).type === 'single') {
                    (item.props as FormSelect).value = '';
                }
                if ((item.props as FormSelect).type === 'multiple') {
                    (item.props as FormSelect).value = [];
                }
            }
        });
        setForm([...teamForm]);
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

    const getTeams = () => {
        setLoading(true);
        HttpProvider.get<PagedResponse<Array<any>>>(`Teams/GetAllPaginated?pageSize=${paging.pageSize}&pageNumber=${paging.pageNumber}`, {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false)))
            .subscribe((result) => {
                setTeams([...result.data]);
                const data: Array<any> = [];
                result.data.forEach((rate) => {
                    data.push(rate);
                });
                setTeams([...data]);
                setPaging(prevState => {
                    return { ...prevState, pageSize: result.pageSize, totalPages: result.totalPages, totalRecords: result.totalRecords, currentSize: result.data.length}
                });
            })
    }

    const getNurses = () => {
        setLoading(true);
        HttpProvider.get<ApiResponse<Array<any>>>(`User/GetAllNurses`, {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false)))
            .subscribe((result) => {
                setUsers([...result.data]);
            })
    }

    const editTeam = (data: any) => {
        setEditState(true);
        form.forEach((item) => {
            if (item.type === 'select') {
                if (item.id === Object.values([item.id])[0]) {
                    const select = (item.props as FormSelect);
                    if (select.type === 'single' || select.type === undefined) {
                        (item.props as FormSelect).value = data[item.id];
                    } else {
                        (item.props as FormSelect).value = String(data[item.id]).split(',');
                    }
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
        HttpProvider.post<ApiResponse<any>>('Teams',
            JSON.stringify(form), {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }).pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: result => {
                    if (result.status === 100) {
                        getTeams();
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
        HttpProvider.put<ApiResponse<any>>('Teams',
            JSON.stringify(form), {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }).pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: result => {
                    if (result.status === 100) {
                        getTeams();
                        closeModalHandler();
                        openMessageHandler({type: "success", message: result.message, open: true});
                    } else {
                        openMessageHandler({type: "error", message: result.message, open: true});
                    }
                }
            })
    }

    useEffect(() => {
        if (users.length > 0) {
            const myForm = form.find(u => u.id === 'teamLead');
            if (myForm) {
                (myForm.props as FormSelect).data = users;
            }
            const myMembersForm = form.find(u => u.id === 'teamMembers');
            if (myMembersForm) {
                (myMembersForm.props as FormSelect).data = users;
            }
            setForm([...form]);
        }
    }, [users])

    useEffect(() => {
        setAuth((prevState) => {
            return {...prevState, user: context.user, accessToken: context.accessToken }
        });
    }, [context]);

    useEffect(() => {
        if (auth.accessToken?.token) {
            HttpProvider.apiUrl = environment.apiUrl;
            getNurses();
        }
    }, [auth])

    useEffect(() => {
        if (auth.accessToken?.token) {
            HttpProvider.apiUrl = environment.apiUrl;
            getTeams();
        }
    }, [paging.pageSize, auth])
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
                        <Builder loading={loading} form={form}  onFormSubmit={submitHandler}/>
                    </div>
                </PiModal>
            }
            <div className={'flex flex-col w-full h-full space-y-4 p-2'}>
                <div className={'h-auto w-full flex justify-between'}>
                    <PiButton onClick={openModalHandler} type={'primary'} size={'small'} rounded={'rounded'}>
                        <i className={'pi pi-plus'}></i> <span className={'ml-2'}>Create Team</span>
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
                                        <PiLoading loading={loading}/>
                                    </div>
                                </td>
                            </tr>
                        }
                        {
                            teams.length > 0 && !loading &&
                            <>
                                {
                                    teams.map((team) =>
                                        <tr key={team.id}>
                                            <td className={'border-slate-700 border p-1'}>{team.name}</td>
                                            <td className={'border-slate-700 border p-1'}>
                                                <div className={'flex space-x-2'}>
                                                    <PiButton rounded={'rounded'} size={'extra small'} type={'success'} onClick={() => editTeam(team)}>EDIT</PiButton>
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
