'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Mock data
  const bookings = [
    {
      id: '1',
      customerName: 'John Doe',
      email: 'john@example.com',
      date: '2024-02-15',
      time: '10:00 AM',
      lessonType: 'Beginner',
      partySize: 2,
      total: 150,
      status: 'confirmed'
    },
    {
      id: '2',
      customerName: 'Jane Smith',
      email: 'jane@example.com',
      date: '2024-02-16',
      time: '2:00 PM',
      lessonType: 'Advanced',
      partySize: 1,
      total: 120,
      status: 'pending'
    }
  ];

  const revenueData = [
    { month: 'January 2024', bookings: 15, gross: 1875, stripeFees: 112.5, net: 1762.5 },
    { month: 'February 2024', bookings: 12, gross: 1500, stripeFees: 90, net: 1410 },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" gutterBottom color="#20B2AA">
        Admin Dashboard
      </Typography>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Bookings" />
            <Tab label="Lesson Types" />
            <Tab label="Media" />
            <Tab label="Reports" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5">Manage Bookings</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ backgroundColor: '#20B2AA' }}
            >
              Add Booking
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Lesson</TableCell>
                  <TableCell>Party Size</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <strong>{booking.customerName}</strong>
                        <br />
                        <small>{booking.email}</small>
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.date}<br />
                      {booking.time}
                    </TableCell>
                    <TableCell>{booking.lessonType}</TableCell>
                    <TableCell>{booking.partySize}</TableCell>
                    <TableCell>${booking.total}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: booking.status === 'confirmed' ? '#4caf50' : '#ff9800',
                          color: 'white',
                          fontSize: '0.8rem',
                          textAlign: 'center'
                        }}
                      >
                        {booking.status}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button size="small" startIcon={<Edit />} sx={{ mr: 1 }}>
                        Edit
                      </Button>
                      <Button size="small" startIcon={<Delete />} color="error">
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" gutterBottom>
            Lesson Types & Pricing
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Beginner Lesson
                  </Typography>
                  <Typography variant="h4" color="#20B2AA">
                    $75
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    1 hour • Max 6 participants
                  </Typography>
                  <Button variant="outlined" sx={{ mt: 2 }}>
                    Edit
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Advanced Coaching
                  </Typography>
                  <Typography variant="h4" color="#20B2AA">
                    $120
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Flexible • Max 4 participants
                  </Typography>
                  <Button variant="outlined" sx={{ mt: 2 }}>
                    Edit
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h5" gutterBottom>
            Media Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ mb: 3, backgroundColor: '#20B2AA' }}
            onClick={() => setDialogOpen(true)}
          >
            Add Media
          </Button>
          
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Card>
                  <Box
                    component="img"
                    sx={{
                      height: 140,
                      width: '100%',
                      objectFit: 'cover'
                    }}
                    src={`https://images.pexels.com/photos/41697${item}/pexels-photo-41697${item}.jpeg`}
                    alt={`Media ${item}`}
                  />
                  <CardContent>
                    <Button size="small" startIcon={<Edit />} sx={{ mr: 1 }}>
                      Edit
                    </Button>
                    <Button size="small" startIcon={<Delete />} color="error">
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h5" gutterBottom>
            Revenue Reports
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell>Bookings</TableCell>
                  <TableCell>Gross Revenue</TableCell>
                  <TableCell>Stripe Fees</TableCell>
                  <TableCell>Net Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {revenueData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.month}</TableCell>
                    <TableCell>{row.bookings}</TableCell>
                    <TableCell>${row.gross}</TableCell>
                    <TableCell>${row.stripeFees}</TableCell>
                    <TableCell>
                      <strong>${row.net}</strong>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Media</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="YouTube URL (optional)"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" sx={{ backgroundColor: '#20B2AA' }}>
            Add Media
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}