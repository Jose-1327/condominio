import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function DetalhesItem() {
  const { id } = useParams(); // Pega o ID que está na URL do QR Code
  const [item, setItem] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarItem() {
      // Vai no Supabase e busca apenas a linha que tem este ID
      const { data, error } = await supabase
        .from('itens_estoque')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Erro ao buscar:", error);
      } else {
        setItem(data);
      }
      setCarregando(false);
    }
    buscarItem();
  }, [id]);

  if (carregando) return <div className="p-10 text-center text-xl font-bold mt-20">Buscando dados no banco...</div>;
  if (!item) return <div className="p-10 text-center text-xl text-red-600 mt-20">Item não encontrado!</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 mt-10 bg-white rounded-xl shadow-lg border border-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Detalhes do Estoque</h1>
      
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex flex-col gap-4 text-lg">
        <p><span className="font-bold text-gray-700">Item:</span> {item.item}</p>
        <p><span className="font-bold text-gray-700">Descrição:</span> {item.descricao}</p>
        <p><span className="font-bold text-gray-700">Quantidade:</span> {item.quantidade} unidades</p>
        <p><span className="font-bold text-gray-700">Setor/Local:</span> {item.setor}</p>
        <p><span className="font-bold text-gray-700">Cadastrado em:</span> {item.data_cadastro}</p>
      </div>

      {item.pdf_url && (
        <div className="mt-8 flex justify-center">
          <a 
            href={item.pdf_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-colors"
          >
            📄 Visualizar Nota Fiscal
          </a>
        </div>
      )}

      <div className="mt-10 text-center">
        <Link to="/" className="text-gray-500 hover:text-gray-800 underline transition-colors">
          Voltar para o Cadastro
        </Link>
      </div>
    </div>
  );
}