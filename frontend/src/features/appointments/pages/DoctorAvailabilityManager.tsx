import { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, MenuItem, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton
} from '@mui/material';
import { DeleteOutlined } from '@mui/icons-material';
import { getHospitalAvailability, setDoctorAvailability, deleteAvailability } from '@/api/appointmentApi';
import { adminApi } from '@/api/adminApi';
import type { DoctorAvailability, DoctorAvailabilityRequest } from '@/types/appointment';
import type { User } from '@/types/auth';

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function DoctorAvailabilityManager() {
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [doctorId, setDoctorId] = useState<number | ''>('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [maxAppointments, setMaxAppointments] = useState(20);

  const loadData = async () => {
    try {
      const [availRes, docRes] = await Promise.all([
        getHospitalAvailability(),
        adminApi.getUsers({ role: 'DOCTOR', page: 0, size: 100 })
      ]);
      setAvailability(availRes.data.data);
      setDoctors(docRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!doctorId || !dayOfWeek) return alert('Please select doctor and day');
    
    try {
      setLoading(true);
      await setDoctorAvailability({
        doctorId: doctorId as number,
        dayOfWeek,
        startTime,
        endTime,
        maxAppointmentsPerSlot: maxAppointments,
        active: true
      });
      loadData();
      // Reset form partially
      setDayOfWeek('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this availability slot?')) return;
    await deleteAvailability(id);
    loadData();
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>Doctor Availability</Typography>

      <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Add / Update Schedule</Typography>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select fullWidth label="Doctor" size="small"
              value={doctorId} onChange={e => setDoctorId(Number(e.target.value))}
            >
              {doctors.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select fullWidth label="Day" size="small"
              value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)}
            >
              {DAYS_OF_WEEK.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField
              type="time" fullWidth label="Start Time" size="small" slotProps={{ inputLabel: { shrink: true } }}
              value={startTime} onChange={e => setStartTime(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField
              type="time" fullWidth label="End Time" size="small" slotProps={{ inputLabel: { shrink: true } }}
              value={endTime} onChange={e => setEndTime(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField
              type="number" fullWidth label="Max Appts" size="small"
              value={maxAppointments} onChange={e => setMaxAppointments(Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 1 }}>
            <Button variant="contained" fullWidth onClick={handleSave} disabled={loading}>Save</Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell>Doctor</TableCell>
              <TableCell>Day</TableCell>
              <TableCell>Time</TableCell>
              <TableCell align="center">Max Appts</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {availability.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.doctorName}</TableCell>
                <TableCell>{a.dayOfWeek}</TableCell>
                <TableCell>{a.startTime.substring(0,5)} - {a.endTime.substring(0,5)}</TableCell>
                <TableCell align="center">{a.maxAppointmentsPerSlot}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleDelete(a.id)} color="error" size="small">
                    <DeleteOutlined />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
