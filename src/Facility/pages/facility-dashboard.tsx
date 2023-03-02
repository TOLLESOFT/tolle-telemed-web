import React from "react";
import {PiCalendar} from "../../shared/components/pi-calendar";


export function FacilityDashboard() {
    return (
        <>
            <div className="flex flex-col w-full h-full">
                <div className={'grow h-full lg:columns-4 lg:col-span-9 flex'}>
                    {/*<PiFullCalendar />*/}
                    <PiCalendar/>
                </div>
            </div>
        </>
    )
}
