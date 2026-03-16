
import React, { useState, useEffect, useCallback } from 'react';
import { Order } from '@/entities/Order';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Package, RefreshCw, ChevronDown, ChevronUp, Trash2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Link } from 'react-router-dom';

const createPageUrl = (pathWithQueryParams) => {
    const [basePath, queryString] = pathWithQueryParams.split('?');
    const url = `/${basePath}`;
    return queryString ? `${url}?${queryString}` : url;
};

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    in_production: "bg-purple-100 text-purple-800",
    ready: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
};

const statusNames = {
    pending: 'În Așteptare',
    confirmed: 'Confirmată',
    in_production: 'În Producție',
    ready: 'Gata de Livrare',
    delivered: 'Livrată',
    cancelled: 'Anulată'
};

function OrderRow({ order, onStatusChange, isSelected, onToggleSelect }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const downloadOrderPDF = (order) => {
        window.open(createPageUrl(`OrderPDF?order_id=${order.id}`), '_blank');
    };

    return (
        <>
            <TableRow className={isSelected ? 'bg-blue-50/60' : ''}>
                <TableCell className="w-10 pr-0">
                    <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => onToggleSelect(order.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                </TableCell>
                <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
                    </Button>
                </TableCell>
                <TableCell className="font-mono">{order.order_number || order.id.slice(-8).toUpperCase()}</TableCell>
                <TableCell>
                    <div>{order.customer_name}</div>
                    <div className="text-xs text-slate-500">{order.customer_email}</div>
                    {order.company_name && (
                        <div className="text-xs text-blue-600 font-medium">{order.company_name}</div>
                    )}
                    {order.cui && (
                        <div className="text-xs text-slate-500">CUI: {order.cui}</div>
                    )}
                </TableCell>
                <TableCell>{format(new Date(order.created_date), 'd MMMM yyyy', { locale: ro })}</TableCell>
                <TableCell className="font-semibold">{order.total_amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</TableCell>
                <TableCell>
                    <Select value={order.status} onValueChange={(newStatus) => onStatusChange(order.id, newStatus)}>
                        <SelectTrigger className={`w-36 border-0 focus:ring-0 ${statusColors[order.status]}`}>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            {Object.keys(statusNames).map(statusKey => (
                                <SelectItem key={statusKey} value={statusKey}>{statusNames[statusKey]}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </TableCell>
            </TableRow>
            {isExpanded && (
                <TableRow>
                    <TableCell colSpan={7} className="p-0">
                        <div className="p-4 bg-slate-50">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-semibold">Detalii Comandă:</h4>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadOrderPDF(order)}
                                    className="flex items-center gap-2"
                                >
                                    <Package className="w-4 h-4" />
                                    Descarcă PDF Complet
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {(order.configurations || []).map((configId, index) => (
                                    <div key={configId} className="flex items-center gap-3 p-3 bg-white rounded-md border hover:bg-gray-50 transition-colors">
                                        <Package className="w-5 h-5 text-slate-500"/>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Configurație Produs #{index + 1}</p>
                                            <p className="text-xs text-slate-500 font-mono">{configId}</p>
                                        </div>
                                        <Link to={createPageUrl(`ConfigurationView?config_id=${configId}&order_id=${order.id}`)}>
                                            <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-800">
                                                Vezi Detalii
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                                {(!order.configurations || order.configurations.length === 0) && (
                                    <p className="text-sm text-slate-500">Nu există configurații detaliate pentru această comandă.</p>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-slate-700">Telefon:</span>
                                        <p className="text-slate-600">{order.customer_phone || 'Nu este specificat'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-700">Tip client:</span>
                                        <p className="text-slate-600 capitalize">
                                            {order.customer_type === 'individual' ? 'Persoană fizică' : 'Persoană juridică'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-700">Status plată:</span>
                                        <p className="text-slate-600 capitalize">{order.payment_status || 'pending'}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-700">Livrare estimată:</span>
                                        <p className="text-slate-600">
                                            {order.estimated_delivery ? format(new Date(order.estimated_delivery), 'd MMM yyyy', { locale: ro }) : 'Nu este specificată'}
                                        </p>
                                    </div>
                                </div>

                                {order.notes && (
                                    <div className="mt-3">
                                        <span className="font-medium text-slate-700">Note:</span>
                                        <p className="text-slate-600 text-sm bg-yellow-50 p-2 rounded mt-1">{order.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const allOrders = await Order.list('-created_date', 200);
      setOrders(allOrders);
      setSelectedIds(new Set()); // Reset selection on refresh
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Selection handlers
  const toggleSelect = (orderId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map(o => o.id)));
    }
  };

  const isAllSelected = orders.length > 0 && selectedIds.size === orders.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < orders.length;

  // Bulk delete
  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      const idsToDelete = [...selectedIds];
      await Promise.all(idsToDelete.map(id => Order.delete(id)));
      setOrders(prev => prev.filter(o => !selectedIds.has(o.id)));
      setSelectedIds(new Set());
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete orders", error);
      alert('Eroare la ștergerea comenzilor. Încearcă din nou.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk status change
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const handleBulkStatusChange = async (newStatus) => {
    if (!newStatus) return;
    setIsChangingStatus(true);
    try {
      const ids = [...selectedIds];
      await Promise.all(ids.map(id => Order.update(id, { status: newStatus })));
      setOrders(prev => prev.map(o => selectedIds.has(o.id) ? { ...o, status: newStatus } : o));
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Failed to bulk update status", error);
      alert('Eroare la schimbarea statusului. Încearcă din nou.');
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
      try {
          await Order.update(orderId, { status: newStatus });
          setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
          
          if (newStatus !== 'pending') {
              try {
                  const { SendEmail } = await import('@/integrations/Core');
                  const updatedOrder = orders.find(o => o.id === orderId);
                  
                  if (updatedOrder) {
                      const emailBody = `
                          <div style="font-family: Arial, sans-serif; color: #333;">
                              <h2 style="color: #16a34a;">Actualizare Status Comandă</h2>
                              <p>Statusul comenzii <strong>#${updatedOrder.order_number || updatedOrder.id.slice(-8).toUpperCase()}</strong> a fost schimbat în: <strong>${statusNames[newStatus]}</strong>.</p>
                              <p>Client: ${updatedOrder.customer_name}</p>
                              <p>Pentru a vedea detaliile complete, accesează panoul de administrare.</p>
                              <a href="${window.location.origin}${createPageUrl(`OrderDetails?order_id=${orderId}`)}" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Vezi Comanda</a>
                          </div>
                      `;

                      await SendEmail({
                          to: updatedOrder.customer_email,
                          subject: `[RoWood] Statusul comenzii tale s-a actualizat: ${statusNames[newStatus]}`,
                          body: emailBody,
                          from_name: 'RoWood'
                      });
                  }
              } catch (emailError) {
                  console.error("Failed to send status update email to client:", emailError);
              }
          }
      } catch (error) {
          console.error("Failed to update order status", error);
      }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Management Comenzi</h1>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <>
              <Select onValueChange={handleBulkStatusChange} disabled={isChangingStatus}>
                <SelectTrigger className="w-52 border-blue-300 bg-blue-50 text-blue-800 font-medium">
                  {isChangingStatus ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Se schimbă...</span>
                  ) : (
                    <span>Schimbă status ({selectedIds.size})</span>
                  )}
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(statusNames).map(key => (
                    <SelectItem key={key} value={key}>
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${statusColors[key]?.split(' ')[0]}`}></span>
                      {statusNames[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)} 
                disabled={isDeleting}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Șterge {selectedIds.size}
              </Button>
            </>
          )}
          <Button onClick={fetchOrders} variant="outline" disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Reîncarcă
          </Button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold">Confirmare Ștergere</h3>
            </div>
            <p className="text-slate-600">
              Ești sigur că vrei să ștergi <strong>{selectedIds.size}</strong> {selectedIds.size === 1 ? 'comandă' : 'comenzi'}? 
              Această acțiune este <strong>ireversibilă</strong>.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                Anulează
              </Button>
              <Button variant="destructive" onClick={handleBulkDelete} disabled={isDeleting} className="gap-2">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? 'Se șterge...' : 'Șterge Definitiv'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border shadow-sm bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 pr-0">
                <input 
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => { if (el) el.indeterminate = isSomeSelected; }}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  disabled={orders.length === 0}
                />
              </TableHead>
              <TableHead className="w-12"></TableHead>
              <TableHead>Nr. Comandă</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center p-8"><Loader2 className="mx-auto h-8 w-8 animate-spin text-slate-400" /></TableCell></TableRow>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <OrderRow
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    isSelected={selectedIds.has(order.id)}
                    onToggleSelect={toggleSelect}
                />
              ))
            ) : (
                <TableRow><TableCell colSpan={7} className="text-center p-8 text-slate-500">Nu s-au găsit comenzi.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bottom selection info bar */}
      {selectedIds.size > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-800 font-medium">
            {selectedIds.size} din {orders.length} {selectedIds.size === 1 ? 'comandă selectată' : 'comenzi selectate'}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="text-blue-700 hover:text-blue-900">
              Deselectează tot
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="text-blue-700 hover:text-blue-900">
              Selectează tot
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
