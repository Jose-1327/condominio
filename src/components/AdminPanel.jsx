import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';

export default function AdminPanel() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [logado, setLogado] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Verifica se o admin já fez login antes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setLogado(true);
    });
  }, []);

  const fazerLogin = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    
    // Tenta fazer login com o usuário que você criou no painel do Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha,
    });

    if (error) {
      setErro('E-mail ou senha incorretos.');
    } else {
      setLogado(true);
    }
    setCarregando(false);
  };

  const sair = async () => {
    await supabase.auth.signOut();
    setLogado(false);
  };

  const exportarExcel = async () => {
    // Busca todos os dados do estoque
    const { data, error } = await supabase.from('itens_estoque').select('*');
    
    if (data) {
      // Converte para Excel e baixa
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Estoque Geral");
      XLSX.writeFile(wb, "Relatorio_Estoque.xlsx");
    } else if (error) {
      alert("Erro ao buscar dados: " + error.message);
    }
  };

  // Se NÃO estiver logado, mostra a tela de Login
  if (!logado) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Acesso Restrito</h2>
        {erro && <p className="text-red-500 text-center mb-4">{erro}</p>}
        
        <form onSubmit={fazerLogin} className="flex flex-col gap-4">
          <input 
            type="email" placeholder="E-mail do Administrador" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="border-2 border-gray-300 rounded-md p-3 outline-none focus:border-blue-500"
          />
          <input 
            type="password" placeholder="Senha" required
            value={senha} onChange={(e) => setSenha(e.target.value)}
            className="border-2 border-gray-300 rounded-md p-3 outline-none focus:border-blue-500"
          />
          <button 
            type="submit" disabled={carregando}
            className="bg-blue-800 text-white p-3 rounded-md font-bold hover:bg-blue-900 transition-colors"
          >
            {carregando ? 'Entrando...' : 'Entrar no Painel'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:underline">Voltar para o site principal</Link>
        </div>
      </div>
    );
  }

  // Se ESTIVER logado, mostra o Painel
  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Painel de Administração</h1>
        <button onClick={sair} className="text-red-600 font-semibold hover:underline">Sair do sistema</button>
      </div>

      <div className="bg-green-50 border-2 border-green-200 p-8 rounded-xl text-center">
        <h2 className="text-xl font-bold text-green-800 mb-4">Exportação de Relatórios</h2>
        <p className="text-gray-600 mb-6">Baixe a planilha completa de todos os itens cadastrados no sistema.</p>
        
        <button 
          onClick={exportarExcel}
          className="bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700 shadow-md transition-all"
        >
          📊 Baixar Excel do Estoque
        </button>
      </div>
    </div>
  );
}   


