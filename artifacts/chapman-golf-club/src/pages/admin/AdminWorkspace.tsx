import { useLocation } from 'wouter';
import AdminDashboard from './Dashboard';
import AdminTeeSheet from './TeeSheet';
import AdminGallery from './GalleryModeration';
import AdminUsersRoles from './UsersRoles';
import { AdminResource } from './Resource';

export default function AdminWorkspace() {
  const [location] = useLocation();
  const section = location === '/admin' ? 'dashboard' : location.replace('/admin/', '');

  if (section === 'dashboard') return <AdminDashboard />;
  if (section === 'tee-sheet') return <AdminTeeSheet />;
  if (section === 'gallery') return <AdminGallery />;
  if (section === 'users') return <AdminUsersRoles />;
  return <AdminResource section={section} />;
}
