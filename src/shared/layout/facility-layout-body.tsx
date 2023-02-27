import {useContext, useEffect} from "react";
import {AuthContext} from "../../store/auth-provider";
import {Link, useNavigate} from "react-router-dom";
import {BaseService} from "../base.service";
import {LoginResponseModel} from "../models/LoginResponseModel";
import {PiAvatar, PiButton, PiIconButton} from "toll-ui-react";

export const FacilityLayoutBody = (props: any) => {
    const context = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
    }, [context]);

    useEffect(() => {
        const data = BaseService.getSessionData();
        if (!data) {
            navigate('/');
        } else {
            if ((data as LoginResponseModel).user?.role?.name.toUpperCase() === 'PATIENT') {
                BaseService.clearSessionData();
                navigate('/');
            } else {
                context.canLogin(data as LoginResponseModel);
            }
        }
    }, []);


    return (
        <>
            <div className="h-screen w-screen dark:bg-gray-800/50 overflow-auto">
                <div className="flex flex-col h-full w-full">
                    <div className="h-[95px] border bg-white dark:bg-gray-800 dark:border-gray-800 w-full px-5">
                        <div className="lg:block max-lg:hidden w-full h-full">
                            <div className="w-full h-full flex justify-between">
                                <div className="h-full flex space-x-5">
                                    <h1 className="h-full flex flex-wrap content-center text-2xl font-bold leading-3 text-gray-600 dark:text-white">
                                        tollecare
                                    </h1>
                                </div>

                                <div className="h-full flex space-x-3">
                                    {
                                        props.showSearch &&
                                        <div className="flex flex-wrap content-center">
                                            <div
                                                className="flex justify-between border border-gray-300 dark:border-white px-2 py-1.5 items-center rounded-xl text-gray-300 dark:text-white w-[150px]">
                                                <label className="leading-3">Search</label>
                                                <i className="pi pi-search"></i>
                                            </div>
                                        </div>
                                    }
                                    <Link className="h-full flex flex-wrap content-center" to={'/account/profile'}>
                                        <div className={'flex items-center space-x-2'}>
                                            <PiAvatar image={context?.user?.image}/>
                                            <span className={'text-base font-bold uppercase leading-3 cursor-pointer text-gray-600 dark:text-white'}>
                                                {context?.user?.firstName} {context?.user?.lastName}
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="lg:hidden w-full h-full">
                            <div className="h-full flex items-center justify-between">
                                <div className="flex flex-wrap content-center">
                                    <div className={'space-x-4 flex items-center'}>
                                        {
                                            props.showBackButton &&
                                            <PiIconButton onClick={() => navigate(-1)} size={'small'} icon={'pi pi-arrow-left'}/>
                                        }
                                        <h1 className="h-full flex flex-wrap content-center text-base font-bold leading-3 text-gray-600 dark:text-white">
                                            tollecare
                                        </h1>
                                    </div>
                                </div>
                                <div className="h-full flex space-x-3">
                                    {
                                        props.showSearch &&
                                        <div className="flex flex-wrap content-center">
                                            <i className="pi pi-search"></i>
                                        </div>
                                    }
                                    <Link to={'/account'} className="h-full flex flex-wrap content-center">
                                        <PiAvatar image={context?.user?.image}/>
                                    </Link>
                                    <div className="h-full flex flex-wrap content-center">
                                        <PiButton onClick={context.canLogout} type={'danger'} size={'small'} rounded={'rounded'}>Log out</PiButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grow h-full overflow-auto">
                        {props.children}
                    </div>
                </div>
            </div>

        </>
    );

}
