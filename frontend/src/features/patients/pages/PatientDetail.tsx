import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPatient, deletePatient, clearSelected, assignDoctor } from '../patientSlice';
import Loader from '@/components/common/Loader';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { ArrowLeft, Edit, Trash2, Activity, Lock, Shield, Phone, MapPin, Heart, UserPlus, Stethoscope, ClipboardList, HeartPulse } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PatientDetail() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selected: patient, status } = useAppSelector((s) => s.patients);
  const { user } = useAppSelector((s) => s.auth);
  const [deleting, setDeleting] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [doctorIdInput, setDoctorIdInput] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchPatient(Number(id)));
    return () => { dispatch(clearSelected()); };
  }, [id, dispatch]);

  const handleDelete = async () => {
    if (!confirm('Deactivate this patient? This action can be reversed.')) return;
    setDeleting(true);
    const result = await dispatch(deletePatient(Number(id)));
    if (deletePatient.fulfilled.match(result)) {
      toast.success('Patient deactivated');
      navigate('/patients');
    } else {
      toast.error('Failed to deactivate');
    }
    setDeleting(false);
  };

  const handleAssignDoctor = async () => {
    if (!doctorIdInput) return;
    setAssigning(true);
    const result = await dispatch(assignDoctor({ id: Number(id), data: { doctorId: Number(doctorIdInput) } }));
    if (assignDoctor.fulfilled.match(result)) {
      toast.success('Doctor assigned');
      dispatch(fetchPatient(Number(id)));
      setShowAssign(false);
      setDoctorIdInput('');
    } else {
      toast.error((result.payload as string) || 'Assignment failed');
    }
    setAssigning(false);
  };

  if (status === 'loading' || !patient) return <Loader />;

  const canEdit = user?.role === 'DOCTOR' || user?.role === 'RECEPTIONIST' || user?.role === 'HOSPITAL_ADMIN';
  const canDelete = user?.role === 'RECEPTIONIST' || user?.role === 'HOSPITAL_ADMIN';
  const canAssign = user?.role === 'RECEPTIONIST' || user?.role === 'HOSPITAL_ADMIN';

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white text-xl font-bold backdrop-blur-sm">
                {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{patient.firstName} {patient.lastName}</h1>
                <p className="text-teal-100 text-sm">
                  {calculateAge(patient.dateOfBirth)} years • {patient.gender} • Added {formatDate(patient.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {user?.role === 'DOCTOR' && (
                <>
                  <Link to={`/patients/${id}/predict`}>
                    <Button variant="secondary" size="sm" className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20">
                      <Activity size={14} /> Predict
                    </Button>
                  </Link>
                  <Link to={`/consultations/new?patientId=${id}`}>
                    <Button variant="secondary" size="sm" className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20">
                      <Stethoscope size={14} /> New Consult
                    </Button>
                  </Link>
                  <Link to={`/patients/${id}/tracking`}>
                    <Button variant="secondary" size="sm" className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20">
                      <HeartPulse size={14} /> Tracking
                    </Button>
                  </Link>
                </>
              )}
              <Link to={`/patients/${id}/medical-history`}>
                <Button variant="secondary" size="sm" className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20">
                  <ClipboardList size={14} /> History
                </Button>
              </Link>
              {canEdit && (
                <Link to={`/patients/${id}/edit`}>
                  <Button variant="secondary" size="sm" className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20">
                    <Edit size={14} /> Edit
                  </Button>
                </Link>
              )}
              {canAssign && (
                <Button variant="secondary" size="sm" onClick={() => setShowAssign(!showAssign)}
                  className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20">
                  <UserPlus size={14} /> Assign Doctor
                </Button>
              )}
              {canDelete && (
                <Button variant="danger" size="sm" onClick={handleDelete} isLoading={deleting}>
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Assign Doctor Panel */}
        {showAssign && (
          <div className="px-8 py-4 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
            <Input placeholder="Enter Doctor ID" type="number" value={doctorIdInput}
              onChange={(e) => setDoctorIdInput(e.target.value)} className="max-w-xs" />
            <Button size="sm" onClick={handleAssignDoctor} isLoading={assigning}>Assign</Button>
            <Button size="sm" variant="secondary" onClick={() => setShowAssign(false)}>Cancel</Button>
          </div>
        )}

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Age', value: calculateAge(patient.dateOfBirth) },
              { label: 'Gender', value: patient.gender },
              { label: 'Blood Group', value: patient.bloodGroup ?? '—' },
              { label: 'Status', value: patient.status },
              { label: 'Doctor', value: patient.doctorName ?? 'Not Assigned' },
              { label: 'Patient ID', value: `#${patient.id}` },
              { label: 'DOB', value: formatDate(patient.dateOfBirth) },
              { label: 'Email', value: patient.email ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <p className="text-sm font-semibold text-slate-900 mt-1 truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Contact Information */}
          {(patient.phone || patient.address || patient.emergencyContactName) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Contact Information</h3>
              </div>
              <div className="bg-slate-50 rounded-xl p-5 space-y-3 border border-slate-100">
                {patient.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-700">{patient.phone}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-700">{patient.address}</span>
                  </div>
                )}
                {patient.emergencyContactName && (
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-red-400" />
                    <span className="text-sm text-slate-700">
                      Emergency: {patient.emergencyContactName}
                      {patient.emergencyContactPhone && ` — ${patient.emergencyContactPhone}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medical Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Medical Information</h3>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium">
                <Lock size={10} /> Decrypted
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {patient.height != null && (
                  <div>
                    <p className="text-xs text-slate-500">Height</p>
                    <p className="text-sm font-medium text-slate-900">{patient.height} cm</p>
                  </div>
                )}
                {patient.weight != null && (
                  <div>
                    <p className="text-xs text-slate-500">Weight</p>
                    <p className="text-sm font-medium text-slate-900">{patient.weight} kg</p>
                  </div>
                )}
              </div>
              {patient.allergies && (
                <div>
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Heart size={10} className="text-red-400" /> Allergies</p>
                  <p className="text-sm text-slate-700">{patient.allergies}</p>
                </div>
              )}
              {patient.existingConditions && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Existing Conditions</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{patient.existingConditions}</p>
                </div>
              )}
              {!patient.height && !patient.weight && !patient.allergies && !patient.existingConditions && (
                <p className="text-sm text-slate-400 italic">No medical information recorded.</p>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
              <Shield size={12} /> Stored with AES-256-GCM encryption + HMAC-SHA256 integrity verification
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
