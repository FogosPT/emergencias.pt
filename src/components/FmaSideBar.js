// components/FmaSideBar.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function FmaSideBar({ incident, onClose }) {
    const crews    = Array.isArray(incident.crews)    ? incident.crews    : [];
    const vehicles = Array.isArray(incident.vehicles) ? incident.vehicles : [];
    const aerials  = Array.isArray(incident.aerials)  ? incident.aerials  : [];
    const boats    = Array.isArray(incident.boats)    ? incident.boats    : [];
    const updates  = Array.isArray(incident.updates)  ? incident.updates  : [];
    const details  = Array.isArray(incident.details)  ? incident.details  : [];
    return (
        <aside className="h-full w-96 shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h2 className="text-lg font-semibold">
                        {incident.natureza || 'Ocorrência'}{incident.id ? ` #${incident.id}` : ''}
                    </h2>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={onClose}
                        aria-label="Fechar"
                        title="Fechar"
                    >
                        ✖
                    </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                    {[incident.district, incident.concelho, incident.freguesia].filter(Boolean).join(' · ')}
                    {incident.date && incident.hour ? ` · ${incident.date} ${incident.hour}` : ''}
                </p>

                <div className="grid grid-cols-4 gap-3 mb-4 text-center">
                    <div><div className="text-xl">{incident.man ?? 0}</div><div className="text-xs text-gray-500">👨‍🚒</div></div>
                    <div><div className="text-xl">{incident.terrain ?? 0}</div><div className="text-xs text-gray-500">🚒</div></div>
                    <div><div className="text-xl">{incident.aerial ?? 0}</div><div className="text-xs text-gray-500">🚁</div></div>
                    <div><div className="text-xl">{incident.meios_aquaticos ?? 0}</div><div className="text-xs text-gray-500">🚣</div></div>
                </div>

                {incident.status && (
                    <div className="mb-4">
                        <span className="text-xs uppercase text-gray-500">Estado</span>
                        <div className="text-sm">{incident.status}</div>
                    </div>
                )}

                {details.length > 0 && (
                    <section className="mb-4">
                        <h3 className="font-semibold mb-2">Detalhes</h3>
                        <ul className="list-disc pl-5">
                            {details.map((d, idx) => <li key={d.id || idx}>{d.text || String(d)}</li>)}
                        </ul>
                    </section>
                )}

                {updates.length > 0 && (
                    <section className="mb-4">
                        <h3 className="font-semibold mb-2">Atualizações</h3>
                        <ul className="space-y-1">
                            {updates.map((u, idx) => (
                                <li key={u.id || idx} className="text-sm">
                                    <span className="font-medium">{u.time || u.timestamp || ''}</span>{' '}
                                    {u.text || u.message || ''}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Debug opcional */}
                {/* <pre className="text-xs bg-gray-50 p-2 rounded border overflow-auto max-h-64">
          {JSON.stringify(incident, null, 2)}
        </pre> */}
            </div>
        </aside>
    );
}

FmaSideBar.propTypes = {
    incident: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
};
