import {useEffect, useRef, useState} from "react";
import {MessageType, Msg} from "../../../../shared/models/message-type";
import {BaseService} from "../../../../shared/base.service";
import {PiAvatar, PiButton, PiIconButton, PiTextArea} from "toll-ui-react";

export const DoctorPatientChat = (props: { messages: Msg[], data: any, onSendMessage: (message: Msg) => void}) => {
    const [messages, setMessages] = useState<Msg[]>([]);
    const [message, setMessage] = useState<any>();
    const [bottom, setBottom] = useState<boolean>(false);
    const scrollElement = useRef(null);

    const sendMessage = () => {
        if (!String(message).trim()) {
            return;
        }

        const newMessage: Msg = {
            text: message,
            from: 'me',
            time: '',
            userId: props.data.patient.id,
            msgType: MessageType.TEXT,
            id: null,
        };

        messages.push(newMessage);
        setMessages([...messages]);
        props.onSendMessage(newMessage);
        setMessage('')
    }

    useEffect(() => {
        BaseService.currentMessage.subscribe((message) => {
            const find = messages.find(u => u.id === message.id);
            if (!find) {
                const messageList = messages;
                messageList.push({
                    text: message.text,
                    from: message.from,
                    time: message.time,
                    userId: message.userId,
                    msgType: message.msgType,
                    id: message.id
                });

                setMessages([...messageList]);
            }
        })
    }, [])

    useEffect(() => {
        setMessages([...props.messages])
    }, [props.messages])

    useEffect(() => {
        setBottom(false);
    }, [messages])

    useEffect(() => {
        if (!bottom) {
            const ele = (scrollElement.current as unknown as HTMLElement);
            const pageBottom = ele.scrollHeight;
            ele.scroll({top: pageBottom, left: 0, behavior: "smooth"});
            setTimeout(() => {
                setBottom(true)
            }, 1000)
        }
    }, [bottom, scrollElement.current])
    return (
        <div className="flex flex-col h-full">
            <div className="border-b dark:border-b-gray-700 h-auto">
                <div className={'flex space-x-4 px-4 py-2 items-center h-full'}>
                    <PiAvatar image={props.data?.patient?.image}/>
                    <h1 className={'text-xl font-bold'}>{props.data?.patient?.firstName} {props.data?.patient?.lastName}</h1>
                </div>
            </div>

            <div className={'grow h-auto'}>
                <div className="bg-gray-100 dark:bg-gray-800 relative h-full">
                    <div className={'absolute w-full bottom-0 left-0 right-0 max-h-full overflow-auto'} ref={scrollElement}>
                        {
                            messages.map((message) =>
                                <div key={message.id ?? BaseService.uuid()} className={`flex ${message.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`rounded-3xl ${message.from === 'me' ? 'rounded-br-none' : 'rounded-bl-none'} p-2 px-4 bg-blue-300 dark:bg-blue-800 m-2 animate__animated animate__fadeIn max-w-[80%]`}>
                                        <span className={'text-base'}>{message.text}</span>
                                    </div>
                                </div>)
                        }
                    </div>
                </div>
            </div>
            <div className={'h-24 border-t dark:border-t-gray-700 flex px-4 py-2 space-x-4 w-full justify-between items-center'}>
                <div className={'w-full'}>
                    <PiTextArea id={'chat'} onChange={(event) => {
                        setMessage(event);
                    }} value={message} rounded={"rounded"} rows={2}/>
                </div>
                <PiButton rounded={"rounded"} type={"primary"} disabled={!message} size={"large"} onClick={sendMessage}>SEND</PiButton>
            </div>
        </div>
    )
}
