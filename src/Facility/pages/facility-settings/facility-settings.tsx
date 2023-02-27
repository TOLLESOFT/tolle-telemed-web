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
                    <div className="h-full relative w-full flex">
                        <div className={'grow h-full overflow-auto feed p-2'}>
                            <Outlet/>
                        </div>
                        <div className={'flex-none w-[300px] space-y-2 p-2 border-l-gray-200 border-l dark:border-l-gray-800 overflow-auto'}>
                            <div onClick={() => route('/facility/settings/country')} className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer'}>
                                <span className={'cursor-pointer'}>Country</span>
                            </div>
                            <div onClick={() => route('/facility/settings/specialty')} className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer'}>
                                <span className={'cursor-pointer'}>Specialties</span>
                            </div>
                            <div onClick={() => route('facility/settings/blood-group')} className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer'}>
                                <span className={'cursor-pointer'}>Blood Group</span>
                            </div>
                            <div className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer'}>
                                <span className={'cursor-pointer'}>General Configuration</span>
                            </div>
                            <div onClick={() => route('facility/settings/import-questions')} className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer'}>
                                <span className={'cursor-pointer'}>Import On Direct Questions</span>
                            </div>
                            <div onClick={() => route('facility/settings/diagnoses')} className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer'}>
                                <span className={'cursor-pointer'}>Import Diagnosis</span>
                            </div>
                            <div onClick={() => route('facility/settings/medical-history')} className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer'}>
                                <span className={'cursor-pointer'}>Import Medical History Type</span>
                            </div>
                            <div onClick={() => route('facility/settings/drugs')} className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer'}>
                                <span className={'cursor-pointer'}>Import Drugs</span>
                            </div>
                            <div onClick={() => route('facility/settings/exam-categories')} className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer'}>
                                <span className={'cursor-pointer'}>Import Exam Systems</span>
                            </div>
                            <div onClick={() => route('facility/settings/item-frequencies')} className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer'}>
                                <span className={'cursor-pointer'}>Import Item Frequencies</span>
                            </div>
                            <div onClick={() => route('facility/settings/lab-investigations')} className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer'}>
                                <span className={'cursor-pointer'}>Import Lab Investigations</span>
                            </div>
                            <div onClick={() => route('facility/settings/sample-types')} className={'flex space-x-2 items-center text-base dark:hover:bg-gray-800 px-2 py-1 rounded-lg cursor-pointer'}>
                                <span className={'cursor-pointer'}>Import Lab Sample Types</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
