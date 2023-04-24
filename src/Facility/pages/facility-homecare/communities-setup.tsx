import {environment} from "../../../shared/environment";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../../store/auth-provider";
import {ContextInterface} from "../../../shared/models/context-interface";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {FormObject} from "../../../shared/FormBuilder/form-object";
import {FormDate} from "../../../shared/FormBuilder/form-date";
import {FormSelect} from "../../../shared/FormBuilder/form-select";
import {FormInput} from "../../../shared/FormBuilder/form-input";
import {HttpProvider} from "../../../store/http-provider";
import {ApiResponse} from "../../../shared/models/ApiResponse";
import {ScheduleType} from "../../../shared/models/schedule-type";
import {finalize} from "rxjs";

export  default function CommunitiesSetup() {
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
    const [communities, setCommunities] = useState<any[]>([]);
    const regionForm: FormObject[] = [
        {
            id: 'countryId',
            type: "select",
            props: {
                required: true,
                label: 'Country',
                data: countries
            }
        },{
            id: 'regionId',
            type: "select",
            props: {
                required: true,
                label: 'Region',
                data: regions
            }
        },
        {
            id: 'name',
            type: "text",
            props: {
                required: true,
                label: 'Community Name',
                value: ''
            }
        }
    ]
    const [form, setForm] = useState<FormObject[]>(regionForm);

    const getCountries = () => {
        setLoading(true);
        HttpProvider.get<ApiResponse<Array<any>>>(`General/AllCountry`, {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false)))
            .subscribe((result) => {
                setCommunities([...result.data]);
            })
    }

    const getCommunities = () => {
        setLoading(true);
        HttpProvider.get<ApiResponse<Array<any>>>(`HomeCare/GetCommunities`, {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false)))
            .subscribe((result) => {
                setCountries([...result.data]);
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

    useEffect(() => {
        setAuth((prevState) => {
            return {...prevState, user: context.user, accessToken: context.accessToken }
        });
    }, [context]);

    useEffect(() => {
        if (auth.accessToken?.token) {
            getCountries();
        }
    }, [auth])

    useEffect(() => {
        if (regions.length > 0) {
            const myForm = regionForm.find(u => u.id === 'regionId');
            if (myForm) {
                (myForm.props as FormSelect).data = regions;
                setForm([...regionForm]);
            }
        }
        if (countries.length > 0) {
            const myForm = regionForm.find(u => u.id === 'countryId');
            if (myForm) {
                (myForm.props as FormSelect).data = countries;
                setForm([...regionForm]);
            }
        }
    }, [regions, countries])
    return (
        <>
            homecare
        </>
    )
}
