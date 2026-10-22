import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import VerifyCodePage from "../pages/auth/VerifyCodePage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import NotFoundPage from "../pages/NotFoundPage";

import SumiAdminLoginPage from "../pages/admin-auth/SumiAdminLoginPage";
import SumiAdminRegisterPage from "../pages/admin-auth/SumiAdminRegisterPage";

import PatientLayout from "../layouts/PatientLayout";
import AdminLayout from "../layouts/AdminLayout";
import DoctorLayout from "../layouts/DoctorLayout";

import PatientDashboardPage from "../pages/patient/PatientDashboardPage";
import PatientProfilePage from "../pages/patient/PatientProfilePage";
import PatientHospitalsPage from "../pages/patient/PatientHospitalsPage";
import PatientDepartmentsPage from "../pages/patient/PatientDepartmentsPage";
import PatientDoctorsPage from "../pages/patient/PatientDoctorsPage";
import PatientSlotsPage from "../pages/patient/PatientSlotsPage";
import PatientBookingPage from "../pages/patient/PatientBookingPage";
import PatientBookingConfirmationPage from "../pages/patient/PatientBookingConfirmationPage";
import PatientAppointmentsPage from "../pages/patient/PatientAppointmentsPage";
import AdminAppointmentDeskPage from "../pages/admin/AdminAppointmentDeskPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminCalendarPage from "../pages/admin/AdminCalendarPage";
import AdminPatientsPage from "../pages/admin/AdminPatientsPage";
import AdminTreatmentPlansPage from "../pages/admin/AdminTreatmentPlansPage";
import AdminAnalyticsPage from "../pages/admin/AdminAnalyticsPage";
import AdminStaffPage from "../pages/admin/AdminStaffPage";
import AdminProfilePage from "../pages/admin/AdminProfilePage";
import AdminHelpCenterPage from "../pages/admin/AdminHelpCenterPage";

import DoctorDashboardPage from "../pages/doctor/DoctorDashboardPage";
import DoctorAppointmentsPage from "../pages/doctor/DoctorAppointmentsPage";
import DoctorSchedulePage from "../pages/doctor/DoctorSchedulePage";
import DoctorProfilePage from "../pages/doctor/DoctorProfilePage";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ================================
          PUBLIC ROUTES
      ================================= */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      {/* ================================
          SUMI-ADMIN DEDICATED ROUTES
      ================================= */}
      <Route
        path="/sumi-admin"
        element={<Navigate to="/sumi-admin/login" replace />}
      />

      <Route
        path="/sumi-admin/login"
        element={<SumiAdminLoginPage />}
      />

      <Route
        path="/sumi-admin/register"
        element={<SumiAdminRegisterPage />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />

      <Route
        path="/verify-code"
        element={<VerifyCodePage />}
      />

      <Route
        path="/verify-email"
        element={<VerifyCodePage />}
      />

      <Route
        path="/unauthorized"
        element={
          <UnauthorizedPage />
        }
      />

      {/* ================================
          PROTECTED ROUTES
      ================================= */}

      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "PATIENT",
              ]}
            />
          }
        >
          <Route
            path="/patient"
            element={<PatientLayout />}
          >
            {/* Dashboard */}
            <Route
              index
              element={
                <PatientDashboardPage />
              }
            />

            {/* My Appointments */}
            <Route
              path="appointments"
              element={
                <PatientAppointmentsPage />
              }
            />

            {/* Profile */}
            <Route
              path="profile"
              element={
                <PatientProfilePage />
              }
            />


            <Route
              path="profile/complete"
              element={
                <PatientProfilePage />
              }
            />

            {/* ============================
                F3.2 BOOKING FLOW
            ============================= */}

            {/* Step 1 */}
            <Route
              path="hospitals"
              element={
                <PatientHospitalsPage />
              }
            />

            {/* Step 2 */}
            <Route
              path="departments"
              element={
                <PatientDepartmentsPage />
              }
            />

            {/* Step 3 */}
            <Route
              path="doctors"
              element={
                <PatientDoctorsPage />
              }
            />

            {/* Step 4 */}
            <Route
              path="slots"
              element={
                <PatientSlotsPage />
              }
            />

            {/* Step 5 */}
            <Route
              path="book-appointment"
              element={
                <PatientBookingPage />
              }
            />

            {/* Confirmation */}
            <Route
              path="booking-confirmation/:id"
              element={
                <PatientBookingConfirmationPage />
              }
            />
          </Route>
        </Route>

        {/* ================================
            ADMIN / COORDINATOR ROUTES
        ================================= */}
        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "SUPER_ADMIN",
                "ADMIN",
                "COORDINATOR",
              ]}
            />
          }
        >
          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            <Route
              index
              element={<AdminDashboardPage />}
            />
            <Route
              path="dashboard"
              element={<AdminDashboardPage />}
            />
            <Route
              path="appointments"
              element={
                <AdminAppointmentDeskPage />
              }
            />
            <Route
              path="calendar"
              element={<AdminCalendarPage />}
            />
            <Route
              path="patients"
              element={<AdminPatientsPage />}
            />
            <Route
              path="treatment-plans"
              element={<AdminTreatmentPlansPage />}
            />
            <Route
              path="analytics"
              element={<AdminAnalyticsPage />}
            />
            <Route
              path="staff"
              element={<AdminStaffPage />}
            />
            <Route
              path="credits"
              element={<Navigate to="/admin" replace />}
            />
            <Route
              path="billing"
              element={<Navigate to="/admin" replace />}
            />
            <Route
              path="profile"
              element={<AdminProfilePage />}
            />
            <Route
              path="help"
              element={<AdminHelpCenterPage />}
            />
          </Route>
        </Route>
      </Route>

      {/* ================================
          DOCTOR ROUTES
      ================================= */}
      <Route
        element={
          <RoleRoute
            allowedRoles={["DOCTOR"]}
          />
        }
      >
        <Route
          path="/doctor"
          element={<DoctorLayout />}
        >
          <Route
            index
            element={<DoctorDashboardPage />}
          />
          <Route
            path="appointments"
            element={<DoctorAppointmentsPage />}
          />
          <Route
            path="schedule"
            element={<DoctorSchedulePage />}
          />
          <Route
            path="profile"
            element={<DoctorProfilePage />}
          />
        </Route>
      </Route>

      {/* ================================
          FALLBACK
      ================================= */}

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
};

export default AppRoutes;