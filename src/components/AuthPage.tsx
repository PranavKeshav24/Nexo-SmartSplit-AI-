import React, { useState } from 'react';

// --- Integrated API Service Logic (Resolves Import Errors) ---scd

// Change the BASE_URL to explicitly point to the backend's port (4000)
const BASE_URL = 'http://localhost:4000/api';
// Utility function for fetching data
const customFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('jwtToken'); 

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }), 
        ...(options.headers || {}),
    };

    const config: RequestInit = { ...options, headers };
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    return response;
};

// 1. LOGIN API (POST /auth/login)
const loginUser = async (email: string, password: string) => {
    try {
        const response = await customFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        
        if (response.ok && data.token) {
            localStorage.setItem('jwtToken', data.token);
            localStorage.setItem('username', data.username);
        }
        return { ok: response.ok, message: data.message, username: data.username };
    } catch (error) {
        console.error("Login Fetch Error:", error);
        return { ok: false, message: "Network error. Is the backend server running?" };
    }
};

// 2. SIGN UP API (POST /auth/register)
const registerUser = async (username: string, email: string, password: string) => {
    try {
        const response = await customFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        
        return { ok: response.ok, message: data.message };
    } catch (error) {
        console.error("Register Fetch Error:", error);
        return { ok: false, message: "Network error. Is the backend server running?" };
    }
};

// --- Simplified UI Components (Resolving Import Errors) ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { disabled?: boolean }> = ({ className, children, disabled, ...props }) => (
    <button className={`px-4 py-2 font-semibold transition-colors duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`} disabled={disabled} {...props}>{children}</button>
);
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
    <input className={`w-full p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`} {...props} />
);
const Card: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (<div className={`rounded-2xl ${className}`}>{children}</div>);
const CardHeader: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (<div className={`p-6 ${className}`}>{children}</div>);
const CardTitle: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (<h1 className={className}>{children}</h1>);
const CardContent: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (<div className={`p-6 pt-0 ${className}`}>{children}</div>);
const Tabs: React.FC<{ defaultValue: string, className?: string, onValueChange: (value: string) => void, children: React.ReactNode }> = ({ defaultValue, className, onValueChange, children }) => (<div className={className} data-state={defaultValue}>{children}</div>);
const TabsList: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (<div className={`flex justify-center mb-6 ${className}`}>{children}</div>);
const TabsTrigger: React.FC<{ value: string, className?: string, children: React.ReactNode }> = ({ value, className, children }) => (<button onClick={() => onValueChange(value)} data-state={value} className={`flex-1 p-2 transition-colors ${className}`}>{children}</button>);
const TabsContent: React.FC<{ value: string, children: React.ReactNode }> = ({ value, children }) => (<div data-value={value} className="pt-4">{children}</div>);

// --- END Simplified UI Components ---

interface AuthPageProps {
  onAuth: () => void;
}

export function AuthPage({ onAuth }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Used as username
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    let result;

    if (activeTab === 'login') {
      // --- LOGIN LOGIC ---
      result = await loginUser(email, password);
      
      if (result.ok) {
        setMessage(`Welcome back, ${result.username}!`);
        setTimeout(onAuth, 500); 
      } else {
        setMessage(result.message || 'Login failed. Invalid credentials.');
      }

    } else {
      // --- SIGN UP LOGIC ---
      result = await registerUser(name, email, password);

      if (result.ok) {
        // Registration successful, attempt automatic login
        const loginResult = await loginUser(email, password);
        if (loginResult.ok) {
             setMessage(`Account created! Welcome, ${loginResult.username}.`);
             setTimeout(onAuth, 500);
        } else {
             // If auto-login fails, switch tab for manual login
             setMessage("Registration succeeded. Please log in.");
             setActiveTab('login');
        }
      } else {
        setMessage(result.message || 'Registration failed. Username/Email may already exist.');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://placehold.co/1080x720/1e3a8a/ffffff?text=NEXO+Background')] bg-cover bg-center opacity-10"></div>
      
      <Card className="w-full max-w-md bg-slate-800/40 backdrop-blur-xl border-slate-600/30 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl bg-gradient-to-r from-slate-200 to-blue-200 bg-clip-text text-transparent font-light tracking-wider">
            Welcome to NEXO
          </CardTitle>
          <p className="text-slate-400 font-light">Your intelligent expense companion</p>
        </CardHeader>
        
        <CardContent>
          {message && (
            <div className={`p-3 mb-4 rounded-xl text-center font-medium ${
                message.includes('success') || message.includes('Welcome') || message.includes('succeeded') ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'
            }`}>
              {message}
            </div>
          )}
          
          <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-700/50 rounded-xl">
              <TabsTrigger value="login" className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-lg">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-slate-300 data-[state=active]:bg-slate-600 data-[state=active]:text-white rounded-lg">
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-400 rounded-xl"
                    required
                  />
                </div>
                {/* Password Input */}
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-400 rounded-xl"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600/80 to-slate-600/80 hover:from-blue-500/80 hover:to-slate-500/80 text-white border-0 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading && activeTab === 'login' ? 'Signing In...' : 'Sign In'}
                </Button>
                {/* Google Login Placeholder (Future OAuth) */}
                <Button 
                  type="button" 
                  className="w-full bg-slate-700/50 border-slate-600/50 text-slate-200 rounded-xl hover:bg-slate-600/70"
                >
                  Sign In with Google
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input (Maps to username) */}
                <div>
                  <Input
                    type="text"
                    placeholder="Full Name (Username)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-400 rounded-xl"
                    required
                  />
                </div>
                {/* Email Input */}
                <div>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-400 rounded-xl"
                    required
                  />
                </div>
                {/* Password Input */}
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder:text-slate-400 rounded-xl"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600/80 to-slate-600/80 hover:from-blue-500/80 hover:to-slate-500/80 text-white border-0 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading && activeTab === 'signup' ? 'Creating...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}