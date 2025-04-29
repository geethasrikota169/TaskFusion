import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainNavBar from "./main/MainNavBar";
import AdminNavBar from "./admin/AdminNavBar";
import UserNavBar from "./user/UserNavBar";
import ManagerNavBar from "./manager/ManagerNavBar";
import CoverPage from "./main/CoverPage"; // Import CoverPage
import { AuthProvider, useAuth } from "./contextapi/AuthContext";

function AppContent() 
{
  const { isAdminLoggedIn, isUserLoggedIn, isManagerLoggedIn } = useAuth();

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CoverPage />} /> 
          <Route
            path="*"
            element={
              isAdminLoggedIn ? (
                <AdminNavBar />
              ) : isUserLoggedIn ? (
                <UserNavBar />
              ) : isManagerLoggedIn ? (
                <ManagerNavBar />
              ) : (
                <MainNavBar />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;