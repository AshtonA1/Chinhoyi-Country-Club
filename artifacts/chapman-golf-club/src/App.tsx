import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DemoBanner } from '@/components/layout/DemoBanner';

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

const queryClient = new QueryClient();

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
        <Route path="/member/dashboard" component={MemberDashboard} />
        <Route path="/member/tee-times" component={MemberTeeTimes} />
        <Route path="/member/membership" component={MemberMembership} />
        <Route path="/member/competitions" component={MemberCompetitions} />
        <Route path="/member/payments" component={MemberPayments} />
        <Route path="/member/profile" component={MemberProfile} />

        <Route path="/admin" component={AdminWorkspace} />
        <Route path="/admin/tee-sheet" component={AdminWorkspace} />
        <Route path="/admin/bookings" component={AdminWorkspace} />
        <Route path="/admin/course" component={AdminWorkspace} />
        <Route path="/admin/events" component={AdminWorkspace} />
        <Route path="/admin/memberships" component={AdminWorkspace} />
        <Route path="/admin/gallery" component={AdminWorkspace} />
        <Route path="/admin/pro-shop" component={AdminWorkspace} />
        <Route path="/admin/payments" component={AdminWorkspace} />
        <Route path="/admin/analytics" component={AdminWorkspace} />
        <Route path="/admin/users" component={AdminWorkspace} />
        <Route path="/admin/activity" component={AdminWorkspace} />
        <Route path="/admin/settings" component={AdminWorkspace} />

        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
        <DemoBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
