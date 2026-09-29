import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useBusiness } from '../../context/BusinessContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { AuditLogItem } from '../../types/index.ts';
import { ShieldCheck, Search, Filter, Clock, User, Activity, Loader2 } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  const { language } = useLanguage();
  const { activeBusiness } = useBusiness();
  const { token } = useAuth();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const bId = activeBusiness?.id || 1;
      let url = `/api/audit-logs?businessId=${bId}`;
      if (filterAction) url += `&action=${filterAction}`;
      if (filterEntity) url += `&entityType=${filterEntity}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeBusiness, filterAction, filterEntity]);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(s) ||
      (log.user_name && log.user_name.toLowerCase().includes(s)) ||
      log.entity_type.toLowerCase().includes(s) ||
      JSON.stringify(log.details || {}).toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            {language === 'hi' ? 'ऑडिट लॉग और सिस्टम सुरक्षा' : 'Audit Logs & Governance'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {language === 'hi'
              ? 'सभी व्यावसायिक संचालन, स्थिति परिवर्तन, वित्तीय समायोजन और उपयोगकर्ता क्रियाओं का पारदर्शी रिकॉर्ड।'
              : 'Tamper-evident audit trail of all appointments, settlements, catalog edits, and role actions.'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action, user, or details..."
            className="w-full text-xs bg-transparent focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
          >
            <option value="">All Actions</option>
            <option value="BOOKING_CREATED">BOOKING_CREATED</option>
            <option value="BOOKING_STATUS_UPDATED">BOOKING_STATUS_UPDATED</option>
            <option value="WALK_IN_CREATED">WALK_IN_CREATED</option>
            <option value="SERVICE_CREATED">SERVICE_CREATED</option>
            <option value="SERVICE_ARCHIVED">SERVICE_ARCHIVED</option>
            <option value="BRANCH_CREATED">BRANCH_CREATED</option>
          </select>

          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
          >
            <option value="">All Entities</option>
            <option value="booking">Booking</option>
            <option value="service">Service</option>
            <option value="branch">Branch</option>
            <option value="staff">Staff</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#E07A5F] animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <Activity className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <p className="text-sm">No audit records found matching criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">User & Role</th>
                  <th className="px-5 py-3.5">Target Entity</th>
                  <th className="px-5 py-3.5">Details (JSON)</th>
                  <th className="px-5 py-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap text-stone-500 font-mono">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 font-semibold">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200 font-mono text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-stone-900">{log.user_name || 'System'}</div>
                      <div className="text-[10px] text-stone-400 uppercase font-mono">{log.user_role || 'system'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="capitalize text-stone-700 font-medium">
                        {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs truncate font-mono text-[11px] text-stone-600">
                      {JSON.stringify(log.details || {})}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono text-[10px] text-stone-400">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
