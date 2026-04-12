import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { ChatPage } from "@/pages/ChatPage";
import { GoalDetailPage } from "@/pages/GoalDetailPage";
import { GoalsPage } from "@/pages/GoalsPage";
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
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:sessionId" element={<ChatPage />} />
            <Route path="/profile" element={<PersonaPage />} />
            {/* Redirects for old bookmarks */}
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route
              path="/dashboard"
              element={<Navigate to="/entries" replace />}
            />
            <Route
              path="/categories"
              element={<Navigate to="/goals" replace />}
            />
            <Route path="/analysis" element={<Navigate to="/chat" replace />} />
            <Route path="/insights" element={<Navigate to="/chat" replace />} />
            <Route
              path="/insights/:id"
              element={<Navigate to="/chat" replace />}
            />
            <Route
              path="/ai-settings"
              element={<Navigate to="/profile" replace />}
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
