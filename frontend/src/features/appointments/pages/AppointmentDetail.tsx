import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Chip, Button, Divider, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { getAppointment, cancelAppointment, rescheduleAppointment, checkInAppointment } from '@/api/appointmentApi';
import type { Appointment } from '@/types/appointment';

export default function AppointmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Reschedule dialog state
  const [openReschedule, setOpenReschedule] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const loadAppointment = async () => {
    try {
      const res = await getAppointment(Number(id));
      setAppointment(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadAppointment();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (!appointment) return <Typography color="error">Appointment not found.</Typography>;

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    await cancelAppointment(appointment.id);
    loadAppointment();
  };

  const handleCheckIn = async () => {
    await checkInAppointment(appointment.id);
    loadAppointment();
  };

  const handleReschedule = async () => {
    await rescheduleAppointment(appointment.id, { appointmentDate: newDate, appointmentTime: newTime });
    setOpenReschedule(false);
    loadAppointment();
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Appointment Details</Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Appointment Number</Typography>
            <Typography variant="body1" fontWeight="bold">{appointment.appointmentNumber}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Status</Typography>
            <Box mt={0.5}>
              <Chip label={appointment.status.replace('_', ' ')} color="primary" />
            </Box>
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Patient</Typography>
            <Typography variant="h6">{appointment.patientName}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Doctor</Typography>
            <Typography variant="h6">{appointment.doctorName}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Date & Time</Typography>
            <Typography variant="body1">
              {appointment.appointmentDate} at {appointment.appointmentTime.substring(0,5)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Reason for Visit</Typography>
            <Typography variant="body1">{appointment.reasonForVisit || 'N/A'}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">Notes</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1 }}>
              {appointment.notes || 'No additional notes.'}
            </Typography>
          </Grid>
        </Grid>

        {/* Actions based on status */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          {(appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED') && (
            <>
              <Button variant="contained" color="success" onClick={handleCheckIn}>Check In Patient</Button>
              <Button variant="outlined" color="primary" onClick={() => setOpenReschedule(true)}>Reschedule</Button>
              <Button variant="outlined" color="error" onClick={handleCancel}>Cancel</Button>
            </>
          )}
        </Box>
      </Paper>

      {/* Reschedule Dialog */}
      <Dialog open={openReschedule} onClose={() => setOpenReschedule(false)}>
        <DialogTitle>Reschedule Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              type="date"
              label="New Date"
              InputLabelProps={{ shrink: true }}
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
            />
            <TextField
              type="time"
              label="New Time"
              InputLabelProps={{ shrink: true }}
              value={newTime}
              onChange={e => setNewTime(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReschedule(false)}>Cancel</Button>
          <Button onClick={handleReschedule} variant="contained" disabled={!newDate || !newTime}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
