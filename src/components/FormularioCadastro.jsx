import { useState } from 'react';
import QRCode from "react-qr-code";
// Importamos o cliente do supabase que configuraste
import { supabase } from '../lib/supabase'; 

export default function FormularioCadastro() {
  const [item, setItem] = useState('');
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [dataCadastro, setDataCadastro] = useState('');
  const [arquivoPdf, setArquivoPdf] = useState(null);

  // Estados de controlo
  const [itemCadastrado, setItemCadastrado] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      let urlPublica = null;

      // 1. Upload do PDF para o Storage (se existir arquivo)
      if (arquivoPdf) {
        const nomeArquivo = `${Date.now()}_${arquivoPdf.name}`;
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('notas-fiscais') // Nome do bucket que criaste no painel
          .upload(nomeArquivo, arquivoPdf);

        if (uploadError) throw uploadError;

        // Pegar a URL pública do arquivo subido
        const { data: { publicUrl } } = supabase
          .storage
          .from('notas-fiscais')
          .getPublicUrl(nomeArquivo);
        
        urlPublica = publicUrl;
      }

      // 2. Inserir os dados na tabela do Banco de Dados
      const { data, error } = await supabase
        .from('itens_estoque')
        .insert([
          { 
            item, 
            descricao, 
            quantidade: parseInt(quantidade), 
            setor: localizacao, 
            data_cadastro: dataCadastro,
            pdf_url: urlPublica 
          }
        ])
        .select(); // Este .select() faz o Supabase devolver o item criado (com o ID real)

      if (error) throw error;

      // 3. Sucesso: Guardamos o item retornado para exibir o QR Code
      if (data && data.length > 0) {
        setItemCadastrado(data[0]);
      }

    } catch (error) {
      console.error("Erro:", error.message);
      alert("Erro ao salvar no banco: " + error.message);
    } finally {
      setCarregando(false);
    }
  };

  const voltarAoInicio = () => {
    setItem('');
    setDescricao('');
    setQuantidade('');
    setLocalizacao('');
    setDataCadastro('');
    setArquivoPdf(null);
    setItemCadastrado(null);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 mt-10 bg-white rounded-xl shadow-lg border border-gray-100">
      
      {!itemCadastrado ? (
        <>
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Formulário de Cadastro</h1>
          <h2 className="text-lg font-semibold mb-8 text-gray-500">Itens de estoque</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Item:</label>
              <input type="text" required value={item} onChange={(e) => setItem(e.target.value)}
                className="border-2 border-blue-400 rounded-md p-2 w-full outline-none focus:border-blue-600 transition-all"/>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Descrição:</label>
              <input type="text" required value={descricao} onChange={(e) => setDescricao(e.target.value)}
                className="border-2 border-blue-400 rounded-md p-2 w-full outline-none focus:border-blue-600 transition-all"/>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="flex flex-col gap-1">
                <label className="font-semibold text-gray-700">Quantidade:</label>
                <input type="number" required value={quantidade} onChange={(e) => setQuantidade(e.target.value)}
                  className="border-2 border-blue-400 rounded-md p-2 w-full outline-none focus:border-blue-600 transition-all"/>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-gray-700">Data:</label>
                <input type="date" required value={dataCadastro} onChange={(e) => setDataCadastro(e.target.value)}
                  className="border-2 border-blue-400 rounded-md p-2 w-full outline-none focus:border-blue-600 transition-all"/>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Localização - Setor:</label>
              <input type="text" required value={localizacao} onChange={(e) => setLocalizacao(e.target.value)}
                className="border-2 border-blue-400 rounded-md p-2 w-full outline-none focus:border-blue-600 transition-all"/>
            </div>

            <div className="flex justify-start items-center gap-6 mt-6 pt-2">
              <div className="relative">
                <input type="file" accept="application/pdf" onChange={(e) => setArquivoPdf(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                <div className="border-2 border-blue-500 text-blue-600 bg-white rounded-lg p-3 px-6 font-bold hover:bg-blue-50 transition-colors shadow-sm">
                  {arquivoPdf ? arquivoPdf.name : 'UPLOAD Nota PDF'}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={carregando}
                className={`${carregando ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg p-3 px-8 font-bold transition-colors shadow-md`}
              >
                {carregando ? 'Salvando...' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="flex flex-col items-center py-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Confira o item cadastrado!</h2>
          <p className="text-gray-500 mb-8">Escaneie o QR code</p>

          <div className="border-2 border-dashed border-blue-400 p-6 rounded-xl bg-blue-50 flex flex-col items-center shadow-inner">
            <p className="font-bold text-blue-800 mb-4 text-lg">{itemCadastrado.item.toUpperCase()}</p>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
              {/* O QR Code agora aponta para o ID REAL do banco */}
              <QRCode 
                value={`https://condominio-1axcdqclf-jose-morais-projects-ebf52c16.vercel.app/${itemCadastrado.id}`} 
                size={180}
              />
            </div>
            
            <p className="mt-4 text-[10px] text-blue-600 font-mono">UUID: {itemCadastrado.id}</p>
          </div>

          <div className="flex gap-4 mt-10">
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md">
              Imprimir Etiqueta
            </button>
            <button onClick={voltarAoInicio} className="border-2 border-gray-300 text-gray-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100">
              Novo Cadastro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}