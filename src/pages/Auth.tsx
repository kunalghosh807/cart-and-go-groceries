import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkUser();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();
      
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (error) throw error;
        
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
        navigate('/');
      } else {
        // Signup with comprehensive validation
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        
        if (error) {
          const errorMessage = error.message.toLowerCase();
          
          // Check for existing user errors (comprehensive patterns)
          if (errorMessage.includes('user already registered') || 
              errorMessage.includes('email already registered') ||
              errorMessage.includes('already been registered') ||
              errorMessage.includes('user with this email already registered') ||
              errorMessage.includes('email address is already registered') ||
              errorMessage.includes('account with this email already exists') ||
              errorMessage.includes('duplicate') ||
              (error.status === 422 && errorMessage.includes('email'))) {
            
            toast({
              title: "Account Already Exists",
              description: "An account with this email already exists. Please sign in instead.",
              variant: "destructive",
            });
            
            // Auto-switch to login mode and populate email
            setIsLogin(true);
            setEmail(normalizedEmail);
            return;
          }
          
          // Handle password validation errors
          if (errorMessage.includes('password') && 
              (errorMessage.includes('weak') || errorMessage.includes('short') || errorMessage.includes('6 characters'))) {
            toast({
              title: "Password Too Weak",
              description: "Password must be at least 6 characters long with a mix of letters and numbers.",
              variant: "destructive",
            });
            return;
          }
          
          // Handle invalid email format
          if (errorMessage.includes('invalid email') || errorMessage.includes('email format')) {
            toast({
              title: "Invalid Email",
              description: "Please enter a valid email address.",
              variant: "destructive",
            });
            return;
          }
          
          // Handle rate limiting
          if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
            toast({
              title: "Too Many Attempts",
              description: "Please wait a moment before trying again.",
              variant: "destructive",
            });
            return;
          }
          
          throw error;
        }
        
        // Check for duplicate email signup (Supabase returns user without session for existing emails)
        if (data && data.user && !data.session && 
            (!data.user.identities || data.user.identities.length === 0)) {
          toast({
            title: "Account Already Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          
          // Auto-switch to login mode and populate email
          setIsLogin(true);
          setEmail(normalizedEmail);
          return;
        }
        
        toast({
          title: "Account Created Successfully!",
          description: "Please check your email to verify your account before signing in.",
        });
      }
    } catch (error: any) {
      // Fallback error handling
      let errorTitle = "Authentication Error";
      let errorDescription = error.message;
      
      if (error.message?.toLowerCase().includes('network')) {
        errorTitle = "Network Error";
        errorDescription = "Please check your internet connection and try again.";
      } else if (error.message?.toLowerCase().includes('invalid login')) {
        errorTitle = "Invalid Credentials";
        errorDescription = "Please check your email and password.";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-password-reset-otp', {
        body: { email }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "OTP Sent!",
        description: "Check your email for the 6-digit verification code. Check spam folder if not found.",
      });
      setShowForgotPassword(false);
      setShowOtpVerification(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please check your email and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First verify OTP with backend
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { 
          email: email.toLowerCase(),
          otp: otp
        }
      });
      
      if (error) {
        throw new Error("Invalid or expired OTP");
      }
      
      if (!data?.success) {
        throw new Error("Invalid or expired OTP");
      }
      
      // OTP is valid, proceed to password reset
      toast({
        title: "OTP Verified!",
        description: "Please enter your new password.",
      });
      
      setShowOtpVerification(false);
      setShowNewPassword(true);
    } catch (error: any) {
      toast({
        title: "Invalid OTP",
        description: "The verification code is invalid or has expired. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Call the password reset function with verified OTP
      const { data, error } = await supabase.functions.invoke('verify-otp-and-reset-password', {
        body: { 
          email: email.toLowerCase(),
          otp: otp,
          newPassword: newPassword
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data?.success) {
        throw new Error("Failed to reset password");
      }
      
      toast({
        title: "Password Reset Successful!",
        description: "You can now sign in with your new password.",
      });
      
      // Reset all states and go back to login
      setShowNewPassword(false);
      setShowOtpVerification(false);
      setShowForgotPassword(false);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setEmail('');
      setPassword('');
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
      
      // Go back to OTP verification if error
      setShowNewPassword(false);
      setShowOtpVerification(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {showForgotPassword ? 'Reset Password' : 
             showOtpVerification ? 'Enter Verification Code' :
             showNewPassword ? 'Set New Password' :
             (isLogin ? 'Sign In' : 'Create Account')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : showOtpVerification ? (
            <form onSubmit={handleOtpVerification} className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  We've sent a 6-digit verification code to {email}
                </p>

              </div>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpVerification(false);
                    setShowForgotPassword(true);
                    setOtp('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Resend Code
                </button>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpVerification(false);
                      setOtp('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            </form>
          ) : showNewPassword ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewPassword(false);
                    setShowOtpVerification(true);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Back to Verification
                </button>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                </Button>
              </form>
              
              <div className="mt-4 text-center space-y-2">
              {isLogin && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;