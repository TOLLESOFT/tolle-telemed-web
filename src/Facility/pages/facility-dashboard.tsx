import React from "react";
import {PiCalendar} from "../../shared/components/pi-calendar";
import {PiFullCalendar} from "../../shared/components/pi-full-calendar";


export function FacilityDashboard() {

    return (
        <>
            <div className="flex flex-col w-full h-full">
                <div className={'grow h-full lg:columns-4 lg:col-span-9 flex'}>
                    <PiFullCalendar />
                    {/*<PiCalendar disablePastDates={true} onChange={(e) => console.log(e)}/>*/}
                </div>
            </div>
        </>
    )
}
