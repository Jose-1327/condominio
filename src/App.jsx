import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FormularioCadastro from './components/FormularioCadastro';
import DetalhesItem from './components/DetalhesItem';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 py-10">
        <Routes>
          {/* Rota principal: O formulário */}
          <Route path="/" element={<FormularioCadastro />} />
          
          {/* Rota do QR Code: Mostra os detalhes baseados no ID */}
          <Route path="/item/:id" element={<DetalhesItem />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FormularioCadastro from './components/FormularioCadastro';
import DetalhesItem from './components/DetalhesItem';
import AdminPanel from './components/AdminPanel'; // <-- Importe a tela nova aqui

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 py-10">
        <Routes>
          <Route path="/" element={<FormularioCadastro />} />
          <Route path="/item/:id" element={<DetalhesItem />} />
          
          {/* A nova rota escondida para o admin */}
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}