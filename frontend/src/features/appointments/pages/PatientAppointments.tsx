import { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination, Chip,
  CircularProgress
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMyAppointments } from '../appointmentSlice';
import type { AppointmentStatus } from '@/types/appointment';

export default function PatientAppointments() {
  const dispatch = useAppDispatch();
  const { myAppointments, loading, totalPages } = useAppSelector(state => state.appointments);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  useEffect(() => {
    dispatch(fetchMyAppointments({ page, size }));
  }, [dispatch, page, size]);

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'SCHEDULED': return 'primary';
      case 'CONFIRMED': return 'info';
      case 'CHECKED_IN': return 'success';
      case 'IN_QUEUE': return 'warning';
      case 'IN_CONSULTATION': return 'error';
      case 'COMPLETED': return 'default';
      case 'CANCELLED': return 'error';
      case 'NO_SHOW': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>My Appointments</Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {myAppointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{apt.appointmentDate}</Typography>
                    <Typography variant="caption" color="text.secondary">{apt.appointmentTime.substring(0,5)}</Typography>
                  </TableCell>
                  <TableCell>{apt.doctorName}</TableCell>
                  <TableCell>{apt.reasonForVisit}</TableCell>
                  <TableCell>
                    <Chip label={apt.status.replace('_', ' ')} color={getStatusColor(apt.status)} size="small" />
                  </TableCell>
                </TableRow>
              ))}
              {myAppointments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    You have no appointments.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        <TablePagination
          component="div"
          count={totalPages * size}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={size}
          onRowsPerPageChange={(e) => {
            setSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>
    </Box>
  );
}
