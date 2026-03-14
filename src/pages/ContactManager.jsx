
import React, { useState, useEffect, useCallback } from 'react';
import { Contact, Order } from '@/entities/all';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit, Trash2, Loader2, Building2, Search, Mail, Phone, MapPin, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '../components/translations/TranslationProvider';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

function ContactForm({ contact, onSave, onCancel, isOpen }) {
  const [formData, setFormData] = useState(
    contact || {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      mobile: '',
      company: '',
      position: '',
      department: '',
      address: {
        street: '',
        city: '',
        postal_code: '',
        country: 'România'
      },
      customer_type: 'individual',
      status: 'active',
      notes: ''
    }
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await onSave(formData);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contact ? 'Editează Contact' : 'Contact Nou'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className="space-y-6 p-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mobile">Mobil</Label>
                <Input 
                  id="mobile" 
                  value={formData.mobile} 
                  onChange={(e) => handleChange('mobile', e.target.value)} 
                />
              </div>
              <div>
                <Label htmlFor="customer_type">Tip Client</Label>
                <Select value={formData.customer_type} onValueChange={(value) => handleChange('customer_type', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Persoană Fizică</SelectItem>
                    <SelectItem value="business">Companie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.customer_type === 'business' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Companie</Label>
                  <Input 
                    id="company" 
                    value={formData.company} 
                    onChange={(e) => handleChange('company', e.target.value)} 
                  />
                </div>
                <div>
                  <Label htmlFor="position">Poziție</Label>
                  <Input 
                    id="position" 
                    value={formData.position} 
                    onChange={(e) => handleChange('position', e.target.value)} 
                  />
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold text-slate-800 mb-3">Adresa</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="street">Strada</Label>
                  <Input 
                    id="street" 
                    value={formData.address?.street || ''} 
                    onChange={(e) => handleChange('address.street', e.target.value)} 
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">Orașul</Label>
                    <Input 
                      id="city" 
                      value={formData.address?.city || ''} 
                      onChange={(e) => handleChange('address.city', e.target.value)} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="postal_code">Cod Poștal</Label>
                    <Input 
                      id="postal_code" 
                      value={formData.address?.postal_code || ''} 
                      onChange={(e) => handleChange('address.postal_code', e.target.value)} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Țara</Label>
                    <Input 
                      id="country" 
                      value={formData.address?.country || ''} 
                      onChange={(e) => handleChange('address.country', e.target.value)} 
                    />
                  </div>
                </div>
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
              {contact ? 'Actualizează Contact' : 'Creează Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ContactManager() {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [editingContact, setEditingContact] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const contactData = await Contact.list('-created_date');
      // Calculăm valorile comenzilor pentru fiecare contact
      for (const contact of contactData) {
        try {
          const orders = await Order.filter({ customer_email: contact.email });
          contact.total_orders_value = orders.reduce((sum, order) => sum + order.total_amount, 0);
          contact.orders_count = orders.length;
          contact.last_contact_date = orders.length > 0 ? orders[0].created_date : null;
        } catch (error) {
          contact.total_orders_value = 0;
          contact.orders_count = 0;
        }
      }
      setContacts(contactData);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleSave = async (formData) => {
    if (editingContact) {
      await Contact.update(editingContact.id, formData);
    } else {
      await Contact.create(formData);
    }
    await fetchContacts();
    setIsFormOpen(false);
    setEditingContact(null);
  };

  const handleDelete = async (contactId) => {
    if (confirm('Ești sigur că vrei să ștergi acest contact?')) {
      await Contact.delete(contactId);
      fetchContacts();
    }
  };
  
  const syncContactsFromOrders = async () => {
    setIsSyncing(true);
    try {
        const [allOrders, allContacts] = await Promise.all([
            Order.list(),
            Contact.list()
        ]);

        const contactsByEmail = new Map(allContacts.map(c => [c.email, c]));
        const ordersByEmail = new Map(); // Map: email -> Array of orders for that email

        for (const order of allOrders) {
            if (order.customer_email) {
                if (!ordersByEmail.has(order.customer_email)) {
                    ordersByEmail.set(order.customer_email, []);
                }
                ordersByEmail.get(order.customer_email).push(order);
            }
        }

        const newContactsToCreate = [];
        const contactsToUpdate = [];

        for (const [email, orders] of ordersByEmail.entries()) {
            // Sort orders for this email to get the most recent one first for primary data
            orders.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
            const latestOrder = orders[0]; // The most recent order for this email

            const existingContact = contactsByEmail.get(email);

            const nameParts = (latestOrder.customer_name || '').split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            // Collect all order notes for this email
            const orderNotesForContact = orders.map(order => 
                `Sincronizat din Comanda #${order.id} (Total: ${order.total_amount?.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} la ${format(new Date(order.created_date), 'dd.MM.yyyy', { locale: ro })})`
            );

            if (existingContact) {
                let updatedContact = { ...existingContact };
                let needsUpdate = false;

                // Update first_name and last_name if empty or less descriptive
                if (!updatedContact.first_name && firstName) {
                    updatedContact.first_name = firstName;
                    needsUpdate = true;
                }
                if (!updatedContact.last_name && lastName) {
                    updatedContact.last_name = lastName;
                    needsUpdate = true;
                }

                // Update phone if empty
                if (!updatedContact.phone && latestOrder.customer_phone) {
                    updatedContact.phone = latestOrder.customer_phone;
                    needsUpdate = true;
                }

                // Ensure address object exists and update fields if empty
                updatedContact.address = updatedContact.address || { street: '', city: '', postal_code: '', country: 'România' };
                if (latestOrder.billing_address) {
                    const latestOrderAddress = latestOrder.billing_address;

                    if (latestOrderAddress.street && !updatedContact.address.street) {
                        updatedContact.address.street = latestOrderAddress.street;
                        needsUpdate = true;
                    }
                    if (latestOrderAddress.city && !updatedContact.address.city) {
                        updatedContact.address.city = latestOrderAddress.city;
                        needsUpdate = true;
                    }
                    if (latestOrderAddress.postal_code && !updatedContact.address.postal_code) {
                        updatedContact.address.postal_code = latestOrderAddress.postal_code;
                        needsUpdate = true;
                    }
                    // Only update country if the existing one is the default 'România' or empty, and order has a different one
                    if (latestOrderAddress.country && (updatedContact.address.country === 'România' || !updatedContact.address.country)) {
                        if (latestOrderAddress.country !== updatedContact.address.country) {
                           updatedContact.address.country = latestOrderAddress.country;
                           needsUpdate = true;
                        }
                    }
                }

                // Append only new order notes that aren't already present
                let combinedNotes = updatedContact.notes || '';
                for (const note of orderNotesForContact) {
                    if (!combinedNotes.includes(note)) {
                        combinedNotes = (combinedNotes ? combinedNotes + '\n' : '') + note;
                        needsUpdate = true;
                    }
                }
                if (needsUpdate) {
                    updatedContact.notes = combinedNotes;
                    contactsToUpdate.push({ id: existingContact.id, data: updatedContact });
                }

            } else {
                // Create new contact
                newContactsToCreate.push({
                    first_name: firstName,
                    last_name: lastName,
                    email: latestOrder.customer_email,
                    phone: latestOrder.customer_phone || '',
                    mobile: '',
                    company: '',
                    position: '',
                    department: '',
                    address: latestOrder.billing_address || {
                        street: '',
                        city: '',
                        postal_code: '',
                        country: 'România'
                    },
                    customer_type: 'individual',
                    status: 'active',
                    notes: orderNotesForContact.join('\n') // All notes for newly created contact
                });
            }
        }

        const operations = [];
        if (newContactsToCreate.length > 0) {
            operations.push(Contact.bulkCreate(newContactsToCreate));
        }
        // For updates, we need to call Contact.update for each one, as there's no bulkUpdate
        for (const update of contactsToUpdate) {
            operations.push(Contact.update(update.id, update.data));
        }

        await Promise.all(operations);
        await fetchContacts(); // Re-fetch to show new/updated contacts

    } catch (error) {
        console.error("Failed to sync contacts from orders:", error);
    } finally {
        setIsSyncing(false);
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = `${contact.first_name} ${contact.last_name} ${contact.email} ${contact.company}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || contact.customer_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-green-600" />
            {t('contactManager.title')}
          </h1>
          <p className="text-slate-600 mt-1">{t('contactManager.description')}</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={syncContactsFromOrders} variant="outline" disabled={isLoading || isSyncing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} /> 
              Sincronizează cu Comenzile
            </Button>
            <Button onClick={() => { setEditingContact(null); setIsFormOpen(true); }} className="bg-green-600 hover:bg-green-700">
              <PlusCircle className="w-4 h-4 mr-2" /> 
              {t('contactManager.addContact')}
            </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input 
            placeholder="Caută contacte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrează după tip" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate tipurile</SelectItem>
            <SelectItem value="individual">Persoane Fizice</SelectItem>
            <SelectItem value="business">Companii</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ContactForm
        contact={editingContact}
        onSave={handleSave}
        onCancel={() => { setIsFormOpen(false); setEditingContact(null); }}
        isOpen={isFormOpen}
      />

      <div className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>{t('contactManager.table.contact')}</TableHead>
              <TableHead>{t('contactManager.table.company')}</TableHead>
              <TableHead>{t('contactManager.table.type')}</TableHead>
              <TableHead>Comenzi</TableHead>
              <TableHead>{t('contactManager.table.totalValue')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center p-12"><Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" /></TableCell></TableRow>
            ) : filteredContacts.map(contact => (
              <TableRow key={contact.id} className="hover:bg-slate-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-green-700">
                        {contact.first_name?.[0]}{contact.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{contact.first_name} {contact.last_name}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="text-sm text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {contact.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {contact.company ? (
                    <div>
                      <div className="font-medium">{contact.company}</div>
                      {contact.position && (
                        <div className="text-sm text-slate-500">{contact.position}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {contact.customer_type === 'individual' ? 'Persoană Fizică' : 'Companie'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{contact.orders_count || 0} comenzi</div>
                    {contact.last_contact_date && (
                      <div className="text-slate-500">
                        Ultima: {format(new Date(contact.last_contact_date), 'd MMM yyyy', { locale: ro })}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-green-700">
                    {(contact.total_orders_value || 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingContact(contact); setIsFormOpen(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(contact.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
