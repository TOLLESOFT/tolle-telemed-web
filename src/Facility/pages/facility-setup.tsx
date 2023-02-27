import {environment} from "../../shared/environment";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../store/auth-provider";
import {ContextInterface} from "../../shared/models/context-interface";
import {Facility} from "../../shared/models/Facility";
import {Paging} from "../../shared/models/paging";
import {Filter} from "../../shared/models/filter";
import {FormItem} from "../../shared/FormBuilder/form-item";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {PagedResponse} from "../../shared/models/PagedResponse";
import {Country} from "../../shared/models/country";
import {PiButton, PiMessage, PiModal} from "toll-ui-react";
import {FormBuilder} from "../../shared/FormBuilder/form-builder";
import {ApiResponse} from "../../shared/models/ApiResponse";
import {MapLatLng} from "../../shared/components/map-lat-lng";
import {PiPagination} from "../../shared/components/pi-pagination";

export default function FacilitySetup() {
    const url = environment.apiUrl;
    const context = useContext(AuthContext);
    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false };
    const [auth, setAuth] = useState<ContextInterface>(getDefault);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [openMapModal, setOpenMapModal] = useState<boolean>(false);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [editState, setEditState] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [paging, setPaging] = useState<Paging>({ pageSize: 10, pageNumber: 1, totalPages: 0, totalRecords: 0, currentSize: 0 });
    const [filter, setFilter] = useState<Filter>({});
    const defaultForm: FormItem[] = [
        {
            id: 'name',
            type: "text",
            required: true,
            label: 'Name',
            value: ''
        },
        {
            id: 'address',
            type: "textarea",
            label: 'Address',
            required: true,
            value: ''
        },
        {
            id: 'contact',
            type: "text",
            label: 'Contact',
            required: true,
            value: ''
        },
        {
            id: 'countryId',
            type: "list",
            label: 'Country',
            required: true,
            value: '',
            list: countries
        },
    ];
    const [forms, setForm] = useState<FormItem[]>(defaultForm);
    const [formId, setFormId] = useState<string>('');
    const messageDialog: MessageProps = {
        open: false,
        message: '',
        type: "success"
    }
    const [openDialog, setOpenDialog] = useState(messageDialog);
    const [facility, setFacility] = useState<Facility>({ longitude: '', latitude: '', name: '', address: '', contact: ''});

    const openModalHandler = () => {
        setOpenModal(true);
    }

    const closeModalHandler = () => {
        clearDefaultForm();
        setEditState(false);
        setOpenModal(false);
    }

    const closeMapModalHandler = () => {
        clearDefaultForm();
        setEditState(false);
        setOpenMapModal(false);
    }

    const getCountriesHandler = () => {
        setLoading(true);
        fetch(`${url}General/AllCountry`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<Array<Country>>) => {
                setCountries([...result.data]);
            }).finally(() => {
                setLoading(false);
            });

        }).catch((reason) => {

        });
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

    const editFormFacility = (data: any) => {
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

    const editFacility = (data: Facility) => {
        setEditState(true);
        setFacility(data);
        setOpenMapModal(true);
    }

    const clearDefaultForm = () => {
        setFormId('');
        defaultForm.forEach((item) => {
            item.value = ''
        });
        setForm([...defaultForm]);
    }

    const updateLatLng = (coords: {lat: any, lng:any}) => {
        setFacility(prevState => {
            return {...prevState, latitude: String(coords.lat), longitude: String(coords.lng)}
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
        fetch(`${url}Facility/Post`, {
            method: 'POST',
            body: JSON.stringify(form),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<any>) => {
                if (result.status === 100) {
                    getFacilitiesHandler();
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
        if (!form["id"]) {
            form["id"] = formId;
        }
        setLoading(true);
        fetch(`${url}Facility/Put`, {
            method: 'PUT',
            body: JSON.stringify(form),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<any>) => {
                if (result.status === 100) {
                    getFacilitiesHandler();
                    closeModalHandler();
                    closeMapModalHandler();
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
    const getFacilitiesHandler = () => {
        setLoading(true);
        fetch(`${url}Facility/GetAll?pageSize=${paging.pageSize}&pageNumber=${paging.pageNumber}`, {
            body: JSON.stringify(filter),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: PagedResponse<Array<Facility>>) => {
                const data: Array<Facility> = [];
                result.data.forEach((rate) => {
                    data.push(rate);
                });
                console.log(result);
                setFacilities(data);
                setPaging(prevState => {
                    return { ...prevState, pageSize: result.pageSize, totalPages: result.totalPages, totalRecords: result.totalRecords, currentSize: result.data.length}
                });
            }).finally(() => {
                setLoading(false);
            });

        }).catch((reason) => {

        });
    }

    useEffect(() => {
        setAuth((prevState) => {
            return {...prevState, user: context.user, accessToken: context.accessToken }
        });
    }, [context]);

    // update auth value
    useEffect(() => {
        if (auth.accessToken?.token) {
            getCountriesHandler();
        }
    }, [auth]);

    useEffect(() => {
        if (auth.accessToken?.token) {
            getFacilitiesHandler();
        }
    }, [paging.pageSize, auth])

    useEffect(() => {
        if (auth.accessToken?.token) {
            getFacilitiesHandler();
        }
    }, [paging.pageNumber, auth])

    useEffect(() => {
        console.log('countries', countries);
        if (countries.length > 0) {
           const newForm = defaultForm.find(u => u.id === 'countryId');
           if(newForm) {
               newForm.list = countries;
               setForm([...defaultForm]);
           }
        }
    }, [countries]);

    return (
        <>
            {
                openDialog.open &&
                <PiMessage onClose={closeMessageHandler} message={openDialog.message} type={openDialog.type}/>
            }
            {
                openModal &&
                <PiModal fullScreen={false} onClose={closeModalHandler}>
                    <FormBuilder title={'Facility Form'} loading={loading} form={forms} onFormSubmit={submitHandler}/>
                </PiModal>
            }
            {
                openMapModal &&
                <PiModal fullScreen={false} onClose={closeMapModalHandler}>
                    <span className={'block'}>Get facility location map</span>
                    <div className={'w-full h-[400px] relative z-[9]'}>
                        <MapLatLng lng={facility.longitude} lat={facility.latitude} onMapMove={updateLatLng}/>
                    </div>
                    <PiButton loading={loading} onClick={() => editHandler(facility)} type={'primary'} size={'small'} rounded={'rounded'}>
                        Submit location
                    </PiButton>
                </PiModal>
            }
            <div className={'flex flex-col w-full h-full space-y-4 p-2'}>
                <div className={'h-auto w-full flex justify-between'}>
                    <PiButton onClick={openModalHandler} type={'primary'} size={'small'} rounded={'rounded'}>
                        <i className={'pi pi-plus'}></i> <span className={'ml-2'}>Add Country</span>
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
                            <th className={'border border-slate-600'}>COUNTRY</th>
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
                            facilities.length > 0 && !loading &&
                            <>
                                {
                                    facilities.map((facility) =>
                                        <tr key={facility.id}>
                                            <td className={'border-slate-700 border p-1'}>{facility.name}</td>
                                            <td className={'border-slate-700 border p-1'}>
                                                {facility.country.name}
                                            </td>
                                            <td className={'border-slate-700 border p-1'}>
                                                <div className={'flex space-x-2'}>
                                                    <PiButton rounded={'rounded'} size={'extra small'} type={'success'} onClick={() => {editFormFacility(facility)}}>EDIT</PiButton>
                                                    <PiButton rounded={'rounded'} size={'extra small'} type={'primary'} onClick={() => {editFacility(facility)}}>MAP</PiButton>
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
