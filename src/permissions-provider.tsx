import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {AuthLayout} from "./shared/layout/auth-layout";
import {Main} from "./Main";
import {FacilitySignIn} from "./Facility/facility-sign-in";
import {FacilityLayout} from "./shared/layout/facility-layout";
import {FacilityDashboard} from "./Facility/pages/facility-dashboard";
import FacilityAppointmentsOutlet from "./Facility/pages/facility-appointments/facility-appointments-outlet";
import FacilityAppointmentPending from "./Facility/pages/facility-appointments/facility-appointment-pending";
import FacilityAppointmentReview from "./Facility/pages/facility-appointments/facility-appointment-review";
import FacilityAppointmentHistory from "./Facility/pages/facility-appointments/facility-appointment-history";
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
import HealthLibraryOutlet from "./Facility/pages/facility-health-library/health-library-outlet";
import FacilityHealthLibrary from "./Facility/pages/facility-health-library/facility-health-library";
import HealthLibraryTopics from "./Facility/pages/facility-health-library/health-library-topics";
import UserManagementOutlet from "./Facility/pages/facility-user-management/user-management-outlet";
import UserRoles from "./Facility/pages/facility-user-management/user-roles";
import Users from "./Facility/pages/facility-user-management/users";
import FacilitySetup from "./Facility/pages/facility-setup";
import FacilityPricing from "./Facility/pages/facility-pricing";
import FacilitySchedule from "./Facility/pages/facility-schedule";
import FacilityScheduleConfiguration from "./Facility/pages/facility-schedule-configuration";
import ModulesSetup from "./Facility/pages/modules-setup";
import React from "react";
import DoctorConsultation, { loader as doctorConsultationLoader } from "./Facility/pages/facility-appointments/doctor-consultation";
import FacilityUserProfile from "./Facility/pages/facility-user-profile";
import FacilityPatients from "./Facility/pages/facility-patients";
import FacilityHomecareOutlet from "./Facility/pages/facility-homecare/facility-homecare-outlet";
import CommunitiesSetup from "./Facility/pages/facility-homecare/communities-setup";
import PolyKioskSetup from "./Facility/pages/facility-homecare/poly-kiosk-setup";
import ActivitiesSetup from "./Facility/pages/facility-homecare/activities-setup";
import ErrorPage from "./error-page";
import TeamsSetup from "./Facility/pages/facility-homecare/teams-setup";
import SubscriptionsSetup from "./Facility/pages/facility-homecare/subscriptions-setup";

export default function PermissionsProvider() {

    const router = createBrowserRouter([
        {
            path: '/',
            element: <AuthLayout/>,
            errorElement: <ErrorPage/>,
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
            errorElement: <ErrorPage/>,
            children: [
                {
                    path: 'facility/dashboard',
                    element: <FacilityDashboard />
                },
                {
                    element: <FacilityAppointmentsOutlet/>,
                    children: [
                        {
                            path: 'facility/appointments/pending',
                            element: <FacilityAppointmentPending/>
                        },
                        {
                            path: 'facility/appointments/reviews',
                            element: <FacilityAppointmentReview/>
                        },
                        {
                            path: 'facility/appointments/history',
                            element: <FacilityAppointmentHistory/>
                        }
                    ]
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
                            path: 'facility/health/library',
                            element: <FacilityHealthLibrary />
                        },
                        {
                            path: 'facility/health/topics',
                            element: <HealthLibraryTopics />
                        }
                    ]
                },
                {
                    element: <UserManagementOutlet/>,
                    children: [
                        {
                            path: 'facility/user-management/roles',
                            element: <UserRoles />
                        },
                        {
                            path: 'facility/user-management/users',
                            element: <Users />
                        }
                    ]
                },{
                    element: <FacilityHomecareOutlet/>,
                    children: [
                        {
                            path: 'home-care/communities',
                            element: <CommunitiesSetup />
                        },
                        {
                            path: 'home-care/poly-kiosks',
                            element: <PolyKioskSetup/>
                        },
                        {
                            path: 'home-care/activities',
                            element: <ActivitiesSetup/>
                        },
                        {
                            path: 'home-care/teams',
                            element: <TeamsSetup/>
                        },
                        {
                            path: 'home-care/subscriptions',
                            element: <SubscriptionsSetup/>
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
                },
                {
                    path: 'facility/my-schedule',
                    element: <FacilitySchedule />
                },
                {
                    path: 'facility/schedule-configuration',
                    element: <FacilityScheduleConfiguration />
                },
                {
                    path: 'facility/modules',
                    element: <ModulesSetup />
                },
                {
                    path: 'facility/user/profile',
                    element: <FacilityUserProfile/>
                },
                {
                    path: 'facility/patients',
                    element: <FacilityPatients/>
                }
            ]
        },
        {
            element: <DoctorConsultation/>,
            path: '/facility/consulting-room/:id',
            loader: doctorConsultationLoader,
            errorElement: <ErrorPage/>,
        }
    ]);
    return (
        <RouterProvider router={router}/>
    )
}
