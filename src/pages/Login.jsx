import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, Eye, EyeOff, UserPlus, LogIn, Mail, Lock, User, Phone } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

// ─── Config ─────────────────────────────────────────
const ADMIN_USERS = [
  { email: 'jeka7ro@gmail.com', password: '15Martie!', full_name: 'Admin RoWood', role: 'admin' },
  { email: 'rowoodbv@gmail.com', password: 'Rowood123!', full_name: 'Admin RoWood BV', role: 'admin' },
];

const REGISTERED_USERS_KEY = 'rowood_registered_users';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// ─── Helpers ────────────────────────────────────────
function getRegisteredUsers() {
  try { return JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) || '[]'); }
  catch { return []; }
}

function saveRegisteredUser(user) {
  const users = getRegisteredUsers();
  users.push(user);
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

function decodeJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch { return null; }
}

// ─── Component ──────────────────────────────────────
export default function Login() {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const googleBtnRef = useRef(null);

    const redirectAfterAuth = useCallback(() => {
        const fromUrl = searchParams.get('from_url') || '/';
        try {
            const path = new URL(fromUrl, window.location.origin).pathname;
            window.location.href = path || '/';
        } catch { window.location.href = '/'; }
    }, [searchParams]);

    // ─── Google Sign-In ─────────────────────────────
    const handleGoogleCallback = useCallback((response) => {
        const payload = decodeJwt(response.credential);
        if (!payload) {
            toast({ title: "Eroare Google", description: "Nu s-a putut citi contul Google.", variant: "destructive" });
            return;
        }

        const googleEmail = payload.email;
        const givenName = payload.given_name || '';
        const familyName = payload.family_name || '';
        const fullName = payload.name || `${givenName} ${familyName}`.trim();
        const picture = payload.picture || '';

        // Check if already registered
        const registeredUsers = getRegisteredUsers();
        let existingUser = registeredUsers.find(u => u.email === googleEmail);
        
        if (!existingUser) {
            // Auto-register with Google
            existingUser = {
                id: `google_${Date.now()}`,
                email: googleEmail,
                password: null, // Google users don't have a password
                first_name: givenName,
                last_name: familyName,
                full_name: fullName,
                phone: '',
                picture,
                role: 'client',
                provider: 'google',
                created_at: new Date().toISOString()
            };
            saveRegisteredUser(existingUser);
        }

        // Check if it's an admin
        const adminUser = ADMIN_USERS.find(u => u.email === googleEmail);

        const session = {
            id: existingUser.id,
            email: googleEmail,
            full_name: fullName,
            first_name: givenName,
            last_name: familyName,
            phone: existingUser.phone || '',
            picture,
            role: adminUser ? 'admin' : 'client',
            provider: 'google',
            isAuthenticated: true,
            loggedInAt: Date.now()
        };
        localStorage.setItem('local_auth_session', JSON.stringify(session));

        toast({ title: `Bine ai venit, ${givenName}! 🎉` });
        setTimeout(() => redirectAfterAuth(), 400);
    }, [toast, redirectAfterAuth]);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
            auto_select: false,
        });

        if (googleBtnRef.current) {
            window.google.accounts.id.renderButton(googleBtnRef.current, {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'pill',
                width: '100%',
                logo_alignment: 'left',
            });
        }
    }, [mode, handleGoogleCallback]);

    // ─── Login handler ──────────────────────────────
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 300));

        // Admin check
        const adminUser = ADMIN_USERS.find(u => u.email === email && u.password === password);
        if (adminUser) {
            localStorage.setItem('local_auth_session', JSON.stringify({
                id: 'local_admin_id', email: adminUser.email, full_name: adminUser.full_name,
                role: 'admin', isAuthenticated: true, loggedInAt: Date.now()
            }));
            redirectAfterAuth();
            return;
        }

        // Client check
        const clientUser = getRegisteredUsers().find(u => u.email === email && u.password === password);
        if (clientUser) {
            localStorage.setItem('local_auth_session', JSON.stringify({
                id: clientUser.id, email: clientUser.email,
                full_name: clientUser.full_name || `${clientUser.first_name || ''} ${clientUser.last_name || ''}`.trim(),
                first_name: clientUser.first_name, last_name: clientUser.last_name,
                phone: clientUser.phone || '', role: 'client',
                isAuthenticated: true, loggedInAt: Date.now()
            }));
            redirectAfterAuth();
            return;
        }

        toast({ title: "Eroare de autentificare", description: "Email sau parolă incorectă.", variant: "destructive" });
        setIsLoading(false);
    };

    // ─── Register handler ───────────────────────────
    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 300));

        if (password.length < 6) {
            toast({ title: "Parolă prea scurtă", description: "Minimum 6 caractere.", variant: "destructive" });
            setIsLoading(false); return;
        }
        if (password !== confirmPassword) {
            toast({ title: "Parolele nu coincid", description: "Verifică parola.", variant: "destructive" });
            setIsLoading(false); return;
        }

        const allEmails = [...ADMIN_USERS.map(u => u.email), ...getRegisteredUsers().map(u => u.email)];
        if (allEmails.includes(email)) {
            toast({ title: "Email deja folosit", description: "Încearcă autentificarea.", variant: "destructive" });
            setIsLoading(false); return;
        }

        const fullName = `${firstName} ${lastName}`.trim();
        const newUser = {
            id: `client_${Date.now()}`, email, password,
            first_name: firstName, last_name: lastName, full_name: fullName,
            phone: phone || '', role: 'client', provider: 'email',
            created_at: new Date().toISOString()
        };
        saveRegisteredUser(newUser);

        localStorage.setItem('local_auth_session', JSON.stringify({
            id: newUser.id, email, full_name: fullName,
            first_name: firstName, last_name: lastName, phone: phone || '',
            role: 'client', isAuthenticated: true, loggedInAt: Date.now()
        }));

        toast({ title: "Cont creat cu succes! 🎉", description: `Bine ai venit, ${firstName}!` });
        setTimeout(() => redirectAfterAuth(), 500);
    };

    const resetForm = () => {
        setEmail(''); setPassword(''); setConfirmPassword('');
        setFirstName(''); setLastName(''); setPhone(''); setShowPassword(false);
    };

    // ─── Google button component ────────────────────
    const GoogleButton = () => {
        if (!GOOGLE_CLIENT_ID) {
            return (
                <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200 cursor-not-allowed opacity-60"
                    disabled
                    title="Google Client ID lipsă — adaugă VITE_GOOGLE_CLIENT_ID în .env.local"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continuă cu Google
                </button>
            );
        }
        return <div ref={googleBtnRef} className="w-full flex justify-center" />;
    };

    // ─── Render ─────────────────────────────────────
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <Card className="w-full max-w-md shadow-xl border-none">
                <CardHeader className="space-y-1 text-center pb-2">
                    <div className="mx-auto mb-2">
                        <img src="/logo-rowood.png" alt="RoWood" className="h-10 mx-auto" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-600">
                        {mode === 'login' ? 'Autentificare' : 'Creare Cont'}
                    </CardTitle>
                    <CardDescription>
                        {mode === 'login' 
                            ? 'Accesează-ți contul sau creează unul nou' 
                            : 'Completează datele pentru a-ți crea un cont'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Google Sign-In — always visible */}
                    <GoogleButton />
                    
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">sau cu email</span>
                        </div>
                    </div>

                    {mode === 'login' ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input id="email" type="email" placeholder="nume@exemplu.ro"
                                        value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Parolă</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input id="password" type={showPassword ? "text" : "password"}
                                        value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10 pr-10" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 gap-2" disabled={isLoading}>
                                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Se procesează...</>
                                    : <><LogIn className="w-4 h-4" /> Autentificare</>}
                            </Button>
                            <p className="text-center text-sm text-slate-500">
                                Nu ai cont?{' '}
                                <button type="button" onClick={() => { resetForm(); setMode('register'); }}
                                    className="text-green-600 hover:text-green-700 font-semibold underline underline-offset-2">
                                    Creează unul gratuit
                                </button>
                            </p>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="reg-fname">Prenume *</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input id="reg-fname" type="text" placeholder="Ion"
                                            value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="pl-10" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="reg-lname">Nume *</Label>
                                    <Input id="reg-lname" type="text" placeholder="Popescu"
                                        value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="reg-email">Email *</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input id="reg-email" type="email" placeholder="ion@exemplu.ro"
                                        value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="reg-phone">Telefon</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input id="reg-phone" type="tel" placeholder="07xx xxx xxx"
                                        value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="reg-password">Parolă * (min. 6 caractere)</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input id="reg-password" type={showPassword ? "text" : "password"}
                                        value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="pl-10 pr-10" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="reg-confirm">Confirmă parola *</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input id="reg-confirm" type={showPassword ? "text" : "password"}
                                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pl-10" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 gap-2" disabled={isLoading}>
                                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Se creează contul...</>
                                    : <><UserPlus className="w-4 h-4" /> Creează cont</>}
                            </Button>
                            <p className="text-center text-sm text-slate-500">
                                Ai deja cont?{' '}
                                <button type="button" onClick={() => { resetForm(); setMode('login'); }}
                                    className="text-green-600 hover:text-green-700 font-semibold underline underline-offset-2">
                                    Autentifică-te
                                </button>
                            </p>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
