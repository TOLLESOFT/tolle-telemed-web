import {Outlet, useNavigate} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../../store/auth-provider";
import {ContextInterface} from "../../../shared/models/context-interface";

export default function FacilityHomecareOutlet() {
    const navigate = useNavigate();
    const context = useContext(AuthContext);
    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        allowedRoutes: [],
        isAuthenticated: false };
    const [auth, setAuth] = useState<ContextInterface>(getDefault);
    const [menu, setMenu] = useState<Array<any>>([])

    const checkRoute = (url: string) :boolean => {
        const getPath = menu.filter((x: any) => x.path === url);
        return getPath.length > 0;
    }

    const route = (url: string) => {
        if (auth.user?.role?.normalizedName !== 'SYSTEM ADMINISTRATOR') {
            if (url) {
                const getPath = menu.filter((x: any) => x.path === url);
                if (getPath.length > 0) {
                    navigate(url);
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

    useEffect(() => {
        if ((auth.allowedRoutes as any[]).length > 0) {
            const routes = (auth.allowedRoutes as any[]).find(u => u.title.toUpperCase() === 'HEALTH LIBRARY');
            setMenu([...routes.children]);
        }
    }, [auth.allowedRoutes]);

    return (
        <>
            <div className="flex flex-col w-full h-full">
                <div className="flex justify-center w-full h-full">
                    <div className="h-full relative w-full flex">
                        <div className={'grow h-full overflow-auto feed p-2'}>
                            <Outlet/>
                        </div>
                        <div className={'flex-none w-[300px] space-y-2 p-2 border-l-gray-200 border-l dark:border-l-gray-800 overflow-auto'}>
                            {
                                auth.user?.role?.normalizedName !== 'SYSTEM ADMINISTRATOR' &&
                                menu.map((item) =>
                                    <div key={item.id}>
                                        {
                                            checkRoute(item.path) &&
                                            <div onClick={() => route(item.path)} className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer'}>
                                                <span className={'cursor-pointer'}>{item.title}</span>
                                            </div>
                                        }
                                    </div>
                                )
                            }
                            {
                                auth.user?.role?.normalizedName === 'SYSTEM ADMINISTRATOR' &&
                                <>
                                    <div onClick={() => route('/home-care/communities')} className={`flex space-x-2 ${window.location.pathname === '/home-care/communities' && 'bg-blue-400'} items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer`}>
                                        <span className={'cursor-pointer'}>Communities</span>
                                    </div>
                                    <div onClick={() => route('/home-care/poly-kiosks')} className={`flex space-x-2 ${window.location.pathname === '/home-care/poly-kiosks' && 'bg-blue-400'} items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer`}>
                                        <span className={'cursor-pointer'}>Poly Kiosks</span>
                                    </div>
                                    <div onClick={() => route('/home-care/activities')} className={`flex space-x-2 ${window.location.pathname === '/home-care/activities' && 'bg-blue-400'} items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer`}>
                                        <span className={'cursor-pointer'}>Activities</span>
                                    </div>
                                    <div onClick={() => route('/home-care/teams')} className={`flex space-x-2 ${window.location.pathname === '/home-care/teams' && 'bg-blue-400'} items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer`}>
                                        <span className={'cursor-pointer'}>Teams</span>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
