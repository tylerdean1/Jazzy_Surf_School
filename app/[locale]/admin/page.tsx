import { Box, Button, Container, Typography } from '@mui/material';
import Link from 'next/link';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { isAdminRequest } from '@/lib/adminAuth';

export default async function AdminPage({ params }: { params: { locale: string } }) {
  const locale = params?.locale || 'en';
  const isAdmin = await isAdminRequest();

  if (!isAdmin) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" gutterBottom>
          Not authorized
        </Typography>
        <Typography sx={{ mb: 2 }}>You must sign in to view the admin area.</Typography>
        <Button component={Link} href={`/${locale}/adminlogin`} variant="contained">
          Go to Admin Login
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: { xs: 2, md: 4 }, pt: 2 }}>
        <Button href={`/api/admin/logout`} variant="outlined">
          Sign out
        </Button>
      </Box>
      <AdminDashboard />
    </>
  );
}