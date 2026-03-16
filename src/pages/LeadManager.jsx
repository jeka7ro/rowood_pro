import React, { useState, useEffect, useCallback } from 'react';
import { Lead, User } from '@/entities/all';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  PlusCircle,
  Edit,
  Trash2,
  Loader2,
  Search,
  Target,
  Phone,
  Mail,
  Building2,
  LayoutGrid,
  List
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '../components/translations/TranslationProvider';

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-purple-100 text-purple-800',
  proposal: 'bg-orange-100 text-orange-800',
  negotiation: 'bg-indigo-100 text-indigo-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800'
};

const stageNames = {
  new: 'Nou',
  contacted: 'Contactat',
  qualified: 'Calificat',
  proposal: 'Propunere',
  negotiation: 'Negociere',
  won: 'Câștigat',
  lost: 'Pierdut'
};

const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

const LeadCard = ({ lead, index, onEdit }) => (
  <Draggable draggableId={lead.id.toString()} index={index}>
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className="mb-3"
      >
        <Card className="hover:shadow-md transition-all duration-200 group cursor-pointer bg-white border-slate-200 hover:border-green-300">
          <CardContent className="p-4 relative flex flex-col gap-2">
            <Button
              variant="ghost" size="icon"
              className="absolute top-2 right-2 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 hover:bg-slate-100 rounded-full"
              onClick={() => onEdit(lead)}
            >
              <Edit className="w-3.5 h-3.5 text-slate-500" />
            </Button>
            <div className="font-semibold text-slate-800 pr-6 truncate">{lead.first_name} {lead.last_name}</div>
            
            <div className="text-sm text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
            {lead.phone && (
               <div className="text-sm text-slate-500 flex items-center gap-1.5">
                 <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" /> 
                 <span className="truncate">{lead.phone}</span>
               </div>
            )}
            
            {lead.company && (
              <div className="text-sm font-medium text-slate-600 flex items-center gap-1.5 mt-1 bg-slate-50 p-1.5 rounded-md border border-slate-100">
                <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"/> 
                <span className="truncate">{lead.company}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-50">
               <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">{lead.source?.replace('_', ' ')}</Badge>
               {lead.budget && (
                 <span className="text-xs font-bold text-green-700 ml-auto">€{lead.budget.toLocaleString()}</span>
               )}
            </div>
          </CardContent>
        </Card>
      </div>
    )}
  </Draggable>
);

const PipelineColumn = ({ stage, leads, onEditLead }) => {
  return (
    <div className="w-[300px] bg-slate-100/60 rounded-xl p-2.5 flex-shrink-0 border border-slate-200/60 flex flex-col max-h-[calc(100vh-250px)]">
      <div className="p-1 mb-3 flex items-center justify-between sticky top-0 bg-slate-100/60 backdrop-blur-sm z-10">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[stage]}`}>
            {stageNames[stage]}
          </span>
        </h3>
        <span className="text-sm font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-sm">{leads.length}</span>
      </div>
      <Droppable droppableId={stage}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 overflow-y-auto px-1 pb-4 min-h-[150px] custom-scrollbar">
            {leads.map((lead, index) => (
              <LeadCard key={lead.id} lead={lead} index={index} onEdit={onEditLead} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

function LeadForm({ lead, users, onSave, onCancel, isOpen }) {
  const [formData, setFormData] = useState(
    lead || {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      source: 'website',
      status: 'new',
      interest_level: 'medium',
      budget: '',
      project_timeline: '',
      notes: '',
      assigned_to: ''
    }
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const dataToSave = { 
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : null
    };
    await onSave(dataToSave);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{lead ? 'Editează Lead' : 'Lead Nou'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">Prenume</Label>
                <Input 
                  id="first_name" 
                  value={formData.first_name} 
                  onChange={(e) => handleChange('first_name', e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="last_name">Nume</Label>
                <Input 
                  id="last_name" 
                  value={formData.last_name} 
                  onChange={(e) => handleChange('last_name', e.target.value)} 
                  required 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email} 
                  onChange={(e) => handleChange('email', e.target.value)} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input 
                  id="phone" 
                  value={formData.phone} 
                  onChange={(e) => handleChange('phone', e.target.value)} 
                />
              </div>
            </div>
            <div>
              <Label htmlFor="company">Companie</Label>
              <Input 
                id="company" 
                value={formData.company} 
                onChange={(e) => handleChange('company', e.target.value)} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source">Sursă</Label>
                <Select value={formData.source} onValueChange={(value) => handleChange('source', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="configurator">Configurator</SelectItem>
                    <SelectItem value="referral">Recomandare</SelectItem>
                    <SelectItem value="advertising">Publicitate</SelectItem>
                    <SelectItem value="cold_call">Apel la Rece</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nou</SelectItem>
                    <SelectItem value="contacted">Contactat</SelectItem>
                    <SelectItem value="qualified">Calificat</SelectItem>
                    <SelectItem value="proposal">Propunere</SelectItem>
                    <SelectItem value="negotiation">Negociere</SelectItem>
                    <SelectItem value="won">Câștigat</SelectItem>
                    <SelectItem value="lost">Pierdut</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Buget Estimat (EUR)</Label>
                <Input 
                  id="budget" 
                  type="number"
                  value={formData.budget} 
                  onChange={(e) => handleChange('budget', e.target.value)} 
                />
              </div>
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
            </div>
            <div>
              <Label htmlFor="notes">Note</Label>
              <Textarea 
                id="notes" 
                value={formData.notes} 
                onChange={(e) => handleChange('notes', e.target.value)} 
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="mt-4 p-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>Anulează</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {lead ? 'Actualizează Lead' : 'Creează Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function LeadManager() {
  const { t } = useTranslation();
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingLead, setEditingLead] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState('board'); // 'board' sau 'list'

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const [leadData, userData] = await Promise.all([
        Lead.list('-created_date'),
        User.list()
      ]);
      setLeads(leadData);
      setUsers(userData.filter(u => u.role === 'admin'));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSave = async (formData) => {
    if (editingLead) {
      await Lead.update(editingLead.id, formData);
    } else {
      await Lead.create(formData);
    }
    await fetchLeads();
    setIsFormOpen(false);
    setEditingLead(null);
  };
  
  const handleDelete = async (leadId) => {
    if (confirm('Ești sigur că vrei să ștergi acest lead?')) {
      await Lead.delete(leadId);
      fetchLeads();
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId)) return;

    // Actualizare optimistă UI
    const updatedLeads = leads.map(lead => {
      if (lead.id.toString() === draggableId) {
        return { ...lead, status: destination.droppableId };
      }
      return lead;
    });
    setLeads(updatedLeads);

    try {
      await Lead.update(draggableId, { status: destination.droppableId });
    } catch (error) {
      console.error("Failed to update lead status:", error);
      fetchLeads(); // Revert back
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = `${lead.first_name} ${lead.last_name} ${lead.email} ${lead.company}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Target className="w-8 h-8 text-green-600" />
            {t('leadManager.title')}
          </h1>
          <p className="text-slate-600 mt-1">{t('leadManager.description')}</p>
        </div>
        <Button onClick={() => { setEditingLead(null); setIsFormOpen(true); }} className="bg-green-600 hover:bg-green-700 shadow-md">
          <PlusCircle className="w-4 h-4 mr-2" /> 
          {t('leadManager.addLead')}
        </Button>
      </div>
      
      <div className="flex gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input 
            placeholder="Caută lead după nume, companie sau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-50 border-transparent focus:bg-white focus:border-green-500 rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-slate-50 border-transparent rounded-xl">
            <SelectValue placeholder="Filtrează după status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate statusurile</SelectItem>
            {stages.map(stage => (
              <SelectItem key={stage} value={stage}>{stageNames[stage]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="h-10 w-px bg-slate-200 mx-2"></div>
        
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <Button 
            variant={viewMode === 'board' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('board')}
            className={`rounded-lg px-3 ${viewMode === 'board' ? 'bg-white text-green-700 shadow-sm hover:bg-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutGrid className="w-4 h-4 mr-1.5" />
            Board
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('list')}
            className={`rounded-lg px-3 ${viewMode === 'list' ? 'bg-white text-green-700 shadow-sm hover:bg-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <List className="w-4 h-4 mr-1.5" />
            Listă
          </Button>
        </div>
      </div>

      <LeadForm
        lead={editingLead}
        users={users}
        onSave={handleSave}
        onCancel={() => { setIsFormOpen(false); setEditingLead(null); }}
        isOpen={isFormOpen}
      />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
           <Loader2 className="h-10 w-10 animate-spin text-green-500" />
        </div>
      ) : viewMode === 'board' ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 px-1 custom-scrollbar">
            {stages.map(stage => {
              // Dacă e aplicat filtrul de status din dropdown, ascundem celelalte coloane complet?
              // Sau doar ascundem itemii? Cel mai bine: dacă e fixat pe 'all', randează tot. 
              // Dacă a ales un anume status, randează doar coloana aia.
              if (statusFilter !== 'all' && statusFilter !== stage) return null;
              
              const columnLeads = filteredLeads.filter(l => l.status === stage);
              return (
                <PipelineColumn 
                  key={stage} 
                  stage={stage} 
                  leads={columnLeads} 
                  onEditLead={(lead) => { setEditingLead(lead); setIsFormOpen(true); }} 
                />
              );
            })}
          </div>
        </DragDropContext>
      ) : (
        <div className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
          <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>{t('leadManager.table.contact')}</TableHead>
              <TableHead>{t('leadManager.table.company')}</TableHead>
              <TableHead>{t('leadManager.table.status')}</TableHead>
              <TableHead>{t('leadManager.table.source')}</TableHead>
              <TableHead>{t('leadManager.table.assignedTo')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center p-12"><Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" /></TableCell></TableRow>
            ) : filteredLeads.map(lead => (
              <TableRow key={lead.id} className="hover:bg-slate-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-green-700">
                        {lead.first_name?.[0]}{lead.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{lead.first_name} {lead.last_name}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {lead.email}
                      </div>
                      {lead.phone && (
                        <div className="text-sm text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {lead.company ? (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {lead.company}
                    </div>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[lead.status]} variant="secondary">
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">{lead.source?.replace('_', ' ')}</TableCell>
                <TableCell>
                  {users.find(u => u.id === lead.assigned_to)?.full_name || 
                   <span className="text-slate-400">Neatribuit</span>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingLead(lead); setIsFormOpen(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(lead.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      )}
    </div>
  );
}