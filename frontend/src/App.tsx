import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/RequireAuth";
import { ForgotPasswordPage } from "./features/auth/ForgotPasswordPage";
import { LoginPage } from "./features/auth/LoginPage";
import { ResetPasswordPage } from "./features/auth/ResetPasswordPage";
import { SignupPage } from "./features/auth/SignupPage";
import { CompaniesPage } from "./features/companies/CompaniesPage";
import { CompanyPage } from "./features/companies/CompanyPage";
import { EmployeePage } from "./features/employees/EmployeePage";

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <CompaniesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/companies/:companyId"
          element={
            <RequireAuth>
              <CompanyPage />
            </RequireAuth>
          }
        />
        <Route
          path="/companies/:companyId/employees/:employeeId"
          element={
            <RequireAuth>
              <EmployeePage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
