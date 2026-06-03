import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bot, Plus, ToggleLeft, ToggleRight, Trash2, Eye, Search } from 'lucide-react';
import apiClient from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

interface ChatbotClientSummary {
  id: string;
  name: string;
  businessDesc: string;
  apiKey: string;
  currency: string;
  contactEmail: string | null;
  contactPhone: string | null;
  webhookUrl: string | null;
  isActive: boolean;
  createdAt: string;
  productCount: number;
}

export function AdminChatbotClientsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data: clients = [], isLoading } = useQuery<ChatbotClientSummary[]>({
    queryKey: ['admin-chatbot-clients'],
    queryFn: () => apiClient.get('/admin/chatbot-clients').then(r => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => apiClient.put(`/admin/chatbot-clients/${id}/toggle-status`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-chatbot-clients'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/chatbot-clients/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-chatbot-clients'] }),
  });

  const filtered = clients.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-7 h-7 text-teal-600" /> Chatbot Clients
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage external clients using ReplyCart AI chatbot on their own websites
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Client
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateClientModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            qc.invalidateQueries({ queryKey: ['admin-chatbot-clients'] });
          }}
        />
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No chatbot clients yet</p>
            <p className="text-slate-400 text-sm mt-1">Create your first external chatbot client</p>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 text-slate-600 font-semibold">Client</th>
                <th className="text-left px-4 py-3 text-slate-600 font-semibold">API Key</th>
                <th className="text-left px-4 py-3 text-slate-600 font-semibold">Products</th>
                <th className="text-left px-4 py-3 text-slate-600 font-semibold">Webhook</th>
                <th className="text-left px-4 py-3 text-slate-600 font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-slate-600 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(client => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{client.name}</p>
                    <p className="text-xs text-slate-400">{client.contactEmail ?? client.contactPhone ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                      {client.apiKey.slice(0, 20)}...
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-700 font-medium">{client.productCount}</span>
                    <span className="text-slate-400 text-xs ml-1">products</span>
                  </td>
                  <td className="px-4 py-3">
                    {client.webhookUrl ? (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Configured</span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      client.isActive
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {client.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/admin/chatbot-clients/${client.id}`)}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="View / Edit"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleMutation.mutate(client.id)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title={client.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {client.isActive
                          ? <ToggleRight className="w-4 h-4 text-green-500" />
                          : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${client.name}? This cannot be undone.`))
                            deleteMutation.mutate(client.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

// ── Create Client Modal ────────────────────────────────────────────────────────

function CreateClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [businessDesc, setBusinessDesc] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [contactEmail, setContactEmail] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => apiClient.post('/admin/chatbot-clients', {
      name, businessDesc, currency, contactEmail, webhookUrl,
      language: 'en',
    }),
    onSuccess: () => onCreated(),
    onError: () => setError('Failed to create client. Please try again.'),
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">New Chatbot Client</h2>

        <div>
          <label className="text-sm font-medium text-slate-700">Business Name *</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Sharma Boutique"
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Business Description</label>
          <textarea value={businessDesc} onChange={e => setBusinessDesc(e.target.value)}
            rows={2} placeholder="What does this business sell?"
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="INR">INR ₹</option>
              <option value="USD">USD $</option>
              <option value="EUR">EUR €</option>
              <option value="GBP">GBP £</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Contact Email</label>
            <input value={contactEmail} onChange={e => setContactEmail(e.target.value)}
              placeholder="owner@store.com"
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Order Webhook URL <span className="text-slate-400 font-normal">(optional)</span></label>
          <input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)}
            placeholder="https://theirstore.com/api/new-order"
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <p className="text-xs text-slate-400 mt-1">When a customer places an order, we POST the order data here.</p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" loading={mutation.isPending} disabled={!name.trim()}
            onClick={() => mutation.mutate()}>
            Create Client
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
