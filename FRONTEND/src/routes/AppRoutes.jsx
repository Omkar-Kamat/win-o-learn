import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleRoute from '../components/auth/RoleRoute';
import { ROLES } from '../utils/constants';

import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

import Home from '../pages/public/Home';
import Listing from '../pages/public/Listing';
import Details from '../pages/public/Details';
import Leaderboard from '../pages/public/Leaderboard';
import NotFound from '../pages/public/NotFound';

import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

import Profile from '../pages/shared/Profile';
import TeamsList from '../pages/shared/TeamsList';
import TeamDetails from '../pages/shared/TeamDetails';

import ParticipantDashboard from '../pages/participant/ParticipantDashboard';
import Registrations from '../pages/participant/Registrations';
import MySubmissions from '../pages/participant/MySubmissions';
import SubmitProject from '../pages/participant/SubmitProject';

import OrganizerDashboard from '../pages/organizer/OrganizerDashboard';
import MyHackathons from '../pages/organizer/MyHackathons';
import CreateEditHackathon from '../pages/organizer/CreateEditHackathon';
import ManageHackathon from '../pages/organizer/ManageHackathon';

import JudgeDashboard from '../pages/judge/JudgeDashboard';
import AssignedHackathons from '../pages/judge/AssignedHackathons';
import SubmissionQueue from '../pages/judge/SubmissionQueue';
import ReviewSubmission from '../pages/judge/ReviewSubmission';
import MyReviews from '../pages/judge/MyReviews';

import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageHackathons from '../pages/admin/ManageHackathons';
import ManageTeams from '../pages/admin/ManageTeams';
import PlatformAnalytics from '../pages/admin/PlatformAnalytics';

const DashboardRouter = () => {
  const { role } = useAuth();
  if (!role) return null;
  return <Navigate to={`/dashboard/${role}`} replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/hackathons" element={<Listing />} />
        <Route path="/hackathons/:id" element={<Details />} />
        <Route path="/hackathons/:id/leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>
      
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route element={<RoleRoute allow={[ROLES.PARTICIPANT]} />}>
            <Route path="/hackathons/:hackathonId/submit" element={<SubmitProject />} />
          </Route>
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/teams" element={<TeamsList />} />
          <Route path="/teams/:id" element={<TeamDetails />} />
          
          <Route element={<RoleRoute allow={[ROLES.ADMIN]} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/admin/users" element={<ManageUsers />} />
            <Route path="/dashboard/admin/hackathons" element={<ManageHackathons />} />
            <Route path="/dashboard/admin/teams" element={<ManageTeams />} />
            <Route path="/dashboard/admin/analytics" element={<PlatformAnalytics />} />
          </Route>
          
          <Route element={<RoleRoute allow={[ROLES.ORGANIZER]} />}>
            <Route path="/dashboard/organizer" element={<OrganizerDashboard />} />
            <Route path="/dashboard/organizer/hackathons" element={<MyHackathons />} />
            <Route path="/dashboard/organizer/hackathons/new" element={<CreateEditHackathon />} />
            <Route path="/dashboard/organizer/hackathons/:id/edit" element={<CreateEditHackathon />} />
            <Route path="/dashboard/organizer/hackathons/:id/manage" element={<ManageHackathon />} />
          </Route>
          
          <Route element={<RoleRoute allow={[ROLES.PARTICIPANT]} />}>
            <Route path="/dashboard/participant" element={<ParticipantDashboard />} />
            <Route path="/dashboard/participant/registrations" element={<Registrations />} />
            <Route path="/dashboard/participant/submissions" element={<MySubmissions />} />
          </Route>

          <Route element={<RoleRoute allow={[ROLES.JUDGE]} />}>
            <Route path="/dashboard/judge" element={<JudgeDashboard />} />
            <Route path="/dashboard/judge/hackathons" element={<AssignedHackathons />} />
            <Route path="/dashboard/judge/hackathons/:hackathonId/submissions" element={<SubmissionQueue />} />
            <Route path="/dashboard/judge/submissions/:submissionId/review" element={<ReviewSubmission />} />
            <Route path="/dashboard/judge/reviews" element={<MyReviews />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
