import {environment} from "../../../shared/environment";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../../store/auth-provider";
import {ContextInterface} from "../../../shared/models/context-interface";
import {ApiResponse} from "../../../shared/models/ApiResponse";
import {PiAvatar, PiButton} from "toll-ui-react";
import {format} from "date-fns";

export default function FacilityAppointmentReview() {
    const url = environment.apiUrl;
    const context = useContext(AuthContext);
    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false };
    const [auth, setAuth] = useState<ContextInterface>(getDefault);
    const [appointments, setAppointments] = useState<Array<any>>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const getDataHandler = () => {
        setLoading(true);
        fetch(`${url}Appointment/GetPendingReviewAppointments`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<Array<any>>) => {
                setAppointments(result.data);

            }).finally(() => {
                setLoading(false);
            });

        }).catch((reason) => {

        });
    }


    useEffect(() => {
        setAuth((prevState) => {
            return {...prevState, user: context.user, accessToken: context.accessToken }
        });
    }, [context]);

    useEffect(() => {
        if (auth.accessToken?.token) {
            getDataHandler();
        }
    }, [auth])

    return (
        <>
            <div className={'flex flex-col w-full h-full space-y-4 p-2'}>
                <div className={'grow w-full h-full overflow-auto'}>
                    <table className={'border-collapse w-full text-sm'}>
                        <thead>
                        <tr className="noWrap">
                            <th className={'border border-slate-600'}></th>
                            <th className={'border border-slate-600'}>PATIENT</th>
                            <th className={'border border-slate-600'}>TIME</th>
                            <th className={'border border-slate-600'}></th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            loading &&
                            <tr>
                                <td colSpan={3}>
                                    <div className={'flex justify-center w-full'}>
                                        <h1>loading ...</h1>
                                    </div>
                                </td>
                            </tr>
                        }
                        {
                            appointments.length > 0 && !loading &&
                            <>
                                {
                                    appointments.map((appointment) =>
                                        <tr key={appointment.id}>
                                            <td className={'border-slate-700 border p-1'}>
                                                <PiAvatar image={appointment.patient?.image}/>
                                            </td>
                                            <td className={'border-slate-700 border p-1'}>{appointment.patient?.firstName} {appointment.patient?.lastName}</td>
                                            <td className={'border-slate-700 border p-1'}>{format(new Date(appointment.startTime), 'hh:mm a')}</td>
                                            <td className={'border-slate-700 border p-1'}>
                                                <PiButton rounded={'rounded'} size={'extra small'} type={'success'} onClick={() => {}}>START CONSULTATION</PiButton>
                                            </td>
                                        </tr>
                                    )
                                }
                            </>
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
