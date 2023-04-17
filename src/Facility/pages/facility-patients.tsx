import {environment} from "../../shared/environment";
import {useContext, useState} from "react";
import {AuthContext} from "../../store/auth-provider";
import {ContextInterface} from "../../shared/models/context-interface";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {FormItem} from "../../shared/FormBuilder/form-item";
import {Gender} from "../../shared/models/Gender";
import {FormObject} from "../../shared/FormBuilder/form-object";
import {FormImage} from "../../shared/FormBuilder/form-image";
import {FormInput} from "../../shared/FormBuilder/form-input";
import {FormSelect} from "../../shared/FormBuilder/form-select";
import {FormTextArea} from "../../shared/FormBuilder/form-text-area";
import {FormDate} from "../../shared/FormBuilder/form-date";

export default function FacilityPatients() {
    const url = environment.apiUrl;
    const context = useContext(AuthContext);
    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false };
    const [auth, setAuth] = useState<ContextInterface>(getDefault);
    const [patients, setPatients] = useState<Array<any>>([]);
    const [editState, setEditState] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const messageDialog: MessageProps = {
        open: false,
        message: '',
        type: "success"
    }
    const [openDialog, setOpenDialog] = useState(messageDialog);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [gender, setGenders] = useState<Gender[]>([]);
    const [communities, setCommunities] = useState<any[]>([]);
    const [polyKiosks, setPolyKiosks] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const defaultForm: FormObject[] = [
        {
            id: 'image',
            type: "image",
            props: {
                label: 'Patient Photo'
            } as FormImage
        },
        {
            id: 'firstName',
            type: "text",
            props: {
                label: 'First Name',
                required: true,
                type: 'text'
            } as FormInput
        },
        {
            id: 'lastName',
            type: "text",
            props: {
                label: 'Last Name',
                required: true,
                type: 'text'
            } as FormInput
        },
        {
            id: 'surName',
            type: "text",
            props: {
                label: 'Middle Name',
                required: true,
                type: 'text'
            } as FormInput
        },
        {
            id: 'age',
            type: "text",
            props: {
                label: 'Age',
                required: true,
                type: 'text',
                mask: 'DDD'
            } as FormInput
        },
        {
            id: 'genderId',
            type: "select",
            props: {
                label: 'Gender',
                required: true,
                type: 'text',
                data: gender
            } as FormSelect
        },
        {
            id: 'phoneNumber',
            type: "text",
            props: {
                label: 'Phone Number',
                required: true,
                type: 'text',
                mask: 'DDD DDD DDDD'
            } as FormInput
        },
        {
            id: 'email',
            type: "text",
            props: {
                label: 'Email',
                required: true,
                type: 'email'
            } as FormInput
        },
        {
            id: 'address',
            type: "textarea",
            props: {
                label: 'Address',
                required: true
            } as FormTextArea
        },
        {
            id: 'location',
            type: "text",
            props: {
                label: 'Location',
                required: true,
                type: 'text'
            } as FormInput
        },
        {
            id: 'gpsAddress',
            type: "text",
            props: {
                label: 'GPS Address',
                required: true,
                type: 'text',
                mask: 'AA-DDD-DDDD'
            } as FormInput
        },
        {
            id: 'dateOfBirth',
            type: "date",
            props: {
                label: 'Date Of Birth',
                required: true
            } as FormDate
        },
        {
            id: 'nextOfKin',
            type: "text",
            props: {
                label: 'Next Of Kin',
                required: true,
                type: 'text'
            } as FormInput
        },
        {
            id: 'nextOfKinPhoneNumber',
            type: "text",
            props: {
                label: 'Next Of Kin Phone Number',
                required: true,
                type: 'text',
                mask: 'DDD DDD DDDD'
            } as FormInput
        },
        {
            id: 'communityId',
            type: "select",
            props: {
                label: 'Community',
                required: true,
                type: 'text',
                data: communities
            } as FormSelect
        },
        {
            id: 'polyKioskId',
            type: "select",
            props: {
                label: 'Poly Kiosk',
                required: true,
                type: 'text',
                data: polyKiosks
            } as FormSelect
        },
        {
            id: 'activityId',
            type: "select",
            props: {
                label: 'Activity',
                required: true,
                type: 'text',
                data: activities
            } as FormSelect
        }
    ];
    const [forms, setForm] = useState<FormObject[]>(defaultForm);
    return (
        <>
        </>
    )
}
