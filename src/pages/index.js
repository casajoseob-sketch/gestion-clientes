import { useState } from 'react';
import Layout from '@/components/Layout';
import VistaCuadricula from '@/components/reservas/VistaCuadricula';
import VistaPlano from '@/components/reservas/VistaPlano';
import VistaLista from '@/components/reservas/VistaLista';

export default function Home() {
  const [vistaActiva, setVistaActiva] = useState('cuadricula');

  const vistas = [
    { id: 'cuadricula', nombre: 'Vista Cuadrícula', icon: '📊' },
    { id: 'plano', nombre: 'Vista Plano', icon: '🗺️' },
    { id: 'lista', nombre: 'Vista Lista', icon: '📋' },
  ];

  return (
    <Layout>
      <div className="card animate-fade-in">
        {/* Pestañas de Vista */}
        <div className="flex space-x-2 border-b border-gray-200 mb-6">
          {vistas.map((vista) => (
            <button
              key={vista.id}
              onClick={() => setVistaActiva(vista.id)}
              className={`tab ${vistaActiva === vista.id ? 'tab-active' : ''}`}
            >
              <span className="mr-2">{vista.icon}</span>
              {vista.nombre}
            </button>
          ))}
        </div>

        {/* Contenido de la Vista Activa */}
        <div className="animate-fade-in">
          {vistaActiva === 'cuadricula' && <VistaCuadricula />}
          {vistaActiva === 'plano' && <VistaPlano />}
          {vistaActiva === 'lista' && <VistaLista />}
        </div>
      </div>
    </Layout>
  );
}
