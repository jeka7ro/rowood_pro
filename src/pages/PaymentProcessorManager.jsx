import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Loader2, CreditCard, Eye, EyeOff } from 'lucide-react';

const processorOptions = [
  { value: 'viva_wallet', label: 'Viva Wallet', logo: '💳' },
  { value: 'stripe', label: 'Stripe', logo: '💳' },
  { value: 'netopia', label: 'Netopia (mobilPay)', logo: '🇷🇴' },
  { value: 'euplatesc', label: 'euplatesc.ro', logo: '🇷🇴' },
  { value: 'paypal', label: 'PayPal', logo: '💰' },
  { value: 'transfer_bancar', label: 'Transfer Bancar', logo: '🏦' }
];

function ProcessorForm({ processor, onSave, onCancel, isOpen }) {
  const [formData, setFormData] = useState(
    processor || {
      processor_name: 'viva_wallet',
      display_name: '',
      description: '',
      logo_url: '',
      is_active: true,
      is_default: false,
      priority_order: 100,
      api_key: '',
      secret_key: '',
      merchant_id: '',
      environment: 'test',
      webhook_url: '',
      return_url: '',
      cancel_url: '',
      supported_currencies: ['EUR', 'RON'],
      transaction_fee_percent: 0,
      transaction_fee_fixed: 0,
      additional_settings: {}
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    if (processor) {
      setFormData(processor);
    }
  }, [processor, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await onSave(formData);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-900 dark:text-gray-100">
            {processor ? 'Editează Procesor de Plăți' : 'Adaugă Procesor de Plăți'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6 pt-4">
          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Informații de Bază</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="processor_name" className="dark:text-gray-300">Procesor *</Label>
                <Select 
                  value={formData.processor_name} 
                  onValueChange={(v) => handleChange('processor_name', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {processorOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.logo} {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="display_name" className="dark:text-gray-300">Nume Afișat *</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => handleChange('display_name', e.target.value)}
                  placeholder="Card Bancar (Viva Wallet)"
                  required
                  className="dark:bg-slate-700 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="dark:text-gray-300">Descriere</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Plătește securizat cu cardul bancar"
                rows={2}
                className="dark:bg-slate-700 dark:text-gray-100"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="logo_url" className="dark:text-gray-300">URL Logo</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) => handleChange('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="dark:bg-slate-700 dark:text-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="priority_order" className="dark:text-gray-300">Ordine Afișare</Label>
                <Input
                  id="priority_order"
                  type="number"
                  value={formData.priority_order}
                  onChange={(e) => handleChange('priority_order', parseInt(e.target.value))}
                  className="dark:bg-slate-700 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Credențiale API</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSecrets(!showSecrets)}
              >
                {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="environment" className="dark:text-gray-300">Mediu</Label>
                <Select 
                  value={formData.environment} 
                  onValueChange={(v) => handleChange('environment', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test / Sandbox</SelectItem>
                    <SelectItem value="production">Producție</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="merchant_id" className="dark:text-gray-300">Merchant ID</Label>
                <Input
                  id="merchant_id"
                  type={showSecrets ? "text" : "password"}
                  value={formData.merchant_id}
                  onChange={(e) => handleChange('merchant_id', e.target.value)}
                  className="dark:bg-slate-700 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="api_key" className="dark:text-gray-300">API Key</Label>
                <Input
                  id="api_key"
                  type={showSecrets ? "text" : "password"}
                  value={formData.api_key}
                  onChange={(e) => handleChange('api_key', e.target.value)}
                  className="dark:bg-slate-700 dark:text-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="secret_key" className="dark:text-gray-300">Secret Key</Label>
                <Input
                  id="secret_key"
                  type={showSecrets ? "text" : "password"}
                  value={formData.secret_key}
                  onChange={(e) => handleChange('secret_key', e.target.value)}
                  className="dark:bg-slate-700 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">URL-uri de Redirecționare</h3>

            <div>
              <Label htmlFor="return_url" className="dark:text-gray-300">URL Retur (Succes)</Label>
              <Input
                id="return_url"
                value={formData.return_url}
                onChange={(e) => handleChange('return_url', e.target.value)}
                placeholder="https://rowood.ro/payment/success"
                className="dark:bg-slate-700 dark:text-gray-100"
              />
            </div>

            <div>
              <Label htmlFor="cancel_url" className="dark:text-gray-300">URL Anulare</Label>
              <Input
                id="cancel_url"
                value={formData.cancel_url}
                onChange={(e) => handleChange('cancel_url', e.target.value)}
                placeholder="https://rowood.ro/payment/cancel"
                className="dark:bg-slate-700 dark:text-gray-100"
              />
            </div>

            <div>
              <Label htmlFor="webhook_url" className="dark:text-gray-300">URL Webhook</Label>
              <Input
                id="webhook_url"
                value={formData.webhook_url}
                onChange={(e) => handleChange('webhook_url', e.target.value)}
                placeholder="https://rowood.ro/api/webhook/payment"
                className="dark:bg-slate-700 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="space-y-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Comisioane Tranzacții</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Opțional: introduceți comisioanele pentru raportare internă
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transaction_fee_percent" className="dark:text-gray-300">Comision Procentual (%)</Label>
                <Input
                  id="transaction_fee_percent"
                  type="number"
                  step="0.01"
                  value={formData.transaction_fee_percent}
                  onChange={(e) => handleChange('transaction_fee_percent', parseFloat(e.target.value) || 0)}
                  placeholder="2.9"
                  className="dark:bg-slate-700 dark:text-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="transaction_fee_fixed" className="dark:text-gray-300">Comision Fix (EUR)</Label>
                <Input
                  id="transaction_fee_fixed"
                  type="number"
                  step="0.01"
                  value={formData.transaction_fee_fixed}
                  onChange={(e) => handleChange('transaction_fee_fixed', parseFloat(e.target.value) || 0)}
                  placeholder="0.25"
                  className="dark:bg-slate-700 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Setări</h3>

            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded border border-gray-200 dark:border-slate-700">
              <div>
                <Label htmlFor="is_active" className="dark:text-gray-300">Procesor Activ</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">Afișează la checkout</p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(v) => handleChange('is_active', v)}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded border border-gray-200 dark:border-slate-700">
              <div>
                <Label htmlFor="is_default" className="dark:text-gray-300">Procesor Implicit</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">Selectat automat la checkout</p>
              </div>
              <Switch
                id="is_default"
                checked={formData.is_default}
                onCheckedChange={(v) => handleChange('is_default', v)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Anulează
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvează
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function PaymentProcessorManager() {
  const [processors, setProcessors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProcessor, setEditingProcessor] = useState(null);
  const [processorToDelete, setProcessorToDelete] = useState(null);

  const fetchProcessors = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.PaymentProcessor.list('-priority_order', 100);
      setProcessors(data);
    } catch (error) {
      console.error('Failed to fetch processors:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProcessors();
  }, [fetchProcessors]);

  const handleSave = async (formData) => {
    try {
      if (editingProcessor) {
        await base44.entities.PaymentProcessor.update(editingProcessor.id, formData);
      } else {
        await base44.entities.PaymentProcessor.create(formData);
      }
      await fetchProcessors();
      setIsFormOpen(false);
      setEditingProcessor(null);
    } catch (error) {
      console.error('Failed to save processor:', error);
      alert('Eroare la salvare. Verificați datele și încercați din nou.');
    }
  };

  const handleDelete = async () => {
    if (processorToDelete) {
      try {
        await base44.entities.PaymentProcessor.delete(processorToDelete.id);
        await fetchProcessors();
        setProcessorToDelete(null);
      } catch (error) {
        console.error('Failed to delete processor:', error);
      }
    }
  };

  return (
    <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-green-600 dark:text-green-500" />
            Procesatori de Plăți
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Gestionează metodele de plată disponibile pentru clienți
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProcessor(null);
            setIsFormOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Adaugă Procesor
        </Button>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Procesor</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Mediu</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Ordine</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
              <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                </TableCell>
              </TableRow>
            ) : processors.length > 0 ? (
              processors.map((processor) => (
                <TableRow key={processor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {processor.logo_url ? (
                        <img src={processor.logo_url} alt="" className="w-10 h-10 object-contain" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{processor.display_name}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{processor.processor_name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={processor.environment === 'production' ? 'default' : 'secondary'} className={processor.environment === 'production' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'dark:bg-slate-700 dark:text-slate-300'}>
                      {processor.environment === 'production' ? 'Producție' : 'Test'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-600 dark:text-slate-400">#{processor.priority_order}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge
                        variant={processor.is_active ? 'default' : 'secondary'}
                        className={processor.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'dark:bg-slate-700 dark:text-slate-300'}
                      >
                        {processor.is_active ? 'Activ' : 'Inactiv'}
                      </Badge>
                      {processor.is_default && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700">
                          Implicit
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingProcessor(processor);
                          setIsFormOpen(true);
                        }}
                        className="hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setProcessorToDelete(processor)}
                        className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400">Niciun procesor de plăți configurat</p>
                  <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                    Adaugă primul procesor pentru a accepta plăți online
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <ProcessorForm
        processor={editingProcessor}
        onSave={handleSave}
        onCancel={() => {
          setIsFormOpen(false);
          setEditingProcessor(null);
        }}
        isOpen={isFormOpen}
      />

      <AlertDialog open={!!processorToDelete} onOpenChange={() => setProcessorToDelete(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Ești sigur?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Procesorul "{processorToDelete?.display_name}" va fi șters definitiv. Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}