import {environment} from "../../../shared/environment";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../../store/auth-provider";
import {ContextInterface} from "../../../shared/models/context-interface";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {FormItem} from "../../../shared/FormBuilder/form-item";
import {Paging} from "../../../shared/models/paging";
import {PagedResponse} from "../../../shared/models/PagedResponse";
import {Facility} from "../../../shared/models/Facility";
import {ApiResponse} from "../../../shared/models/ApiResponse";
import {PiAvatar, PiButton, PiMessage, PiModal} from "toll-ui-react";
import {FormBuilder} from "../../../shared/FormBuilder/form-builder";
import {PiPagination} from "../../../shared/components/pi-pagination";
import {User} from "../../../shared/models/User";
import {Country} from "../../../shared/models/country";
import {Specialty} from "../../../shared/models/specialty";
import {UserModel} from "../../../shared/models/UserModel";
import {Gender} from "../../../shared/models/Gender";
import {FormObject} from "../../../shared/FormBuilder/form-object";
import {FormSelect} from "../../../shared/FormBuilder/form-select";
import {FormDate} from "../../../shared/FormBuilder/form-date";
import {FormImage} from "../../../shared/FormBuilder/form-image";
import {FormInput} from "../../../shared/FormBuilder/form-input";
import {FormTextArea} from "../../../shared/FormBuilder/form-text-area";
import {Builder} from "../../../shared/FormBuilder/builder";
import {HttpProvider} from "../../../store/http-provider";
import {finalize} from "rxjs";

export  default function Users() {
    const url = environment.apiUrl;
    const context = useContext(AuthContext);
    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false };
    const [auth, setAuth] = useState<ContextInterface>(getDefault);
    const [users, setUsers] = useState<Array<UserModel>>([]);
    const [editState, setEditState] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const messageDialog: MessageProps = {
        open: false,
        message: '',
        type: "success"
    }
    const [openDialog, setOpenDialog] = useState(messageDialog);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [gender, setGenders] = useState<Gender[]>([]);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [workPlaces, setWorkPlaces] = useState<Facility[]>([]);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const defaultForm: FormObject[] = [
        {
            id: 'image',
            type: "image",
            props: {
                required: true,
                label: 'User Photo',
                value: ''
            }
        },
        {
            id: 'firstName',
            type: "text",
            props: {
                required: true,
                label: 'First Name',
                value: ''
            }
        },
        {
            id: 'lastName',
            type: "text",
            props: {
                required: true,
                label: 'Last Name',
                value: ''
            }
        },
        {
            id: 'surName',
            type: "text",
            props: {
                required: false,
                label: 'Middle Name',
                value: ''
            }
        },
        {
            id: 'genderId',
            type: "select",
            props: {
                required: true,
                label: 'Gender',
                value: '',
                data: gender
            }
        },
        {
            id: 'email',
            type: "text",
            props: {
                type: "email",
                required: true,
                label: 'Email',
                value: ''
            }
        },
        {
            id: 'address',
            type: "textarea",
            props: {
                required: false,
                label: 'Address',
                value: ''
            }
        },
        {
            id: 'dateOfBirth',
            type: "date",
            props: {
                required: true,
                label: 'Date Of Birth',
                value: ''
            }
        },
        {
            id: 'nationalityId',
            type: "select",
            props: {
                required: true,
                label: 'Nationality',
                value: '',
                data: countries,
                dataName: 'nationality',
                dataValue: 'id'
            }
        },
        {
            id: 'specialtyId',
            type: "select",
            props: {
                required: false,
                label: 'Specialty',
                value: '',
                data: specialties
            }
        },
        {
            id: 'workPlaceId',
            type: "select",
            props: {
                required: false,
                label: 'Work Place',
                value: '',
                data: workPlaces
            }
        },
        {
            id: 'facilityId',
            type: "select",
           props: {
               required: false,
               label: 'Facility',
               value: '',
               data: facilities
           }
        }
    ];
    const [forms, setForm] = useState<FormObject[]>(defaultForm);
    const [selectedUser, setSelectedUser] = useState<User>({});
    const [formId, setFormId] = useState<string>('');
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
        setSelectedUser({});
        setForm([...clearDefaultForm(defaultForm)]);
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
    const editUser = (data: any) => {
        setEditState(true);
        setSelectedUser(data);
        defaultForm.forEach((item) => {
            if (item.type === 'text') {
                if (item.id === Object.values([item.id])[0]) {
                    (item.props as FormInput).value = data[item.id].name;
                }
            }
            if (item.type === 'textarea') {
                if (item.id === Object.values([item.id])[0]) {
                    (item.props as FormTextArea).value = data[item.id];
                }
            }
            if (item.type === 'select') {
                if (item.id === Object.values([item.id])[0]) {
                    (item.props as FormSelect).value = data[item.id];
                }
            }
            if (item.type === 'image') {
                if (item.id === Object.values([item.id])[0]) {
                    (item.props as FormImage).image = data[item.id];
                }
            }
            if (item.type === 'time') {
                if (item.id === Object.values([item.id])[0]) {
                    (item.props as FormDate).date = new Date(data[item.id]);
                }
            }
        });
        setForm([...defaultForm]);
        setFormId(data["id"]);
        setOpenModal(true);
    }
    const clearDefaultForm = (form: FormObject[]): FormObject[] => {
        setFormId('');
        form.forEach((item) => {
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
            if (item.type === 'time') {
                (item.props as FormDate).date = new Date()
            }
        });

        return form;
    }
    const getDataHandler = () => {
        setLoading(true);
        fetch(`${url}User/GetAll?pageSize=${paging.pageSize}&pageNumber=${paging.pageNumber}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: PagedResponse<Array<UserModel>>) => {
                const data: Array<UserModel> = [];
                result.data.forEach((rate) => {
                    data.push(rate);
                });
                setUsers(data);
                setPaging(prevState => {
                    return { ...prevState, pageSize: result.pageSize, totalPages: result.totalPages, totalRecords: result.totalRecords, currentSize: result.data.length}
                });
            }).finally(() => {
                setLoading(false);
            });

        }).catch((reason) => {

        });
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
    const getGenderHandler = () => {
        setLoading(true);
        fetch(`${url}General/Gender`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: Array<Gender>) => {
                setGenders([...result]);
            }).finally(() => {
                setLoading(false);
            });

        }).catch((reason) => {

        });
    }
    const getSpecialtyHandler = () => {
        setLoading(true);
        fetch(`${url}General/AllSpecialty`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: Array<Specialty>) => {
                setSpecialties([...result]);
            }).finally(() => {
                setLoading(false);
            });

        }).catch((reason) => {

        });
    }
    const getFacilityHandler = () => {
        setLoading(true);
        HttpProvider.get<ApiResponse<Array<Facility>>>(`Facility/GetFacilities`, {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        })
            .pipe(finalize(() => setLoading(false)))
            .subscribe((result) => {
                setFacilities([...result.data]);
                setWorkPlaces([...result.data]);
            })
    }
    const submitHandler = (form: any) => {
        console.log(form);
        if (editState) {
            editHandler(form);
        } else {
            saveHandler(form);
        }
    }
    const saveHandler = (form: any) => {
        setLoading(true);
        HttpProvider.post<ApiResponse<any>>('User/Post',
            JSON.stringify(form), {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }).pipe(finalize(() => setLoading(false)))
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
    const editHandler = (form: User) => {
        form["id"] = formId;
        form.concurrencyStamp = selectedUser.concurrencyStamp;
        form.normalizedEmail = selectedUser.normalizedEmail;
        form.normalizedUserName = selectedUser.normalizedUserName;
        form.userName = selectedUser.userName;
        setLoading(true);

        HttpProvider.put<ApiResponse<any>>('User/Put',
            JSON.stringify(form), {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }).pipe(finalize(() => setLoading(false)))
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

    useEffect(() => {
        setAuth((prevState) => {
            return {...prevState, user: context.user, accessToken: context.accessToken }
        });
    }, [context]);

    useEffect(() => {
        if (auth.accessToken?.token) {
            HttpProvider.apiUrl = environment.apiUrl;
            getCountriesHandler()
            getGenderHandler()
            getSpecialtyHandler()
            getFacilityHandler()
        }
    }, [auth])

    useEffect(() => {
        if (auth.accessToken?.token) {
            getDataHandler();
        }
    }, [paging.pageSize, auth])

    useEffect(() => {
        if (auth.accessToken?.token) {
            getDataHandler();
        }
    }, [paging.pageNumber, auth])

    useEffect(() => {
        if (countries.length > 0) {
            const myForm = defaultForm.find(u => u.id === 'nationalityId');
            if (myForm) {
                (myForm.props as FormSelect).data = countries;
                setForm([...defaultForm]);
            }
        }
    }, [countries]);

    useEffect(() => {
        if (facilities.length > 0) {
            const myForm = defaultForm.find(u => u.id === 'facilityId');
            if (myForm) {
                (myForm.props as FormSelect).data = facilities;
                setForm([...defaultForm]);
            }
        }
    }, [facilities]);

    useEffect(() => {
        if (workPlaces.length > 0) {
            const myWork = defaultForm.find(u => u.id === 'workPlaceId');
            if (myWork) {
                (myWork.props as FormSelect).data = workPlaces;
                setForm([...defaultForm]);
            }
        }
    }, [workPlaces]);

    useEffect(() => {
        if (specialties.length > 0) {
            const myForm = defaultForm.find(u => u.id === 'specialtyId');
            if (myForm) {
                (myForm.props as FormSelect).data = specialties;
                setForm([...defaultForm]);
            }
        }
    }, [specialties]);

    useEffect(() => {
        if (gender.length > 0) {
            const myForm = defaultForm.find(u => u.id === 'genderId');
            if (myForm) {
                (myForm.props as FormSelect).data = gender;
                setForm([...defaultForm]);
            }
        }
    }, [gender]);

    return (
        <>
            {
                openDialog.open &&
                <PiMessage onClose={closeMessageHandler} message={openDialog.message} type={openDialog.type}/>
            }
            {
                openModal &&
                <PiModal fullScreen={false} onClose={closeModalHandler}>
                    <Builder title={'User'} loading={loading} form={forms} onFormSubmit={submitHandler}/>
                </PiModal>
            }
            <div className={'flex flex-col w-full h-full space-y-4 p-2'}>
                <div className={'h-auto w-full flex justify-between items-center'}>
                    <PiButton onClick={openModalHandler} type={'primary'} size={'small'} rounded={'rounded'}>
                        <i className={'pi pi-plus'}></i> <span className={'ml-2'}>New User</span>
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
                            <th className={'border border-slate-600'}></th>
                            <th className={'border border-slate-600'}>NAME</th>
                            <th className={'border border-slate-600'}>ROLE</th>
                            <th className={'border border-slate-600'}>EMAIL</th>
                            <th className={'border border-slate-600'}>GENDER</th>
                            <th className={'border border-slate-600'}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            loading &&
                            <tr>
                                <td colSpan={6}>
                                    <div className={'flex justify-center w-full'}>
                                        <h1>loading ...</h1>
                                    </div>
                                </td>
                            </tr>
                        }
                        {
                            users.length > 0 && !loading &&
                            <>
                                {
                                    users.map((user) =>
                                        <tr key={user.user.id}>
                                            <td className={'border-slate-700 border p-1'}>
                                                <PiAvatar image={user.user.image}/>
                                            </td>
                                            <td className={'border-slate-700 border p-1'}>{user.user.firstName} {user.user.lastName}</td>
                                            <td className={'border-slate-700 border p-1'}>{user.role.name}</td>
                                            <td className={'border-slate-700 border p-1'}>{user.user.email}</td>
                                            <td className={'border-slate-700 border p-1'}>{user.user.gender?.name}</td>
                                            <td className={'border-slate-700 border p-1'}>
                                                <PiButton rounded={'rounded'} size={'extra small'} type={'success'} onClick={() => editUser(user.user)}>EDIT</PiButton>
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
