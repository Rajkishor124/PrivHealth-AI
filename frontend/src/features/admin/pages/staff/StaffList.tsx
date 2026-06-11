import { useState, useEffect } from 'react';
import { staffApi } from '@/api/staffApi';
import type { User } from '@/types/auth';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { StatusBadge } from '@/components/common/Badge';
import { formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

interface StaffListProps {
  type: 'doctors' | 'receptionists' | 'technicians';
  title: string;
}

export default function StaffList({ type, title }: StaffListProps) {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '', email: '', employeeId: '',
    department: '', specialization: '', qualification: '',
    medicalLicenseNumber: '', yearsOfExperience: 0, joiningDate: ''
  });

  const loadStaff = async () => {
    try {
      setLoading(true);
      const res = await staffApi.getStaff(type);
      setStaff(res.data.data || []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [type]);

  const openModal = (user: User | null = null) => {
    setEditingStaff(user);
    if (user) {
      setForm({
        name: user.name, email: user.email, employeeId: user.employeeId || '',
        department: user.department || '', specialization: user.specialization || '',
        qualification: user.qualification || '', medicalLicenseNumber: user.medicalLicenseNumber || '',
        yearsOfExperience: user.yearsOfExperience || 0, joiningDate: user.joiningDate || ''
      });
    } else {
      setForm({
        name: '', email: '', employeeId: '', department: '', specialization: '',
        qualification: '', medicalLicenseNumber: '', yearsOfExperience: 0, joiningDate: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await staffApi.updateStaff(type, editingStaff.id, form);
        toast.success('Staff updated successfully');
      } else {
        await staffApi.createStaff(type, form);
        toast.success('Staff created successfully');
      }
      setShowModal(false);
      loadStaff();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save staff');
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!window.confirm('Are you sure you want to deactivate this staff member?')) return;
    try {
      await staffApi.deactivateStaff(type, id);
      toast.success('Staff deactivated successfully');
      loadStaff();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to deactivate staff');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">Manage your hospital's {type}</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus size={18} /> Add New
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email / Emp ID</th>
                {type === 'doctors' && <th className="px-6 py-4">Specialization</th>}
                {type !== 'doctors' && <th className="px-6 py-4">Department</th>}
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">Loading...</td></tr>
              ) : staff.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">No {type} found.</td></tr>
              ) : (
                staff.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{s.name}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">{s.email}</div>
                      <div className="text-xs text-slate-500">{s.employeeId || 'N/A'}</div>
                    </td>
                    {type === 'doctors' && <td className="px-6 py-4 text-sm text-slate-600">{s.specialization || '-'}</td>}
                    {type !== 'doctors' && <td className="px-6 py-4 text-sm text-slate-600">{s.department || '-'}</td>}
                    <td className="px-6 py-4"><StatusBadge status={s.staffStatus} /></td>
                    <td className="px-6 py-4 text-sm text-slate-500">{s.joiningDate ? formatDate(s.joiningDate) : '-'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => openModal(s)}><Edit2 size={16} /></Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => handleDeactivate(s.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingStaff ? 'Edit' : 'Add'} {title.slice(0, -1)}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input label="Employee ID" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
                <Input label="Joining Date" type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
                
                {type === 'doctors' && (
                  <>
                    <Input label="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
                    <Input label="Qualification" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
                    <Input label="Medical License" value={form.medicalLicenseNumber} onChange={(e) => setForm({ ...form, medicalLicenseNumber: e.target.value })} />
                    <Input label="Years of Exp." type="number" value={form.yearsOfExperience} onChange={(e) => setForm({ ...form, yearsOfExperience: parseInt(e.target.value) || 0 })} />
                  </>
                )}
                {type !== 'doctors' && (
                  <Input label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
