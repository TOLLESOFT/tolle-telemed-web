import {Outlet, useNavigate} from "react-router-dom";

export default function HealthLibraryOutlet() {
    const navigate = useNavigate();

    const route = (url: string) => {
        navigate(url);
    }
    return (
        <>
            <div className="flex flex-col w-full h-full">
                <div className="flex justify-center w-full h-full">
                    <div className="h-full relative w-full flex">
                        <div className={'grow h-full overflow-auto feed p-2'}>
                            <Outlet/>
                        </div>
                        <div className={'flex-none w-[300px] space-y-2 p-2 border-l-gray-200 border-l dark:border-l-gray-800 overflow-auto'}>
                            <div onClick={() => route('/facility/health-topics')} className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer'}>
                                <span className={'cursor-pointer'}>Topics</span>
                            </div>
                            <div onClick={() => route('/facility/health-library')} className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer'}>
                                <span className={'cursor-pointer'}>Library</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
