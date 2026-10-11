import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { AdminShell, PortalHeading, PortalStat } from './AdminShell';
import { SectionLabel } from '@/components/layout/Shared';
import { SampleChip } from '@/components/layout/Portal';
import { PERMISSION_MODULES, ROLES, type PermissionAction, type RoleId } from '@/data/club';

const users = [
  { id: 'USR-0042', name: 'Sample Admin', title: 'Club manager', role: 'super_admin' as RoleId },
  { id: 'USR-0038', name: 'Sample Golf Manager', title: 'Golf operations', role: 'golf_ops_manager' as RoleId },
  { id: 'USR-0031', name: 'Sample Membership Officer', title: 'Membership', role: 'membership_manager' as RoleId },
  { id: 'USR-0029', name: 'Sample Events Coordinator', title: 'Events coordinator', role: 'events_manager' as RoleId },
  { id: 'USR-0022', name: 'Sample Content Editor', title: 'Content', role: 'content_manager' as RoleId },
  { id: 'USR-0018', name: 'Sample Facilities Lead', title: 'Facilities lead', role: 'pro_shop_manager' as RoleId },
  { id: 'USR-0011', name: 'Sample Accountant', title: 'Finance', role: 'accountant' as RoleId },
];

const ACTIONS: PermissionAction[] = ['read', 'write', 'delete', 'publish'];

export default function AdminUsersRoles() {
  const [activeRole, setActiveRole] = useState<RoleId>('super_admin');
  const role = ROLES.find((r) => r.id === activeRole)!;

  return (
    <AdminShell>
      <PortalHeading
        eyebrow="ADMIN PORTAL / USERS & ROLES"
        title="The team behind the club."
        copy="Control access with clear roles and a dependable, module-by-module permission matrix."
        action={<button disabled title="Not available in the demo" className="inline-flex items-center gap-2 bg-[#12372A] px-5 py-4 text-[10px] font-bold tracking-[.14em] text-[#F7F5EF] disabled:opacity-40"><Plus size={14} /> INVITE USER</button>}
      />
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        <PortalStat label="TOTAL USERS" value={String(users.length)} note="Across the club" />
        <PortalStat label="ROLES DEFINED" value={String(ROLES.length)} note="Custom RBAC roles" />
        <PortalStat label="INVITES PENDING" value="3" sample />
      </div>

      <section className="mt-10">
        <div className="flex items-center gap-3"><SectionLabel>TEAM MEMBERS</SectionLabel><SampleChip /></div>
        <div className="mt-4 overflow-x-auto border border-[#12372A]/10 bg-[#F7F5EF]">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-[#12372A]/10 bg-[#e8e9df] font-mono-club text-[9px] tracking-[.12em] text-[#5d6b63]">
              <tr><th className="px-5 py-4">ID</th><th className="px-5 py-4">NAME</th><th className="px-5 py-4">TITLE</th><th className="px-5 py-4">ROLE</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[#12372A]/10 last:border-0">
                  <td className="px-5 py-4 font-mono-club text-[10px] text-[#2E6B4E]">{u.id}</td>
                  <td className="px-5 py-4 font-medium text-[#12372A]">{u.name}</td>
                  <td className="px-5 py-4 text-[#5d6b63]">{u.title}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => setActiveRole(u.role)} className="text-[10px] font-bold tracking-[.1em] text-[#2E6B4E] hover:underline">
                      {ROLES.find((r) => r.id === u.role)?.label.toUpperCase()}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <SectionLabel>PERMISSION MATRIX</SectionLabel>
        <h2 className="font-display mt-2 text-4xl text-[#12372A]">What each role can do.</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRole(r.id)}
              className={`border px-4 py-2 text-[10px] font-bold tracking-[.12em] transition-colors ${activeRole === r.id ? 'border-[#2E6B4E] bg-[#2E6B4E] text-white' : 'border-[#12372A]/20 text-[#5d6b63] hover:border-[#2E6B4E]'}`}
              data-testid={`button-role-${r.id}`}
            >
              {r.label.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#5d6b63]">{role.description}</p>
        <div className="mt-5 overflow-x-auto border border-[#12372A]/10 bg-[#F7F5EF]">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-[#12372A]/10 bg-[#e8e9df] font-mono-club text-[9px] tracking-[.12em] text-[#5d6b63]">
              <tr>
                <th className="px-5 py-4">MODULE</th>
                {ACTIONS.map((a) => <th key={a} className="px-5 py-4 text-center">{a.toUpperCase()}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_MODULES.map((mod) => (
                <tr key={mod.id} className="border-b border-[#12372A]/10 last:border-0">
                  <td className="px-5 py-4 font-medium text-[#12372A]">{mod.label}</td>
                  {ACTIONS.map((action) => {
                    const granted = role.permissions[mod.id]?.includes(action);
                    return (
                      <td key={action} className="px-5 py-4 text-center">
                        {granted ? (
                          <span className="mx-auto grid h-6 w-6 place-items-center rounded-full bg-[#2E6B4E]/15 text-[#2E6B4E]"><Check size={13} /></span>
                        ) : (
                          <span className="text-[#d8dcd3]">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
