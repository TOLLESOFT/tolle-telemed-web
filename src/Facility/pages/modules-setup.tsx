import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../store/auth-provider";
import {ContextInterface} from "../../shared/models/context-interface";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {FormObject} from "../../shared/FormBuilder/form-object";
import {FormInput} from "../../shared/FormBuilder/form-input";
import {HttpProvider} from "../../store/http-provider";
import {ApiResponse} from "../../shared/models/ApiResponse";
import {finalize} from "rxjs";
import {environment} from "../../shared/environment";
import {PiButton, PiCheckbox, PiMessage, PiModal} from "toll-ui-react";
import { FormService } from '../../shared/FormBuilder/form-service'
import {Builder} from "../../shared/FormBuilder/builder";
import {BaseService} from "../../shared/base.service";

export default function ModulesSetup() {
    const context = useContext(AuthContext);
    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false };
    const [auth, setAuth] = useState<ContextInterface>(getDefault);
    const [loading, setLoading] = useState<boolean>(false);
    const [editState, setEditState] = useState<boolean>(false);
    const [allChecked, setAllChecked] = useState<boolean>(false);
    const messageDialog: MessageProps = {
        open: false,
        message: '',
        type: "success"
    }
    const [openDialog, setOpenDialog] = useState(messageDialog);
    const defaultModuleForm: FormObject [] = [
        {
            id:'name',
            type: "text",
            props: {
                required: true,
                label: 'Name',
                value: ''
            } as FormInput
        },
        {
            id:'path',
            type: "text",
            props: {
                required: false,
                label: 'Path',
                value: ''
            } as FormInput
        },
        {
            id:'icon',
            type: "text",
            props: {
                required: true,
                label: 'Icon',
                value: ''
            } as FormInput
        },
        {
            id:'order',
            type: "text",
            props: {
                required: true,
                label: 'Order',
                type: 'number',
                value: 0
            } as FormInput
        }
    ];
    const defaultMenuForm: FormObject [] = [
        {
            id:'name',
            type: "text",
            props: {
                required: true,
                label: 'Name',
                value: ''
            } as FormInput
        },
        {
            id:'path',
            type: "text",
            props: {
                required: true,
                label: 'Path',
                value: ''
            } as FormInput
        },
        {
            id:'order',
            type: "text",
            props: {
                required: true,
                label: 'Order',
                type: 'number',
                value: 0
            } as FormInput
        }
    ];
    const [moduleForm, setModuleForm] = useState<FormObject[]>(defaultModuleForm);
    const [selectedMenu, setSelectedMenu] = useState<any[]>([]);
    const [menuForm, setMenuForm] = useState<FormObject[]>(defaultMenuForm);
    const [moduleId, setModuleId] = useState<string>('');
    const [modules, setModules] = useState<any[]>([]);
    const [formId, setFormId] = useState<string>('');
    const [enabledCount, setEnabledCount] = useState<number>(0);
    const [openModuleModal, setOpenModuleModal] = useState<boolean>(false);
    const [openMenuModal, setOpenMenuModal] = useState<boolean>(false);
    const [openMenuModalForm, setOpenMenuModalForm] = useState<boolean>(false);

    const openModuleModalHandler = () => {
        setOpenModuleModal(true);
    }

    const closeModuleModalHandler = () => {
        setModuleForm([...FormService.clearDefaultForm(defaultModuleForm)]);
        setEditState(false);
        setOpenModuleModal(false);
    }

    const openMenuModalHandler = (data: any) => {
        setModuleId(data.id);
        setSelectedMenu([...data.children]);
        setOpenMenuModal(true);
    }

    const openMenuModalFormHandler = () => {
        setOpenMenuModalForm(true);
    }

    const closeMenuModalFormHandler = () => {
        setMenuForm([...FormService.clearDefaultForm(defaultMenuForm)]);
        setEditState(false);
        setOpenMenuModalForm(false);
    }

    const closeMenuModalHandler = () => {
        setOpenMenuModal(false);
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

    const getModulesWithMenu = () => {
        setLoading(true);
        HttpProvider.get<ApiResponse<any>>('General/GetModuleWithMenus', {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: result => {
                    if (moduleId) {
                        setSelectedMenu([...result.data.find((u: any) => u.id === moduleId)?.children])
                    }
                    setModules([...result.data]);
                },
                error: (err: ErrorEvent) => {
                    console.log('error', err)
                }
            })
    }

    const refreshStatus = () => {
        const checked = modules.every(value => value.enabled === true);
        setAllChecked(checked);
    }

    const selectModules = (value: boolean) => {
        modules.forEach(data => data.enabled = value);
        setModules([...modules]);
    }

    const editModuleForm = (data: any) => {
        setEditState(true);
        moduleForm.forEach((item) => {
            (item.props as FormInput).value = data[item.id];
        });
        setModuleForm([...moduleForm]);
        setFormId(data.id);
        setOpenModuleModal(true);
    }

    const editMenuForm = (data: any) => {
        setEditState(true);
        menuForm.forEach((item) => {
            (item.props as FormInput).value = data[item.id];
        });
        setMenuForm([...menuForm]);
        setFormId(data.id);
        setOpenMenuModalForm(true);
    }

    const saveModuleHandler = (data: any) => {
        setLoading(true);
        HttpProvider.post<ApiResponse<any>>('General/AddModule', JSON.stringify(data), {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            })
            .pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: (result) => {
                    if (result.status === 100) {
                        getModulesWithMenu();
                        closeModuleModalHandler();
                        openMessageHandler({type: "success", message: result.message, open: true});
                    } else {
                        openMessageHandler({type: "error", message: result.message, open: true});
                    }
                }
            })
    }

    const updateModuleHandler = (data: any) => {
        if (!data["id"]) {
            data["id"] = formId;
        }
        setLoading(true);
        HttpProvider.put<ApiResponse<any>>('General/EditModule', JSON.stringify(data), {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        })
            .pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: (result) => {
                    if (result.status === 100) {
                        getModulesWithMenu();
                        closeModuleModalHandler();
                        openMessageHandler({type: "success", message: result.message, open: true});
                    } else {
                        openMessageHandler({type: "error", message: result.message, open: true});
                    }
                }
            })
    }

    const saveMenuHandler = (data: any) => {
        setLoading(true);
        data.moduleId = moduleId;
        HttpProvider.post<ApiResponse<any>>('General/AddMenu', JSON.stringify(data), BaseService.HttpHeaders())
            .pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: (result) => {
                    if (result.status === 100) {
                        getModulesWithMenu();
                        closeMenuModalFormHandler();
                        openMessageHandler({type: "success", message: result.message, open: true});
                    } else {
                        openMessageHandler({type: "error", message: result.message, open: true});
                    }
                }
            })
    }

    const updateMenuHandler = (data: any) => {
        if (!data["id"]) {
            data["id"] = formId;
        }
        setLoading(true);
        HttpProvider.put<ApiResponse<any>>('General/EditMenu', JSON.stringify(data), {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        })
            .pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: (result) => {
                    if (result.status === 100) {
                        getModulesWithMenu();
                        closeMenuModalFormHandler();
                        openMessageHandler({type: "success", message: result.message, open: true});
                    } else {
                        openMessageHandler({type: "error", message: result.message, open: true});
                    }
                }
            })
    }

    const saveModule = (data: any) => {
        if (editState) {
            updateModuleHandler(data);
        } else {
            saveModuleHandler(data);
        }
    }

    const saveMenu = (data: any) => {
        if (editState) {
            updateMenuHandler(data);
        } else {
            saveMenuHandler(data);
        }
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
            getModulesWithMenu();
        }
    }, [auth]);

    useEffect(() => {
        setEnabledCount(modules.filter(x => x.enabled).length);
        refreshStatus();
    }, [modules])
    return (
        <>
            {
                openDialog.open &&
                <PiMessage onClose={closeMessageHandler} message={openDialog.message} type={openDialog.type}/>
            }
            {
                openModuleModal &&
                <PiModal fullScreen={false} onClose={closeModuleModalHandler}>
                    <div className={'h-full w-full flex flex-col'}>
                        <div className={'h-auto w-full flex justify-end items-center'}>
                            <i onClick={closeModuleModalHandler} className={'pi pi-times cursor-pointer'}></i>
                        </div>
                        <div className={'grow w-full h-full'}>
                            <Builder form={[...moduleForm]} loading={loading} title={'Module Form'} onFormSubmit={saveModule}/>
                        </div>
                    </div>
                </PiModal>
            }
            {
                openMenuModalForm &&
                <PiModal fullScreen={false} onClose={closeMenuModalFormHandler}>
                    <div className={'h-full w-full flex flex-col'}>
                        <div className={'h-auto w-full flex justify-end items-center'}>
                            <i onClick={closeMenuModalFormHandler} className={'pi pi-times cursor-pointer'}></i>
                        </div>
                        <div className={'grow w-full h-full'}>
                            <Builder form={[...menuForm]} loading={loading} title={'Menu Form'} onFormSubmit={saveMenu}/>
                        </div>
                    </div>
                </PiModal>
            }
            {
                openMenuModal &&
                <PiModal fullScreen={true} onClose={closeMenuModalHandler}>
                    <div className={'h-full w-full flex flex-col'}>
                        <div className={'h-auto w-full flex justify-between items-center p-2'}>
                            <PiButton onClick={openMenuModalFormHandler} type={'primary'} size={'small'} rounded={'rounded'}>
                                <i className={'pi pi-plus'}></i> <span className={'ml-2'}>Add Menu</span>
                            </PiButton>
                            <i onClick={closeMenuModalHandler} className={'pi pi-times cursor-pointer'}></i>
                        </div>
                        <div className={'grow w-full h-full'}>
                            <table className={'border-collapse w-full text-sm'}>
                                <thead>
                                <tr className="noWrap">
                                    <th className={'border border-slate-600'}>ORDER</th>
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
                                    selectedMenu.length > 0 && !loading &&
                                    <>
                                        {
                                            selectedMenu.map((menu) =>
                                                <tr key={menu.id}>
                                                    <td className={'border-slate-700 border p-1'}>{menu.order}</td>
                                                    <td className={'border-slate-700 border p-1'}>
                                                        {menu.title}
                                                    </td>
                                                    <td className={'border-slate-700 border p-1'}>
                                                        <div className={'flex space-x-2'}>
                                                            <PiButton rounded={'rounded'} size={'extra small'} type={'success'} onClick={() => editMenuForm(menu)}>EDIT</PiButton>
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
                </PiModal>
            }
            <div className={'flex flex-col w-full h-full space-y-4 p-2'}>
                <div className={'h-auto w-full flex justify-between'}>
                    <PiButton onClick={openModuleModalHandler} type={'primary'} size={'small'} rounded={'rounded'}>
                        <i className={'pi pi-plus'}></i> <span className={'ml-2'}>Add Module</span>
                    </PiButton>
                </div>
                <div className={'grow w-full h-full overflow-auto'}>
                    <table className={'border-collapse w-full text-sm'}>
                        <thead>
                        <tr className="noWrap">
                            <th className={'border border-slate-600'}>
                                <div className={'p-2'}>
                                    <PiCheckbox onChange={(event) => selectModules(event.target.checked)} value={allChecked} position={"right"} label={`${enabledCount} enabled modules`} />
                                </div>
                            </th>
                            <th className={'border border-slate-600'}>ORDER</th>
                            <th className={'border border-slate-600'}>ICON</th>

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
                            modules.length > 0 && !loading &&
                            <>
                                {
                                    modules.map((module) =>
                                        <tr key={module.id}>
                                            <td className={'border-slate-700 border'}>
                                                <div className={'p-2'}>
                                                    <PiCheckbox onChange={(event) => {
                                                        modules.find(u => u === module).enabled = event.target.checked;
                                                        setModules([...modules])
                                                    }} value={module.enabled} />
                                                </div>
                                            </td>
                                            <td className={'border-slate-700 border p-1'}>{module.order}</td>
                                            <td className={'border-slate-700 border p-1'}>
                                                <i className={module.icon}></i>
                                            </td>
                                            <td className={'border-slate-700 border p-1'}>
                                                {module.title}
                                            </td>
                                            <td className={'border-slate-700 border p-1'}>
                                                <div className={'flex space-x-2'}>
                                                    <PiButton rounded={'rounded'} size={'extra small'} type={'success'} onClick={() => editModuleForm(module)}>EDIT</PiButton>
                                                    <PiButton rounded={'rounded'} size={'extra small'} type={'primary'} onClick={() => openMenuModalHandler(module)}> MENU</PiButton>
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

