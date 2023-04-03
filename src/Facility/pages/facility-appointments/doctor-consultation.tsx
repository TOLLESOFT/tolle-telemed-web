import React, {useContext, useEffect, useRef, useState} from "react";
import {useLoaderData, useNavigate} from "react-router-dom";
import {AuthContext} from "../../../store/auth-provider";
import {ContextInterface} from "../../../shared/models/context-interface";
import {HttpProvider} from "../../../store/http-provider";
import {environment} from "../../../shared/environment";
import {PiLoader} from "../../../shared/components/pi-loader";
import {ApiResponse} from "../../../shared/models/ApiResponse";
import {BaseService} from "../../../shared/base.service";
import {finalize} from "rxjs";
import {HubConnection, HubConnectionBuilder, HubConnectionState} from "@microsoft/signalr";
import OT from "@opentok/client";
import {intervalToDuration} from "date-fns";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {PiDrawer, PiMessage} from "toll-ui-react";
import {DoctorPatientChat} from "./consultation-items/doctor-patient-chat";
import {Msg} from "../../../shared/models/message-type";

interface CallInfo {
    data?: any
}

interface SessionInfo {
    session?: any
    publisher?: any
    subscriber?: OT.Subscriber
    apiKey?: any
    sessionId?: any
    token?: any
}

interface CallSettings {
    useAudio?: boolean
    useVideo?: boolean
    currentMinute?: any
    currentSecond?: any
    timerInterval?: any
    timer?: any
    duration?: Duration
}

export function loader({params}: any) {
    return params.id;
}

export default function DoctorConsultation() {
    const appointmentId = useLoaderData();
    const navigate = useNavigate();
    const context = useContext(AuthContext);
    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false };
    const [auth, setAuth] = useState<ContextInterface>(getDefault);
    const endState = 'less than 3 minutes remaining';
    const [callInfo, setCallInfo] = useState<CallInfo>();
    const [sessionInfo, setSessionInfo] = useState<SessionInfo>();
    const [callSettings, setCallSettings] = useState<CallSettings>({ useVideo: true, useAudio: true});
    const pubEle = useRef(null);
    const [connected, setConnected] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [alertShown, setAlertShown] = useState<boolean>(false);
    const [show, setShow] = useState<boolean>(false);
    const [messages, setMessages] = useState<Msg[]>([]);
    const messageDialog: MessageProps = {
        open: false,
        message: '',
        type: "success"
    }
    const [openDialog, setOpenDialog] = useState(messageDialog);
    const [openChatPanel, setOpenChatPanel] = useState<boolean>(false);
    const [patientHubConnect, setPatientHubConnect] = useState<HubConnection>();
    const toggleChatPanel = () => {
        setOpenChatPanel( !openChatPanel);
    }

    const openMessageHandler = (options: MessageProps) => {
        setOpenDialog((prevState) => {
            return {...prevState, open: options.open, message: options.message, type: options.type }
        });
    }

    const closeMessageHandler = () => {
        setOpenDialog((prevState) => {
            return {...prevState, open: false }
        });
    }
    const toggleAudio = () => {
        callSettings.useAudio = !callSettings.useAudio;
        sessionInfo?.publisher.publishAudio(callSettings.useAudio);

        setCallSettings(prevState =>  {
            return { ...prevState, useAudio: callSettings.useAudio }
        })
    }

    const toggleVideo = () => {
        callSettings.useVideo = !callSettings.useVideo;
        sessionInfo?.publisher.publishVideo(callSettings.useVideo);

        setCallSettings(prevState =>  {
            return { ...prevState, useVideo: callSettings.useVideo }
        })
    }

    // const toggleCams = () => {
    //     const publish = sessionInfo?.publisher.cycleVideo();
    //     setSessionInfo(prevState => {
    //         return { ...prevState, publisher: publish }
    //     })
    // }

    const sendMessage = (chat: any, doctorId: any, patientId: any) => {
        if (patientHubConnect?.state === HubConnectionState.Connected) {
            (patientHubConnect as HubConnection).invoke('SendMessage', chat, doctorId).then(val => {
                console.log('mmm', val);
            })
        } else {
            (patientHubConnect as HubConnection).start().then(() => {
                (patientHubConnect as HubConnection).invoke('SendMessage', chat, doctorId).then(val => {
                    console.log('kkk', val);
                })
            })
        }
    }

    const getRoom = () => {
        setLoading(true);
        HttpProvider.get<ApiResponse<any>>(
            `Appointment/GetRoomToken/${appointmentId}`,
            BaseService.HttpHeaders()
        ).pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: (result) => {
                    setCallInfo(prevState => {
                        return { ...prevState, data: result.data }
                    });
                    // (auth.hubConnect as HubConnection).invoke('SendAppointmentNotification', result?.data.appointment.id)
                    // const allMessages = (auth.hubConnect as HubConnection).invoke('GetChat', result?.data.appointment.patient.id);
                    //
                    // allMessages.then((value) => {
                    //     const messageList: any[] = [];
                    //
                    //     value.forEach((val: any) => {
                    //         messageList.push({
                    //             text: val?.text,
                    //             from: val?.from,
                    //             time: val?.date,
                    //             userId: val?.userId,
                    //             msgType: val?.type,
                    //             id: val?.id,
                    //         });
                    //     });
                    //
                    //     setMessages([...messageList])
                    // });
                    //
                    // const url = `${environment.apiUrl}notificationHub?userId=${result?.data.appointment.patient.id}`;
                    // const hubConnect= new HubConnectionBuilder()
                    //     .withUrl(url)
                    //     .withAutomaticReconnect()
                    //     .build();
                    // hubConnect
                    //     .start()
                    //     .then(() => {
                    //         console.log('connected to patient');
                    //         setPatientHubConnect(hubConnect);
                    //     }).catch(err => {
                    //     alert('Error while establishing connection to patient ' + err);
                    // });
                }
            })
    }

    useEffect(() => {
        setAuth((prevState) => {
            return {...prevState, user: context.user, accessToken: context.accessToken, hubConnect: context.hubConnect }
        });
    }, [context]);

    // update auth value
    useEffect(() => {
        if (auth.accessToken?.token) {
            HttpProvider.apiUrl = environment.apiUrl;
            // console.log('state', auth.hubConnect);
            // (auth.hubConnect as HubConnection).on('MessagedReceived', (message) => {
            //     console.log(message);
            //     BaseService.currentMessage.next(message);
            // })
            getRoom();
        }
    }, [auth]);

    useEffect(() => {
        if (callInfo?.data) {
            let subscriber: OT.Subscriber;
            const session = OT.initSession(callInfo.data.key, callInfo.data.sessionId);
            const publisher = OT.initPublisher('publisher', {
                insertMode: 'append',
                width: '100%',
                height: '100%',
                style: {buttonDisplayMode: 'off'}
            });

            if (pubEle.current) {
                (pubEle.current as HTMLDivElement).classList.add('subscriber');
                (pubEle.current as HTMLDivElement).classList.remove('publisher');
            }

            session.on({

                streamCreated: (event: any) => {
                    const options = {insertMode: 'append', width: '100%', height: '100%'}
                    // @ts-ignore
                    subscriber = session.subscribe(event.stream, 'subscriber', options)

                    if (pubEle.current) {
                        (pubEle.current as HTMLDivElement).classList.remove('subscriber');
                        (pubEle.current as HTMLDivElement).classList.add('publisher');
                    }

                    setTimeout(() => {
                        setShow(true)
                        setConnected(true)
                    }, 2000)
                },

                streamDestroyed: (event: any) => {
                    if (pubEle.current) {
                        (pubEle.current as HTMLDivElement).classList.add('subscriber');
                        (pubEle.current as HTMLDivElement).classList.remove('publisher');
                    }

                    if (event.reason === 'networkDisconnected') {
                        // notification
                    } else {

                    }
                },

                sessionConnected: (event: any) => {
                    session.publish(publisher);

                    if (subscriber) {
                        if (pubEle.current) {
                            (pubEle.current as HTMLDivElement).classList.remove('subscriber');
                            (pubEle.current as HTMLDivElement).classList.add('publisher');
                        }
                    }
                    setLoading(false);
                    const timerInterval = setInterval(() => {
                        const time = intervalToDuration({
                            end: new Date(callInfo.data.appointment.endTime),
                            start: new Date()
                        })

                        setCallSettings(prevState => {
                            return { ...prevState, duration: time, timerInterval: timerInterval }
                        })
                    })
                },

                sessionDisconnected: (event: any) => {
                    alert(`Stream disconnected ended because ${event.reason}`);
                }
            })

            session.connect(callInfo.data.token, (error: any) => {
                if (error) {
                    console.log(`There was an error connecting to the session ${error}`);
                }
            })

            setSessionInfo(prevState =>  {
                return { ...prevState,session: session, subscriber: subscriber, publisher: publisher }
            })
        }
    }, [callInfo])


    useEffect(() => {
        return (() => {
            clearInterval(callSettings.timerInterval);
            sessionInfo?.session.unpublish(sessionInfo?.publisher);
            if (sessionInfo?.subscriber) {
                sessionInfo?.session.unsubscribe(sessionInfo?.subscriber);
            }

            patientHubConnect?.stop();
            sessionInfo?.session.disconnect()
        })
    }, [sessionInfo])



    return (
        <div className={'h-screen w-screen'}>
            {
                openDialog.open &&
                <PiMessage onClose={closeMessageHandler} message={openDialog.message} type={openDialog.type}/>
            }
            {
                openChatPanel &&
                <PiDrawer position={'right'} onClose={toggleChatPanel} title={'CHAT PANEL'}>
                    <DoctorPatientChat messages={messages} data={callInfo?.data?.appointment} onSendMessage={(message) => {
                        sendMessage(message, callInfo?.data?.appointment.doctor.id, callInfo?.data?.appointment.patient.id);
                    }}/>
                </PiDrawer>
            }
            <PiLoader loading={loading}/>
            <div className={'h-full w-full flex flex-col'}>
                <div className={'grow w-full h-full'}>
                    <div className={'flex flex-col w-full h-full'}>
                        <div className={'grid grid-cols-2 w-full h-full'}>
                            <div className={'w-full relative h-full p-4'} >
                                <div className={'w-full relative h-full rounded-3xl overflow-hidden'}>
                                    <div ref={pubEle} id="publisher" className="publisher rounded-2xl overflow-hidden shadow-2xl z-0"></div>
                                    <div id="subscriber" className="subscriber z-0"></div>
                                    <div className={'absolute bottom-0 left-0 right-0 z-10'}>
                                        <div className={'flex justify-center mb-5'}>
                                            <div className={'bg-green-100 text-green-600 px-4 py-1 rounded-lg text-base'}>
                                                {callSettings.duration?.minutes ?? '00'} : {callSettings.duration?.seconds ?? '00'}
                                            </div>
                                        </div>
                                        <div className={'flex w-full justify-center pb-4'}>
                                            <div className={'backdrop-blur-sm bg-gray-900/50 px-4 rounded-full h-20 flex items-center justify-center space-x-4'}>
                                                <button onClick={toggleAudio} className={'bg-white rounded-full w-12 h-12'}>
                                                    <i className={`fa-solid ${callSettings?.useAudio ? 'fa-microphone' : 'fa-microphone-slash'} text-xl text-blue-500`}></i>
                                                </button>
                                                <button className={'bg-red-500 rounded-full w-14 h-14'}>
                                                    <i className={'fa-solid fa-phone-slash text-xl text-white'}></i>
                                                </button>
                                                <button onClick={toggleVideo} className={'bg-white rounded-full w-12 h-12'}>
                                                    <i className={`fa-solid ${callSettings?.useVideo ? 'fa-video' : 'fa-video-slash'} text-xl text-blue-500`}></i>
                                                </button>
                                                {/*<button onClick={toggleChatPanel} className={'bg-white rounded-full w-12 h-12'}>*/}
                                                {/*    <i className={'fa-solid fa-comments text-xl text-blue-500'}></i>*/}
                                                {/*</button>*/}
                                                {/*<button className={'bg-white rounded-full w-12 h-12'}>*/}
                                                {/*    <i className={'fa-solid fa-camera-rotate text-xl text-blue-500'}></i>*/}
                                                {/*</button>*/}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={'overflow-auto w-full p-4'}>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
