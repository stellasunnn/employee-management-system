import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loadUser, logout } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store/store';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Information</CardTitle>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-muted-foreground">Username</div>
                  <div className="col-span-2">{user.username}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-muted-foreground">Email</div>
                  <div className="col-span-2">{user.email}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-sm font-medium text-muted-foreground">Account Created</div>
                  <div className="col-span-2">{new Date(user.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
