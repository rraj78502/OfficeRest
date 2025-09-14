import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'sms' | 'email'>('email'); // New state for delivery method

  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const API_BASE_URL = (import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim()) ||
    `${window.location.protocol}//${window.location.hostname}:8000`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password, deliveryMethod);
    if (success) {
      navigate('/verify-otp'); // Navigate to OTP verification page
    } else {
      toast({
        title: 'Login Failed',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/user/forgot-password/request`, { email });
      if (res.data?.success) {
        setOtpToken(res.data.data?.token || null);
        setCurrentPage('otp');
        toast({ title: 'OTP Sent', description: 'An SMS OTP has been sent to your registered mobile.' });
      } else {
        toast({ title: 'Request Failed', description: res.data?.message || 'Unable to send OTP', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Request Failed', description: err?.response?.data?.message || 'Unable to send OTP', variant: 'destructive' });
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken) {
      toast({ title: 'Session expired', description: 'Please request a new OTP.', variant: 'destructive' });
      setCurrentPage('forgot');
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/user/forgot-password/verify`, { token: otpToken, otp });
      if (res.data?.success) {
        setResetToken(res.data.data?.resetToken || null);
        setCurrentPage('reset');
        toast({ title: 'OTP Verified', description: 'You can now reset your password.' });
      } else {
        toast({ title: 'Verification Failed', description: res.data?.message || 'Invalid OTP', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Verification Failed', description: err?.response?.data?.message || 'Invalid OTP', variant: 'destructive' });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: 'Validation', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (!resetToken) {
      toast({ title: 'Session expired', description: 'Please verify OTP again.', variant: 'destructive' });
      setCurrentPage('forgot');
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/user/forgot-password/reset`, { resetToken, newPassword });
      if (res.data?.success) {
        toast({ title: 'Password Reset', description: 'Password changed successfully. Please log in.' });
        setCurrentPage('login');
        setEmail('');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setOtp('');
        setOtpToken(null);
        setResetToken(null);
      } else {
        toast({ title: 'Reset Failed', description: res.data?.message || 'Unable to reset password', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Reset Failed', description: err?.response?.data?.message || 'Unable to reset password', variant: 'destructive' });
    }
  };

  const renderLoginPage = () => (
    <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">REST</h1>
          <p className="text-xl text-blue-700">Admin Login</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-5 w-5" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-12 h-12 border-blue-300 focus:border-blue-500 rounded-lg"
              required
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-5 w-5" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12 pr-12 h-12 border-blue-300 focus:border-blue-500 rounded-lg"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div>
            <Label>OTP Delivery Method</Label>
            <RadioGroup
              value={deliveryMethod}
              onValueChange={(value: 'sms' | 'email') => setDeliveryMethod(value)}
              className="flex space-x-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email-method" />
                <Label htmlFor="email-method">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sms" id="sms-method" />
                <Label htmlFor="sms-method">SMS</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-blue-800 font-semibold rounded-lg transition-colors"
          >
            Send OTP
          </Button>
          
          <div className="text-center">
            <span className="text-blue-600">Forgot password? </span>
            <button
              type="button"
              onClick={() => setCurrentPage('forgot')}
              className="text-yellow-600 hover:text-yellow-700 transition-colors"
            >
              Click Here
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderForgotPasswordPage = () => (
    <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-4">REST</h1>
          <p className="text-blue-700 text-lg">Enter your email address</p>
        </div>
        
        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border-blue-300 focus:border-blue-500 rounded-lg"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-blue-800 font-semibold rounded-lg transition-colors"
          >
            Send OTP
          </Button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setCurrentPage('login')}
              className="text-blue-600 hover:text-yellow-600 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderOtpPage = () => (
    <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-4">REST</h1>
          <p className="text-blue-700 text-lg">Enter OTP</p>
        </div>
        
        <form onSubmit={handleOtpVerification} className="space-y-6">
          <div>
            <Input
              type="text"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="h-12 border-blue-300 focus:border-blue-500 rounded-lg text-center text-xl tracking-widest"
              maxLength={6}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-blue-800 font-semibold rounded-lg transition-colors"
          >
            Verify OTP
          </Button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setCurrentPage('forgot')}
              className="text-blue-600 hover:text-yellow-600 transition-colors"
            >
              Back to Email Entry
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderResetPasswordPage = () => (
    <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-4">REST</h1>
          <p className="text-blue-700 text-lg">Change Password</p>
        </div>
        
        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div className="relative">
            <Input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-12 h-12 border-blue-300 focus:border-blue-500 rounded-lg"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600"
            >
              {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          <div>
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 border-blue-300 focus:border-blue-500 rounded-lg"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-blue-800 font-semibold rounded-lg transition-colors"
          >
            Change Password
          </Button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setCurrentPage('login')}
              className="text-blue-600 hover:text-yellow-600 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const getCurrentPageComponent = () => {
    switch (currentPage) {
      case 'login':
        return renderLoginPage();
      case 'forgot':
        return renderForgotPasswordPage();
      case 'otp':
        return renderOtpPage();
      case 'reset':
        return renderResetPasswordPage();
      default:
        return renderLoginPage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {getCurrentPageComponent()}
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex justify-end space-x-4 mb-4">
            <button className="text-blue-600 hover:text-blue-800 transition-colors">
              Contact
            </button>
            <button className="text-blue-600 hover:text-blue-800 transition-colors">
              Help
            </button>
          </div>
          <p className="text-blue-600 text-sm">
            2025 REST. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
