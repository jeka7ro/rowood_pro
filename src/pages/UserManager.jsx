import React, { useEffect, useMemo, useState } from "react";
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Shield, ShieldAlert, Crown, User as UserIcon, Clock, Sparkles } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useTranslation } from '../components/translations/TranslationProvider';

export default function UserManager() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [changingRoleFor, setChangingRoleFor] = useState(null);
  const [newRoleValue, setNewRoleValue] = useState("");
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '' });

  const showAlert = (title, message) => {
    setAlertDialog({ isOpen: true, title, message });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [me, allUsers] = await Promise.all([
        base44.auth.me(),
        base44.entities.User.list()
      ]);
      setCurrentUser(me);
      setUsers(allUsers || []);
    } catch (error) {
      console.error("Failed to load users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!changingRoleFor || !newRoleValue) return;

    try {
      await base44.entities.User.update(changingRoleFor.id, { role: newRoleValue });

      await base44.entities.UserLog.create({
        user_id: currentUser.id,
        target_user_id: changingRoleFor.id,
        action: 'role_change',
        details: `Rol schimbat de la "${changingRoleFor.role}" la "${newRoleValue}" pentru ${changingRoleFor.email}`
      });

      await loadUsers();

      showAlert(t('success'), t('userManager.roleChanged', { email: changingRoleFor.email, role: newRoleValue }));
    } catch (error) {
      console.error("Failed to change role:", error);
      showAlert(t('error'), t('error'));
    } finally {
      setChangingRoleFor(null);
      setNewRoleValue("");
    }
  };

  const canEditUser = (user) => {
    if (!currentUser) return false;
    if (user.id === currentUser.id) return false;
    return true;
  };

  const getLastLoginText = (lastLoginDate) => {
    if (!lastLoginDate) return t('userManager.never');
    try {
      return formatDistanceToNow(new Date(lastLoginDate), { 
        addSuffix: true, 
        locale: ro 
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return (users || []).filter(u => {
      const roleOk = roleFilter === "all" || u.role === roleFilter;
      const textOk =
        !qq ||
        (u.full_name || "").toLowerCase().includes(qq) ||
        (u.email || "").toLowerCase().includes(qq);
      return roleOk && textOk;
    });
  }, [users, q, roleFilter]);

  return (
    <div className="space-y-6 pb-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 dark:from-green-600 dark:via-emerald-700 dark:to-teal-700 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        <div className="relative flex items-center gap-4">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1 tracking-tight">{t('userManager.title')}</h1>
            <p className="text-white/80 text-sm">{t('userManager.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="macos-window bg-white dark:bg-slate-900 border-gray-200/50 dark:border-slate-700/50">
        <div className="p-5 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">🔍 {t('filter')}</h3>
        </div>
        <div className="p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 block uppercase tracking-wide">{t('search')}</label>
              <Input 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
                placeholder={t('userManager.searchPlaceholder')}
                className="h-10 rounded-xl bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 block uppercase tracking-wide">{t('userManager.role')}</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder={t('userManager.allRoles')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600">
                  <SelectItem value="all">{t('userManager.allRoles')}</SelectItem>
                  <SelectItem value="admin">{t('userManager.admin')}</SelectItem>
                  <SelectItem value="user">{t('userManager.user')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="macos-window bg-white dark:bg-slate-900 border-gray-200/50 dark:border-slate-700/50">
        <div className="p-5 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-gray-50 to-white dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">📋 {t('userManager.userList')}</h3>
            <Badge variant="secondary" className="text-sm px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200">
              {filtered.length}
            </Badge>
          </div>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-12 h-12 border-3 border-green-200 dark:border-green-800 border-t-green-600 dark:border-t-green-400 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">{t('loadingUsers')}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table className="ios-table">
                <TableHeader>
                  <TableRow className="border-b border-gray-100 dark:border-slate-700">
                    <TableHead className="text-gray-700 dark:text-gray-300">{t('name')}</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">{t('pdf.email')}</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">{t('userManager.role')}</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">{t('userManager.lastLogin')}</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">{t('userManager.createdAt')}</TableHead>
                    <TableHead className="text-right text-gray-700 dark:text-gray-300">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => {
                    const isCurrentUser = currentUser && u.id === currentUser.id;
                    const canEdit = canEditUser(u);

                    return (
                      <TableRow key={u.id} className={`border-b border-gray-100 dark:border-slate-700 ${isCurrentUser ? 'bg-green-50 dark:bg-green-900/20' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                              u.role === 'admin' ? 'bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                            } text-white font-bold text-sm`}>
                              {(u.full_name || u.email || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                                {u.full_name || 'Fără nume'}
                                {isCurrentUser && (
                                  <Badge variant="default" className="ml-2 bg-green-600 dark:bg-green-500 text-[10px] px-2 py-0.5">
                                    {t('userManager.you')}
                                  </Badge>
                                )}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700 dark:text-gray-300 text-sm">{u.email}</TableCell>
                        <TableCell>
                          {u.role === 'admin' ? (
                            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white text-[10px] px-2 py-1">
                              <Crown className="w-2.5 h-2.5 mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[10px] px-2 py-1">
                              <UserIcon className="w-2.5 h-2.5 mr-1" />
                              User
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            <span className={!u.last_login_date ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}>
                              {getLastLoginText(u.last_login_date)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 text-xs">
                          {u.created_date ? new Date(u.created_date).toLocaleDateString('ro-RO') : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {canEdit ? (
                            <Select
                              value={u.role}
                              onValueChange={(value) => {
                                setChangingRoleFor(u);
                                setNewRoleValue(value);
                              }}
                            >
                              <SelectTrigger className="w-32 ml-auto h-9 rounded-xl text-xs bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600">
                                <SelectItem value="user">
                                  <div className="flex items-center gap-2">
                                    <UserIcon className="w-3.5 h-3.5" />
                                    User
                                  </div>
                                </SelectItem>
                                <SelectItem value="admin">
                                  <div className="flex items-center gap-2">
                                    <Crown className="w-3.5 h-3.5" />
                                    Admin
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline" className="border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-400 text-[10px] px-2 py-1">
                              <ShieldAlert className="w-2.5 h-2.5 mr-1" />
                              {t('userManager.protected')}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16">
                        <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-base">{t('userManager.noUsersFound')}</p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">{t('userManager.modifyFilters')}</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!changingRoleFor} onOpenChange={(open) => !open && setChangingRoleFor(null)}>
        <AlertDialogContent className="rounded-3xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-gray-100">
              <Shield className="w-5 h-5 text-amber-600" />
              {t('userManager.confirmRoleChange')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 dark:text-gray-400">
              {changingRoleFor && (
                <>
                  <p className="mb-3">{t('userManager.confirmMessage')}</p>
                  <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-2xl border border-gray-200 dark:border-slate-700 mb-3">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{changingRoleFor.full_name || changingRoleFor.email}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{changingRoleFor.email}</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-base font-semibold">
                    <Badge variant={changingRoleFor.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                      {changingRoleFor.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                    <span className="text-gray-400 dark:text-gray-500">→</span>
                    <Badge variant={newRoleValue === 'admin' ? 'default' : 'secondary'} className="text-xs">
                      {newRoleValue === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                  </div>
                  {newRoleValue === 'admin' && (
                    <div className="mt-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-2xl p-2.5">
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        ⚠️ <strong>{t('userManager.warning')}:</strong> {t('userManager.adminWarning')}
                      </p>
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setChangingRoleFor(null)} className="rounded-xl bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100">
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRoleChange}
              className="bg-green-600 hover:bg-green-700 rounded-xl"
            >
              {t('userManager.confirmChange')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={alertDialog.isOpen} onOpenChange={(open) => setAlertDialog({ ...alertDialog, isOpen: open })}>
        <AlertDialogContent className="rounded-3xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">{alertDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertDialog({ ...alertDialog, isOpen: false })} className="rounded-xl">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}