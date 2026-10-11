import { useLocation } from 'wouter';
import AdminDashboard from './Dashboard';
import AdminTeeSheet from './TeeSheet';
import AdminGallery from './GalleryModeration';
import AdminUsersRoles from './UsersRoles';
import { AdminResource } from './Resource';
import AdminBookings from './AdminBookings';
import AdminCourse from './AdminCourse';
import AdminEvents from './AdminEvents';
import AdminFacilities from './AdminFacilities';
import AdminSettings from './AdminSettings';
import NotFound from '@/pages/not-found';

export default function AdminWorkspace() {
  const [location] = useLocation();
  const section = location === '/admin' ? 'dashboard' : location.replace('/admin/', '');

  if (section === 'dashboard') return <AdminDashboard />;
  if (section === 'tee-sheet') return <AdminTeeSheet />;
  if (section === 'gallery') return <AdminGallery />;
  if (section === 'users') return <AdminUsersRoles />;
  if (section === 'bookings') return <AdminBookings />;
  if (section === 'course') return <AdminCourse />;
  if (section === 'events') return <AdminEvents />;
  if (section === 'facilities') return <AdminFacilities />;
  if (section === 'settings') return <AdminSettings />;
  if (['memberships', 'payments', 'analytics', 'activity'].includes(section)) return <AdminResource section={section} />;
  return <NotFound />;
}
