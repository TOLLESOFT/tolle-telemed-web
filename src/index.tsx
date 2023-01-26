import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import './index.css';
import 'toll-ui-react/lib/index.scss'
import {AuthProvider} from "./store/auth-provider";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {Main} from "./Main";
import {AuthLayout} from "./shared/layout/auth-layout";
import {FacilitySignIn} from "./Facility/facility-sign-in";
import {FacilityLayout} from "./shared/layout/facility-layout";
import {FacilityDashboard} from "./Facility/pages/facility-dashboard";
import FacilitySettings from "./Facility/pages/facility-settings/facility-settings";
import CountrySetup from "./Facility/pages/facility-settings/country-setup";


const router = createBrowserRouter([
    {
        path: '/',
        element: <AuthLayout/>,
        children: [
            {
            path: '/',
            element: <Main/>
            },
            {
                path: '/facility/sign-in',
                element: <FacilitySignIn/>
            }
        ]
    },
    {
        element: <FacilityLayout/>,
        children: [
            {
                path: 'facility/dashboard',
                element: <FacilityDashboard/>
            },
            {
                element: <FacilitySettings/>,
                children: [
                    {
                        path: 'facility/settings/country',
                        element: <CountrySetup/>
                    }
                ]
            }
        ]
    }
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AuthProvider>
        <RouterProvider router={router}/>
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
