import React, {useEffect, useState} from "react";
import {LoginResponseModel} from "../shared/models/LoginResponseModel";
import {ContextInterface} from "../shared/models/context-interface";
import {BaseService} from "../shared/base.service";
import {HubConnection, HubConnectionBuilder} from "@microsoft/signalr";
import {environment} from "../shared/environment";

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

    const [auth, setAuth] = useState<ContextInterface>({ canLogout: logOutHandler, canLogin: loginHandler, isAuthenticated: false, allowedRoutes: [] });

    const [state, setState] = useState<ContextInterface>({ canLogout: logOutHandler, canLogin: loginHandler, isAuthenticated: false, allowedRoutes: [] });


    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
        let connect: HubConnection;
        let accessObj: LoginResponseModel = JSON.parse(localStorage.getItem(BaseService.key) as string) as LoginResponseModel;
        if (accessObj) {
            interval = setInterval(() => {
                const seconds = Math.round(BaseService.getTimeLeft(accessObj.accessToken?.expire, new Date()));
                if (seconds === 0) {
                    window.location.href = '/';
                }
            }, 3000);

            // const url = `${environment.apiUrl}notificationHub?userId=${accessObj.user?.id}`;
            //
            // connect = new HubConnectionBuilder()
            //     .withUrl(url)
            //     .withAutomaticReconnect()
            //     .build();
            // connect.start()
            //     .then(() => {
            //         console.log('connection started ...');
            //     }).catch( err => {
            //     console.log('Error while starting connection ' + err);
            // });

            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark');
            }
            setState((prevState) => {
                return { ...prevState,
                    accessToken: accessObj.accessToken,
                    isAuthenticated: true,
                    canLogin: loginHandler,
                    canLogout: logOutHandler,
                    user: accessObj.user,
                    allowedRoutes: accessObj.permissions
                }
            });
            return () => clearInterval(interval);
        }
    }, [auth]);

    useEffect(() => {
        // console.log('state', state);
        if ((state.allowedRoutes as any[]).length > 0) {
            BaseService.Menu.next(state.allowedRoutes as any[]);
        }
    }, [state])

    return (
      <AuthContext.Provider value={state}>
          {props.children}
      </AuthContext.Provider>
  )
}
