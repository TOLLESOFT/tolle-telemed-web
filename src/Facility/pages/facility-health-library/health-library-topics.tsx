import {environment} from "../../../shared/environment";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../../store/auth-provider";
import {ContextInterface} from "../../../shared/models/context-interface";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {Topics} from "../../../shared/models/topics";
import {ApiResponse} from "../../../shared/models/ApiResponse";
import {PiAvatar, PiButton, PiMessage, PiModal} from "toll-ui-react";
import {FormItem} from "../../../shared/FormBuilder/form-item";
import {FormBuilder} from "../../../shared/FormBuilder/form-builder";

export default function HealthLibraryTopics() {
    const url = environment.apiUrl;
    const context = useContext(AuthContext);
    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false };
    const [auth, setAuth] = useState<ContextInterface>(getDefault);
    const [topics, setTopics] = useState<Array<Topics>>([]);
    const [editState, setEditState] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const messageDialog: MessageProps = {
        open: false,
        message: '',
        type: "success"
    }
    const [openDialog, setOpenDialog] = useState(messageDialog);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const defaultForm: FormItem[] = [
        {
            id: 'image',
            type: "image",
            label: 'Image',
            required: true,
            value: '',
            imagePickerType: 'single'
        },
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
    const editTopic = (data: any) => {
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
        fetch(`${url}Blog/GetBlogSpaces`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<Array<any>>) => {
                setTopics(result.data);

            }).finally(() => {
                setLoading(false);
            });

        }).catch((reason) => {

        });
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
        fetch(`${url}Blog/AddBlogSpaces`, {
            method: 'POST',
            body: JSON.stringify(form),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<any>) => {
                if (result.status === 100) {
                    getDataHandler();
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
        fetch(`${url}Blog/PutBlogSpaces`, {
            method: 'PUT',
            body: JSON.stringify(form),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<any>) => {
                if (result.status === 100) {
                    getDataHandler();
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

    useEffect(() => {
        setAuth((prevState) => {
            return {...prevState, user: context.user, accessToken: context.accessToken }
        });
    }, [context]);

    useEffect(() => {
        if (auth.accessToken?.token) {
            getDataHandler();
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
                    <h1>New Specialty</h1>
                    <FormBuilder loading={loading} form={forms} onFormSubmit={submitHandler}/>
                </PiModal>
            }
            <div className={'flex flex-col w-full h-full space-y-4 p-2'}>
                <div className={'h-auto w-full flex justify-between items-center'}>
                    <PiButton onClick={openModalHandler} type={'primary'} size={'small'} rounded={'rounded'}>
                        <i className={'pi pi-plus'}></i> <span className={'ml-2'}>New Topic</span>
                    </PiButton>
                </div>
                <div className={'grow w-full h-full overflow-auto'}>
                    <table className={'border-collapse w-full text-sm'}>
                        <thead>
                        <tr className="noWrap">
                            <th className={'border border-slate-600'}></th>
                            <th className={'border border-slate-600'}>TOPIC</th>
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
                            topics.length > 0 && !loading &&
                            <>
                                {
                                    topics.map((topic) =>
                                        <tr key={topic.id}>
                                            <td className={'border-slate-700 border p-1'}>
                                                <PiAvatar image={topic.image}/>
                                            </td>
                                            <td className={'border-slate-700 border p-1'}>{topic.name}</td>
                                            <td className={'border-slate-700 border p-1'}>
                                                <PiButton rounded={'rounded'} size={'extra small'} type={'success'} onClick={() => editTopic(topic)}>EDIT</PiButton>
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
