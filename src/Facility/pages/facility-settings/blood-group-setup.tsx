import {environment} from "../../../shared/environment";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../../store/auth-provider";
import {ContextInterface} from "../../../shared/models/context-interface";
import {Paging} from "../../../shared/models/paging";
import {Filter} from "../../../shared/models/filter";
import {FormItem} from "../../../shared/FormBuilder/form-item";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {ApiResponse} from "../../../shared/models/ApiResponse";
import {PagedResponse} from "../../../shared/models/PagedResponse";
import {PiButton, PiMessage, PiModal, PiSkeleton, PiSkeletonWrapper} from "toll-ui-react";
import {FormBuilder} from "../../../shared/FormBuilder/form-builder";
import {BloodGroup} from "../../../shared/models/blood-group";

export default function BloodGroupSetup() {
    const url = environment.apiUrl;
    const context = useContext(AuthContext);

    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false }

    const [auth, setAuth] = useState<ContextInterface>(getDefault);

    const [openModal, setOpenModal] = useState<boolean>(false);

    const [all, setAll] = useState<BloodGroup[]>([]);

    const [editState, setEditState] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);

    const [paging, setPaging] = useState<Paging>({ pageSize: 10, pageNumber: 1, totalPages: 0, totalRecords: 0, currentSize: 0 });

    const [filter, setFilter] = useState<Filter>({});

    const defaultForm: FormItem[] = [
        {
            id: 'group',
            type: "text",
            required: true,
            label: 'Name of blood group',
            value: ''
        }
    ];

    const [forms, setForm] = useState<FormItem[]>(defaultForm);

    const [formId, setFormId] = useState<string>('');

    const messageDialog: MessageProps = {
        open: false,
        message: '',
        type: "success"
    }

    const [openDialog, setOpenDialog] = useState(messageDialog);
    const openModalHandler = () => {
        setOpenModal(true);
    }

    const closeModalHandler = () => {
        setEditState(false);
        setOpenModal(false);
        clearDefaultForm();
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
    const editForm = (data: any) => {
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

    const submitHandler = (form: any) => {
        if (editState) {
            editHandler(form);
        } else {
            saveHandler(form);
        }
    }

    const saveHandler = (form: any) => {
        setLoading(true);
        fetch(`${url}General/AddBloodGroup`, {
            method: 'POST',
            body: JSON.stringify(form),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<any>) => {
                if (result.status === 200) {
                    getAllHandler();
                    closeModalHandler();
                    openMessageHandler({type: "success", message: result.message, open: true});
                } else {
                    openMessageHandler({type: "error", message: result.message, open: true});
                }
            }).finally(() => {
                setLoading(false);
            });

        }).catch((reason) => {
            openMessageHandler({type: "error", message: 'something went wrong please try again', open: true});
        });
    }
    const editHandler = (form: any) => {
        form["id"] = formId;
        setLoading(true);
        fetch(`${url}General/EditBloodGroup`, {
            method: 'PUT',
            body: JSON.stringify(form),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<any>) => {
                if (result.status === 200) {
                    getAllHandler();
                    closeModalHandler();
                    openMessageHandler({type: "success", message: result.message, open: true});
                } else {
                    openMessageHandler({type: "error", message: result.message, open: true});
                }
            }).finally(() => {
                setLoading(false);
            });

        }).catch((reason) => {
            openMessageHandler({type: "error", message: 'something went wrong please try again', open: true});
        });
    }
    const getAllHandler = () => {
        setLoading(true);
        fetch(`${url}General/BloodGroup`, {
            // body: JSON.stringify(filter),
            // method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: Array<any>) => {
                // const data: Array<BloodGroup> = [];
                // result.data.forEach((rate) => {
                //     data.push(rate);
                // });
                // console.log(result);
                setAll(result);
            }).finally(() => {
                setLoading(false);
            });

        }).catch((reason) => {

        });
    }

    // check token
    useEffect(() => {
        setAuth((prevState) => {
            return {...prevState, user: context.user, accessToken: context.accessToken }
        });

        console.log(context);
    }, [context]);

    // update auth value
    useEffect(() => {
        if (auth.accessToken?.token) {
            getAllHandler();
        }
    }, [auth]);

    return (
        <>
            {
                openDialog.open && <PiMessage onClose={closeMessageHandler} message={openDialog.message} type={openDialog.type}/>
            }
            {
                openModal &&
                <PiModal fullScreen={false} onClose={closeModalHandler}>
                    <h1>New Blood Group</h1>
                    <FormBuilder loading={loading} form={forms} onFormSubmit={submitHandler}/>
                </PiModal>
            }
            <div className={'flex flex-col w-full h-full space-y-4'}>
                <div className={'h-auto w-full flex'}>
                    <PiButton onClick={openModalHandler} type={'primary'} size={'small'} rounded={'rounded'}>
                        <i className={'pi pi-plus'}></i> <span className={'ml-2'}>Add Blood Group</span>
                    </PiButton>
                </div>
                <div className={'grow w-full h-full overflow-auto'}>
                    <table className={'border-collapse w-full text-sm'}>
                        <thead>
                        <tr className="noWrap">
                            <th className={'border border-slate-600'}>GROUP</th>
                            <th className={'border border-slate-600'}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            loading &&
                            <tr>
                                <td colSpan={2}>
                                    <div className={'flex justify-center w-full'}>
                                        <h1>loading ...</h1>
                                    </div>
                                </td>
                            </tr>
                        }
                        {
                            all.length > 0 && !loading &&
                            <>
                                {
                                    all.map((group) =>
                                        <tr key={group.id}>
                                            <td className={'border-slate-700 border p-1'}> {group.group}</td>
                                            <td className={'border-slate-700 border p-1'}>
                                                <PiButton rounded={'rounded'} size={'extra small'} type={'success'} onClick={() => {editForm(group)}}>EDIT</PiButton>
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
