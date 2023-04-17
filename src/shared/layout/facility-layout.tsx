import {Outlet, useNavigate} from "react-router-dom";
import {FacilityLayoutBody} from "./facility-layout-body";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../store/auth-provider";
import {ContextInterface} from "../models/context-interface";
import {BaseService} from "../base.service";
import {PiButton} from "toll-ui-react";

export function FacilityLayout() {
    const navigate = useNavigate();
    const context = useContext(AuthContext);
    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        allowedRoutes: [],
        isAuthenticated: false };
    const [auth, setAuth] = useState<ContextInterface>(getDefault);
    const [menu, setMenu] = useState<Array<any>>([])

    const checkRoute = (url: string):boolean => {
        const getPath = menu.filter((x: any) => x.path === url);
        return getPath.length > 0;
    }

    const route = (url: string, name?: string) => {
        if ( auth.user?.role?.normalizedName !== 'SYSTEM ADMINISTRATOR') {
            if (url) {
                const getPath = menu.filter((x: any) => x.path === url);
                if (getPath.length > 0) {
                    navigate(url);
                }
            } else {
                const getPath = menu.find((x: any) => x.title.toUpperCase() === name?.toUpperCase());
                if (getPath) {
                    navigate(getPath.children[0].path);
                }
            }
        } else {
            navigate(url);
        }
    }

    useEffect(() => {
        setAuth((prevState) => {
            return {...prevState, user: context.user, accessToken: context.accessToken, allowedRoutes: context.allowedRoutes }
        });
    }, [context]);

    // update auth value
    useEffect(() => {
        BaseService.Menu.subscribe({
            next: value => {
                setMenu([...value]);
            }
        })
    }, []);


    useEffect(() => {
        if (menu.length > 0) {
            if (auth.user?.role?.normalizedName !== 'SYSTEM ADMINISTRATOR') {
                let found = false;
                const getPath = menu.filter((x: any) => x.path === window.location.pathname);
                if (getPath.length > 0) {
                    found = true;
                } else {
                    menu.forEach((x: any) => {
                        const getChild = x.children.filter((m: any) => m.path === window.location.pathname );
                        if (getChild.length > 0) {
                            found = true;
                        }
                    });
                }

                if (!found) {
                    if (menu.length > 0) {
                        if (!menu[0]?.path) {
                            window.location.href = menu[0]?.children[0].path
                        } else {
                            const getRoute = menu.filter((m: any) => m.path);
                            if (getRoute.length > 0) {
                                window.location.href = getRoute[0].path;
                            } else {
                                window.location.href = menu[0]?.children[0].path
                            }
                        }
                    } else {
                        window.location.href = '/'
                    }
                }
            }
        }
    })

    return (
        <FacilityLayoutBody>
            <div className="flex flex-col w-full h-full">
                <div className="flex justify-center w-full h-full">
                    <div className="max-xl:w-full xl:w-full gap-4">
                        <div className="flex w-full h-full overflow-auto">
                            <div className={'flex-none w-[300px] bg-gray-200 dark:bg-gray-800 border-r dark:border-r-gray-800 p-2'}>
                                <div className={'flex flex-col w-full h-full'}>
                                    <div className={'grow w-full h-full'}>
                                        {
                                            auth.user?.role?.normalizedName !== 'SYSTEM ADMINISTRATOR' &&
                                            menu.map((item) =>
                                                <div key={item.id}>
                                                    {
                                                        checkRoute(item.path) &&
                                                        <div onClick={() => route(item.path, item.title)} className={'flex space-x-2 items-center text-base dark:hover:text-slate-400 py-3 px-4 rounded-xl cursor-pointer'}>
                                                            <i className={`${item.icon} text-base cursor-pointer`}></i>
                                                            <span className={'cursor-pointer'}>{item.title}</span>
                                                        </div>
                                                    }
                                                </div>
                                            )
                                        }
                                        {
                                            auth.user?.role?.normalizedName === 'SYSTEM ADMINISTRATOR' &&
                                            <>
                                                <div onClick={() => route('/facility/dashboard')} className={'flex space-x-2 items-center text-base dark:hover:text-slate-400 py-3 px-4 rounded-xl cursor-pointer'}>
                                                    <i className={'pi pi-calendar text-base cursor-pointer'}></i>
                                                    <span className={'cursor-pointer'}>Dashboard</span>
                                                </div>
                                                <div onClick={() => route('/facility/appointments/pending')} className={'flex space-x-2 items-center text-base dark:hover:text-slate-400 py-3 px-4 rounded-xl cursor-pointer'}>
                                                    <i className={'pi pi-calendar text-base cursor-pointer'}></i>
                                                    <span className={'cursor-pointer'}>Appointments</span>
                                                </div>
                                                <div onClick={() => route('/facility/my-schedule')} className={'flex space-x-2 items-center text-base dark:hover:text-slate-400 py-3 px-4 rounded-xl cursor-pointer'}>
                                                    <i className={'pi pi-calendar-plus text-base cursor-pointer'}></i>
                                                    <span className={'cursor-pointer'}>My Schedule</span>
                                                </div>
                                                <div onClick={() => route('facility/roles')} className={'flex space-x-2 items-center text-base dark:hover:text-slate-400 py-3 px-4 rounded-xl cursor-pointer'}>
                                                    <i className={'pi pi-users text-base cursor-pointer'}></i>
                                                    <span className={'cursor-pointer'}>User Management</span>
                                                </div>
                                                <div onClick={() => route('home-care/communities')} className={'flex space-x-2 items-center text-base dark:hover:text-slate-400 py-3 px-4 rounded-xl cursor-pointer'}>
                                                    <i className={'pi pi-home text-base cursor-pointer'}></i>
                                                    <span className={'cursor-pointer'}>Home Care Management</span>
                                                </div>
                                                <div onClick={() => route('facility/patients')} className={'flex space-x-2 items-center text-base dark:hover:text-slate-400 py-3 px-4 rounded-xl cursor-pointer'}>
                                                    <i className={'pi pi-user text-base cursor-pointer'}></i>
                                                    <span className={'cursor-pointer'}>Patient Management</span>
                                                </div>
                                                <div onClick={() => route('facility/health-library')} className={'flex space-x-2 items-center text-base dark:hover:text-slate-400 py-3 px-4 rounded-xl cursor-pointer'}>
                                                    <i className={'pi pi-book text-base cursor-pointer'}></i>
                                                    <span className={'cursor-pointer'}>Health Library</span>
                                                </div>
                                                <div onClick={() => route('/facility/settings/country')} className={'flex space-x-2 items-center text-base dark:hover:text-slate-400 py-3 px-4 rounded-xl cursor-pointer'}>
                                                    <i className={'pi pi-cog text-base cursor-pointer'}></i>
                                                    <span className={'cursor-pointer'}>Settings</span>
                                                </div>
                                                <div onClick={() => route('/facility/schedule-configuration')} className={'flex space-x-2 items-center text-base dark:hover:text-slate-400 py-3 px-4 rounded-xl cursor-pointer'}>
                                                    <i className={'pi pi-sliders-h text-base cursor-pointer'}></i>
                                                    <span className={'cursor-pointer'}>Schedule Configuration</span>
                                                </div>
                                                <div onClick={() => route('/facility/setup')} className={'flex space-x-2 items-center text-base dark:hover:text-slate-400 py-3 px-4 rounded-xl cursor-pointer'}>
                                                    <i className={'pi pi-building text-base cursor-pointer'}></i>
                                                    <span className={'cursor-pointer'}>Facility Setup</span>
                                                </div>
                                                <div onClick={() => route('facility/pricing')} className={'flex space-x-2 items-center text-base dark:hover:text-slate-400 py-3 px-4 rounded-xl cursor-pointer'}>
                                                    <i className={'pi pi-money-bill text-base cursor-pointer'}></i>
                                                    <span className={'cursor-pointer'}>Pricing Setup</span>
                                                </div>
                                                <div onClick={() => route('facility/modules')} className={'flex space-x-2 items-center text-base dark:hover:text-slate-400 py-3 px-4 rounded-xl cursor-pointer'}>
                                                    <i className={'pi pi-lock text-base cursor-pointer'}></i>
                                                    <span className={'cursor-pointer'}>Modules Setup</span>
                                                </div>
                                            </>
                                        }
                                    </div>
                                    <div className={'h-auto px-4'}>
                                        <PiButton onClick={context.canLogout} block={true} type={'primary'} size={'small'} rounded={'rounded'}>
                                            Log Out
                                        </PiButton>
                                    </div>
                                </div>
                            </div>
                            <div className={'grow h-full flex overflow-auto feed'}>
                                <Outlet/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FacilityLayoutBody>
    )
}

