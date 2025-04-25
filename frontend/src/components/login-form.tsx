import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '@/store/slices/authSlice';
import { RootState, AppDispatch } from '@/store/store';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LoginFormData {
  username: string;
  password: string;
}

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data: LoginFormData) => {
    dispatch(clearError());
    const result = await dispatch(login(data));

    if (login.fulfilled.match(result)) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your credentials below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...register('username', { required: 'Username is required' })}
                  placeholder="Enter your username"
                  required
                />
                {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  required
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
