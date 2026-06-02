import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquareQuote } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authApi } from '../../api/auth.api';

const schema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  ownerName: z.string().min(2, 'Your name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await authApi.register(data);
      navigate('/login', { state: { registered: true } });
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-700 rounded-2xl mb-4">
            <MessageSquareQuote className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Start selling smarter</h1>
          <p className="text-slate-500 mt-1">Create your ReplyCart store in 2 minutes</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Business Name"
              placeholder="Neha Boutique"
              error={errors.businessName?.message}
              required
              {...register('businessName')}
            />
            <Input
              label="Your Name"
              placeholder="Neha Sharma"
              error={errors.ownerName?.message}
              required
              {...register('ownerName')}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="neha@example.com"
                error={errors.email?.message}
                required
                {...register('email')}
              />
              <Input
                label="WhatsApp Number"
                type="tel"
                placeholder="+91 98765 43210"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              error={errors.password?.message}
              required
              {...register('password')}
            />

            <Button type="submit" className="w-full mt-2" loading={isSubmitting} size="lg">
              Create My Store — It's Free
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-700 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
