
import React, { useState, useEffect, useCallback } from 'react';
import { Deal, User } from '@/entities/all';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlusCircle, Loader2, Briefcase, Edit } from 'lucide-react';
import { useTranslation } from '../components/translations/TranslationProvider';
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


const stageNames = {
  prospecting: 'Prospectare',
  qualification: 'Calificare',
  proposal: 'Propunere Trimisă',
  negotiation: 'Negociere',
  closed_won: 'Câștigat',
  closed_lost: 'Pierdut',
};

const stageColors = {
  prospecting: 'bg-slate-500',
  qualification: 'bg-blue-500',
  proposal: 'bg-purple-500',
  negotiation: 'bg-orange-500',
  closed_won: 'bg-green-600',
  closed_lost: 'bg-red-600',
};

const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

const DealCard = ({ deal, index, onEdit }) => (
  <Draggable draggableId={deal.id} index={index}>
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className="mb-4"
      >
        <Card className="hover:shadow-md transition-shadow group">
          <CardContent className="p-4 relative">
             <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onEdit(deal)}
            >
              <Edit className="w-4 h-4 text-slate-500" />
            </Button>
            <h4 className="font-semibold mb-2 pr-8">{deal.deal_name}</h4>
            <p className="text-lg font-bold text-green-700 mb-2">
              {deal.value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </p>
            <Badge variant="outline">{deal.customer_email}</Badge>
          </CardContent>
        </Card>
      </div>
    )}
  </Draggable>
);

const PipelineColumn = ({ stage, deals, onEditDeal }) => {
  const { t } = useTranslation();
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="w-80 bg-slate-100 rounded-lg p-1 flex-shrink-0">
      <div className="p-3">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${stageColors[stage]}`}></div>
          {stageNames[stage]} 
          <Badge variant="secondary" className="ml-2">{deals.length}</Badge>
        </h3>
        <p className="text-sm font-bold text-slate-500 mt-1">
          {t('dealManager.totalValue')}: {totalValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
        </p>
      </div>
      <Droppable droppableId={stage}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="p-3 min-h-[500px]">
            {deals.map((deal, index) => (
              <DealCard key={deal.id} deal={deal} index={index} onEdit={onEditDeal} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

function DealForm({ deal, users, onSave, onCancel, isOpen }) {
  const [formData, setFormData] = useState(
    deal || {
      deal_name: '',
      customer_email: '',
      value: '',
      stage: 'prospecting',
      assigned_to: '',
      notes: ''
    }
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData(deal || {
      deal_name: '',
      customer_email: '',
      value: '',
      stage: 'prospecting',
      assigned_to: '',
      notes: ''
    });
  }, [deal, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const dataToSave = { 
      ...formData,
      value: formData.value ? parseFloat(formData.value) : 0,
      assigned_to: formData.assigned_to === '' ? null : formData.assigned_to, // Ensure null if not selected
    };
    await onSave(dataToSave);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{deal ? 'Editează Deal' : 'Deal Nou'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deal_name" className="text-right">Nume Deal</Label>
              <Input id="deal_name" value={formData.deal_name} onChange={e => handleChange('deal_name', e.target.value)} required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer_email" className="text-right">Email Client</Label>
              <Input id="customer_email" type="email" value={formData.customer_email} onChange={e => handleChange('customer_email', e.target.value)} required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">Valoare (EUR)</Label>
              <Input id="value" type="number" value={formData.value} onChange={e => handleChange('value', e.target.value)} required className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assigned_to" className="text-right">Alocat Lui</Label>
              <Select value={formData.assigned_to || ''} onValueChange={(value) => handleChange('assigned_to', value)} className="col-span-3">
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Selectează utilizator" /></SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Note</Label>
              <Textarea id="notes" value={formData.notes} onChange={e => handleChange('notes', e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>Anulează</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deal ? 'Actualizează Deal' : 'Creează Deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function DealManager() {
  const { t } = useTranslation();
  const [dealsByStage, setDealsByStage] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);

  const fetchDealsAndUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allDeals, allUsers] = await Promise.all([
        Deal.list('-created_date'),
        User.list()
      ]);
      const groupedDeals = stages.reduce((acc, stage) => {
        acc[stage] = allDeals.filter(deal => deal.stage === stage);
        return acc;
      }, {});
      setDealsByStage(groupedDeals);
      // Filter for users with role 'admin' for assignment purposes, or adjust as needed
      setUsers(allUsers.filter(u => u.role === 'admin')); 
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDealsAndUsers();
  }, [fetchDealsAndUsers]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId)) {
      return;
    }

    const sourceColumn = [...dealsByStage[source.droppableId]];
    const destColumn = [...dealsByStage[destination.droppableId]];
    const [movedDeal] = sourceColumn.splice(source.index, 1);
    destColumn.splice(destination.index, 0, movedDeal);
    
    setDealsByStage({
      ...dealsByStage,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    });

    try {
      await Deal.update(draggableId, { stage: destination.droppableId });
    } catch (error) {
      console.error("Failed to update deal stage:", error);
      // Revert state on error by refetching
      fetchDealsAndUsers(); 
    }
  };

  const handleSaveDeal = async (formData) => {
    try {
      if (editingDeal) {
        await Deal.update(editingDeal.id, formData);
      } else {
        await Deal.create(formData);
      }
      await fetchDealsAndUsers(); // Re-fetch all deals to update the UI
      setIsFormOpen(false);
      setEditingDeal(null);
    } catch (error) {
      console.error("Failed to save deal:", error);
      // Optionally show a user-friendly error message
    }
  };

  const handleOpenForm = (deal = null) => {
    setEditingDeal(deal);
    setIsFormOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-green-600" />
            {t('dealManager.title')}
          </h1>
          <p className="text-slate-600 mt-1">{t('dealManager.description')}</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="w-4 h-4 mr-2" /> 
          {t('dealManager.addDeal')}
        </Button>
      </div>

      <DealForm
        deal={editingDeal}
        users={users}
        onSave={handleSaveDeal}
        onCancel={() => setIsFormOpen(false)}
        isOpen={isFormOpen}
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-slate-400" />
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map(stage => (
              <PipelineColumn key={stage} stage={stage} deals={dealsByStage[stage] || []} onEditDeal={handleOpenForm} />
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
