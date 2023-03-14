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
                    <div className="max-xl:w-full xl:w-full gap-4">
                        <div className="flex w-full h-full overflow-auto">
                            <div className={'flex-none w-[300px] bg-gray-200 dark:bg-gray-800 border-r dark:border-r-gray-800 p-2'}>
                                <div onClick={() => route('/facility/dashboard')} className={'flex space-x-2 items-center text-base dark:hover:text-slate-400 py-3 px-4 rounded-xl cursor-pointer'}>
                                    <i className={'pi pi-desktop text-base cursor-pointer'}></i>
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
