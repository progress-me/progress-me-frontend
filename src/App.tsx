import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { AnalysisPage } from "@/pages/AnalysisPage";
import { GoalDetailPage } from "@/pages/GoalDetailPage";
import { GoalsPage } from "@/pages/GoalsPage";
import { InsightDetailPage } from "@/pages/InsightDetailPage";
import { LoginPage } from "@/pages/LoginPage";
import { NewEntryPage } from "@/pages/NewEntryPage";
import { PersonaPage } from "@/pages/PersonaPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { TimelinePage } from "@/pages/TimelinePage";
import { Navigate, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/entries" element={<TimelinePage />} />
            <Route path="/entries/new" element={<NewEntryPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/goals/:id" element={<GoalDetailPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/insights/:id" element={<InsightDetailPage />} />
            <Route path="/profile" element={<PersonaPage />} />
            {/* Redirects for old bookmarks */}
            <Route
              path="/dashboard"
              element={<Navigate to="/entries" replace />}
            />
            <Route
              path="/categories"
              element={<Navigate to="/goals" replace />}
            />
            <Route
              path="/insights"
              element={<Navigate to="/analysis" replace />}
            />
            <Route
              path="/ai-settings"
              element={<Navigate to="/analysis" replace />}
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
