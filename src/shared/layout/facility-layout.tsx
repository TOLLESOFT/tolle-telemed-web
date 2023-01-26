import {Outlet, useNavigate} from "react-router-dom";
import {FacilityLayoutBody} from "./facility-layout-body";

export function FacilityLayout() {

    const navigate = useNavigate();

    const route = (url: string) => {
        navigate(url);
    }

    return (
        <FacilityLayoutBody>
            <div className="flex flex-col w-full h-full">
                <div className="flex justify-center w-full h-full">
                    <div className="max-xl:w-full xl:w-11/12 2xl:w-9/12 gap-4">
                        <div className="grid lg:grid-cols-12 h-full relative w-full py-4 px-2">
                            <div className={'lg:columns-1 lg:col-span-3 max-lg:hidden p-2 border-r border-r-gray-800'}>
                                <div onClick={() => route('/facility/dashboard')} className={'flex space-x-2 items-center text-xl dark:hover:bg-gray-800 py-3 px-4 rounded-xl cursor-pointer'}>
                                    <i className={'pi pi-desktop text-2xl cursor-pointer'}></i>
                                    <span className={'cursor-pointer'}>Dashboard</span>
                                </div>
                                <div className={'flex space-x-2 items-center text-xl dark:hover:bg-gray-800 py-3 px-4 rounded-xl cursor-pointer'}>
                                    <i className={'pi pi-calendar text-2xl cursor-pointer'}></i>
                                    <span className={'cursor-pointer'}>Appointments</span>
                                </div>
                                <div className={'flex space-x-2 items-center text-xl dark:hover:bg-gray-800 py-3 px-4 rounded-xl cursor-pointer'}>
                                    <i className={'pi pi-calendar-plus text-2xl cursor-pointer'}></i>
                                    <span className={'cursor-pointer'}>My Schedule</span>
                                </div>
                                <div className={'flex space-x-2 items-center text-xl dark:hover:bg-gray-800 py-3 px-4 rounded-xl cursor-pointer'}>
                                    <i className={'pi pi-users text-2xl cursor-pointer'}></i>
                                    <span className={'cursor-pointer'}>User Management</span>
                                </div>
                                <div className={'flex space-x-2 items-center text-xl dark:hover:bg-gray-800 py-3 px-4 rounded-xl cursor-pointer'}>
                                    <i className={'pi pi-book text-2xl cursor-pointer'}></i>
                                    <span className={'cursor-pointer'}>Health Library</span>
                                </div>
                                <div onClick={() => route('/facility/settings/country')} className={'flex space-x-2 items-center text-xl dark:hover:bg-gray-800 py-3 px-4 rounded-xl cursor-pointer'}>
                                    <i className={'pi pi-cog text-2xl cursor-pointer'}></i>
                                    <span className={'cursor-pointer'}>Settings</span>
                                </div>
                                <div className={'flex space-x-2 items-center text-xl dark:hover:bg-gray-800 py-3 px-4 rounded-xl cursor-pointer'}>
                                    <i className={'pi pi-sliders-h text-2xl cursor-pointer'}></i>
                                    <span className={'cursor-pointer'}>Schedule Configuration</span>
                                </div>
                                <div className={'flex space-x-2 items-center text-xl dark:hover:bg-gray-800 py-3 px-4 rounded-xl cursor-pointer'}>
                                    <i className={'pi pi-building text-2xl cursor-pointer'}></i>
                                    <span className={'cursor-pointer'}>Facility Setup</span>
                                </div>
                                <div className={'flex space-x-2 items-center text-xl dark:hover:bg-gray-800 py-3 px-4 rounded-xl cursor-pointer'}>
                                    <i className={'pi pi-money-bill text-2xl cursor-pointer'}></i>
                                    <span className={'cursor-pointer'}>Pricing Setup</span>
                                </div>
                            </div>
                            <div className={'grow h-full lg:columns-4 lg:col-span-9 flex overflow-auto feed p-2'}>
                                <Outlet/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FacilityLayoutBody>
    )
}