import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/RequireAuth";
import { LoginPage } from "./features/auth/LoginPage";
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
