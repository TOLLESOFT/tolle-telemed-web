import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../../store/auth-provider";
import {ContextInterface} from "../../../shared/models/context-interface";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {Paging} from "../../../shared/models/paging";
import {
    PiButton,
    PiInput, PiLoader,
    PiLoading,
    PiMessage,
    PiModal
} from "toll-ui-react";
import {PiPagination} from "../../../shared/components/pi-pagination";
import {HttpProvider} from "../../../store/http-provider";
import {ApiResponse} from "../../../shared/models/ApiResponse";
import {finalize} from "rxjs";
import {PagedResponse} from "../../../shared/models/PagedResponse";
import {environment} from "../../../shared/environment";
import {BaseService} from "../../../shared/base.service";

export default function SubscriptionsSetup() {
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
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [formId, setFormId] = useState<string>('');
    const [paging, setPaging] = useState<Paging>({ pageSize: 10, pageNumber: 1, totalPages: 0, totalRecords: 0, currentSize: 0 });
    const [subscription, setSubscription] = useState<{id: string, name: string, active: boolean}>({ id:'', name: '', active: false})
    const [subscriptionFee, setSubscriptionFee] = useState<
        {
            subscriptionFee: {
                id: string
                subscriptionId: string,
                fee: any;
            },
            items: {item: string, subscriptionId: string, feeId: string}[]
        }[]
    >([]);

    const [selectedItem, setSelectedItem] = useState<{
        subscriptionFee: {
            id: string
            subscriptionId: string,
            fee: 0
        },
        items: {item: string, subscriptionId: string, feeId: string}[]
    }>({
        subscriptionFee: {
            id: '',
            subscriptionId: '',
            fee: 0
        },
        items: []
    })

    const editSubscriptions = (item: any) => {
        setSubscription(prevState => {
            return { ...prevState, name: item.name, id: item.id }
        })

        const newSubscriptionFee: { subscriptionFee: { id: any; fee: any; subscriptionId: any; }; items: any; }[] = [];
        item.feeItems.forEach((feeItem: any) => {
            newSubscriptionFee.push({
                subscriptionFee: {
                    id: feeItem.id,
                    fee: feeItem.fee,
                    subscriptionId: feeItem.subscriptionId
                },
                items: feeItem.items
            })
        });
        setEditState(true);
        setSubscriptionFee([...newSubscriptionFee]);
        openModalHandler();

        console.log(subscriptionFee);
    }

    const nameInputOnChange = (data: any) => {
        setSubscription((prevState) => {
            return {...prevState, name: data};
        })
    }

    const feeInputOnChange = (data: any) => {
        // setSubscriptionFee((prevState) => {
        //     return {...prevState, fee: data};
        // })
    }

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

    const getSubscriptions = () => {
        setLoading(true);
        HttpProvider.get<PagedResponse<Array<any>>>(`HomeCare/GetAllSubscriptionsPaginated?pageSize=${paging.pageSize ?? 10}&pageNumber=${paging.pageNumber}`, {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth?.accessToken?.token}`
        }).pipe(finalize(() => setLoading(false)))
            .subscribe({
            next: result => {

                const data: Array<any> = [];
                result.data.forEach((team) => {
                    data.push(team);
                });

                setSubscriptions([...data]);
                setPaging(prevState => {
                    return { ...prevState, pageSize: result.pageSize, totalPages: result.totalPages, totalRecords: result.totalRecords, currentSize: result.data.length}
                });
            }
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
        HttpProvider.post<ApiResponse<any>>('HomeCare/PostSubscription',
            JSON.stringify(form), {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }).pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: result => {
                    if (result.status === 100) {
                        getSubscriptions();
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
        HttpProvider.put<ApiResponse<any>>('HomeCare/PutSubscription',
            JSON.stringify(form), {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }).pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: result => {
                    if (result.status === 100) {
                        getSubscriptions();
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
            getSubscriptions();
        }
    }, [auth])

    useEffect(() => {
        if (auth.accessToken?.token) {
            if (paging.pageSize > 0) {
                HttpProvider.apiUrl = environment.apiUrl;
                getSubscriptions();
            }
        }
    }, [paging.pageSize, auth])

    return (
        <>
            {
                openDialog.open &&
                <PiMessage onClose={closeMessageHandler} message={openDialog.message} type={openDialog.type}/>
            }
            {
                openModal &&
                <PiModal fullScreen={true} onClose={closeModalHandler}>
                    <div className={'h-full w-full flex flex-col'}>
                        <PiLoader loading={loading}/>
                        <div className={'h-auto w-full flex justify-between items-center p-1'}>
                            <div>
                                <PiButton onClick={() => {
                                    let errorCount = 0;
                                    if (subscription.name.length === 0) {
                                        errorCount ++;
                                    }
                                    if (subscriptionFee.length === 0) {
                                        errorCount ++;
                                    }

                                    if (errorCount === 0) {
                                        const data = {
                                            subscription,
                                            subscriptionItems: subscriptionFee
                                        }
                                        submitHandler(data);
                                    }
                                }} type={'primary'} size={'small'} rounded={'rounded'}>
                                    SAVE SUBSCRIPTION
                                </PiButton>
                            </div>
                            <i onClick={closeModalHandler} className={'pi pi-times cursor-pointer'}></i>
                        </div>
                        <div className={'grow w-full h-full'}>
                            <div className={'grid grid-cols-2 w-full h-full divide-x dark:divide-gray-600'}>
                                <div className={'w-full flex flex-col h-full p-4 space-y-4'}>
                                    <div className={'h-auto w-full'}>
                                        <PiInput
                                            value={subscription.name}
                                            label={'Name'}
                                            id={'name'}
                                            rounded={'rounded'}
                                            required={true}
                                            size={"normal"}
                                            onChange={nameInputOnChange}/>
                                    </div>
                                    <div className={'grow h-full w-full'}>
                                        <h1 className={'text-xl pb-2'}>SUBSCRIPTION FEES. <small className={'text-sm'}>Add subscription fees here.</small></h1>

                                        <div className={'pb-4'}>
                                            <PiButton onClick={() => {
                                                subscriptionFee.push({
                                                    subscriptionFee: {
                                                        fee: 0,
                                                        subscriptionId: '',
                                                        id: ''
                                                    },
                                                    items: []
                                                });
                                                setSubscriptionFee([...subscriptionFee])
                                            }} type={'primary'} size={'small'} rounded={'rounded'}>
                                                ADD FEE
                                            </PiButton>
                                        </div>
                                        <div className={'space-y-3 py-3'}>
                                            {
                                                subscriptionFee.map((item,index) =>
                                                    <div key={BaseService.uuid()} className={'flex items-center space-x-2'}>
                                                        <div className={'w-full'}>
                                                            <PiInput
                                                                value={item.subscriptionFee.fee}
                                                                type={'number'}
                                                                id={'fee'}
                                                                rounded={'rounded'}
                                                                size={"normal"}
                                                                onChange={(e) => {
                                                                    subscriptionFee[index].subscriptionFee.fee = e;
                                                                }}/>
                                                        </div>
                                                        <div className={'w-full'}>
                                                            <PiButton onClick={() => {
                                                                setSelectedItem(item);
                                                            }} type={'success'} size={'small'} rounded={'rounded'}>
                                                                FEE ITEMS
                                                            </PiButton>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className={'overflow-auto w-full p-4'}>
                                    {
                                        selectedItem &&
                                        <>
                                            <h1 className={'text-xl pb-2'}>GHS {selectedItem.subscriptionFee.fee} SUBSCRIPTION FEE ITEMS</h1>
                                            <div>
                                                <PiButton onClick={() => {
                                                    selectedItem.items.push({
                                                        item: '',
                                                        subscriptionId: '',
                                                        feeId: ''
                                                    });

                                                    const findSub = subscriptionFee.find(u => u === selectedItem);
                                                    if (findSub) {
                                                        findSub.items = [...selectedItem.items];
                                                        setSubscriptionFee([...subscriptionFee]);
                                                    }
                                                }} type={'primary'} size={'small'} rounded={'rounded'}>
                                                    ADD FEE ITEM
                                                </PiButton>
                                            </div>
                                        </>
                                    }
                                    <div className={'space-y-3 py-3'}>
                                        {
                                            selectedItem.items.map((item, index) =>

                                                <div key={index} className={'flex justify-between items-center space-x-2'}>
                                                    <div className={'w-full'}>
                                                        <PiInput
                                                            value={item.item}
                                                            id={'name'}
                                                            name={'Item description'}
                                                            rounded={'rounded'}
                                                            required={true}
                                                            size={"normal"}
                                                            onChange={(e) => {
                                                                selectedItem.items[index].item = e;
                                                            }}/>
                                                    </div>
                                                    <div>
                                                        <PiButton onClick={() => {
                                                            selectedItem.items.splice(index, 1);
                                                            setSubscriptionFee([...subscriptionFee]);
                                                        }} type={'danger'} size={'small'} rounded={'rounded'}>
                                                            REMOVE
                                                        </PiButton>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </PiModal>
            }
            <div className={'flex flex-col w-full h-full space-y-4 p-2'}>
                <div className={'h-auto w-full flex justify-between'}>
                    <div className={'flex items-center'}>
                        <PiButton onClick={openModalHandler} type={'primary'} size={'small'} rounded={'rounded'}>
                            <i className={'pi pi-plus'}></i> <span className={'ml-2'}>Add Subscription</span>
                        </PiButton>
                    </div>

                    <div className={'flex items-center'}>
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
                </div>
                <div className={'grow w-full h-full overflow-auto'}>
                    <table className={'border-collapse w-full text-sm'}>
                        <thead>
                        <tr className="noWrap">
                            <th className={'border border-slate-600 p-1'}>NAME</th>
                            <th className={'border border-slate-600 p-1'}>No. OF SUBSCRIPTIONS</th>
                            <th className={'border border-slate-600 p-1'}></th>
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
                            subscriptions.length > 0 && !loading &&
                            <>
                                {
                                    subscriptions.map((item) =>
                                        <tr key={item.id}>
                                            <td className={'border-slate-700 border p-1'}>{item.name}</td>
                                            <td className={'border-slate-700 border p-1'}>{item.feeItems.length}</td>
                                            <td className={'border-slate-700 border p-1'}>
                                                <div className={'flex space-x-2'}>
                                                    <PiButton rounded={'rounded'} size={'extra small'} type={'success'} onClick={() => editSubscriptions(item)}>EDIT</PiButton>
                                                    {/*<PiButton rounded={'rounded'} size={'extra small'} type={'primary'} onClick={() => {}}>VIEW</PiButton>*/}
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
