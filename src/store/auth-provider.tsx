import React, {useEffect, useState} from "react";
import {LoginResponseModel} from "../shared/models/LoginResponseModel";
import {ContextInterface} from "../shared/models/context-interface";
import {BaseService} from "../shared/base.service";

export const AuthContext = React.createContext<ContextInterface>({
    canLogout: () => {},
    canLogin: (value: LoginResponseModel) => {},
    isAuthenticated: false });

export const AuthProvider = (props: any) => {
    const loginHandler = (value: LoginResponseModel) => {
        setAuth((prevState) => {
            return {...prevState, isAuthenticated: true, accessToken: value.accessToken, user: value.user}
        })
    }

    const logOutHandler = () => {
        setAuth((prevState) => {
            return {...prevState, isAuthenticated: false}
        });
        BaseService.clearSessionData();
        window.location.href = '/';
    }

    const [auth, setAuth] = useState<ContextInterface>({ canLogout: logOutHandler, canLogin: loginHandler, isAuthenticated: false });

    const [state, setState] = useState<ContextInterface>({ canLogout: logOutHandler, canLogin: loginHandler, isAuthenticated: false });

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        let accessObj: LoginResponseModel = JSON.parse(localStorage.getItem(BaseService.key) as string) as LoginResponseModel;
        if (accessObj) {
            interval = setInterval(() => {
                const seconds = Math.round( BaseService.getTimeLeft(accessObj.accessToken?.expire, new Date()));
                if (seconds === 0) {
                    window.location.href = '/';
                }
            }, 3000);
            setState((prevState) => {
                return { ...prevState, accessToken: accessObj.accessToken, isAuthenticated: true, canLogin: loginHandler, canLogout: logOutHandler, user: accessObj.user }
            });
            return () => clearInterval(interval);
        }
    }, [auth]);

    useEffect(() => {
        // console.log('state', state);
    }, [state])

    return (
      <AuthContext.Provider value={state}>
          {props.children}
      </AuthContext.Provider>
  )
}
