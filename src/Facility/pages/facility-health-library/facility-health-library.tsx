import {useContext, useEffect, useState} from "react";
import {HealthLibrary} from "../../../shared/models/health-library";
import {Paging} from "../../../shared/models/paging";
import {environment} from "../../../shared/environment";
import {AuthContext} from "../../../store/auth-provider";
import {ContextInterface} from "../../../shared/models/context-interface";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {PagedResponse} from "../../../shared/models/PagedResponse";
import {Filter} from "../../../shared/models/filter";
import {
    PiAvatar,
    PiBadge,
    PiButton,
    PiCheckbox,
    PiImagePicker,
    PiInput,
    PiMessage,
    PiModal,
    PiSelectList, PiTextArea
} from "toll-ui-react";
import {PiPagination} from "../../../shared/components/pi-pagination";
import {format, formatDistance} from 'date-fns';
import {ApiResponse} from "../../../shared/models/ApiResponse";
import {Topics} from "../../../shared/models/topics";

export default function FacilityHealthLibrary() {
    const url = environment.apiUrl;
    const context = useContext(AuthContext);
    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false };
    const [auth, setAuth] = useState<ContextInterface>(getDefault);
    const [library, setLibrary] = useState<Array<HealthLibrary>>([]);
    const [topics, setTopics] = useState<Array<Topics>>([]);
    const [editState, setEditState] = useState<boolean>(false);
    const [filter, setFilter] = useState<Filter>({});
    const [paging, setPaging] = useState<Paging>({ pageSize: 10, pageNumber: 1, totalPages: 0, totalRecords: 0, currentSize: 0 });
    const [loading, setLoading] = useState<boolean>(false);
    const messageDialog: MessageProps = {
        open: false,
        message: '',
        type: "success"
    }
    const [openDialog, setOpenDialog] = useState(messageDialog);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [form, setForm] = useState<HealthLibrary>({});
    const [selectedLibrary, setSelectedLibrary] = useState<HealthLibrary>({});
    const [inValidTopic, setInValidTopic] = useState<boolean>(false);
    const [inValidTitle, setInValidTitle] = useState<boolean>(false);
    const [inValidContent, setInValidContent] = useState<boolean>(false);

    const editForm = (form: HealthLibrary) => {
        setEditState(true);
        setForm(prevState => {
            return { ...prevState,
                content: form.content,
                title: form.title,
                subTitle: form.subTitle,
                spaceId: form.space.id,
                image: form.image,
                id: form.id,
                published: form.published
            }
        });
        setSelectedLibrary(form);
        setOpenModal(true);
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
    const openModalHandler = () => {
        setOpenModal(true);
    }
    const closeModalHandler = () => {
        setEditState(false);
        setForm({});
        setSelectedLibrary({});
        setOpenModal(false);
    }
    const getFiles = (images: Array<any>) => {
        if (images.length > 0) {
            console.log(images.map(image => image.file));
            setForm((prevState) => {
                return {...prevState, image: images.map(image => image.file)[0]}
            });
            setSelectedLibrary((prevState) => {
                return {...prevState, image: images.map(image => image.file)[0]}
            });
        }
    }
    const titleInputOnChange = (data: any) => {
        setForm((prevState) => {
            return {...prevState, title: data};
        })

        setSelectedLibrary((prevState) => {
            return {...prevState, title: data};
        })
    }
    const contentInputOnChange = (data: any) => {
        setForm((prevState) => {
            return {...prevState, content: data};
        })

        setSelectedLibrary((prevState) => {
            return {...prevState, content: data};
        })
    }
    const publishInputOnChange = (data: any) => {
        setForm((prevState) => {
            return {...prevState, published: data.target.checked};
        })
    }
    const subTitleInputOnChange = (data: any) => {
        setForm((prevState) => {
            return {...prevState, subTitle: data};
        })

        setSelectedLibrary((prevState) => {
            return {...prevState, subTitle: data};
        })
    }
    const topicInputOnChange = (data: any) => {
        setForm((prevState) => {
            return {...prevState, spaceId: data};
        })

        setSelectedLibrary((prevState) => {
            return {...prevState, space: topics.find(u => u.id === data)};
        })
    }
    const getDataHandler = () => {
        setLoading(true);
        fetch(`${url}Blog/GetAllByFilter?pageSize=${paging.pageSize}&pageNumber=${paging.pageNumber}`, {
            body: JSON.stringify(filter),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: PagedResponse<Array<HealthLibrary>>) => {
                const data: Array<HealthLibrary> = [];
                result.data.forEach((rate) => {
                    data.push(rate);
                });

                setLibrary(data);
                setPaging(prevState => {
                    return { ...prevState, pageSize: result.pageSize, totalPages: result.totalPages, totalRecords: result.totalRecords, currentSize: result.data.length}
                });
            }).finally(() => {
                setLoading(false);
            });

        }).catch((reason) => {

        });
    }
    const getTopics = () => {
        setLoading(true);
        fetch(`${url}Blog/GetBlogSpaces`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<Array<any>>) => {
                setTopics(result.data);

            }).finally(() => {
                setLoading(false);
            });

        }).catch((reason) => {

        });
    }
    const submitHandler = () => {
        let errorCount = 0;
        if ((form.title as string).length === 0) {
            errorCount ++;
            setInValidTitle(true);
        }
        if ((form.spaceId as string).length === 0 ) {
            errorCount ++;
            setInValidTopic(true);
        }
        if ((form.content as string).length === 0) {
            errorCount ++;
            setInValidContent(true);
        }
        if (errorCount === 0) {
            if (editState) {
                editHandler(form);
            } else {
                saveHandler(form);
            }
        }
    }
    const saveHandler = (form: any) => {
        setLoading(true);
        fetch(`${url}Blog/AddBlog`, {
            method: 'POST',
            body: JSON.stringify(form),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<any>) => {
                if (result.status === 100) {
                    getDataHandler();
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
        setLoading(true);
        fetch(`${url}Blog/EditBlog`, {
            method: 'PUT',
            body: JSON.stringify(form),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<any>) => {
                if (result.status === 100) {
                    getDataHandler();
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

    useEffect(() => {
        setAuth((prevState) => {
            return {...prevState, user: context.user, accessToken: context.accessToken }
        });
    }, [context]);

    useEffect(() => {
        if (auth.accessToken?.token) {
            getTopics();
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
                        <div className={'h-auto w-full flex justify-end items-center'}>

                            <i onClick={closeModalHandler} className={'pi pi-times cursor-pointer'}></i>
                        </div>
                        <div className={'grow w-full h-full'}>
                            <div className={'flex flex-col w-full h-full'}>
                                <div className={'grid grid-cols-2 w-full h-full divide-x dark:divide-gray-600'}>
                                    <div className={'w-full p-4 space-y-4'}>
                                        <div>
                                            <span className={'block text-[15px] pb-4'}>Banner image</span>
                                            <div className={'w-full h-[150px] bg-center bg-cover rounded-lg relative overflow-auto'} style={{backgroundImage: `url(${form.image})`}}>
                                                <div className={'absolute inset-0 bg-gray-900/50 flex flex-wrap content-end'}>
                                                    <div className={'p-2'}>
                                                        <PiImagePicker
                                                            onImageAdded={getFiles}
                                                            type={'single'}
                                                            label={'Select banner image'}
                                                            files={[`${form.image}`]}
                                                            simple={true}
                                                            id={'image-picker'}/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <PiInput
                                            value={form.title as string}
                                            label={'Title'}
                                            id={'title'}
                                            rounded={'rounded'}
                                            invalid={inValidTitle}
                                            required={true}
                                            onChange={titleInputOnChange}/>
                                        <PiInput
                                            value={form.subTitle as string}
                                            label={'Sub Title'}
                                            id={'subtitle'}
                                            rounded={'rounded'}
                                            onChange={subTitleInputOnChange}/>
                                        <PiSelectList
                                            rounded={'rounded'}
                                            label={'Topic'}
                                            onValueChange={topicInputOnChange}
                                            data={topics}
                                            invalid={inValidTopic}
                                            required={true}
                                            value={form.spaceId}
                                            dataValue={'id'}
                                            dataLabel={'name'}/>
                                        <PiTextArea
                                            id={'editor'}
                                            onChange={contentInputOnChange}
                                            invalid={inValidContent}
                                            label={'Content'}
                                            rounded={'rounded'}
                                            rows={10}
                                            value={form.content as string}/>
                                        <PiCheckbox
                                            onChange={publishInputOnChange}
                                            value={form.published}
                                            label={'PUBLISH'}
                                            position={"right"}/>
                                        <PiButton loading={loading} onClick={submitHandler} type={'primary'} size={'small'} rounded={'rounded'}>
                                            SAVE
                                        </PiButton>
                                    </div>

                                    <div className={'overflow-auto w-full p-4'}>
                                        <h1 className={'text-xl pb-2'}>PREVIEW</h1>
                                        <div className={'w-full h-[200px] bg-center bg-cover rounded-lg relative overflow-auto'} style={{backgroundImage: `url(${selectedLibrary.image})`}}>

                                        </div>
                                        <div className={'flex justify-between w-full items-center pt-5'}>
                                            <div className={'flex bg-blue-500/50 items-center py-1 px-1.5 space-x-2 rounded-full'}>
                                                <img src={selectedLibrary.space?.image} className={'w-6 h-6 rounded-full'}/>
                                                <span className={'text-xs'}>{selectedLibrary.space?.name}</span>
                                            </div>
                                            <div className={'flex space-x-4 items-center'}>
                                                <div className={'flex space-x-2 items-center'}>
                                                    <i className={'pi pi-eye'}></i>
                                                    <span>3.4k</span>
                                                </div>
                                                <div className={'flex space-x-2 items-center'}>
                                                    <i className={'pi pi-heart-fill'}></i>
                                                    <span>999</span>
                                                </div>
                                            </div>
                                        </div>

                                        <h1 className={'pt-4 text-4xl font-bold'}>{selectedLibrary.title}</h1>
                                        <div className={'flex items-center py-1 px-1.5 space-x-2 rounded-full pt-3'}>
                                            <img src={selectedLibrary.publisher?.image} className={'w-8 h-8 rounded-full'}/>
                                            <span className={'text-sm'}>{selectedLibrary.publisher?.firstName} {selectedLibrary.publisher?.lastName}</span>
                                            {
                                                selectedLibrary.publishDate &&
                                                <i className={'text-sm'}>~ {formatDistance(new Date(selectedLibrary.publishDate), new Date(), {addSuffix: true})}</i>
                                            }
                                        </div>

                                        <div className={'pt-5'}>
                                            {
                                                selectedLibrary.content?.split('.').map((paragraph: string, index) => <p key={index}>
                                                    {
                                                        paragraph.length > 0 && `${paragraph}.`
                                                    }</p>)
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </PiModal>
            }
            <div className={'flex flex-col w-full h-full space-y-4 p-2'}>
                <div className={'h-auto w-full flex justify-between items-center'}>
                    <PiButton onClick={openModalHandler} type={'primary'} size={'small'} rounded={'rounded'}>
                        <i className={'pi pi-plus'}></i> <span className={'ml-2'}>New Article</span>
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
                            <th className={'border border-slate-600'}>LIBRARY CATEGORY</th>
                            <th className={'border border-slate-600'}>CONTENT</th>
                            <th className={'border border-slate-600'}>DATE ADDED</th>
                            <th className={'border border-slate-600'}>DATE PUBLISHED</th>
                            <th className={'border border-slate-600'}>STATUS</th>
                            <th className={'border border-slate-600'}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            loading &&
                            <tr>
                                <td colSpan={7}>
                                    <div className={'flex justify-center w-full'}>
                                        <h1>loading ...</h1>
                                    </div>
                                </td>
                            </tr>
                        }
                        {
                            library.length > 0 && !loading &&
                            <>
                                {
                                    library.map((library) =>
                                        <tr key={library.id}>
                                            <td className={'border-slate-700 border p-1'}>
                                                <PiAvatar image={library.image}/>
                                            </td>
                                            <td className={'border-slate-700 border p-1'}>{library.space.name}</td>
                                            <td className={'border-slate-700 border p-1'}>
                                                {library.title}
                                            </td>
                                            <td className={'border-slate-700 border p-1'}>
                                                {format(new Date(library.date), 'MM/dd/yyyy')}
                                            </td>
                                            <td className={'border-slate-700 border p-1'}>
                                                {format(new Date(library.publishDate), 'MM/dd/yyyy')}
                                            </td>
                                            <td className={'border-slate-700 border p-1'}>
                                                <div className={'flex justify-center w-full'}>
                                                    {
                                                        library.published &&
                                                        <PiBadge type={"success"} size={"large"} outline={true} rounded={"full"}>PUBLISHED</PiBadge>
                                                    }
                                                    {
                                                        !library.published &&
                                                        <PiBadge type={"danger"} size={"large"} outline={true} rounded={"full"}>NOT PUBLISHED</PiBadge>
                                                    }
                                                </div>
                                            </td>
                                            <td className={'border-slate-700 border p-1'}>
                                                <PiButton rounded={'rounded'} size={'extra small'} type={'success'} onClick={() => editForm(library)}>EDIT</PiButton>
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
