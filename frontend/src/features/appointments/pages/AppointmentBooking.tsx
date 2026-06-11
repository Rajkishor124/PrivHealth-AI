import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import {
  Box, Paper, Typography, TextField, Button, Grid,
  MenuItem, Alert, CircularProgress, Autocomplete
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useAppDispatch } from '@/app/hooks';
import { createAppointment, getDoctorAvailability } from '@/api/appointmentApi';
import { patientApi } from '@/api/patientApi';
import { getUsers } from '@/api/adminApi';
import type { Patient } from '@/types/patient';
import type { User } from '@/types/auth';
import type { DoctorAvailability } from '@/types/appointment';

interface AppointmentFormData {
  patientId: number;
  doctorId: number;
  appointmentDate: Date | null;
  appointmentTime: Date | null;
  reasonForVisit: string;
  notes: string;
}

export default function AppointmentBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedPatient = location.state?.patientId;

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AppointmentFormData>({
    defaultValues: {
      patientId: preselectedPatient || '',
      appointmentDate: null,
      appointmentTime: null,
      reasonForVisit: '',
      notes: ''
    }
  });

  const selectedDoctor = watch('doctorId');

  useEffect(() => {
    // Load patients and doctors
    Promise.all([
      patientApi.list({ page: 0, size: 1000 }), // In real app, use async autocomplete
      getUsers('DOCTOR', 0, 100)
    ]).then(([patientsRes, doctorsRes]) => {
      setPatients(patientsRes.data.data);
      setDoctors(doctorsRes.data.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      getDoctorAvailability(selectedDoctor).then(res => {
        setAvailability(res.data.data);
      }).catch(console.error);
    }
  }, [selectedDoctor]);

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!data.appointmentDate || !data.appointmentTime) {
        throw new Error('Please select date and time');
      }

      const dateStr = format(data.appointmentDate, 'yyyy-MM-dd');
      const timeStr = format(data.appointmentTime, 'HH:mm');

      await createAppointment({
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentDate: dateStr,
        appointmentTime: timeStr,
        reasonForVisit: data.reasonForVisit,
        notes: data.notes
      });
      
      navigate('/appointments');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Book Appointment</Typography>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Patient Selection */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                options={patients}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.phone})`}
                onChange={(_, value) => setValue('patientId', value?.id || 0)}
                defaultValue={patients.find(p => p.id === preselectedPatient)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Select Patient *" 
                    error={!!errors.patientId}
                  />
                )}
              />
            </Grid>

            {/* Doctor Selection */}
            <Grid size={{ xs: 12, md: 6 }}>
               <TextField
                select
                fullWidth
                label="Select Doctor *"
                {...register('doctorId', { required: 'Doctor is required' })}
                error={!!errors.doctorId}
                helperText={errors.doctorId?.message}
                defaultValue=""
              >
                {doctors.map((doc) => (
                  <MenuItem key={doc.id} value={doc.id}>
                    Dr. {doc.name} - {doc.specialization || 'General'}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Availability Info */}
            {availability.length > 0 && (
              <Grid size={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Doctor's Schedule:</Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                    {availability.map(slot => (
                      <Box key={slot.id} sx={{ bgcolor: 'background.paper', px: 1, py: 0.5, borderRadius: 1 }}>
                        {slot.dayOfWeek}: {slot.startTime.substring(0,5)} - {slot.endTime.substring(0,5)}
                      </Box>
                    ))}
                  </Box>
                </Alert>
              </Grid>
            )}

            {/* Date & Time */}
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Appointment Date *"
                disablePast
                onChange={(date) => setValue('appointmentDate', date)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TimePicker
                label="Appointment Time *"
                onChange={(time) => setValue('appointmentTime', time)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>

            {/* Details */}
            <Grid size={12}>
              <TextField
                fullWidth
                label="Reason for Visit"
                {...register('reasonForVisit')}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Additional Notes"
                {...register('notes')}
              />
            </Grid>

            {/* Submit */}
            <Grid size={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ minWidth: 200 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Book Appointment'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
