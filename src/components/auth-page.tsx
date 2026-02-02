import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Chrome, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.jpg';

interface AuthPageProps {
  onLogin: (userData: any) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login/signup
    setTimeout(() => {
      onLogin({ name: 'User', email: 'user@example.com' });
      setIsLoading(false);
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate Google Login
    setTimeout(() => {
      onLogin({ name: 'Google User', email: 'google@example.com' });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-cyber-gradient flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-500">
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Header */}
        <div className="text-center space-y-4">
          <div className="relative inline-block group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <img 
              src={logo} 
              alt="Logo" 
              className="relative h-20 w-20 rounded-full border-2 border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              {isLogin ? 'Welcome Back' : 'Start Mining Today'}
            </h1>
            <p className="text-muted-foreground text-sm max-w-[280px] mx-auto">
              Join the future of Web3 tourism mining and start earning rewards.
            </p>
          </div>
        </div>

        <Card className="bg-card/30 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
          <CardHeader className="pb-4">
            <CardTitle className="sr-only">{isLogin ? 'Login' : 'Sign Up'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Action: Google Login */}
            <Button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-white text-black hover:bg-white/90 transition-all duration-300 font-semibold rounded-xl flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Chrome className="h-5 w-5" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-muted-foreground">OR</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input 
                      placeholder="Username" 
                      className="bg-white/5 border-white/10 pl-10 h-11 rounded-xl focus:ring-purple-500/50" 
                      required 
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input 
                    type="email" 
                    placeholder="Email Address" 
                    className="bg-white/5 border-white/10 pl-10 h-11 rounded-xl focus:ring-purple-500/50" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input 
                    type="password" 
                    placeholder="Password" 
                    className="bg-white/5 border-white/10 pl-10 h-11 rounded-xl focus:ring-purple-500/50" 
                    required 
                  />
                </div>
                {isLogin && (
                  <div className="text-right">
                    <button type="button" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-300 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                {isLogin ? 'Login' : 'Create Account'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-sm text-white/60">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-400 font-semibold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
          
          <p className="text-[10px] text-white/30 px-8 leading-relaxed">
            By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
