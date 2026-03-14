import React, { useEffect, useMemo, useState } from "react";
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, History, Filter, Download, RefreshCw, ShieldCheck, UserPlus, Trash2, Edit, LogIn, LogOut } from "lucide-react";
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const actionIcons = {
  login: LogIn,
  logout: LogOut,
  role_change: ShieldCheck,
  create: UserPlus,
  update: Edit,
  delete: Trash2,
};

const actionColors = {
  login: 'bg-green-100 text-green-800 border-green-200',
  logout: 'bg-slate-100 text-slate-800 border-slate-200',
  role_change: 'bg-purple-100 text-purple-800 border-purple-200',
  create: 'bg-blue-100 text-blue-800 border-blue-200',
  update: 'bg-amber-100 text-amber-800 border-amber-200',
  delete: 'bg-red-100 text-red-800 border-red-200',
};

const actionLabels = {
  login: 'Login',
  logout: 'Logout',
  role_change: 'Schimbare Rol',
  create: 'Creare',
  update: 'Actualizare',
  delete: 'Ștergere',
};

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const [logsData, usersData] = await Promise.all([
        base44.entities.UserLog.list("-created_date", 500),
        base44.entities.User.list()
      ]);
      setLogs(logsData || []);
      setUsers(usersData || []);
    } catch (error) {
      console.error("Failed to load logs:", error);
      setLogs([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserEmail = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.email || userId || 'Necunoscut';
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.full_name || user?.email || userId || 'Necunoscut';
  };

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return (logs || []).filter(l => {
      const actionOk = actionFilter === "all" || l.action === actionFilter;
      const userOk = userFilter === "all" || l.user_id === userFilter;
      const textOk =
        !qq ||
        (l.action || "").toLowerCase().includes(qq) ||
        (l.details || "").toLowerCase().includes(qq) ||
        getUserEmail(l.user_id).toLowerCase().includes(qq) ||
        getUserEmail(l.target_user_id).toLowerCase().includes(qq);
      return actionOk && userOk && textOk;
    });
  }, [logs, q, actionFilter, userFilter, users]);

  const exportLogs = () => {
    const csv = [
      ['Data', 'Ora', 'Utilizator', 'Acțiune', 'Țintă', 'Detalii'].join(','),
      ...filtered.map(l => [
        format(new Date(l.created_date), 'dd/MM/yyyy', { locale: ro }),
        format(new Date(l.created_date), 'HH:mm:ss', { locale: ro }),
        getUserEmail(l.user_id),
        actionLabels[l.action] || l.action,
        l.target_user_id ? getUserEmail(l.target_user_id) : '-',
        `"${(l.details || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `admin-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const uniqueActions = Array.from(new Set(logs.map(l => l.action).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header modern */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
              <History className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-1">📋 Jurnal Activitate Admin</h1>
              <p className="text-slate-300">Toate acțiunile administratorilor sunt înregistrate aici</p>
            </div>
          </div>
          <Button onClick={loadLogs} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reîmprospătează
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-semibold mb-1">Total Loguri</p>
                <p className="text-3xl font-bold text-slate-900">{logs.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <History className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-semibold mb-1">Login-uri</p>
                <p className="text-3xl font-bold text-slate-900">
                  {logs.filter(l => l.action === 'login').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <LogIn className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-semibold mb-1">Schimbări Rol</p>
                <p className="text-3xl font-bold text-slate-900">
                  {logs.filter(l => l.action === 'role_change').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-semibold mb-1">Utilizatori Activi</p>
                <p className="text-3xl font-bold text-slate-900">
                  {new Set(logs.map(l => l.user_id)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-xl border-none">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtrare
            </CardTitle>
            <Button onClick={exportLogs} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportă CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Caută</label>
              <Input 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
                placeholder="Acțiune, detalii, utilizator..." 
                className="h-12"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Acțiune</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Toate acțiunile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate Acțiunile</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>
                      {actionLabels[action] || action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Utilizator</label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Toți utilizatorii" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toți Utilizatorii</SelectItem>
                  {users.filter(u => u.role === 'admin').map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="shadow-xl border-none">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-800">📜 Istoric Complet</CardTitle>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {filtered.length} {filtered.length === 1 ? 'înregistrare' : 'înregistrări'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Se încarcă jurnalul...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold text-slate-700">Data & Ora</TableHead>
                    <TableHead className="font-bold text-slate-700">Utilizator</TableHead>
                    <TableHead className="font-bold text-slate-700">Acțiune</TableHead>
                    <TableHead className="font-bold text-slate-700">Țintă</TableHead>
                    <TableHead className="font-bold text-slate-700">Detalii</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => {
                    const ActionIcon = actionIcons[l.action] || History;
                    return (
                      <TableRow key={l.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-mono text-sm text-slate-700">
                          <div>
                            <p className="font-semibold">
                              {format(new Date(l.created_date), 'dd MMM yyyy', { locale: ro })}
                            </p>
                            <p className="text-xs text-slate-500">
                              {format(new Date(l.created_date), 'HH:mm:ss', { locale: ro })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 text-white flex items-center justify-center text-xs font-bold">
                              {getUserName(l.user_id)[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm">
                                {getUserName(l.user_id)}
                              </p>
                              <p className="text-xs text-slate-500">{getUserEmail(l.user_id)}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`border ${actionColors[l.action] || 'bg-slate-100 text-slate-800'}`}>
                            <ActionIcon className="w-3 h-3 mr-1" />
                            {actionLabels[l.action] || l.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-700 text-sm">
                          {l.target_user_id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                                {getUserName(l.target_user_id)[0]?.toUpperCase()}
                              </div>
                              <span>{getUserName(l.target_user_id)}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="text-sm text-slate-700 truncate" title={l.details || ""}>
                            {l.details || <span className="text-slate-400">-</span>}
                          </p>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16">
                        <History className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium text-lg">Nicio înregistrare găsită</p>
                        <p className="text-slate-400 text-sm mt-2">Încearcă să modifici filtrele de căutare</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}