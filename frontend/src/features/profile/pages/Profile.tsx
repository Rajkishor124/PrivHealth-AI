import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMyProfile, updateMyProfile } from '@/features/patients/patientSlice';
import { formatDate } from '@/utils/helpers';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Loader from '@/components/common/Loader';
import toast from 'react-hot-toast';
import { UserCircle, Mail, Calendar, Shield, Phone, MapPin, Heart, Edit, Save, X } from 'lucide-react';

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function Profile() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { myProfile, status } = useAppSelector((s) => s.patients);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    phone: '', address: '', emergencyContactName: '', emergencyContactPhone: '',
  });

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (myProfile) {
      setForm({
        phone: myProfile.phone ?? '',
        address: myProfile.address ?? '',
        emergencyContactName: myProfile.emergencyContactName ?? '',
        emergencyContactPhone: myProfile.emergencyContactPhone ?? '',
      });
    }
  }, [myProfile]);

  const handleSave = async () => {
    setSaving(true);
    const result = await dispatch(updateMyProfile(form));
    if (updateMyProfile.fulfilled.match(result)) {
      toast.success('Profile updated');
      setEditing(false);
    } else {
      toast.error((result.payload as string) || 'Update failed');
    }
    setSaving(false);
  };

  if (!user) return null;
  if (status === 'loading' && !myProfile) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Profile</h1>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-8 text-center">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center text-white text-3xl font-bold mb-4">
            {user.name.charAt(0)}
          </div>
          <h2 className="text-xl font-bold text-white">{user.name}</h2>
          <p className="text-blue-100 text-sm">{user.email}</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Account Info */}
          <div className="space-y-4">
            {[
              { icon: UserCircle, label: 'Name', value: user.name },
              { icon: Mail, label: 'Email', value: user.email },
              { icon: Shield, label: 'Role', value: user.role },
              { icon: Calendar, label: 'Joined', value: formatDate(user.createdAt) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                <Icon size={18} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-sm font-medium text-slate-900">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Patient-Specific Information */}
          {myProfile && (
            <>
              <hr className="border-slate-100" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Heart size={16} className="text-red-400" /> Health Information
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Age', value: calculateAge(myProfile.dateOfBirth) },
                    { label: 'Gender', value: myProfile.gender },
                    { label: 'Blood Group', value: myProfile.bloodGroup ?? '—' },
                    { label: 'Doctor', value: myProfile.doctorName ?? 'Not Assigned' },
                    { label: 'Height', value: myProfile.height ? `${myProfile.height} cm` : '—' },
                    { label: 'Weight', value: myProfile.weight ? `${myProfile.weight} kg` : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-xl p-3">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
                {myProfile.allergies && (
                  <div className="mt-4 bg-red-50 rounded-xl p-4 border border-red-100">
                    <p className="text-xs text-red-500 font-medium mb-1">Allergies</p>
                    <p className="text-sm text-red-800">{myProfile.allergies}</p>
                  </div>
                )}
                {myProfile.existingConditions && (
                  <div className="mt-3 bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <p className="text-xs text-amber-600 font-medium mb-1">Existing Conditions</p>
                    <p className="text-sm text-amber-800">{myProfile.existingConditions}</p>
                  </div>
                )}
              </div>

              <hr className="border-slate-100" />

              {/* Editable Contact Info */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Phone size={16} className="text-teal-500" /> Contact Information
                  </h3>
                  {!editing && (
                    <button onClick={() => setEditing(true)}
                      className="text-xs text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1">
                      <Edit size={12} /> Edit
                    </button>
                  )}
                </div>

                {editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                      <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                      <Input label="Emergency Contact" value={form.emergencyContactName}
                        onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} />
                      <Input label="Emergency Phone" value={form.emergencyContactPhone}
                        onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="secondary" size="sm" onClick={() => setEditing(false)}><X size={14} /> Cancel</Button>
                      <Button size="sm" onClick={handleSave} isLoading={saving}><Save size={14} /> Save</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Phone size={14} className="text-slate-400" />
                      {myProfile.phone || <span className="text-slate-400 italic">Not provided</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <MapPin size={14} className="text-slate-400" />
                      {myProfile.address || <span className="text-slate-400 italic">Not provided</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Shield size={14} className="text-red-400" />
                      {myProfile.emergencyContactName ? (
                        <span>{myProfile.emergencyContactName}{myProfile.emergencyContactPhone && ` — ${myProfile.emergencyContactPhone}`}</span>
                      ) : (
                        <span className="text-slate-400 italic">No emergency contact</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
