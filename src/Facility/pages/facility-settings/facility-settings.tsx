import {Outlet, useNavigate} from "react-router-dom";

export default function FacilitySettings(){
    const navigate = useNavigate();

    const route = (url: string) => {
        navigate(url);
    }
    return (
        <>
            <div className="flex flex-col w-full h-full">
                <div className="flex justify-center w-full h-full">
                    <div className="grid lg:grid-cols-12 h-full relative w-full py-4 px-2">
                        <div className={'grow h-full lg:columns-4 lg:col-span-9 flex overflow-auto feed p-2'}>
                            <Outlet/>
                        </div>
                        <div className={'lg:columns-1 lg:col-span-3 max-lg:hidden p-2 border-l border-l-gray-800'}>
                            <div className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 p-3 rounded-xl cursor-pointer'}>
                                <span className={'cursor-pointer'}>Country</span>
                            </div>
                            <div className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 p-3 rounded-xl cursor-pointer'}>
                                <span className={'cursor-pointer'}>Specialities</span>
                            </div>
                            <div className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 p-3 rounded-xl cursor-pointer'}>
                                <span className={'cursor-pointer'}>Blood Group</span>
                            </div>
                            <div className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 p-3 rounded-xl cursor-pointer'}>
                                <span className={'cursor-pointer'}>General Configuration</span>
                            </div>
                            <div className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 p-3 rounded-xl cursor-pointer'}>
                                <span className={'cursor-pointer'}>Import On Direct Questions</span>
                            </div>
                            <div className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 p-3 rounded-xl cursor-pointer'}>
                                <span className={'cursor-pointer'}>Import Diagnosis</span>
                            </div>
                            <div className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 p-3 rounded-xl cursor-pointer'}>
                                <span className={'cursor-pointer'}>Import Medical History Type</span>
                            </div>
                            <div className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 p-3 rounded-xl cursor-pointer'}>
                                <span className={'cursor-pointer'}>Import Exam Systems</span>
                            </div>
                            <div className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 p-3 rounded-xl cursor-pointer'}>
                                <span className={'cursor-pointer'}>Import Drugs</span>
                            </div>
                            <div className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 p-3 rounded-xl cursor-pointer'}>
                                <span className={'cursor-pointer'}>Import Item Frequencies</span>
                            </div>
                            <div className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 p-3 rounded-xl cursor-pointer'}>
                                <span className={'cursor-pointer'}>Import Lab Investigations</span>
                            </div>
                            <div className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 p-3 rounded-xl cursor-pointer'}>
                                <span className={'cursor-pointer'}>Import Lab Sample Types</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}