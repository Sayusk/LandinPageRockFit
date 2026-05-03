// TODO: Proteger esta rota com autenticação antes de colocar em produção.
// Opções: Supabase Auth, middleware Vercel com ADMIN_ACCESS_TOKEN, ou Auth0.
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient.js';
import logo from '../../assets/Rockfitlogo.png';

const ITEMS_PER_PAGE = 10;

const STATUS_LABELS = {
  active: { label: 'Ativo', color: 'bg-green-500/15 text-green-400 border-green-500/20' },
  pending: { label: 'Pendente', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/15 text-red-400 border-red-500/20' },
  expired: { label: 'Expirado', color: 'bg-muted/15 text-muted border-muted/20' },
};

function StatusBadge({ status }) {
  const config = STATUS_LABELS[status] || STATUS_LABELS.pending;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
      {config.label}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

export default function AdminAlunos() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  // Check admin access
  const adminToken = import.meta.env.VITE_ADMIN_ACCESS_TOKEN;
  const [accessGranted, setAccessGranted] = useState(!adminToken);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    if (!accessGranted) return;
    if (!supabase) {
      setError('Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
      setLoading(false);
      return;
    }

    async function fetchClients() {
      setLoading(true);
      try {
        const { data, error: dbErr } = await supabase
          .from('clients')
          .select(`
            id, name, email, phone, cpf, created_at,
            client_subscriptions (
              id, status, next_payment_date,
              plans ( name, slug )
            )
          `)
          .order('created_at', { ascending: false });

        if (dbErr) throw dbErr;
        setClients(data || []);
      } catch (err) {
        setError(err.message || 'Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, [accessGranted]);

  const filtered = useMemo(() => {
    let result = clients;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.cpf?.includes(q)
      );
    }

    if (filterStatus) {
      result = result.filter((c) => {
        const sub = c.client_subscriptions?.[0];
        return sub?.status === filterStatus;
      });
    }

    if (filterPlan) {
      result = result.filter((c) => {
        const sub = c.client_subscriptions?.[0];
        return sub?.plans?.slug === filterPlan;
      });
    }

    return result;
  }, [clients, search, filterStatus, filterPlan]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function handleSearch(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handleTokenSubmit(e) {
    e.preventDefault();
    if (tokenInput === adminToken) {
      setAccessGranted(true);
      setTokenError('');
    } else {
      setTokenError('Token inválido.');
    }
  }

  // Token gate
  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center px-5">
        <div className="max-w-sm w-full card-dark p-8 text-center">
          <img src={logo} alt="RockFit Brasil" className="h-10 w-auto logo-light mx-auto mb-6" />
          <h1 className="text-lg font-bold text-light mb-2">Área Administrativa</h1>
          <p className="text-xs text-muted mb-6">Digite o token de acesso para continuar.</p>
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Token de acesso"
              className="w-full bg-dark-3 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-light placeholder-muted/50 focus:outline-none focus:border-brand/50 transition-colors"
            />
            {tokenError && <p className="text-xs text-red-400">{tokenError}</p>}
            <button type="submit" className="btn-primary w-full justify-center py-3 text-sm">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <div className="glass-dark sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="RockFit Brasil" className="h-8 w-auto logo-light" />
            <span className="text-xs font-semibold tracking-widest uppercase text-muted">Admin</span>
          </div>
          <a href="/" className="text-xs text-muted hover:text-light transition-colors">← Voltar ao site</a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gradient mb-1">Alunos</h1>
          <p className="text-sm text-muted">
            {loading ? '...' : `${filtered.length} cliente${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Buscar por nome, e-mail ou CPF…"
            className="sm:col-span-1 bg-dark-2 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-light placeholder-muted/50 focus:outline-none focus:border-brand/50 transition-colors"
          />
          <select
            value={filterPlan}
            onChange={(e) => { setFilterPlan(e.target.value); setPage(1); }}
            className="bg-dark-2 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-light focus:outline-none focus:border-brand/50 transition-colors"
          >
            <option value="">Todos os planos</option>
            <option value="mensal">Mensal</option>
            <option value="trimestral">Trimestral</option>
            <option value="semestral">Semestral</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="bg-dark-2 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-light focus:outline-none focus:border-brand/50 transition-colors"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="pending">Pendente</option>
            <option value="cancelled">Cancelado</option>
            <option value="expired">Expirado</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="card-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Nome', 'E-mail', 'Telefone', 'CPF', 'Plano', 'Status', 'Cadastro', 'Próx. pagamento'].map((col) => (
                    <th key={col} className="px-4 py-3.5 text-left text-xs font-semibold text-muted tracking-wide whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                        Carregando...
                      </div>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                ) : (
                  paginated.map((client) => {
                    const sub = client.client_subscriptions?.[0];
                    return (
                      <tr key={client.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3.5 text-sm font-medium text-light whitespace-nowrap">{client.name || '—'}</td>
                        <td className="px-4 py-3.5 text-sm text-muted">{client.email || '—'}</td>
                        <td className="px-4 py-3.5 text-sm text-muted whitespace-nowrap">{client.phone || '—'}</td>
                        <td className="px-4 py-3.5 text-sm text-muted whitespace-nowrap font-mono">{client.cpf || '—'}</td>
                        <td className="px-4 py-3.5 text-sm text-muted whitespace-nowrap">{sub?.plans?.name || '—'}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {sub ? <StatusBadge status={sub.status} /> : <span className="text-xs text-muted/40">—</span>}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-muted whitespace-nowrap">{formatDate(client.created_at)}</td>
                        <td className="px-4 py-3.5 text-sm text-muted whitespace-nowrap">{formatDate(sub?.next_payment_date)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-4 border-t border-white/[0.06] flex items-center justify-between gap-4">
              <p className="text-xs text-muted">
                Página {page} de {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs border border-white/[0.08] text-muted hover:text-light hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Anterior
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs transition-colors ${
                        pageNum === page
                          ? 'bg-brand text-white font-bold'
                          : 'border border-white/[0.08] text-muted hover:text-light hover:border-white/20'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs border border-white/[0.08] text-muted hover:text-light hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Próxima →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
