import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, TextField,
  CircularProgress
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchDoctorSchedule } from '../appointmentSlice';
import { format } from 'date-fns';

export default function DoctorSchedule() {
  const dispatch = useAppDispatch();
  const { doctorSchedule, loading } = useAppSelector(state => state.appointments);
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    dispatch(fetchDoctorSchedule(filterDate));
  }, [dispatch, filterDate]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>My Schedule</Typography>
        <TextField
          type="date"
          size="small"
          label="Date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doctorSchedule.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell fontWeight="bold">{apt.appointmentTime.substring(0,5)}</TableCell>
                  <TableCell>{apt.patientName}</TableCell>
                  <TableCell>{apt.reasonForVisit}</TableCell>
                  <TableCell>
                    <Chip label={apt.status.replace('_', ' ')} size="small" />
                  </TableCell>
                </TableRow>
              ))}
              {doctorSchedule.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    No appointments scheduled for this date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
}
