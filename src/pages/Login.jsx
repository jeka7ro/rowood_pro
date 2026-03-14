import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const LOCAL_ADMIN_EMAIL = import.meta.env.VITE_LOCAL_ADMIN_EMAIL || 'jeka7ro@gmail.com';
const LOCAL_ADMIN_PASSWORD = import.meta.env.VITE_LOCAL_ADMIN_PASSWORD || '15Martie!';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const { toast } = useToast();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        await new Promise(r => setTimeout(r, 300));

        if (email === LOCAL_ADMIN_EMAIL && password === LOCAL_ADMIN_PASSWORD) {
            const session = {
                id: 'local_admin_id',
                email: LOCAL_ADMIN_EMAIL,
                full_name: 'Admin RoWood',
                role: 'admin',
                isAuthenticated: true,
                loggedInAt: Date.now()
            };
            localStorage.setItem('rowood_session', JSON.stringify(session));

            const fromUrl = searchParams.get('from_url') || '/';
            try {
                const path = new URL(fromUrl, window.location.origin).pathname;
                window.location.href = path || '/';
            } catch {
                window.location.href = '/';
            }
        } else {
            toast({
                title: "Eroare de autentificare",
                description: "Email sau parolă incorectă.",
                variant: "destructive"
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <Card className="w-full max-w-md shadow-xl border-none">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold text-green-600">Autentificare</CardTitle>
                    <CardDescription>Introduceți datele pentru a accesa contul</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nume@exemplu.ro"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Parolă</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
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
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Se procesează...
                                </>
                            ) : (
                                'Autentificare'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
