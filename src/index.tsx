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
import SpecialtySetup from "./Facility/pages/facility-settings/specialty-setup";
import BloodGroupSetup from "./Facility/pages/facility-settings/blood-group-setup";
import OnDirectQuestionsSetup from "./Facility/pages/facility-settings/on-direct-questions-setup";
import DiagnosesSetup from "./Facility/pages/facility-settings/diagnoses-setup";
import MedicalHistorySetup from "./Facility/pages/facility-settings/medical-history-setup";
import DrugSetup from "./Facility/pages/facility-settings/drug-setup";
import ExamCategoriesSetup from "./Facility/pages/facility-settings/exam-categories-setup";
import ItemFrequencySetup from "./Facility/pages/facility-settings/item-frequency-setup";
import LabTestsSetup from "./Facility/pages/facility-settings/lab-tests-setup";
import SampleTypesSetup from "./Facility/pages/facility-settings/sample-types-setup";
import FacilitySetup from "./Facility/pages/facility-setup";
import FacilityPricing from "./Facility/pages/facility-pricing";
import FacilityHealthLibrary from "./Facility/pages/facility-health-library/facility-health-library";
import HealthLibraryOutlet from "./Facility/pages/facility-health-library/health-library-outlet";
import HealthLibraryTopics from "./Facility/pages/facility-health-library/health-library-topics";
import UserManagementOutlet from "./Facility/pages/facility-user-management/user-management-outlet";
import UserRoles from "./Facility/pages/facility-user-management/user-roles";


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
                element: <FacilityDashboard />
            },
            {
                element: <FacilitySettings />,
                children: [
                    {
                        path: 'facility/settings/country',
                        element: <CountrySetup />
                    },
                    {
                        path: 'facility/settings/specialty',
                        element: <SpecialtySetup />
                    },
                    {
                        path: 'facility/settings/blood-group',
                        element: <BloodGroupSetup />
                    },
                    {
                        path: 'facility/settings/import-questions',
                        element: <OnDirectQuestionsSetup />
                    },
                    {
                        path: 'facility/settings/diagnoses',
                        element: <DiagnosesSetup />
                    },
                    {
                        path: 'facility/settings/medical-history',
                        element: <MedicalHistorySetup />
                    },
                    {
                        path: 'facility/settings/drugs',
                        element: <DrugSetup />
                    },
                    {
                        path: 'facility/settings/exam-categories',
                        element: <ExamCategoriesSetup />
                    },
                    {
                        path: 'facility/settings/item-frequencies',
                        element: <ItemFrequencySetup />
                    },
                    {
                        path: 'facility/settings/lab-investigations',
                        element: <LabTestsSetup />
                    },
                    {
                        path: 'facility/settings/sample-types',
                        element: <SampleTypesSetup />
                    }
                ]
            },
            {
                element: <HealthLibraryOutlet/>,
                children: [
                    {
                        path: 'facility/health-library',
                        element: <FacilityHealthLibrary />
                    },
                    {
                        path: 'facility/health-topics',
                        element: <HealthLibraryTopics />
                    }
                ]
            },
            {
                element: <UserManagementOutlet/>,
                children: [
                    {
                        path: 'facility/roles',
                        element: <UserRoles />
                    }
                ]
            },
            {
                path: 'facility/setup',
                element: <FacilitySetup />
            },
            {
                path: 'facility/pricing',
                element: <FacilityPricing />
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
