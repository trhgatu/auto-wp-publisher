import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/Layout/MainLayout";
import { JobsList, CreateJob, JobDetail } from "./features/jobs";
import { Dashboard } from "./features/dashboard";
import { ApiHistoryList } from "./features/api-history";
import { NotificationProvider } from "./providers/NotificationProvider";
import { SocketProvider } from "./providers/SocketProvider";

function App() {
  return (
    <NotificationProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="jobs" element={<JobsList />} />
              <Route path="jobs/:id" element={<JobDetail />} />
              <Route path="create" element={<CreateJob />} />
              <Route path="api-history" element={<ApiHistoryList />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </NotificationProvider>
  );
}

export default App;
