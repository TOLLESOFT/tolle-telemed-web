import React from "react";
import { PiDatepicker } from "../../shared/components/pi-datepicker";
import {PiTimepicker} from "../../shared/components/pi-timepicker";


export function FacilityDashboard() {

    return (
        <>
            <div className="flex flex-col w-full h-full">
                <div className={'grow h-full lg:columns-4 lg:col-span-9 flex'}>
                    <div className={'w-96 space-y-4'}>
                        <PiDatepicker
                            onValueChange={(e) => console.log(e)}
                            invalid={true}
                            required={true}
                            readOnly={false}
                            label={'Date'}
                            value={new Date()}
                            rounded={"rounded"}
                            disablePastDates={true}/>
                        {/*<PiCalendar/>*/}

                        <PiTimepicker
                            onValueChange={(e) => console.log(e)}
                            invalid={true}
                            required={true}
                            label={'Time'}
                            rounded={"rounded"}
                           />
                        {/*<PiCalendar/>*/}
                    </div>
                </div>
            </div>
        </>
    )
}
