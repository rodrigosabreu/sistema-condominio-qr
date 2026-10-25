import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { Layout } from './componentes/Layout';
import { Condominios } from './paginas/Condominios';
import { Locais } from './paginas/Locais';
import { Login } from './paginas/Login';
import { Painel } from './paginas/Painel';
import { QrPublico } from './paginas/QrPublico';
import { Servicos } from './paginas/Servicos';
import { Usuarios } from './paginas/Usuarios';

function Protegido({ children }: { children: ReactNode }) {
  const { sessao } = useAuth();
  return sessao ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/qr/:id" element={<QrPublico />} />
      <Route
        element={
          <Protegido>
            <Layout />
          </Protegido>
        }
      >
        <Route index element={<Painel />} />
        <Route path="condominios" element={<Condominios />} />
        <Route path="locais" element={<Locais />} />
        <Route path="servicos" element={<Servicos />} />
        <Route path="usuarios" element={<Usuarios />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
