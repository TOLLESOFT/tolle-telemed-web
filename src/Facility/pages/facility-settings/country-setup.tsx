import {PiButton, PiModal} from "toll-ui-react";
import {environment} from "../../../shared/environment";
import {useNavigate} from "react-router-dom";
import {AuthContext} from "../../../store/auth-provider";
import {useContext, useState} from "react";
import {ContextInterface} from "../../../shared/models/context-interface";
import {Country} from "../../../shared/models/country";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {FormBuilder} from "../../../shared/FormBuilder/form-builder";
import {FormItem} from "../../../shared/FormBuilder/form-item";
import {ApiResponse} from "../../../shared/models/ApiResponse";
import {Paging} from "../../../shared/models/paging";
import {Filter} from "../../../shared/models/filter";
import {PagedResponse} from "../../../shared/models/PagedResponse";

export default function CountrySetup() {
    const url = environment.apiUrl;
    const context = useContext(AuthContext);
    const navigate = useNavigate();

    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false }

    const [auth, setAuth] = useState<ContextInterface>(getDefault);

    const [openModal, setOpenModal] = useState<boolean>(false);

    const [countries, setCountries] = useState<Country[]>([]);

    const [editState, setEditState] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(false);

    const [form, setForm] = useState<Country>();

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

    const saveHandler = (form: any) => {
        setLoading(true);
        fetch(`${url}Country`, {
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

    const getCountriesHandler = () => {
        setLoading(true);
        fetch(`${url}Country/GetAll?pageSize=${paging.pageSize}&pageNumber=${paging.pageNumber}`, {
            body: JSON.stringify(filter),
            method: 'POST',
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

    return (
        <>
            {
                openModal &&
                <PiModal fullScreen={false} onClose={closeModalHandler}>
                    <h1>New Country</h1>
                    <FormBuilder loading={loading} form={defaultForm} onFormSubmit={saveHandler}/>
                </PiModal>
            }
            <div className={'flex flex-col w-full h-full'}>
                <div className={'h-auto w-full flex'}>
                    <PiButton onClick={openModalHandler} type={'primary'} size={'small'} rounded={'rounded'}>
                        <i className={'pi pi-plus'}></i> <span className={'ml-2'}>Add Country</span>
                    </PiButton>
                </div>
                <div className={'grow w-full h-full'}></div>
            </div>
        </>
    )
}