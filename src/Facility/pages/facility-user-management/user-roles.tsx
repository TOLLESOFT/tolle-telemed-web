import {environment} from "../../../shared/environment";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../../store/auth-provider";
import {ContextInterface} from "../../../shared/models/context-interface";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {FormItem} from "../../../shared/FormBuilder/form-item";
import {ApiResponse} from "../../../shared/models/ApiResponse";
import {Role} from "../../../shared/models/Role";
import {Paging} from "../../../shared/models/paging";
import {PiButton, PiLoading, PiMessage, PiModal} from "toll-ui-react";
import {FormBuilder} from "../../../shared/FormBuilder/form-builder";
import {PagedResponse} from "../../../shared/models/PagedResponse";
import {Facility} from "../../../shared/models/Facility";
import {PiPagination} from "../../../shared/components/pi-pagination";
import {HttpProvider} from "../../../store/http-provider";
import {BaseService} from "../../../shared/base.service";
import {finalize} from "rxjs";
import {UserPermissions} from "./user-permissions";
import {PiLoader} from "../../../shared/components/pi-loader";

export default function UserRoles() {
    const context = useContext(AuthContext);
    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false };
    const [auth, setAuth] = useState<ContextInterface>(getDefault);
    const [roles, setRoles] = useState<Array<Role>>([]);
    const [editState, setEditState] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const messageDialog: MessageProps = {
        open: false,
        message: '',
        type: "success"
    }
    const [openDialog, setOpenDialog] = useState(messageDialog);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openPermissionsModal, setOpenPermissionsModal] = useState<boolean>(false);
    const [selectedRole, setSelectedRole] = useState<Role>({concurrencyStamp: "", id: "", name: "", normalizedName: ""})
    const defaultForm: FormItem[] = [
        {
            id: 'name',
            type: "text",
            required: true,
            label: 'Name',
            value: ''
        }
    ];
    const [forms, setForm] = useState<FormItem[]>(defaultForm);
    const [formId, setFormId] = useState<string>('');
    const [allSelected, setAllSelected] = useState<any[]>([]);
    const [paging, setPaging] = useState<Paging>({
        pageSize: 10,
        pageNumber: 1,
        totalPages: 0,
        totalRecords: 0,
        currentSize: 0
    });

    const openModalHandler = () => {
        setOpenModal(true);
    }
    const closeModalHandler = () => {
        setEditState(false);
        setOpenModal(false);
        clearDefaultForm();
    }
    const openPermissionsModalHandler = (data: any) => {
        setSelectedRole(data);
        setOpenPermissionsModal(true);
    }
    const closePermissionsModalHandler = () => {
        setOpenPermissionsModal(false);
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
    const editRole = (data: any) => {
        setEditState(true);
        defaultForm.forEach((item) => {
            if (item.id === Object.values([item.id])[0]) {
                item.value = data[item.id];
            }
        });
        setForm([...defaultForm]);
        setFormId(data["id"]);
        setOpenModal(true);
    }
    const clearDefaultForm = () => {
        setFormId('');
        defaultForm.forEach((item) => {
            item.value = ''
        });
        setForm([...defaultForm]);
    }
    const getDataHandler = () => {
        setLoading(true);
        HttpProvider.get<PagedResponse<Array<Facility>>>(`User/GetAllRoles?pageSize=${paging.pageSize}&pageNumber=${paging.pageNumber}`, {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        })
            .pipe(finalize(() => setLoading(false)))
            .subscribe((result) => {
                const data: Array<Facility> = [];
                result.data.forEach((rate) => {
                    data.push(rate);
                });
                setRoles(data);
                setPaging(prevState => {
                    return { ...prevState, pageSize: result.pageSize, totalPages: result.totalPages, totalRecords: result.totalRecords, currentSize: result.data.length}
                });
            })
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
        HttpProvider.post<ApiResponse<any>>(
            'User/AddRole',
            JSON.stringify(form),
            BaseService.HttpHeaders())
            .pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: (result) => {
                    if (result.status === 100) {
                        getDataHandler();
                        closeModalHandler();
                        openMessageHandler({type: "success", message: result.message, open: true});
                    } else {
                        openMessageHandler({type: "error", message: result.message, open: true});
                    }
                },
                error: err => {
                    openMessageHandler({type: "error", message: 'something went wrong please try again', open: true});
                }
            })
    }
    const editHandler = (form: any) => {
        form["id"] = formId;
        setLoading(true);
        HttpProvider.put<ApiResponse<any>>(
            'User/EditRole',
            JSON.stringify(form),
            BaseService.HttpHeaders())
            .pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: result => {
                    if (result.status === 100) {
                        getDataHandler();
                        closeModalHandler();
                        openMessageHandler({type: "success", message: result.message, open: true});
                    } else {
                        openMessageHandler({type: "error", message: result.message, open: true});
                    }
                },
                error: err => {
                    openMessageHandler({type: "error", message: 'something went wrong please try again', open: true});
                }
            })
    }

    const savePermissions = () => {
        setLoading(true);
        allSelected.forEach(u => {
            u.roleId = selectedRole.id;
            u.children = u.children.filter((m: any) => m.checked === true);
        });

        HttpProvider.post<ApiResponse<any>>(
            'General/RolePermissions',
            JSON.stringify(allSelected),
            BaseService.HttpHeaders())
            .pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: (result) => {
                    if (result.status === 100) {
                        closePermissionsModalHandler();
                        openMessageHandler({type: "success", message: result.message, open: true});
                    } else {
                        openMessageHandler({type: "error", message: result.message, open: true});
                    }
                },
                error: err => {
                    openMessageHandler({type: "error", message: 'something went wrong please try again', open: true});
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
            if (paging.pageSize > 0) {
                getDataHandler();
            }
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
                    <FormBuilder title={'Roles'} loading={loading} form={forms} onFormSubmit={submitHandler}/>
                </PiModal>
            }
            {
                openPermissionsModal &&
                <PiModal fullScreen={true} onClose={closePermissionsModalHandler}>
                    <div className={'h-full w-full flex flex-col'}>
                        <div className={'h-auto w-full flex justify-between items-center'}>
                            <h1>{selectedRole.normalizedName} PERMISSIONS</h1>
                            <i onClick={closePermissionsModalHandler} className={'pi pi-times cursor-pointer'}></i>
                        </div>
                        <div className={'h-auto w-full flex justify-between items-center py-4'}>
                            <PiButton onClick={savePermissions} type={'primary'} size={'small'} rounded={'rounded'}>
                                Save Permissions
                            </PiButton>
                        </div>
                        <div className={'grow w-full h-full p-2'}>
                           <UserPermissions data={selectedRole} onPermissionsChange={(e) => {
                               setAllSelected(e);
                           }}/>
                        </div>
                    </div>
                    <PiLoader loading={loading}/>
                </PiModal>
            }
            <div className={'flex flex-col w-full h-full space-y-4 p-2'}>
                <div className={'h-auto w-full flex justify-between items-center'}>
                    <PiButton onClick={openModalHandler} type={'primary'} size={'small'} rounded={'rounded'}>
                        <i className={'pi pi-plus'}></i> <span className={'ml-2'}>New Role</span>
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
                            <th className={'border border-slate-600'}>ROLE</th>
                            <th className={'border border-slate-600'}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            loading &&
                            <tr>
                                <td colSpan={3}>
                                    <div className={'flex justify-center w-full'}>
                                        <PiLoading  loading={loading}/>
                                    </div>
                                </td>
                            </tr>
                        }
                        {
                            roles.length > 0 && !loading &&
                            <>
                                {
                                    roles.map((role) =>
                                        <tr key={role.id}>
                                            <td className={'border-slate-700 border p-1'}>{role.name}</td>
                                            <td className={'border-slate-700 border p-1'}>
                                               <div className={'flex space-x-2'}>
                                                   <PiButton rounded={'rounded'} size={'extra small'} type={'success'} onClick={() => editRole(role)}>EDIT</PiButton>
                                                   <PiButton rounded={'rounded'} size={'extra small'} type={'primary'} onClick={() => openPermissionsModalHandler(role)}>PERMISSIONS</PiButton>
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
