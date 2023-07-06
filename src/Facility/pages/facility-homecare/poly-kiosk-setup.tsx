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
import {FormTextArea} from "../../../shared/FormBuilder/form-text-area";
import {FormSelect} from "../../../shared/FormBuilder/form-select";
import {FormImage} from "../../../shared/FormBuilder/form-image";
import {FormDate} from "../../../shared/FormBuilder/form-date";
import {FormCheckBox} from "../../../shared/FormBuilder/form-check-box";
import {PiButton, PiLoading, PiMessage, PiModal, PiSelectList} from "toll-ui-react";
import {Builder} from "../../../shared/FormBuilder/builder";
import {PiPagination} from "../../../shared/components/pi-pagination";

export default function PolyKioskSetup(){
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
    const [editState, setEditState] = useState<boolean>(false);
    const [regions, setRegions] = useState<any[]>([]);
    const [countries, setCountries] = useState<any[]>([]);
    const [country, setCountry] = useState<string>('');
    const [communities, setCommunities] = useState<any[]>([]);
    const [formId, setFormId] = useState<string>('');
    const [paging, setPaging] = useState<Paging>({ pageSize: 10, pageNumber: 1, totalPages: 0, totalRecords: 0, currentSize: 0 });
    const regionForm: FormObject[] = [
        {
            id: 'regionId',
            type: "select",
            props: {
                required: true,
                label: 'Region',
                data: regions,
                value: ''
            }
        },
        {
            id: 'name',
            type: "text",
            props: {
                required: true,
                label: 'PolyKiosk',
                value: ''
            }
        }
    ]
    const [form, setForm] = useState<FormObject[]>(regionForm);
    const [selectedCommunity, setSelectedCommunity] = useState<any>();
    const getCountries = () => {
        setLoading(true);
        HttpProvider.get<ApiResponse<Array<any>>>(`General/AllCountry`, {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false)))
            .subscribe((result) => {
                setCountries([...result.data]);
            })
    }

    const getCommunities = () => {
        setLoading(true);
        HttpProvider.get<ApiResponse<Array<any>>>(`HomeCare/GetPolyKiosk`, {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false)))
            .subscribe((result) => {
                setCommunities([...result.data]);
            })
    }

    const getRegions = (countryId: any) => {
        setLoading(true);
        HttpProvider.get<ApiResponse<Array<any>>>(`General/AllRegions/${countryId}`, {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false)))
            .subscribe((result) => {
                setRegions([...result.data]);
            })
    }

    const clearDefaultForm = () => {
        setFormId('');
        regionForm.forEach((item) => {
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
            if(item.type === 'checkbox') {
                (item.props as FormCheckBox).value = false
            }
        });
        setForm([...regionForm]);
    }

    const openModalHandler = () => {
        setOpenModal(true);
    }

    const closeModalHandler = () => {
        clearDefaultForm();
        setEditState(false);
        setOpenModal(false);
    }

    const editCommunititesForm = (data: any) => {
        setEditState(true);
        setSelectedCommunity(data);
        setCountry(data.region.countryId);
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

    const submitHandler = (form: any) => {
        if (editState) {
            editHandler(form);
        } else {
            saveHandler(form);
        }
    }

    const saveHandler = (form: any) => {
        setLoading(true);
        HttpProvider.post<ApiResponse<any>>('HomeCare/PostPolyKiosk',
            JSON.stringify(form), {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }).pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: result => {
                    if (result.status === 100) {
                        getCommunities();
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
        HttpProvider.put<ApiResponse<any>>('HomeCare/PutPolyKiosk',
            JSON.stringify(form), {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }).pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: result => {
                    if (result.status === 100) {
                        getCommunities();
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
            getCountries();
            getCommunities();
        }
    }, [auth])

    useEffect(() => {
        if (regions.length > 0) {
            const myForm = form.find(u => u.id === 'regionId');
            if (myForm) {
                (myForm.props as FormSelect).data = regions;
                if(editState) {
                    form.forEach((item) => {
                        if (item.type === 'select') {
                            if (item.id === Object.values([item.id])[0]) {
                                (item.props as FormSelect).value = selectedCommunity[item.id];
                            }
                        }
                        if (item.type === 'text') {
                            if (item.id === Object.values([item.id])[0]) {
                                (item.props as FormInput).value = selectedCommunity[item.id];
                            }
                        }
                    });
                    setFormId(selectedCommunity.id);
                    setOpenModal(true);
                }
                setForm([...form]);
            }
        }
    }, [regions, selectedCommunity, editState])

    useEffect(() => {
        if(country) {
            getRegions(country);
        }
    }, [country])

    return (
        <>
            {
                openDialog.open &&
                <PiMessage onClose={closeMessageHandler} message={openDialog.message} type={openDialog.type}/>
            }
            {
                openModal &&
                <PiModal fullScreen={false} onClose={closeModalHandler}>
                    <div>
                        <PiSelectList
                            rounded={'rounded'}
                            label={'Countries'}
                            onValueChange={(e) => {
                                setCountry(e);
                            }}
                            data={countries}
                            value={country}
                            dataValue={'id'}
                            dataLabel={'name'}/>
                    </div>
                    <Builder loading={loading} form={form} onFormSubmit={submitHandler}/>
                </PiModal>
            }
            <div className={'flex flex-col w-full h-full space-y-4 p-2'}>
                <div className={'h-auto w-full flex justify-between'}>
                    <PiButton onClick={openModalHandler} type={'primary'} size={'small'} rounded={'rounded'}>
                        <i className={'pi pi-plus'}></i> <span className={'ml-2'}>Add Poly Kiosk</span>
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
                            communities.length > 0 && !loading &&
                            <>
                                {
                                    communities.map((community) =>
                                        <tr key={community.id}>
                                            <td className={'border-slate-700 border p-1'}>{community.name}</td>
                                            <td className={'border-slate-700 border p-1'}>
                                                <div className={'flex space-x-2'}>
                                                    <PiButton rounded={'rounded'} size={'extra small'} type={'success'} onClick={() => editCommunititesForm(community)}>EDIT</PiButton>
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
