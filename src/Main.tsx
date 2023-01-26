import {useNavigate} from "react-router-dom";
import {PiButton} from "toll-ui-react";
import './index.css';
export function Main(){
    const navigate = useNavigate();

    return (
        <>
            <div className={'space-y-4 z-0'}></div>
            <div className={'space-y-4'}>
                <h1 className={'font-bold text-xl uppercase'}>Sign in as</h1>
                <div className={'divide-y dark:divide-gray-700'}>
                    <div className={'py-4'}>
                        <PiButton block={true} type={'primary'} size={'large'} rounded={'rounded'} onClick={() => {navigate('/facility/sign-in')}}>
                            A FACILITY
                        </PiButton>
                    </div>
                    <div className={'py-4'}>
                        <PiButton block={true} type={'primary'} size={'large'} rounded={'rounded'} onClick={() => {navigate('/sign-in')}}>
                            A USER
                        </PiButton>
                    </div>
                </div>
            </div>
        </>
    )
}