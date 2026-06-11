import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Grid, Button, Stack, Card, CardContent, Divider
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchDoctorQueueDashboard } from '../appointmentSlice';
import { callNextPatient, startQueueConsultation, completeQueueEntry, skipQueueEntry } from '@/api/appointmentApi';

export default function DoctorQueueDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { dashboard, loading } = useAppSelector(state => state.appointments);

  const loadQueue = () => dispatch(fetchDoctorQueueDashboard());

  useEffect(() => {
    loadQueue();
    // In a real app, you might want to set up polling or WebSockets here
    const interval = setInterval(loadQueue, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleCallNext = async () => {
    await callNextPatient();
    loadQueue();
  };

  const handleStartConsultation = async (queueId: number) => {
    await startQueueConsultation(queueId);
    loadQueue();
  };

  const handleComplete = async (queueId: number, patientId: number) => {
    await completeQueueEntry(queueId);
    loadQueue();
    // Navigate to EMR consultation form
    navigate(`/consultations/new`, { state: { patientId } });
  };

  const handleSkip = async (queueId: number) => {
    await skipQueueEntry(queueId);
    loadQueue();
  };

  if (loading && !dashboard) return <Typography>Loading dashboard...</Typography>;
  if (!dashboard) return null;

  const current = dashboard.currentPatient;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>Queue Dashboard</Typography>

      {/* Metrics Header */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Today', val: dashboard.totalToday, color: 'primary.main' },
          { label: 'Waiting', val: dashboard.waiting, color: 'warning.main' },
          { label: 'Completed', val: dashboard.completed, color: 'success.main' }
        ].map(m => (
          <Grid size={{ xs: 12, md: 4 }} key={m.label}>
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3, borderTop: `4px solid ${m.color}` }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }} color={m.color}>{m.val}</Typography>
              <Typography variant="subtitle1" color="text.secondary">{m.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* Current Patient Actions */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }} gutterBottom>Current Patient</Typography>
              <Divider sx={{ mb: 3 }} />

              {current ? (
                <Box>
                  <Typography variant="h1" sx={{ fontWeight: 'bold', mb: 1 }} color="primary.main" align="center">
                    {current.tokenNumber}
                  </Typography>
                  <Typography variant="h4" align="center" sx={{ mb: 4 }}>
                    {current.patientName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
                    Reason: {current.reasonForVisit || 'Routine Checkup'}
                  </Typography>

                  <Stack direction="row" spacing={2} sx={{ justifyContent: 'center' }}>
                    {current.status === 'CALLED' && (
                      <Button variant="contained" size="large" onClick={() => handleStartConsultation(current.id)}>
                        Start Consultation
                      </Button>
                    )}
                    {current.status === 'IN_CONSULTATION' && (
                      <Button variant="contained" color="success" size="large" onClick={() => handleComplete(current.id, current.patientId)}>
                        Complete & Write EMR
                      </Button>
                    )}
                    <Button variant="outlined" color="error" size="large" onClick={() => handleSkip(current.id)}>
                      Skip Patient
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>No patient currently in consultation.</Typography>
                  <Button 
                    variant="contained" 
                    size="large" 
                    onClick={handleCallNext}
                    disabled={dashboard.waiting === 0}
                  >
                    Call Next Patient
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Waiting Queue List */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%', maxHeight: 600, overflow: 'auto' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Waiting Queue</Typography>
            <Stack spacing={2}>
              {dashboard.queue.filter(q => q.status === 'WAITING').map((q) => (
                <Paper key={q.id} variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>{q.tokenNumber}</Typography>
                    <Typography variant="body2">{q.patientName}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">Pos: {q.queuePosition}</Typography>
                </Paper>
              ))}
              {dashboard.waiting === 0 && (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>Queue is empty.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
