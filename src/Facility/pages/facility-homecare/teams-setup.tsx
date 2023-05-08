import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../../store/auth-provider";
import {ContextInterface} from "../../../shared/models/context-interface";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {Paging} from "../../../shared/models/paging";
import {FormObject} from "../../../shared/FormBuilder/form-object";
import {FormInput} from "../../../shared/FormBuilder/form-input";
import {FormSelect} from "../../../shared/FormBuilder/form-select";
import {PiAvatar, PiButton, PiLoading, PiMessage, PiModal} from "toll-ui-react";
import {Builder} from "../../../shared/FormBuilder/builder";
import {PiPagination} from "../../../shared/components/pi-pagination";
import {HttpProvider} from "../../../store/http-provider";
import {ApiResponse} from "../../../shared/models/ApiResponse";
import {finalize, forkJoin, Observable} from "rxjs";
import {environment} from "../../../shared/environment";
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
    const [openTeamInfoModal, setOpenTeamInfoModal] = useState<boolean>(false);
    const [selectedTeam, setSelectedTeam] = useState<any>();
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

    const openTeamInfoModalHandler = (data: any) => {
        setSelectedTeam(data);
        setOpenTeamInfoModal(true);
    }

    const closeTeamInfoModalHandler = () => {
        setOpenTeamInfoModal(false);
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

    const getAllDataHandler = () => {
        setLoading(true);
        loadAll()
            .pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: result => {

                    const data: Array<any> = [];
                    result.teams.data.forEach((team) => {
                        data.push(team);
                    });

                    setTeams([...data]);
                    setPaging(prevState => {
                        return { ...prevState, totalPages: result.teams.totalPages, totalRecords: result.teams.totalRecords, currentSize: result.teams.data.length}
                    });

                    setUsers(result.nurses.data)
                }
            })
    }

    const loadAll = (): Observable<{nurses: ApiResponse<Array<any>>, teams: PagedResponse<Array<any>>}> => {
        return forkJoin({
            nurses: getNurses(),
            teams: getTeams()
        })
    }

    const getTeams = (): Observable<PagedResponse<Array<any>>> => {
        return HttpProvider.get<PagedResponse<Array<any>>>(`Teams/GetAllPaginated?pageSize=${10}&pageNumber=${1}`, {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        })
    }

    const getNurses = (): Observable<ApiResponse<Array<any>>> => {
        return HttpProvider.get<ApiResponse<Array<any>>>(`User/GetAllNurses`, {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        })
    }

    const getAllTeams = () => {
        setLoading(true);
        HttpProvider.get<PagedResponse<Array<any>>>(`Teams/GetAllPaginated?pageSize=${paging.pageSize ?? 10}&pageNumber=${paging.pageNumber}`, {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).subscribe({
            next: result => {

                const data: Array<any> = [];
                result.data.forEach((team) => {
                    data.push(team);
                });

                setTeams([...data]);
                setPaging(prevState => {
                    return { ...prevState, pageSize: result.pageSize, totalPages: result.totalPages, totalRecords: result.totalRecords, currentSize: result.data.length}
                });
            }
        })
    }

    const editTeam = (data: any) => {
        setEditState(true);
        teamForm.forEach((item) => {
            if (item.type === 'text') {
                if (item.id === Object.values([item.id])[0]) {
                    (item.props as FormInput).value = data[item.id];
                }
            }
            if (item.type === 'select') {
                const selectType = item.props as FormSelect;
                if (selectType.type === 'single') {
                    if (item.id === 'teamLead') {
                        selectType.value = data.teamLead.id;
                    }
                }
                if (selectType.type === 'multiple') {
                    if (item.id === 'teamMembers') {
                        const mapdata = data.userTeams.map((team: any) => {
                            return team.userId
                        });
                        selectType.value = [...mapdata];
                    }
                }
            }

        });
        console.log('id', data);
        setForm([...teamForm]);
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
                        getAllTeams();
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
                        getAllTeams();
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
            getAllDataHandler();
        }
    }, [auth])

    useEffect(() => {
        if (auth.accessToken?.token) {
            if (paging.pageSize > 0) {
                HttpProvider.apiUrl = environment.apiUrl;
                getAllTeams();
            }
        }
    }, [paging.pageSize, auth])

    useEffect(() => {
        if (users.length > 0) {
            const myForm = form.find(u => u.id === 'teamLead');
            if (myForm) {
                (myForm.props as FormSelect).data = users;
                setForm([...form]);
            }
            const myMembersForm = form.find(u => u.id === 'teamMembers');
            if (myMembersForm) {
                (myMembersForm.props as FormSelect).data = users;
                setForm([...form]);
            }
        }
    }, [users])

    return (
        <>
            {
                openDialog.open &&
                <PiMessage onClose={closeMessageHandler} message={openDialog.message} type={openDialog.type}/>
            }
            {
                openTeamInfoModal &&
                <PiModal fullScreen={false} onClose={closeTeamInfoModalHandler}>
                    <div className={'w-full flex flex-col space-y-8'}>
                        <div className={'flex justify-center'}>
                            <div className={'text-center'}>
                                <h5 className={'text-base'}>TEAM NAME</h5>
                                <h1 className={'text-3xl font-extrabold'}>{selectedTeam?.name}</h1>
                            </div>
                        </div>
                        <div className={'flex justify-center'}>
                            <div className={'text-center space-y-1'}>
                                <h5 className={'text-base'}>TEAM LEAD</h5>
                                <div className={'flex justify-center w-full'}>
                                    <PiAvatar image={selectedTeam?.teamLead?.image}/>
                                </div>
                                <h1 className={'text-3xl font-extrabold'}>{selectedTeam?.teamLead?.firstName} {selectedTeam?.teamLead?.lastName}</h1>
                            </div>
                        </div>
                        <div className={'flex justify-center'}>
                            <div className={'space-y-2'}>
                                <h5 className={'text-base text-center'}>TEAM MEMBERS</h5>
                                {
                                    selectedTeam?.userTeams?.map((team: any) =>
                                        <div key={team.id} className="flex items-center space-x-4">
                                            <PiAvatar image={team.user.image}/>
                                            <div className="font-medium dark:text-white">
                                                <div>{team.user.firstName} {team.user.lastName}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{team.user.email}</div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </PiModal>
            }
            {
                openModal &&
                <PiModal fullScreen={false} onClose={closeModalHandler}>
                    <div className={'min-h-[600px] w-full'}>
                        <Builder loading={loading} form={form} onFormSubmit={submitHandler}/>
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
                            <th className={'border border-slate-600'}>TEAM</th>
                            <th className={'border border-slate-600'}>LEAD</th>
                            <th className={'border border-slate-600'}>MEMBERS</th>
                            <th className={'border border-slate-600'}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            loading &&
                            <tr>
                                <td colSpan={4}>
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
                                        <tr key={team.name}>
                                            <td className={'border-slate-700 border p-1 text-center'}>{team.name}</td>
                                            <td className={'border-slate-700 border p-1 text-center'}>{team.teamLead?.firstName} {team.teamLead?.lastName}</td>
                                            <td className={'border-slate-700 border p-1'}>
                                                <div className={'flex justify-center w-full'}>
                                                    <div className="flex -space-x-4">
                                                        {
                                                            team.userTeams?.map((user: any) =>
                                                                <div key={user.id}
                                                                     className="relative inline-flex items-center justify-center border w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                                                                    <div className="font-medium text-gray-600 dark:text-gray-300">{user.user.firstName?.[0]}{user.user.lastName?.[0]}</div>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={'border-slate-700 border p-1'}>
                                                <div className={'flex space-x-2'}>
                                                    <PiButton rounded={'rounded'} size={'extra small'} type={'success'} onClick={() => editTeam(team)}>EDIT</PiButton>
                                                    <PiButton rounded={'rounded'} size={'extra small'} type={'primary'} onClick={() => openTeamInfoModalHandler(team)}>TEAM INFO</PiButton>
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
