
import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Lead, Deal, User } from '@/entities/all';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, CalendarCheck, Loader2, Phone, Mail, Calendar, CheckCircle2, Clock, AlertTriangle, Edit } from 'lucide-react';
import { useTranslation } from '../components/translations/TranslationProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckCircle2,
  note: CheckCircle2,
  quote_sent: Mail,
  demo: Calendar
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-red-100 text-red-800'
};

function ActivityForm({ activity, users, leads, deals, onSave, onCancel, isOpen }) {
  const [formData, setFormData] = useState(
    activity || {
      type: 'task',
      subject: '',
      description: '',
      related_to: 'lead',
      related_id: '',
      assigned_to: '',
      due_date: new Date().toISOString().split('T')[0],
      priority: 'normal'
    }
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initialData = activity ? {
        ...activity,
        due_date: activity.due_date ? format(parseISO(activity.due_date), 'yyyy-MM-dd') : new Date().toISOString().split('T')[0]
    } : {
      type: 'task',
      subject: '',
      description: '',
      related_to: 'lead',
      related_id: '',
      assigned_to: '',
      due_date: new Date().toISOString().split('T')[0],
      priority: 'normal'
    };
    setFormData(initialData);
  }, [activity, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await onSave(formData);
    setIsLoading(false);
  };

  const relatedOptions = {
    lead: leads.map(l => ({ value: l.id, label: `${l.first_name} ${l.last_name}` })),
    deal: deals.map(d => ({ value: d.id, label: d.deal_name }))
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{activity ? 'Editează Activitate' : 'Activitate Nouă'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className="space-y-4 p-4">
            <div>
              <Label htmlFor="subject">Subiect</Label>
              <Input id="subject" value={formData.subject} onChange={e => handleChange('subject', e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tip Activitate</Label>
                  <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(activityIcons).map(type => (
                        <SelectItem key={type} value={type} className="capitalize">{type.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Prioritate</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Scăzută</SelectItem>
                      <SelectItem value="normal">Normală</SelectItem>
                      <SelectItem value="high">Ridicatî</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Asociat Cu</Label>
                 <Select value={formData.related_to} onValueChange={(value) => handleChange('related_to', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="deal">Deal</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <div>
                <Label>Nume (Lead/Deal)</Label>
                <Select value={formData.related_id} onValueChange={(value) => handleChange('related_id', value)}>
                    <SelectTrigger><SelectValue placeholder={`Selectează ${formData.related_to}`} /></SelectTrigger>
                    <SelectContent>
                      {(relatedOptions[formData.related_to] || []).map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assigned_to">Alocat Lui</Label>
                  <Select value={formData.assigned_to} onValueChange={(value) => handleChange('assigned_to', value)}>
                    <SelectTrigger><SelectValue placeholder="Selectează utilizator" /></SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                    <Label htmlFor="due_date">Data Scadentă</Label>
                    <Input id="due_date" type="date" value={formData.due_date} onChange={e => handleChange('due_date', e.target.value)} />
                </div>
            </div>
             <div>
                <Label htmlFor="description">Descriere</Label>
                <Textarea id="description" value={formData.description} onChange={e => handleChange('description', e.target.value)} />
            </div>
          </div>
          <DialogFooter className="mt-4 p-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>Anulează</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {activity ? 'Actualizează' : 'Creează'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ActivityManager() {
  const { t } = useTranslation();
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [activityData, userData, leadData, dealData] = await Promise.all([
        Activity.list('-due_date'),
        User.list(),
        Lead.list(),
        Deal.list(),
      ]);
      setActivities(activityData);
      setUsers(userData);
      setLeads(leadData);
      setDeals(dealData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleToggleComplete = async (activity) => {
    await Activity.update(activity.id, { 
      completed: !activity.completed,
      completed_date: !activity.completed ? new Date().toISOString().split('T')[0] : null
    });
    fetchAllData();
  };
  
  const handleSaveActivity = async (formData) => {
    if (editingActivity) {
      await Activity.update(editingActivity.id, formData);
    } else {
      await Activity.create(formData);
    }
    await fetchAllData();
    setIsFormOpen(false);
    setEditingActivity(null);
  };

  const handleOpenForm = (activity = null) => {
    setEditingActivity(activity);
    setIsFormOpen(true);
  };
  
  const today = new Date().toISOString().split('T')[0];

  const overdueActivities = activities.filter(a => !a.completed && a.due_date && a.due_date < today);
  const dueTodayActivities = activities.filter(a => !a.completed && a.due_date === today);
  const upcomingActivities = activities.filter(a => !a.completed && a.due_date && a.due_date > today).slice(0, 10);

  const ActivityCard = ({ activity }) => {
    const Icon = activityIcons[activity.type] || CheckCircle2;
    const assignedUser = users.find(u => u.id === activity.assigned_to);
    
    let relatedName = activity.related_id ? activity.related_id.substring(0,8) : 'N/A'; // Default to ID if not found or empty
    if(activity.related_to === 'lead' && leads.length > 0) {
        const lead = leads.find(l => l.id === activity.related_id);
        if(lead) relatedName = `${lead.first_name} ${lead.last_name}`;
    } else if (activity.related_to === 'deal' && deals.length > 0) {
        const deal = deals.find(d => d.id === activity.related_id);
        if(deal) relatedName = deal.deal_name;
    }

    return (
      <div className="flex items-start gap-4 p-3 bg-white rounded-lg border hover:bg-slate-50 transition-colors group">
        <Checkbox
          className="mt-1"
          checked={activity.completed}
          onCheckedChange={() => handleToggleComplete(activity)}
        />
        <div className="flex items-center gap-2 mt-1">
          <div className={`p-2 rounded-full ${activity.completed ? 'bg-green-100' : 'bg-slate-100'}`}>
            <Icon className={`w-4 h-4 ${activity.completed ? 'text-green-600' : 'text-slate-600'}`} />
          </div>
        </div>
        <div className="flex-1">
          <p className={`font-medium ${activity.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
            {activity.subject}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs capitalize">
              {activity.type.replace('_', ' ')}
            </Badge>
            {activity.related_id && (
              <Badge variant="secondary" className="text-xs capitalize">
                {relatedName}
              </Badge>
            )}
            {activity.priority !== 'normal' && (
              <Badge className={`text-xs ${priorityColors[activity.priority]}`}>
                {activity.priority}
              </Badge>
            )}
          </div>
          {assignedUser && (
            <p className="text-xs text-slate-500 mt-1">Alocat: {assignedUser.full_name}</p>
          )}
        </div>
        <div className="text-right flex flex-col items-end">
          {activity.due_date && (
            <p className="text-sm font-semibold text-slate-700">
              {format(parseISO(activity.due_date), 'd MMM', { locale: ro })}
            </p>
          )}
          {activity.due_date && activity.due_date < today && !activity.completed && (
            <Badge className="bg-red-100 text-red-800 text-xs mt-1">Întârziat</Badge>
          )}
           <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleOpenForm(activity)}
            >
              <Edit className="w-4 h-4 text-slate-500" />
            </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
         <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <CalendarCheck className="w-8 h-8 text-green-600" />
            {t('activityManager.title')}
          </h1>
          <p className="text-slate-600 mt-1">{t('activityManager.description')}</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="w-4 h-4 mr-2" />
          {t('activityManager.addActivity')}
        </Button>
      </div>
      
      <ActivityForm
        activity={editingActivity}
        users={users}
        leads={leads}
        deals={deals}
        onSave={handleSaveActivity}
        onCancel={() => {setIsFormOpen(false); setEditingActivity(null);}}
        isOpen={isFormOpen}
       />

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-red-200 bg-red-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {t('activityManager.overdue')} ({overdueActivities.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto p-3">
              {overdueActivities.length > 0 ? (
                overdueActivities.map(a => <ActivityCard key={a.id} activity={a} />)
              ) : (
                <p className="text-slate-500 text-center py-4">Nu există activități întârziate</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-700 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {t('activityManager.dueToday')} ({dueTodayActivities.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto p-3">
              {dueTodayActivities.length > 0 ? (
                dueTodayActivities.map(a => <ActivityCard key={a.id} activity={a} />)
              ) : (
                <p className="text-slate-500 text-center py-4">Nu există activități pentru astăzi</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-700 flex items-center gap-2">
                <CalendarCheck className="w-5 h-5" />
                {t('activityManager.upcoming')} ({upcomingActivities.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto p-3">
              {upcomingActivities.length > 0 ? (
                upcomingActivities.map(a => <ActivityCard key={a.id} activity={a} />)
              ) : (
                <p className="text-slate-500 text-center py-4">Nu există activități programate</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
