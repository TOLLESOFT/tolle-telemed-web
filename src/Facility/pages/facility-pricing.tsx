import {useContext, useEffect, useState} from "react";
import {Specialty} from "../../shared/models/specialty";
import {environment} from "../../shared/environment";
import {AuthContext} from "../../store/auth-provider";
import {ContextInterface} from "../../shared/models/context-interface";
import {PiAvatar, PiButton, PiMessage, PiModal} from "toll-ui-react";
import {ApiResponse} from "../../shared/models/ApiResponse";
import {FormItem} from "../../shared/FormBuilder/form-item";
import {FormBuilder} from "../../shared/FormBuilder/form-builder";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";

export default function FacilityPricing() {
    const url = environment.apiUrl;
    const context = useContext(AuthContext);
    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false };
    const defaultForm: FormItem[] = [
        {
            id: 'amount',
            type: "number",
            required: true,
            label: 'Amount',
            value: 0
        }
    ]
    const [forms, setForm] = useState<FormItem[]>(defaultForm);
    const [specialty, setSpecialty] = useState<Specialty>({ image: '', name: '', description: '' });
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [auth, setAuth] = useState<ContextInterface>(getDefault);
    const [specialties, setSpecialties] = useState<Array<{specialty: any, amount: any}>>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const messageDialog: MessageProps = {
        open: false,
        message: '',
        type: "success"
    }
    const [openDialog, setOpenDialog] = useState(messageDialog);

    const openModalHandler = (data: any) => {
        defaultForm.forEach((item) => {
            if (item.id === Object.values([item.id])[0]) {
                item.value = data.amount;
            }
        });
        setForm([...defaultForm]);
        setSpecialty(data.specialty);
        setOpenModal(true);
    }

    const closeModalHandler = () => {
        clearDefaultForm();
        setOpenModal(false);
    }

    const clearDefaultForm = () => {
        defaultForm.forEach((item) => {
            item.value = 0
        });
        setForm([...defaultForm]);
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

    const setSpecialtyAmount = (form: any) => {
        setLoading(true);
        const data = {
            specialtyId: specialty.id,
            amount: form.amount
        }

        fetch(`${url}Facility/FacilityPricing`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<any>) => {
                if (result.status === 100) {
                    getSpecialtiesHandler();
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
            getSpecialtiesHandler();
        }
    }, [auth]);
    const getSpecialtiesHandler = () => {
        setLoading(true);
        fetch(`${url}Facility/GetFacilityPricing`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<Array<{specialty: any, amount: any}>>) => {
                setSpecialties(result.data);
                // openMessageHandler({type: "success", message: result.message, open: true});
            }).finally(() => {
                setLoading(false);
            });

        }).catch((reason) => {

        });
    }

    return (
        <>
            {
                openDialog.open &&
                <PiMessage onClose={closeMessageHandler} message={openDialog.message} type={openDialog.type}/>
            }
            {
                openModal &&
                <PiModal fullScreen={false} onClose={closeModalHandler}>
                    <FormBuilder title={'Specialty Pricing Form'} loading={loading} form={forms} onFormSubmit={setSpecialtyAmount}/>
                </PiModal>
            }
            <div className={'flex flex-col w-full h-full space-y-4 p-2'}>
                <table className={'border-collapse w-full text-sm'}>
                    <thead>
                    <tr className="noWrap">
                        <th className={'border border-slate-600'}></th>
                        <th className={'border border-slate-600'}>NAME</th>
                        <th className={'border border-slate-600'}>DESCRIPTION</th>
                        <th className={'border border-slate-600'}>PRICES</th>
                        <th className={'border border-slate-600'}></th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        loading &&
                        <tr>
                            <td colSpan={4}>
                                <div className={'flex justify-center w-full'}>
                                    <h1>loading ...</h1>
                                </div>
                            </td>
                        </tr>
                    }
                    {
                        specialties.length > 0 && !loading &&
                        <>
                            {
                                specialties.map((specialty) =>
                                    <tr key={specialty.specialty?.id}>
                                        <td className={'border-slate-700 border p-1'}>
                                            <PiAvatar image={specialty.specialty?.image}/>
                                        </td>
                                        <td className={'border-slate-700 border p-1'}>{specialty.specialty?.name}</td>
                                        <td className={'border-slate-700 border p-1'}>{specialty.specialty?.description}</td>
                                        <td className={'border-slate-700 border p-1'}>{specialty.amount}</td>
                                        <td className={'border-slate-700 border p-1'}>
                                            <PiButton rounded={'rounded'} size={'extra small'} type={'success'} onClick={() => {openModalHandler(specialty)}}>SET PRICE</PiButton>
                                        </td>
                                    </tr>
                                )
                            }
                        </>
                    }
                    </tbody>
                </table>
            </div>
        </>
    )
}
