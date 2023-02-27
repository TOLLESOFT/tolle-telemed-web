import {environment} from "../../../shared/environment";
import {useContext, useEffect, useRef, useState} from "react";
import {AuthContext} from "../../../store/auth-provider";
import {ContextInterface} from "../../../shared/models/context-interface";
import {ExamCategories} from "../../../shared/models/exam-categories";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {ApiResponse} from "../../../shared/models/ApiResponse";
import {PiButton, PiMessage, PiSkeleton, PiSkeletonWrapper} from "toll-ui-react";
import {ItemFrequency} from "../../../shared/models/item-frequency";

export default function ItemFrequencySetup() {
    const url = environment.apiUrl;
    const context = useContext(AuthContext);
    const fileRef = useRef<any>()

    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false }

    const [auth, setAuth] = useState<ContextInterface>(getDefault);
    const [all, setAll] = useState<ItemFrequency[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const messageDialog: MessageProps = {
        open: false,
        message: '',
        type: "success"
    }

    const [openDialog, setOpenDialog] = useState(messageDialog);

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

    const getAllHandler = () => {
        setLoading(true);
        fetch(`${url}Settings/GetFrequencies`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<Array<ItemFrequency>>) => {
                setAll(result.data);
            }).finally(() => {
                setLoading(false);
            });

        }).catch((reason) => {
            // alert('log out');
        });
    }

    const selectFile = () => {
        if (fileRef.current) {
            fileRef.current.click()
        }
    }

    const importFile = (file: any) => {
        if (!file.target.files && !file.target.files[0]) {
            openMessageHandler({type: "error", message: 'Please select a valid excel file', open: true});
            return;
        }

        const formData: FormData = new FormData();
        formData.append('fileKey', file.target.files[0], file.target.files[0].name);

        setLoading(true);
        fetch(`${url}Settings/ImportFrequency`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<any>) => {
                if (result.status === 200) {
                    getAllHandler();
                    openMessageHandler({type: "success", message: result.message, open: true});
                } else {
                    openMessageHandler({type: "error", message: result.message, open: true});
                }
            }).finally(() => {
                if (fileRef.current) {
                    fileRef.current.value = ''
                }
                setLoading(false);
            });

        }).catch((reason) => {
            if (fileRef.current) {
                fileRef.current.value = ''
            }
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
            getAllHandler();
        }
    }, [auth]);

    return (
        <>
            {/*@ts-ignore*/}
            <input type="file" ref={fileRef} accept=".xls, .xlsx" hidden onChange={(e) => importFile(e)}/>
            {
                openDialog.open &&
                <PiMessage onClose={closeMessageHandler} message={openDialog.message} type={openDialog.type}/>
            }
            <div className={'flex flex-col w-full h-full space-y-4'}>
                <div className={'h-auto w-full flex justify-between'}>
                    <PiButton onClick={selectFile} type={'primary'} size={'small'} rounded={'rounded'}>
                        <i className={'pi pi-file-excel'}></i> <span className={'ml-2'}>Select import file</span>
                    </PiButton>
                </div>
                <div className={'grow w-full h-full overflow-auto'}>
                    <table className={'border-collapse w-full text-sm'}>
                        <thead>
                        <tr className="noWrap">
                            <th className={'border border-slate-600'}>ITEM FREQUENCIES</th>
                            {/*<th className={'border border-slate-600'}></th>*/}
                        </tr>
                        </thead>
                        <tbody>
                        {
                            loading &&
                            <tr>
                                <td colSpan={1}>
                                    <div className={'flex justify-center w-full'}>
                                        <h1>loading ...</h1>
                                    </div>
                                </td>
                            </tr>
                        }
                        {
                            all.length > 0 && !loading &&
                            <>
                                {
                                    all.map((data) =>
                                        <tr key={data.id}>
                                            <td className={'border-slate-700 border p-1'}> {data.description} </td>
                                            {/*<td className={'border-slate-700 border p-1'}>*/}
                                            {/*    /!*<PiButton rounded={'rounded'} size={'extra small'} type={'success'} onClick={() => {editForm(group)}}>EDIT</PiButton>*!/*/}
                                            {/*</td>*/}
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
