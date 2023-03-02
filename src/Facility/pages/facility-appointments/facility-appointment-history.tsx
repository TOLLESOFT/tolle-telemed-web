import {environment} from "../../../shared/environment";
import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../../store/auth-provider";
import {ContextInterface} from "../../../shared/models/context-interface";
import {ApiResponse} from "../../../shared/models/ApiResponse";
import {PiAvatar, PiBadge, PiButton} from "toll-ui-react";
import {format} from "date-fns";
import {PagedResponse} from "../../../shared/models/PagedResponse";
import {Facility} from "../../../shared/models/Facility";
import {Paging} from "../../../shared/models/paging";
import {Filter} from "../../../shared/models/filter";
import {PiPagination} from "../../../shared/components/pi-pagination";

export default function FacilityAppointmentHistory() {
    const url = environment.apiUrl;
    const context = useContext(AuthContext);
    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false };
    const [auth, setAuth] = useState<ContextInterface>(getDefault);
    const [appointments, setAppointments] = useState<Array<any>>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [paging, setPaging] = useState<Paging>({ pageSize: 10, pageNumber: 1, totalPages: 0, totalRecords: 0, currentSize: 0 });
    const [filter, setFilter] = useState<Filter>({});
    const getDataHandler = () => {
        setLoading(true);
        fetch(`${url}Appointment/GetAll?pageSize=${paging.pageSize}&pageNumber=${paging.pageNumber}`, {
            body: JSON.stringify(filter),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth?.accessToken?.token}`
            }
        }).then((response) => {
            response.json().then((result: PagedResponse<Array<any>>) => {
                const data: Array<any> = [];
                result.data.forEach((rate) => {
                    data.push(rate);
                });
                console.log(result);
                setAppointments(data);
                setPaging(prevState => {
                    return { ...prevState, pageSize: result.pageSize, totalPages: result.totalPages, totalRecords: result.totalRecords, currentSize: result.data.length}
                });
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
    }, [paging.pageSize, auth])

    useEffect(() => {
        if (auth.accessToken?.token) {
            getDataHandler();
        }
    }, [paging.pageNumber, auth])

    return (
        <>
            <div className={'flex flex-col w-full h-full space-y-4 p-2'}>
                <div className={'h-auto w-full flex justify-end'}>
                    <PiPagination
                        pageSize={paging.pageSize}
                        pageNumber={paging.pageNumber}
                        totalPages={paging.totalPages}
                        pageNumberChangeHandler={(e) => setPaging(prevState => {
                            return { ...prevState, pageNumber: e}
                        })}
                        pageSizeChangeHandler={(e) => setPaging(prevState => {
                            return { ...prevState, pageSize: e}
                        })}
                        totalRecords={paging.totalRecords}
                        currentSize={paging.currentSize}/>
                </div>
                <div className={'grow w-full h-full overflow-auto'}>
                    <table className={'border-collapse w-full text-sm'}>
                        <thead>
                        <tr className="noWrap">
                            <th className={'border border-slate-600'}></th>
                            <th className={'border border-slate-600'}>PATIENT</th>
                            <th className={'border border-slate-600'}>DATE</th>
                            <th className={'border border-slate-600'}>STATUS</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            loading &&
                            <tr>
                                <td colSpan={5}>
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
                                            <td className={'border-slate-700 border p-1'}>
                                                {format(new Date(appointment.startTime), 'MMMM d, yyyy hh:mm a')}
                                            </td>
                                            <td className={'border-slate-700 border p-1'}>
                                                {
                                                    appointment.states === 2 &&
                                                    <PiBadge type={"success"} size={"large"} outline={true}>COMPLETED</PiBadge>
                                                }
                                                {
                                                    appointment.states === 4 &&
                                                    <PiBadge type={"danger"} size={"large"} outline={true} >CANCELLED</PiBadge>
                                                }
                                                {
                                                    appointment.states === 5 &&
                                                    <PiBadge type={"warning"} size={"large"} outline={true} >EXPIRED</PiBadge>
                                                }
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
