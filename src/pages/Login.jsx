import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff, UserPlus, LogIn, Mail, Lock, User } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const ADMIN_USERS = [
  { email: 'jeka7ro@gmail.com', password: '15Martie!', full_name: 'Admin RoWood', role: 'admin' },
  { email: 'rowoodbv@gmail.com', password: 'Rowood123!', full_name: 'Admin RoWood BV', role: 'admin' },
];

const REGISTERED_USERS_KEY = 'rowood_registered_users';

function getRegisteredUsers() {
  try {
    return JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]');
  } catch { return []; }
}

function saveRegisteredUser(user) {
  const users = getRegisteredUsers();
  users.push(user);
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

export default function Login() {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const { toast } = useToast();

    const redirectAfterAuth = () => {
        const fromUrl = searchParams.get('from_url') || '/';
        try {
            const path = new URL(fromUrl, window.location.origin).pathname;
            window.location.href = path || '/';
        } catch {
            window.location.href = '/';
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 300));

        // Check admin users first
        const adminUser = ADMIN_USERS.find(u => u.email === email && u.password === password);
        if (adminUser) {
            const session = {
                id: 'local_admin_id',
                email: adminUser.email,
                full_name: adminUser.full_name,
                role: 'admin',
                isAuthenticated: true,
                loggedInAt: Date.now()
            };
            localStorage.setItem('local_auth_session', JSON.stringify(session));
            redirectAfterAuth();
            return;
        }

        // Check registered client users
        const registeredUsers = getRegisteredUsers();
        const clientUser = registeredUsers.find(u => u.email === email && u.password === password);
        if (clientUser) {
            const session = {
                id: clientUser.id,
                email: clientUser.email,
                full_name: clientUser.full_name,
                phone: clientUser.phone || '',
                role: 'client', // NO admin access
                isAuthenticated: true,
                loggedInAt: Date.now()
            };
            localStorage.setItem('local_auth_session', JSON.stringify(session));
            redirectAfterAuth();
            return;
        }

        toast({
            title: "Eroare de autentificare",
            description: "Email sau parolă incorectă.",
            variant: "destructive"
        });
        setIsLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 300));

        // Validations
        if (password.length < 6) {
            toast({ title: "Parolă prea scurtă", description: "Parola trebuie să aibă minim 6 caractere.", variant: "destructive" });
            setIsLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            toast({ title: "Parolele nu coincid", description: "Verifică parola introdusă.", variant: "destructive" });
            setIsLoading(false);
            return;
        }

        // Check if email already exists
        const registeredUsers = getRegisteredUsers();
        const adminExists = ADMIN_USERS.find(u => u.email === email);
        const clientExists = registeredUsers.find(u => u.email === email);
        if (adminExists || clientExists) {
            toast({ title: "Email deja folosit", description: "Acest email este deja înregistrat. Încearcă autentificarea.", variant: "destructive" });
            setIsLoading(false);
            return;
        }

        // Create client account
        const newUser = {
            id: `client_${Date.now()}`,
            email,
            password,
            full_name: fullName,
            phone: phone || '',
            role: 'client',
            created_at: new Date().toISOString()
        };
        saveRegisteredUser(newUser);

        // Auto-login after registration
        const session = {
            id: newUser.id,
            email: newUser.email,
            full_name: newUser.full_name,
            phone: newUser.phone,
            role: 'client',
            isAuthenticated: true,
            loggedInAt: Date.now()
        };
        localStorage.setItem('local_auth_session', JSON.stringify(session));

        toast({
            title: "Cont creat cu succes! 🎉",
            description: `Bine ai venit, ${fullName}!`,
        });

        setTimeout(() => redirectAfterAuth(), 500);
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setPhone('');
        setShowPassword(false);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <Card className="w-full max-w-md shadow-xl border-none">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold text-green-600">
                        {mode === 'login' ? 'Autentificare' : 'Creare Cont Nou'}
                    </CardTitle>
                    <CardDescription>
                        {mode === 'login' 
                            ? 'Introduceți datele pentru a accesa contul' 
                            : 'Completează datele pentru a-ți crea un cont'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {mode === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="nume@exemplu.ro"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Parolă</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Se procesează...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-4 h-4" />
                                        Autentificare
                                    </>
                                )}
                            </Button>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">sau</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                                onClick={() => { resetForm(); setMode('register'); }}
                            >
                                <UserPlus className="w-4 h-4" />
                                Creează un cont nou
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reg-name">Nume complet *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="reg-name"
                                        type="text"
                                        placeholder="Ion Popescu"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reg-email">Email *</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="reg-email"
                                        type="email"
                                        placeholder="ion@exemplu.ro"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reg-phone">Telefon</Label>
                                <div className="relative">
                                    <Input
                                        id="reg-phone"
                                        type="tel"
                                        placeholder="07xx xxx xxx"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="pl-3"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reg-password">Parolă * (min. 6 caractere)</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="reg-password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reg-confirm">Confirmă parola *</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="reg-confirm"
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700 gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Se creează contul...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        Creează cont
                                    </>
                                )}
                            </Button>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">sau</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full gap-2"
                                onClick={() => { resetForm(); setMode('login'); }}
                            >
                                <LogIn className="w-4 h-4" />
                                Am deja un cont — Autentificare
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
