import {useNavigate} from "react-router-dom";
import {PiButton, PiIconButton, PiInput, PiMessage} from "toll-ui-react";
import {useState} from "react";
import {environment} from "../shared/environment";
import {LoginResponseModel} from "../shared/models/LoginResponseModel";
import {ApiResponse} from "../shared/models/ApiResponse";
import {BaseService} from "../shared/base.service";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";

export function FacilitySignIn() {
    const navigate = useNavigate();
    const [loginForm, setLoginValues] = useState({userName: '', password: ''});
    const [loading, setLoading] = useState<boolean>(false);
    const [inValidEmail, setInValidEmail] = useState<boolean>(false);
    const [inValidPassword, setInValidPassword] = useState<boolean>(false);

    const messageDialog: MessageProps = {
        open: false,
        message: '',
        type: "success"
    }

    const [openDialog, setOpenDialog] = useState(messageDialog);

    const loginHandler = async () => {
        let errorCount = 0;
        if (!loginForm.userName) {
            errorCount ++;
            setInValidEmail(true);
        }
        if (!loginForm.password) {
            errorCount ++;
            setInValidPassword(true);
        }
        if (errorCount > 0) {
            return;
        }
        setLoading(true);
        const url = environment.apiUrl;
        fetch(`${url}Account/AccountLogin`, {
            method: 'POST',
            body: JSON.stringify(loginForm),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            response.json().then((result: ApiResponse<LoginResponseModel>) => {
                if (result.status === 200) {
                    // openMessageHandler({type: "success", message: result.message, open: true});
                    BaseService.setSessionData(result.data);
                    navigate('/facility/dashboard')
                } else {
                    openMessageHandler({type: "error", message: result.message, open: true});
                }
            }).catch((e) => {
                openMessageHandler({type: "error", message: e.statusMessage, open: true});
            }).finally(() => setLoading(false))
        }).catch((e) => {
            setLoading(false);
            openMessageHandler({type: "error", message: "An error occurred while trying to complete your request, please try again or contact support.", open: true});
        });
    }

    const emailInputOnChange = (event: any) => {
        setLoginValues((prevState) => {
            return {...prevState, userName: event}
        });
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

    const passwordInputOnChange = (event: any) => {
        setLoginValues((prevState) => {
            return {...prevState, password: event}
        });
    }

    return (
        <>
            {
                openDialog.open && <PiMessage onClose={closeMessageHandler} message={openDialog.message} type={openDialog.type}/>
            }
            <div className={'space-y-4 z-0'}></div>
            <form className={'space-y-4'}>
                <h1 className={'font-bold text-2xl'}>FOR FACILITY</h1>
                <PiIconButton onClick={() => {navigate('/')}} icon={'pi pi-arrow-left'} type={'primary'} size={'normal'} outline={true} rounded={'rounded'}/>
                <h1 className={'font-bold text-xl'}>Sign in with your email</h1>
                <div>
                    <PiInput
                        rounded={'rounded'}
                        name={'Email'}
                        invalid={inValidEmail}
                        label={'Enter your email'}
                        value={loginForm.userName}
                        onChange={emailInputOnChange}
                        required={true}
                        type={'email'}
                        placeholder={'Your email'} id={'email'}/>
                </div>
                <div>
                    <PiInput
                        rounded={'rounded'}
                        name={'Password'}
                        invalid={inValidPassword}
                        label={'Enter your password'}
                        required={true}
                        value={loginForm.password}
                        onChange={passwordInputOnChange}
                        type={'password'}
                        placeholder={'Your password'} id={'password'}/>
                </div>
                <div className={'pt-4'}>
                    <PiButton loading={loading} block={true} type={'primary'} size={'large'} rounded={'rounded'} onClick={loginHandler}>
                        Submit
                    </PiButton>
                </div>
            </form>
        </>
    )
}