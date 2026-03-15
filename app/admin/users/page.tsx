import { getAllUsers } from "@/actions/user.actions";
import { requireAdmin } from "@/lib/auth-middleware";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Shield, User, Search, UserCheck, UserX, Clock } from "lucide-react";
import UserRoleToggle from "@/components/admin/UserRoleToggle";
import UserStatusActions from "@/components/admin/UserStatusActions";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await getAllUsers();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-green-100 text-green-700 flex items-center gap-1 w-fit"><UserCheck className="w-3 h-3" /> نشط</span>;
      case 'pending_approval':
        return <span className="badge bg-yellow-100 text-yellow-700 flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> قيد المراجعة</span>;
      case 'rejected':
        return <span className="badge bg-red-100 text-red-700 flex items-center gap-1 w-fit"><UserX className="w-3 h-3" /> مرفوض</span>;
      default:
        return null;
    }
  };

  return (
    <div className="church-container church-section space-y-8">
      <div className="animate-fade-up">
        <h1 className="font-title text-3xl text-church-red">إدارة المستخدمين</h1>
        <p className="text-church-text-muted mt-2">الموافقة على الأعضاء الجدد وتعديل الصلاحيات</p>
      </div>

      <div className="church-card p-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
        {/* Mobile Search - Visual Only for now */}
        <div className="relative mb-6">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-church-text-light w-5 h-5" />
          <input 
            type="text" 
            placeholder="البحث عن مستخدم..." 
            className="church-input pr-10"
          />
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>المستخدم</th>
                <th>البريد الإلكتروني</th>
                <th>الحالة</th>
                <th>الدور</th>
                <th className="text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="bg-church-bg-warm p-2 rounded-full">
                        <User className="w-5 h-5 text-church-text" />
                      </div>
                      <span className="font-bold">{u.name}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{getStatusBadge(u.status)}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'bg-church-red/10 text-church-red' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role === 'admin' ? 'مدير (Admin)' : 'مستخدم'}
                    </span>
                  </td>
                  <td className="text-left">
                    <div className="flex items-center justify-end gap-2">
                      <UserStatusActions userId={u.id} status={u.status as any} />
                      <UserRoleToggle userId={u.id} currentRole={u.role as 'admin' | 'user'} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-4">
          {users.map((u) => (
            <div key={u.id} className="border border-church-border-light rounded-xl p-4 space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-church-bg-warm p-2 rounded-full">
                    <User className="w-4 h-4 text-church-text" />
                  </div>
                  <div>
                    <div className="font-bold text-church-text">{u.name}</div>
                    <div className="text-xs text-church-text-light">{u.email}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                   {getStatusBadge(u.status)}
                   <span className={`badge text-[10px] ${u.role === 'admin' ? 'bg-church-red/10 text-church-red' : 'bg-gray-100 text-gray-600'}`}>
                    {u.role === 'admin' ? 'مدير' : 'مستخدم'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-church-border-light">
                <div className="text-[10px] text-church-text-muted">
                    انضم في: {format(u.createdAt, "d MMM yyyy", { locale: ar })}
                </div>
                <div className="flex items-center gap-2">
                  <UserStatusActions userId={u.id} status={u.status as any} />
                  <UserRoleToggle userId={u.id} currentRole={u.role as 'admin' | 'user'} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
