import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { createPatient, updatePatient, fetchPatient, clearSelected } from '../patientSlice';
import type { Gender } from '@/types/patient';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Loader from '@/components/common/Loader';
import toast from 'react-hot-toast';
import { ArrowLeft, User, Heart, Phone, Shield, Copy, CheckCircle } from 'lucide-react';

export default function PatientForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selected, status } = useAppSelector((s) => s.patients);
  const [loading, setLoading] = useState(false);
  const [createdPatient, setCreatedPatient] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'MALE' as Gender,
    bloodGroup: '', phone: '', email: '', address: '',
    emergencyContactName: '', emergencyContactPhone: '',
    doctorId: '' as string, // string for input
    height: '', weight: '', allergies: '', existingConditions: '',
  });

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchPatient(Number(id)));
    }
    return () => { dispatch(clearSelected()); };
  }, [id, isEdit, dispatch]);

  useEffect(() => {
    if (isEdit && selected) {
      setForm({
        firstName: selected.firstName,
        lastName: selected.lastName,
        dateOfBirth: selected.dateOfBirth,
        gender: selected.gender,
        bloodGroup: selected.bloodGroup ?? '',
        phone: selected.phone ?? '',
        email: selected.email ?? '',
        address: selected.address ?? '',
        emergencyContactName: selected.emergencyContactName ?? '',
        emergencyContactPhone: selected.emergencyContactPhone ?? '',
        doctorId: selected.doctorId ? String(selected.doctorId) : '',
        height: selected.height ? String(selected.height) : '',
        weight: selected.weight ? String(selected.weight) : '',
        allergies: selected.allergies ?? '',
        existingConditions: selected.existingConditions ?? '',
      });
    }
  }, [isEdit, selected]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      bloodGroup: form.bloodGroup || undefined,
      phone: form.phone || undefined,
      email: form.email,
      address: form.address || undefined,
      emergencyContactName: form.emergencyContactName || undefined,
      emergencyContactPhone: form.emergencyContactPhone || undefined,
      doctorId: form.doctorId ? Number(form.doctorId) : undefined,
      height: form.height ? Number(form.height) : undefined,
      weight: form.weight ? Number(form.weight) : undefined,
      allergies: form.allergies || undefined,
      existingConditions: form.existingConditions || undefined,
    };

    try {
      if (isEdit) {
        const result = await dispatch(updatePatient({ id: Number(id), data: payload }));
        if (updatePatient.fulfilled.match(result)) {
          toast.success('Patient updated');
          navigate(`/patients/${id}`);
        } else {
          toast.error((result.payload as string) || 'Update failed');
        }
      } else {
        const result = await dispatch(createPatient(payload));
        if (createPatient.fulfilled.match(result)) {
          const patient = result.payload;
          if (patient.temporaryPassword) {
            setCreatedPatient({ email: form.email, password: patient.temporaryPassword });
          } else {
            toast.success('Patient registered');
            navigate('/patients');
          }
        } else {
          toast.error((result.payload as string) || 'Registration failed');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (!createdPatient) return;
    navigator.clipboard.writeText(`Email: ${createdPatient.email}\nPassword: ${createdPatient.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isEdit && status === 'loading' && !selected) return <Loader />;

  // Show credentials card after successful creation
  if (createdPatient) {
    return (
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6 text-center">
            <CheckCircle size={48} className="text-white mx-auto mb-3" />
            <h1 className="text-xl font-bold text-white">Patient Registered Successfully!</h1>
            <p className="text-emerald-100 text-sm mt-1">Share these login credentials with the patient</p>
          </div>
          <div className="p-8">
            <div className="bg-slate-50 rounded-xl p-5 space-y-3 border border-slate-100">
              <div>
                <p className="text-xs text-slate-500 font-medium">Email</p>
                <p className="text-sm font-mono font-semibold text-slate-900 mt-0.5">{createdPatient.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Temporary Password</p>
                <p className="text-sm font-mono font-semibold text-slate-900 mt-0.5">{createdPatient.password}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-[11px] text-amber-600">
              <Shield size={12} />
              This password will not be shown again. Please note it down.
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={copyCredentials} className="flex-1">
                {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy Credentials</>}
              </Button>
              <Button onClick={() => navigate('/patients')} className="flex-1">
                Go to Patients
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-xl font-bold text-slate-900 mb-6">{isEdit ? 'Edit Patient' : 'Register New Patient'}</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <fieldset>
            <legend className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
              <User size={16} className="text-teal-600" /> Personal Information
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="First Name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              <Input label="Last Name" required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              <Input label="Date of Birth" type="date" required value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Gender <span className="text-red-500">*</span></label>
                <div className="flex gap-3">
                  {(['MALE', 'FEMALE', 'OTHER'] as Gender[]).map((g) => (
                    <button key={g} type="button" onClick={() => setForm({ ...form, gender: g })}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        form.gender === g
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">Blood Group</label>
                <select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500">
                  <option value="">Select...</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <Input label="Email" type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Patient login account will be created" />
            </div>
          </fieldset>

          {/* Contact Information */}
          <fieldset>
            <legend className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
              <Phone size={16} className="text-teal-600" /> Contact Information
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <Input label="Emergency Contact Name" value={form.emergencyContactName}
                onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })} />
              <Input label="Emergency Contact Phone" value={form.emergencyContactPhone}
                onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })} />
            </div>
          </fieldset>

          {/* Medical Information */}
          <fieldset>
            <legend className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
              <Heart size={16} className="text-teal-600" /> Medical Information
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="Height (cm)" type="number" step="0.1" value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })} />
              <Input label="Weight (kg)" type="number" step="0.1" value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })} />
            </div>
            <div className="mt-5 space-y-1">
              <label className="block text-sm font-medium text-slate-700">Allergies</label>
              <textarea rows={2} value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Known allergies..." />
            </div>
            <div className="mt-5 space-y-1">
              <label className="block text-sm font-medium text-slate-700">Existing Conditions</label>
              <textarea rows={3} value={form.existingConditions}
                onChange={(e) => setForm({ ...form, existingConditions: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Diabetes, Hypertension, etc..." />
              <p className="text-xs text-slate-400">Medical info is encrypted with AES-256-GCM at rest.</p>
            </div>
          </fieldset>

          {/* Doctor Assignment (optional) */}
          <fieldset>
            <legend className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
              <Shield size={16} className="text-teal-600" /> Doctor Assignment
            </legend>
            <Input label="Doctor ID (optional)" type="number" value={form.doctorId}
              onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
              placeholder="Assign a doctor by ID, or leave blank to assign later" />
          </fieldset>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" isLoading={loading}>{isEdit ? 'Update Patient' : 'Register Patient'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
