import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LINKS = [
    { to: '/lista',    label: 'Lista' },
    { to: '/mapa',     label: 'Mapa' },
    { to: '/fma',      label: 'FMA' },
    { to: '/fma-mapa', label: 'Mapa FMA' },
];

export default function NavBar() {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (
        <nav className="fixed inset-x-0 top-0 bg-blue-500 h-16 z-[1000] w-screen">
            <div className="max-w-6xl mx-auto px-4 h-16">
                <div className="flex justify-between h-16">
                    <div className="flex space-x-4">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center py-5 px-2 text-white hover:text-gray-300">
                                <span className="font-bold">Emergencias.pt</span>
                            </Link>
                        </div>
                        <div className="hidden md:flex items-center space-x-1">
                            {LINKS.map(({ to, label }) => (
                                <Link key={to} to={to} className="py-5 px-3 text-white hover:text-gray-300">{label}</Link>
                            ))}
                        </div>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button
                            type="button"
                            className="focus:outline-none text-white"
                            onClick={() => setOpen((s) => !s)}
                            aria-label="Abrir menu"
                            aria-expanded={open}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {open ? (
                                    <>
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </>
                                ) : (
                                    <>
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <line x1="3" y1="12" x2="21" y2="12" />
                                        <line x1="3" y1="18" x2="21" y2="18" />
                                    </>
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className={open ? 'md:hidden fixed inset-x-0 top-16 bg-white shadow z-40' : 'hidden'}>
                <Link to="/" className="block py-2 px-4 text-sm hover:bg-gray-200" onClick={close}>Início</Link>
                {LINKS.map(({ to, label }) => (
                    <Link key={to} to={to} className="block py-2 px-4 text-sm hover:bg-gray-200" onClick={close}>{label}</Link>
                ))}
            </div>
        </nav>
    );
}
