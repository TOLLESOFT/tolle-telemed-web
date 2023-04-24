import {PiAvatar, PiButton, PiMessage, PiModal} from "toll-ui-react";
import {environment} from "../../../shared/environment";
import {AuthContext} from "../../../store/auth-provider";
import React, {useContext, useEffect, useState} from "react";
import {ContextInterface} from "../../../shared/models/context-interface";
import {Country} from "../../../shared/models/country";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {FormBuilder} from "../../../shared/FormBuilder/form-builder";
import {FormItem} from "../../../shared/FormBuilder/form-item";
import {ApiResponse} from "../../../shared/models/ApiResponse";
import {Paging} from "../../../shared/models/paging";
import {Filter} from "../../../shared/models/filter";
import {PagedResponse} from "../../../shared/models/PagedResponse";
import {RegionSetup} from "./region-setup";
import {HttpProvider} from "../../../store/http-provider";

export default function CountrySetup() {
    const url = environment.apiUrl;
    const context = useContext(AuthContext);

    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false }

    const [auth, setAuth] = useState<ContextInterface>(getDefault);

    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openRegionModal, setOpenRegionModal] = useState<boolean>(false);

    const [countries, setCountries] = useState<Country[]>([]);

    const [editState, setEditState] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);

    const [paging, setPaging] = useState<Paging>({ pageSize: 10, pageNumber: 1, totalPages: 0, totalRecords: 0, currentSize: 0 });

    const [filter, setFilter] = useState<Filter>({});

    const [selectedCountry, setSelectedCountry] = useState<any>(null);

    const defaultForm: FormItem[] = [
        {
            id: 'name',
            type: "text",
            required: true,
            label: 'Name',
            value: ''
        },
        {
            id: 'nationality',
            type: "text",
            label: 'Nationality',
            required: true,
            value: ''
        },
        {
            id: 'code',
            type: "text",
            label: 'Code',
            required: true,
            value: ''
        },
        {
            id: 'mainLanguage',
            type: "text",
            label: 'Main Language',
            required: true,
            value: ''
        },
        {
            id: 'currencyName',
            type: "text",
            label: 'Currency Name',
            required: true,
            value: ''
        },
        {
            id: 'currencySymbol',
            type: "text",
            label: 'Currency Symbol',
            required: true,
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
    const editCountry = (data: any) => {
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
        fetch(`${url}General/AddCountry`, {
            method: 'POST',
            body: JSON.stringify(form),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<any>) => {
                if (result.status === 200) {
                    getCountriesHandler();
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
        fetch(`${url}General/EditCountry`, {
            method: 'PUT',
            body: JSON.stringify(form),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<any>) => {
                if (result.status === 200) {
                    getCountriesHandler();
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
    const getCountriesHandler = () => {
        setLoading(true);
        fetch(`${url}General/Country?pageSize=${paging.pageSize}&pageNumber=${paging.pageNumber}`, {
            // body: JSON.stringify(filter),
            // method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: PagedResponse<Array<Country>>) => {
                const data: Array<Country> = [];
                result.data.forEach((rate) => {
                    data.push(rate);
                });
                console.log(result);
                setCountries(data);
                setPaging(prevState => {
                    return { ...prevState, pageSize: result.pageSize, totalPages: result.totalPages, totalRecords: result.totalRecords, currentSize: result.data.length}
                });
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
            HttpProvider.apiUrl = environment.apiUrl;
            getCountriesHandler();
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
                    <h1>New Country</h1>
                    <FormBuilder loading={loading} form={forms} onFormSubmit={submitHandler}/>
                </PiModal>
            }
            {
                openRegionModal &&
                <PiModal fullScreen={true} onClose={() => {
                    setOpenRegionModal(false)
                }}>
                    <div className={'h-auto w-full flex justify-end items-center'}>
                        <i onClick={() => {
                            setOpenRegionModal(false)
                        }} className={'pi pi-times cursor-pointer'}></i>
                    </div>
                    <RegionSetup auth={auth} country={selectedCountry}/>
                </PiModal>
            }
            <div className={'flex flex-col w-full h-full space-y-4'}>
                <div className={'h-auto w-full flex'}>
                    <PiButton onClick={openModalHandler} type={'primary'} size={'small'} rounded={'rounded'}>
                        <i className={'pi pi-plus'}></i> <span className={'ml-2'}>Add Country</span>
                    </PiButton>
                </div>
                <div className={'grow w-full h-full overflow-auto'}>
                    <table className={'border-collapse w-full text-sm'}>
                        <thead>
                        <tr className="noWrap">
                            <th className={'border border-slate-600'}>NAME</th>
                            <th className={'border border-slate-600'}>NATIONALITY</th>
                            <th className={'border border-slate-600'}>LANGUAGE</th>
                            <th className={'border border-slate-600'}>CURRENCY</th>
                            <th className={'border border-slate-600'}>CURRENCY SYMBOL</th>
                            <th className={'border border-slate-600'}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            loading &&
                            <tr>
                                <td colSpan={5}>
                                    <div className={'flex justify-center w-full'}>
                                        <h1>loading ...</h1>
                                    </div>
                                </td>
                            </tr>
                        }
                        {
                            countries.length > 0 && !loading &&
                            <>
                                {
                                    countries.map((country) =>
                                        <tr key={country.id}>
                                            <td className={'border-slate-700 border p-1'}> {country.name}</td>
                                            <td className={'border-slate-700 border p-1'}> {country.nationality}</td>
                                            <td className={'border-slate-700 border p-1'}> {country.mainLanguage}</td>
                                            <td className={'border-slate-700 border p-1'}> {country.currencyName}</td>
                                            <td className={'border-slate-700 border p-1'}> {country.currencySymbol}</td>
                                            <td className={'border-slate-700 border p-1'}>
                                                <div className={'flex space-x-2'}>
                                                    <PiButton onClick={() => editCountry(country)} type={'primary'} size={'small'} rounded={'rounded'}>
                                                        Edit Country
                                                    </PiButton>
                                                    <PiButton onClick={() => {
                                                        setSelectedCountry(country);
                                                        setOpenRegionModal(true);
                                                    }} type={'primary'} size={'small'} rounded={'rounded'}>
                                                        Regions
                                                    </PiButton>
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
