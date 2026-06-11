import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination, 
  Chip, IconButton, Button, Stack, TextField, MenuItem,
  CircularProgress
} from '@mui/material';
import { 
  Visibility, CheckCircleOutlined, CancelOutlined, 
  EditCalendarOutlined 
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchAppointments } from '../appointmentSlice';
import { checkInAppointment } from '@/api/appointmentApi';
import type { AppointmentStatus } from '@/types/appointment';

export default function AppointmentList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { appointments, loading, totalPages } = useAppSelector(state => state.appointments);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const loadData = () => {
    dispatch(fetchAppointments({ 
      page, size, 
      date: filterDate || undefined, 
      status: filterStatus || undefined 
    }));
  };

  useEffect(() => {
    loadData();
  }, [dispatch, page, size, filterDate, filterStatus]);

  const handleCheckIn = async (id: number) => {
    try {
      await checkInAppointment(id);
      loadData(); // Refresh
    } catch (err) {
      console.error(err);
      alert('Failed to check in');
    }
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Appointments</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/appointments/new')}
          sx={{ borderRadius: 2 }}
        >
          Book Appointment
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          type="date"
          label="Filter by Date"
          InputLabelProps={{ shrink: true }}
          value={filterDate}
          onChange={(e) => { setFilterDate(e.target.value); setPage(0); }}
          size="small"
        />
        <TextField
          select
          label="Filter by Status"
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="SCHEDULED">Scheduled</MenuItem>
          <MenuItem value="CHECKED_IN">Checked In</MenuItem>
          <MenuItem value="IN_QUEUE">In Queue</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="CANCELLED">Cancelled</MenuItem>
        </TextField>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Apt No.</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((apt) => (
                <TableRow key={apt.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">{apt.appointmentDate}</Typography>
                    <Typography variant="caption" color="text.secondary">{apt.appointmentTime.substring(0,5)}</Typography>
                  </TableCell>
                  <TableCell>{apt.appointmentNumber}</TableCell>
                  <TableCell>{apt.patientName}</TableCell>
                  <TableCell>{apt.doctorName}</TableCell>
                  <TableCell>
                    <Chip label={apt.status.replace('_', ' ')} color={getStatusColor(apt.status)} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {(apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') && (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="success"
                          startIcon={<CheckCircleOutline />}
                          onClick={() => handleCheckIn(apt.id)}
                        >
                          Check In
                        </Button>
                      )}
                      <IconButton onClick={() => navigate(`/appointments/${apt.id}`)} color="primary" size="small">
                        <Visibility />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {appointments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No appointments found.
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
