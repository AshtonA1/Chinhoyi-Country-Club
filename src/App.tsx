import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { RemoteErrorBanner } from '@/components/layout/RemoteErrorBanner';
import { RequireMember, RequireStaff } from '@/components/auth/RequireAuth';
import { AuthProvider } from '@/lib/auth';

import Home from '@/pages/Home';
import About from '@/pages/About';
import Course from '@/pages/Course';
import HoleDetail from '@/pages/HoleDetail';
import TeeTimes from '@/pages/TeeTimes';
import Membership from '@/pages/Membership';
import Events from '@/pages/Events';
import EventDetail from '@/pages/EventDetail';
import Facilities from '@/pages/Facilities';
import Gallery from '@/pages/Gallery';
import GolfInfo from '@/pages/GolfInfo';
import Contact from '@/pages/Contact';
import NotFound from '@/pages/not-found';

import MemberLogin from '@/pages/member/Login';
import MemberRegister from '@/pages/member/Register';
import MemberDashboard from '@/pages/member/Dashboard';
import MemberTeeTimes from '@/pages/member/TeeTimes';
import MemberMembership from '@/pages/member/Membership';
import MemberCompetitions from '@/pages/member/Competitions';
import MemberPayments from '@/pages/member/Payments';
import MemberProfile from '@/pages/member/Profile';

import AdminWorkspace from '@/pages/admin/AdminWorkspace';
import StaffLogin from '@/pages/admin/StaffLogin';

const queryClient = new QueryClient();

/** Wraps a page so only staff can open it. */
const staff = (Page: React.ComponentType) => function StaffPage() { return <RequireStaff><Page /></RequireStaff>; };
/** Wraps a page so only signed-in members can open it. */
const member = (Page: React.ComponentType) => function MemberPage() { return <RequireMember><Page /></RequireMember>; };

const GuardedAdmin = staff(AdminWorkspace);
const GuardedDashboard = member(MemberDashboard);
const GuardedTeeTimes = member(MemberTeeTimes);
const GuardedMembership = member(MemberMembership);
const GuardedCompetitions = member(MemberCompetitions);
const GuardedPayments = member(MemberPayments);
const GuardedProfile = member(MemberProfile);

function Router() {
  return (
    <ErrorBoundary resetKey={useLocation()[0]}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/course/hole/:holeNumber" component={HoleDetail} />
        <Route path="/course" component={Course} />
        <Route path="/tee-times" component={TeeTimes} />
        <Route path="/membership" component={Membership} />
        <Route path="/events/:eventId" component={EventDetail} />
        <Route path="/events" component={Events} />
        <Route path="/facilities" component={Facilities} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/golf-info" component={GolfInfo} />
        <Route path="/contact" component={Contact} />

        <Route path="/member-login" component={MemberLogin} />
        <Route path="/member/login" component={MemberLogin} />
        <Route path="/member/register" component={MemberRegister} />
        <Route path="/member/dashboard" component={GuardedDashboard} />
        <Route path="/member/tee-times" component={GuardedTeeTimes} />
        <Route path="/member/membership" component={GuardedMembership} />
        <Route path="/member/competitions" component={GuardedCompetitions} />
        <Route path="/member/payments" component={GuardedPayments} />
        <Route path="/member/profile" component={GuardedProfile} />

        <Route path="/staff-login" component={StaffLogin} />
        <Route path="/admin" component={GuardedAdmin} />
        <Route path="/admin/tee-sheet" component={GuardedAdmin} />
        <Route path="/admin/bookings" component={GuardedAdmin} />
        <Route path="/admin/course" component={GuardedAdmin} />
        <Route path="/admin/events" component={GuardedAdmin} />
        <Route path="/admin/memberships" component={GuardedAdmin} />
        <Route path="/admin/gallery" component={GuardedAdmin} />
        <Route path="/admin/facilities" component={GuardedAdmin} />
        <Route path="/admin/payments" component={GuardedAdmin} />
        <Route path="/admin/analytics" component={GuardedAdmin} />
        <Route path="/admin/users" component={GuardedAdmin} />
        <Route path="/admin/activity" component={GuardedAdmin} />
        <Route path="/admin/settings" component={GuardedAdmin} />

        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
        <DemoBanner />
        <RemoteErrorBanner />
      </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
