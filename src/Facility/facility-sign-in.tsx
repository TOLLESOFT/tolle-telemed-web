import {useNavigate} from "react-router-dom";
import {PiButton, PiIconButton, PiInput, PiMessage} from "toll-ui-react";
import {useContext, useEffect, useState} from "react";
import {environment} from "../shared/environment";
import {LoginResponseModel} from "../shared/models/LoginResponseModel";
import {ApiResponse} from "../shared/models/ApiResponse";
import {BaseService} from "../shared/base.service";
import {MessageProps} from "toll-ui-react/lib/components/pi-message";
import {HttpProvider} from "../store/http-provider";
import {finalize} from "rxjs";
import {AuthContext} from "../store/auth-provider";
import {ContextInterface} from "../shared/models/context-interface";

export function FacilitySignIn() {
    const context = useContext(AuthContext);
    const getDefault: ContextInterface = {
        canLogout: () => {},
        canLogin: () => {},
        isAuthenticated: false };
    const [auth, setAuth] = useState<ContextInterface>(getDefault);
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
        HttpProvider.post<ApiResponse<LoginResponseModel>>('Account/Login',
            JSON.stringify(loginForm),
            BaseService.HttpHeaders())
            .pipe(finalize(() => setLoading(false)))
            .subscribe({
                next: (result) => {
                    if (result.status === 100) {
                        BaseService.setSessionData(result.data);
                        if (result.data.user?.role?.normalizedName !== 'SYSTEM ADMINISTRATOR') {
                            let found = false;
                            const routes = result.data?.permissions as any[];
                            BaseService.Menu.next(routes);
                            const getPath = routes.filter((x: any) => x.path === window.location.pathname);
                            if (getPath.length > 0) {
                                found = true;
                            } else {
                                routes.forEach((x: any) => {
                                    const getChild = x.children.filter((m: any) => m.path === window.location.pathname );
                                    if (getChild.length > 0) {
                                        found = true;
                                    }
                                });
                            }

                            if (!found) {
                                if (routes.length > 0) {
                                    if (!routes[0]?.path) {
                                        window.location.href = routes[0]?.children[0].path
                                    } else {
                                        const getRoute = routes.filter((m: any) => m.path);
                                        if (getRoute.length > 0) {
                                            window.location.href = getRoute[0].path;
                                        } else {
                                            window.location.href = routes[0]?.children[0].path
                                        }
                                    }
                                } else {
                                    window.location.href = routes[0]?.children[0].path
                                }
                            }
                        } else {
                            navigate('/facility/dashboard')
                        }
                    } else {
                        openMessageHandler({type: "error", message: result.message, open: true});
                    }
                }, error: (err) => {
                    openMessageHandler({type: "error", message: "An error occurred while trying to complete your request, please try again or contact support.", open: true});
                }
            })

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

    useEffect(() => {
        HttpProvider.apiUrl = environment.apiUrl;
    }, [])

    useEffect(() => {
        setAuth((prevState) => {
            return {...prevState, user: null, accessToken: null }
        });
    }, [context]);
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
                        size={"normal"}
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
                        size={"normal"}
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
