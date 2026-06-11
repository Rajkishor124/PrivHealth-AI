import { useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, CircularProgress 
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchAppointmentAnalytics } from '../appointmentSlice';

export default function AppointmentAnalytics() {
  const dispatch = useAppDispatch();
  const { analytics, loading } = useAppSelector(state => state.appointments);

  useEffect(() => {
    dispatch(fetchAppointmentAnalytics());
  }, [dispatch]);

  if (loading || !analytics) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>Appointment Analytics</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Appointments', val: analytics.totalAppointments, color: 'primary.main' },
          { label: 'Today\'s Total', val: analytics.todayAppointments, color: 'info.main' },
          { label: 'Checked In', val: analytics.todayCheckedIn, color: 'success.main' },
          { label: 'Currently Waiting', val: analytics.todayWaiting, color: 'warning.main' },
          { label: 'In Consultation', val: analytics.todayInConsultation, color: 'error.main' },
          { label: 'Completed Today', val: analytics.todayCompleted, color: 'text.secondary' }
        ].map(m => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={m.label}>
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3, borderTop: `4px solid ${m.color}` }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }} color={m.color}>{m.val}</Typography>
              <Typography variant="subtitle1" color="text.secondary">{m.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Doctor Utilization (Today)</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell>Doctor Name</TableCell>
              <TableCell align="center">Total Appointments</TableCell>
              <TableCell align="center">Completed</TableCell>
              <TableCell align="center">Currently Waiting</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analytics.doctorUtilization.map((doc) => (
              <TableRow key={doc.doctorId}>
                <TableCell sx={{ fontWeight: 'bold' }}>{doc.doctorName}</TableCell>
                <TableCell align="center">{doc.totalAppointments}</TableCell>
                <TableCell align="center">{doc.completed}</TableCell>
                <TableCell align="center">{doc.waiting}</TableCell>
              </TableRow>
            ))}
            {analytics.doctorUtilization.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  No utilization data for today.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
