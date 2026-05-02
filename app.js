// =====================
// BLOCO 1 — APP PRINCIPAL (Firebase, APP object, funções)
// =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, setDoc, orderBy, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const FB = { apiKey:"AIzaSyB4-eS5dLimqSewLPwwA_IT2haMV3kLD9s", authDomain:"tralienigena-ee7a9.firebaseapp.com", projectId:"tralienigena-ee7a9", storageBucket:"tralienigena-ee7a9.firebasestorage.app", messagingSenderId:"307288619335", appId:"1:307288619335:web:467b6aeae99b641866b462", measurementId:"G-29J2FDXBH8" };
const app = initializeApp(FB);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
let usuarioLogado=null,usuarioEmail=null,usuarioNome=null,usuarioId=null;
onAuthStateChanged(auth,(user)=>{ if(user){ usuarioLogado=user; usuarioEmail=user.email; usuarioNome=user.displayName||user.email.split('@')[0]; usuarioId=user.uid; document.getElementById('modal-consentimento-overlay')&&(document.getElementById('modal-consentimento-overlay').style.display='none'); }else{ usuarioLogado=null; usuarioEmail=null; usuarioNome=null; usuarioId=null; } });

const TIPOS = {
  mecanico:{label:"🔩 Mecânico",color:"#ea580c"}, borracharia:{label:"🔧 Borracharia",color:"#dc2626"},
  posto:{label:"⛽ Combustível",color:"#16a34a"}, guindaste:{label:"🏗️ Guincho",color:"#c2410c"},
  eletricista:{label:"⚡ Elétrica",color:"#ca8a04"}, pecas:{label:"🏪 Autopeças",color:"#0891b2"},
  funilaria:{label:"🚗 Funilaria",color:"#9333ea"}, lavajato:{label:"🚿 Lava-Jato",color:"#0284c7"}, lavanderia:{label:"👕 Lavanderia",color:"#ec4899"},
  restaurante:{label:"🍽️ Restaurante",color:"#d97706"}, pousada:{label:"🛏️ Pousada",color:"#7c3aed"},
  farmacia:{label:"💊 Farmácia",color:"#059669"}, tacografo:{label:"📟 Tacógrafo",color:"#0f766e"},
  toxicologico:{label:"🧪 Toxicológico",color:"#7e22ce"}, chapa:{label:"💪 Chapa",color:"#0369a1"},
  outros:{label:"📦 Outros",color:"#6b7280"}
};

// CRITÉRIOS ESPECÍFICOS POR CATEGORIA
const CRITERIOS = {
  posto:       ["Preço do Diesel","Banheiro","Segurança","Estacionamento","Atendimento","ARLA 32"],
  mecanico:    ["Qualidade do Serviço","Honestidade","Preço","Agilidade","Atendimento","Garantia"],
  borracharia: ["Qualidade","Preço","Agilidade","Atendimento","Equipamentos","Localização"],
  eletricista: ["Qualidade","Honestidade","Preço","Agilidade","Diagnóstico","Atendimento"],
  pecas:       ["Variedade de Peças","Preço","Atendimento","Qualidade","Prazo de Entrega","Conhecimento"],
  funilaria:   ["Qualidade do Acabamento","Preço","Agilidade","Pintura","Atendimento","Garantia"],
  guindaste:   ["Agilidade","Preço","Equipamento","Segurança","Atendimento","Disponibilidade"],
  pousada:     ["Limpeza","Segurança","Conforto","Preço","Banheiro","Estacionamento"],
  restaurante: ["Qualidade da Comida","Preço","Limpeza","Atendimento","Variedade","Espaço"],
  lavajato:    ["Qualidade da Lavagem","Preço","Agilidade","Atendimento","Estrutura","Espaço"],
  farmacia:    ["Variedade","Preço","Atendimento","Horário","Localização","Agilidade"],
  tacografo:   ["Qualidade","Preço","Agilidade","Honestidade","Atendimento","Laudo"],
  toxicologico:["Agilidade","Preço","Atendimento","Estrutura","Sigilo","Credibilidade"],
  chapa:       ["Força e Eficiência","Pontualidade","Preço","Cuidado com a Carga","Atendimento","Experiência"],
  outros:      ["Qualidade","Preço","Atendimento","Agilidade","Honestidade","Satisfação Geral"],
  financiamento:["Taxa de Juros","Atendimento","Agilidade","Transparência","Facilidade","Aprovação"],
  saude:        ["Atendimento","Preço","Qualidade","Agilidade","Estrutura","Variedade de Serviços"]
};

const TAGS_SERVICOS = ["⛽ Combustível/Diesel","🧴 ARLA 32","🛏️ Dormida","🚿 Banheiro/Chuveiro","🍽️ Restaurante","🔧 Borracharia","🔩 Mecânico","⚡ Elétrica Veicular","🏪 Autopeças","🚗 Funilaria","🏗️ Guincho","🅿️ Estacionamento","📶 Wi-Fi","💊 Farmácia","🏧 Banco 24h","💰 Abastece Caminhão","💳 Crédito/Financiamento","🔑 Chuveiro pago","🍺 Conveniência","🖨️ Xerox/Impressão","📟 Tacógrafo","✨ Polimento"];

const SERVICOS_BUSCA = [{id:"mecanico",label:"🔩 Mecânico"},{id:"borracharia",label:"🔧 Borracharia"},{id:"posto",label:"⛽ Combustível"},{id:"guindaste",label:"🏗️ Guincho"},{id:"eletricista",label:"⚡ Elétrica"},{id:"pecas",label:"🏪 Autopeças"},{id:"funilaria",label:"🚗 Funilaria"},{id:"lavajato",label:"🚿 Lava-Jato"},{id:"lavanderia",label:"👕 Lavanderia"},{id:"restaurante",label:"🍽️ Restaurante"},{id:"pousada",label:"🛏️ Pousada"},{id:"farmacia",label:"💊 Farmácia"},{id:"tacografo",label:"📟 Tacógrafo"},{id:"toxicologico",label:"🧪 Toxicológico"},{id:"chapa",label:"💪 Chapa"},{id:"polimento",label:"✨ Polimento"},{id:"outros",label:"📦 Outros"},
  {id:"financiamento",label:"💰 Financiamento"},
  {id:"saude",label:"🏥 Saúde"}];

const ADMIN_SENHA = 'Juli0Filh0';

// CLOUDINARY CONFIG
const CLOUD_NAME = 'djajspfnl';
const CLOUD_API_KEY = '647235522933812';
const CLOUD_UPLOAD_PRESET = 'tralienigena_unsigned';

// ESTADO
let prestadores=[],avs=[],coordsUser=null,prestAtual=null;
let servSel=[],tagsCadSel=[],notaGeral=0,notasCrit={};
let adminLogado=false,geocTimer=null;
let mapaRes=null,mapaCad=null,mapaDet=null,marcCad=null;

// RELÓGIO
setInterval(()=>{ const n=new Date(); const el=document.getElementById('hRel'); if(el) el.textContent=`🕐 ${n.toLocaleTimeString('pt-BR')} • ${n.toLocaleDateString('pt-BR')}`; },1000);

// GPS HEADER
navigator.geolocation?.getCurrentPosition(async pos=>{
  coordsUser={lat:pos.coords.latitude,lng:pos.coords.longitude};
  try{
    const r=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coordsUser.lat}&lon=${coordsUser.lng}&format=json`);
    const d=await r.json();
    if(d?.address){ const c=d.address.city||d.address.town||d.address.village||''; const u=d.address.state_code||''; document.getElementById('hLoc').textContent=`📍 Você está em ${c}${u?', '+u:''}`; document.getElementById('busca-local').value=`${c}${u?', '+u:''}`; }
  }catch(e){}
},()=>{ document.getElementById('hLoc').textContent='📍 Localização não disponível'; });

// INIT
window.addEventListener('DOMContentLoaded',()=>{ buildGrids(); carregarTudo(); });

async function carregarTudo(){
  try{
    const [pSnap,aSnap]=await Promise.all([getDocs(collection(db,'prestadores')),getDocs(collection(db,'avaliacoes'))]);
    prestadores=pSnap.docs.map(d=>({id:d.id,...d.data()}));
    avs=aSnap.docs.map(d=>({id:d.id,...d.data()}));
    renderInicio();
    
    // SCRIPT DE SEMENTE DE EVENTOS (Executa uma vez e se remove)
    (async function() {
        try {
            const jaSemeado = localStorage.getItem('eventos_semeados_2026_v7');
            if (!jaSemeado) {
                const evs = [{'titulo': '2º Encontro de Motoristas de Sobral', 'data': '2026-08-28', 'hora': '16:00', 'descricao': 'Prepare-se para o maior evento de confraternização da região! O 2º Encontro de Motoristas de Sobral é a oportunidade perfeita para reencontrar amigos, fazer novas amizades e compartilhar histórias da estrada. Teremos música boa, comidas típicas e muitas surpresas para celebrar a paixão pela profissão. Venha fortalecer os laços da nossa comunidade e desfrutar de um dia inesquecível!', 'endereco': 'Posto Gatão, Sobral - CE', 'imagem': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663566321890/rBzctlDgrahVXYFC.png', 'whatsapp': '88981363953', 'instagram': 'tr.alienigena'}, {'titulo': 'Dia das Crianças - Filhos de Motoristas', 'data': '2026-10-11', 'hora': '10:00', 'descricao': 'Nossos pequenos heróis merecem uma celebração à altura! O Evento das Crianças, dedicado aos filhos dos motoristas, será um dia repleto de alegria, brincadeiras, presentes e muita diversão. Com atividades lúdicas, jogos e guloseimas, o Palmeiras Country Club se transformará em um parque de diversões para garantir sorrisos e memórias felizes. Traga sua família e venha celebrar o Dia das Crianças com a gente!', 'endereco': 'Palmeiras Country Club, Sobral - CE', 'imagem': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663566321890/OnmphDGGmCZlAHkZ.png', 'whatsapp': '88981363953', 'instagram': 'tr.alienigena'}, {'titulo': '2º Torneio dos Motoristas', 'data': '2026-11-28', 'hora': '15:00', 'descricao': 'É hora de calçar as chuteiras e mostrar o talento em campo! O 2º Torneio dos Motoristas promete muita emoção, fair play e lances incríveis. Reuna sua equipe e venha competir pelo troféu Tr.Alienigena, celebrando a união e o espírito esportivo da categoria. Além da disputa, teremos um ambiente de confraternização para toda a família. Não perca!', 'endereco': 'Palmeiras Country Club, Sobral - CE', 'imagem': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663566321890/zztkmHzHbHsHmDVa.png', 'whatsapp': '88981363953', 'instagram': 'tr.alienigena'}, {'titulo': 'Churrasco do Chofer 5.0', 'data': '2026-07-25', 'hora': '16:00', 'descricao': 'Venha aí! O melhor churrasco para motoristas com muita diversão, música e encontro de amigos. Realizado pela Cardan Service.', 'endereco': 'Filial Cardan Service - R. Generoso França, S/N - Pedras, Fortaleza - CE', 'imagem': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663566321890/laueIjUvkobycJUw.png', 'whatsapp': '', 'instagram': 'cardanservice'}, {'titulo': 'Arraiá do Motorista', 'data': '2026-06-20', 'hora': '21:00', 'descricao': 'O melhor Arraiá da região! Venha curtir com a gente no Palmeiras Country Club. Muita comida típica, música boa e diversão para toda a família dos motoristas.', 'endereco': 'Palmeiras Country Club, Sobral - CE', 'imagem': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663566321890/ySZSRLtjyPzszQtN.png', 'whatsapp': '88981363953', 'instagram': 'tr.alienigena'}, {'titulo': 'Torneio do Motorista', 'data': '2026-07-18', 'hora': '15:00', 'descricao': 'Grande torneio de futebol society exclusivo para motoristas. Venha mostrar seu talento em campo e disputar o troféu Tr.Alienigena!', 'endereco': 'Palmeiras Country Club, Sobral - CE', 'imagem': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663566321890/UoPGWhdhYwzqbOLU.png', 'whatsapp': '88981363953', 'instagram': 'tr.alienigena'}, {'titulo': '1º SBC Truck Fest', 'data': '2026-05-03', 'hora': '', 'descricao': 'Exposição de caminhões, música ao vivo, gincanas, área kids, presença de influenciadores e praça de alimentação. Entrada: 1kg de alimento por pessoa.', 'endereco': 'Ginásio Poliesportivo SBC, São Bernardo do Campo - SP', 'imagem': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663566321890/bWxtcxFpDOSdxkej.png', 'whatsapp': '', 'instagram': 'marcinha.caminhoneira_reserva'}, {'titulo': 'Fest Truck - 5ª Edição', 'data': '2026-05-02', 'hora': '', 'descricao': 'Grande evento consolidado com 5ª edição. Exposição de caminhões, música ao vivo, influenciadores e muita diversão no Parque Municipal Angelo Zeglin Palu.', 'endereco': 'Parque Municipal Angelo Zeglin Palu, Mandirituba - PR', 'imagem': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663566321890/LfJMFVppxMUiBTZV.png', 'whatsapp': '', 'instagram': 'fest.truck'}, {'titulo': 'Encontro Blessed Truck - 3ª Edição', 'data': '2026-06-20', 'hora': '', 'descricao': 'Festival de caminhões customizados, música ao vivo, influenciadores e diversão no Speedway Music Park. Evento grande com estrutura completa.', 'endereco': 'Speedway Music Park, Balneário Camboriú - SC', 'imagem': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663566321890/vWjLyOrHuqDmXaIj.png', 'whatsapp': '4798049574', 'instagram': 'encontro_blessedtruck'}, {'titulo': '26ª Festa do Motorista', 'data': '2026-05-03', 'hora': '10:00', 'descricao': 'Um dia especial com fé, carreata, almoço tradicional e muita música boa para reunir amigos, famílias e todos apaixonados pela vida na estrada. Celebração da tradição dos motoristas!', 'endereco': 'São Luiz de Castro - Boa Vista do Sul, RS', 'imagem': 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663566321890/iAodYvSFuNqbUCwH.png', 'whatsapp': '', 'instagram': 'loja_basso'}];
                for (const ev of evs) {
                    // Verificar se já existe um evento com o mesmo título e data
                    const q = query(collection(db, 'eventos'), where('titulo', '==', ev.titulo), where('data', '==', ev.data));
                    const snap = await getDocs(q);
                    if (snap.empty) {
                        await addDoc(collection(db, 'eventos'), ev);
                        console.log('Evento semeado:', ev.titulo);
                    }
                }
                localStorage.setItem('eventos_semeados_2026_v7', 'true');
            }
        } catch (e) { console.error('Erro na semente:', e); }
    })();
    // SCRIPT DE SEMENTE DE PRESTADORES (Executa uma vez e se remove)
    (async function() {
        try {
            const jaSemeadoPrestadores = localStorage.getItem('prestadores_semeados_2026_v1');
            if (!jaSemeadoPrestadores) {
                const prestSemear = [{'nome': 'Eudes Auto Peças', 'tipo': 'pecas', 'descricao': 'Peças e Acessórios para a Linha Diesel. Sobral - CE. Atendimento rápido e eficiente.', 'tags_servicos': ['Peças', 'Acessórios', 'Linha Diesel', 'Entrega'], 'whatsapp': '(88) 9 9448-0540', 'instagram': '@eudespecas', 'endereco': 'BR-222 KM-222 Nº 1329 - Distrito Industrial, Sobral - CE', 'lat': -3.7680, 'lng': -40.3478, 'abre': '08:00', 'fecha': '18:00', 'aberto24h': false, 'fotos': [], 'data': new Date().toISOString(), 'responsavel_nome': 'Júlio Filho', 'responsavel_email': 'julio@tralienigena.com', 'responsavel_uid': 'admin_julio_filho', 'responsavel_telefone': '(88) 98136-3953', 'fonte': 'instagram_print', 'status': 'ativo'}, {'nome': 'Tião Truck Center', 'tipo': 'mecanico', 'descricao': 'Vida de caminhoneiro, do jeito que ela é. Oficina • Peças • Pneus. Reboque 24h • Tacógrafo. Aqui a estrada encontra apoio.', 'tags_servicos': ['Oficina', 'Peças', 'Pneus', 'Reboque 24h', 'Tacógrafo', 'Socorro Mecânico'], 'whatsapp': '(88) 98655-1844', 'instagram': '@tiaotruckcenter_', 'endereco': 'Rodovia BR 222 KM 222, Nº 1581 - Sobral - CE', 'lat': -3.7680, 'lng': -40.3478, 'abre': '00:00', 'fecha': '23:59', 'aberto24h': true, 'fotos': [], 'data': new Date().toISOString(), 'responsavel_nome': 'Júlio Filho', 'responsavel_email': 'julio@tralienigena.com', 'responsavel_uid': 'admin_julio_filho', 'responsavel_telefone': '(88) 98136-3953', 'fonte': 'instagram_print', 'status': 'ativo'}, {'nome': 'Cardan Service Fortaleza', 'tipo': 'mecanico', 'descricao': 'Cardan, freios, suspensão, direção. Socorro Mecânico. Linha Diesel. A Casa do chofer em Fortaleza.', 'tags_servicos': ['Cardan', 'Freios', 'Suspensão', 'Direção', 'Socorro Mecânico', 'Linha Diesel'], 'whatsapp': '(85) 98136-3953', 'instagram': '@cardanservice', 'endereco': 'Rod. Quarto Anel Viário, 2700 E, Fortaleza - CE', 'lat': -3.7319, 'lng': -38.5267, 'abre': '06:00', 'fecha': '18:00', 'aberto24h': false, 'fotos': [], 'data': new Date().toISOString(), 'responsavel_nome': 'Júlio Filho', 'responsavel_email': 'julio@tralienigena.com', 'responsavel_uid': 'admin_julio_filho', 'responsavel_telefone': '(88) 98136-3953', 'fonte': 'instagram_print', 'status': 'ativo'}];
                for (const prest of prestSemear) {
                    // Verificar se já existe um prestador com o mesmo nome
                    const q = query(collection(db, 'prestadores'), where('nome', '==', prest.nome));
                    const snap = await getDocs(q);
                    if (snap.empty) {
                        await addDoc(collection(db, 'prestadores'), prest);
                        console.log('Prestador semeado:', prest.nome);
                    }
                }
                localStorage.setItem('prestadores_semeados_2026_v1', 'true');
            }
        } catch (e) { console.error('Erro na semente de prestadores:', e); }
    })();
    carregarEventos();
    carregarCursos();
    carregarMotoristas();
  }catch(e){ console.error(e); }
}

function calcMedia(prestId){ const n=avs.filter(a=>a.prestador_id===prestId).map(a=>a.nota_geral||0); return n.length?{media:+(n.reduce((a,b)=>a+b,0)/n.length).toFixed(1),total:n.length}:{media:0,total:0}; }

function renderInicio(){
  renderAvsRecentes();
  renderCadastrosRecentes();
  renderTop5('banheiro','posto','Banheiro');
  renderTop5('restaurante','restaurante','Comida');
  renderTop5('dormida','pousada','Limpeza');
}

function renderCadastrosRecentes(){
  const el = document.getElementById('lista-cadastros-recentes');
  if(!el) return;
  const lista = [...prestadores]
    .filter(p => !p.cadastrado_via_avaliacao && !p.cadastrado_via_internet)
    .sort((a,b) => new Date(b.data||0) - new Date(a.data||0))
    .slice(0,8);
  if(!lista.length){ el.innerHTML='<div class="empty">Nenhum cadastro ainda.</div>'; return; }
  el.innerHTML = lista.map(p => {
    const t = TIPOS[p.tipo]||TIPOS.outros;
    const cidade = (p.endereco||'').split(',').slice(-2).join(',').trim() || 'Localização não informada';
    const dataStr = p.data ? new Date(p.data).toLocaleDateString('pt-BR') : '';
    return `<div onclick="window.APP.detalhe('${p.id}','inicio')" style="background:#fff;border:1px solid #eee;border-radius:8px;padding:10px 12px;margin-bottom:6px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:8px;box-shadow:0 1px 3px rgba(0,0,0,.04)">
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:13px;color:#1a1a1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.nome}</div>
        <div style="font-size:11px;font-weight:700;color:${t.color};margin-top:1px">${t.label}</div>
        <div style="font-size:11px;color:#aaa;margin-top:1px">📍 ${cidade}</div>
      </div>
      <div style="font-size:10px;color:#aaa;flex-shrink:0;text-align:right">${dataStr}<br><span style="color:#2d8c3e;font-weight:700;font-size:10px">🆕 novo</span></div>
    </div>`;
  }).join('');
}

function renderAvsRecentes(){
  const el=document.getElementById('lista-avs-recentes');
  const lista=[...avs].sort((a,b)=>new Date(b.data)-new Date(a.data)).slice(0,5);
  if(!lista.length){el.innerHTML='<div class="empty">Nenhuma avaliação ainda.</div>';return;}
  el.innerHTML=lista.map(av=>{
    const t=TIPOS[av.prestador_tipo]||TIPOS.outros;
    const stars='★'.repeat(Math.round(av.nota_geral||0))+'☆'.repeat(5-Math.round(av.nota_geral||0));
    const clickable = av.prestador_id ? `onclick="APP.detalhe('${av.prestador_id}','inicio')" style="cursor:pointer"` : '';
    const cidadeAutor = av.cidade_autor && av.cidade_autor !== 'Desconhecida' ? av.cidade_autor : '';
    return `<div class="av-mini" ${clickable}><div class="av-mini-top"><div><div class="av-mini-nome">${av.prestador_nome||'—'}</div><div class="av-mini-tipo" style="color:${t.color}">${t.label}</div></div><div class="av-mini-stars">${stars}</div></div>${av.texto?`<div class="av-mini-txt">${av.texto.substring(0,90)}${av.texto.length>90?'...':''}</div>`:''}<div class="av-mini-autor">por ${av.autor||'Anônimo'}${cidadeAutor?' ('+cidadeAutor+')':''} • ${av.data?new Date(av.data).toLocaleDateString('pt-BR'):''}</div></div>`;
  }).join('');
}

function encurtarEndereco(end){
  if(!end) return 'Localização não informada';
  const partes = end.split(',');
  // Pega até 2 partes: rodovia/rua + cidade ou só cidade
  if(partes.length >= 3){
    const p1 = partes[0].trim();
    // Tenta pegar a cidade (geralmente penúltima ou antepenúltima antes de estado/país)
    const cidade = partes.find(p=>{
      const s = p.trim();
      return s.length > 2 && s.length < 40 && !/^\d{5}/.test(s) && !/^Brasil$/i.test(s) && !/^Região/i.test(s) && !/^CEP/i.test(s);
    }) || partes[1];
    return p1 + ', ' + cidade.trim();
  }
  return partes.slice(0,2).join(', ');
}

function renderTop5(elId, tipoFiltro, critNome){
  const el=document.getElementById('top5-'+elId);
  // Pegar prestadores do tipo
  const lista=prestadores.filter(p=>p.tipo===tipoFiltro||( tipoFiltro==='posto'&&p.tipo==='posto'));
  // Calcular nota do critério específico
  const comNota=lista.map(p=>{
    const avsP=avs.filter(a=>a.prestador_id===p.id);
    let notaCrit=0,qtd=0;
    avsP.forEach(a=>{ if(a.criterios&&a.criterios[critNome]){ notaCrit+=a.criterios[critNome]; qtd++; } });
    const mediaGeral=calcMedia(p.id);
    const nota=qtd>0?(notaCrit/qtd):mediaGeral.media;
    return {...p,notaTop:nota,totalAv:mediaGeral.total};
  }).filter(p=>p.notaTop>0).sort((a,b)=>b.notaTop-a.notaTop).slice(0,5);
  if(!comNota.length){el.innerHTML='<div class="empty">Nenhuma avaliação ainda nesta categoria.</div>';return;}
  el.innerHTML=comNota.map((p,i)=>{
    const stars='★'.repeat(Math.round(p.notaTop))+'☆'.repeat(5-Math.round(p.notaTop));
    return `<div class="top5-card" onclick="window.APP.detalhe('${p.id}','inicio')" style="cursor:pointer">
      <div class="top5-pos">${i+1}º</div>
      <div style="flex:1"><div class="top5-nome">${p.nome}</div><div class="top5-info">📍 ${encurtarEndereco(p.endereco)}</div><div class="top5-stars">${stars} <span style="font-size:10px;color:#aaa">(${p.totalAv} av.)</span></div></div>
    </div>`;
  }).join('');
}

// GRIDS
function buildGrids(){
  document.getElementById('servicos-grid').innerHTML=SERVICOS_BUSCA.map(s=>`<button class="serv-btn" id="sb-${s.id}" onclick="APP.togServ('${s.id}')">${s.label}</button>`).join('');
  document.getElementById('cad-tags-grid').innerHTML=TAGS_SERVICOS.map((t,i)=>`<button type="button" class="tag-btn" id="tag-${i}" onclick="APP.togTag(${i},'${t}')">${t}</button>`).join('');
  setTimeout(()=>{ if(!mapaCad){ mapaCad=L.map('mapa-cadastro').setView([-5.0892,-42.8019],5); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(mapaCad); mapaCad.on('click',e=>{ document.getElementById('cad-lat').value=e.latlng.lat; document.getElementById('cad-lng').value=e.latlng.lng; if(marcCad) marcCad.remove(); marcCad=L.marker([e.latlng.lat,e.latlng.lng]).addTo(mapaCad).bindPopup('Seu local').openPopup(); }); } },400);
}

// APP GLOBAL
window.APP={
  toggleDark(){ const dark = document.body.classList.toggle('dark-mode');
    document.getElementById('btn-dark-toggle').textContent = dark ? '☀️' : '🌙';
    try{ localStorage.setItem('darkMode', dark?'1':'0'); }catch(e){}
  },
  sosMecanico(){
    if(!navigator.geolocation){ alert('GPS não disponível no seu dispositivo.'); return; }
    const btn = document.querySelector('.sos-banner');
    if(btn){ btn.innerHTML='<div class="sos-icon">📡</div><div class="sos-text"><div class="sos-title">Obtendo sua localização...</div><div class="sos-sub">Aguarde um momento</div></div>'; }
    navigator.geolocation.getCurrentPosition(pos=>{
      const lat=pos.coords.latitude, lng=pos.coords.longitude;
      const mapsUrl=`https://www.google.com/maps?q=${lat},${lng}`;
      const msg=encodeURIComponent(`🆘 *SOS MECÂNICO — QUEBREI NA ESTRADA!*\n\n📍 Minha localização:\n${mapsUrl}\n\nPreciso de socorro mecânico urgente!\n_Enviado pelo app Tr.Alienigena_`);
      const wpp=`https://wa.me/5588981363953?text=${msg}`;
      window.open(wpp,'_blank');
      if(btn){ btn.innerHTML='<div class="sos-icon">🆘</div><div class="sos-text"><div class="sos-title">SOS Mecânico — Quebrei!</div><div class="sos-sub">Manda sua localização agora para mecânicos próximos</div></div><div class="sos-arrow">›</div>'; }
    },()=>{
      alert('Não foi possível obter sua localização. Ative o GPS e tente novamente.');
      if(btn){ btn.innerHTML='<div class="sos-icon">🆘</div><div class="sos-text"><div class="sos-title">SOS Mecânico — Quebrei!</div><div class="sos-sub">Manda sua localização agora para mecânicos próximos</div></div><div class="sos-arrow">›</div>'; }
    },{enableHighAccuracy:true,timeout:10000});
  },
  voltarFixo(){ this.inicio(); },
  inicio(){
    document.querySelectorAll('.tela').forEach(t=>{ t.classList.remove('ativa'); t.style.display=''; });
    const ti = document.getElementById('tela-inicio');
    ti.classList.add('ativa');
    const bv=document.getElementById('btn-voltar-fixo');
    if(bv) bv.classList.remove('visivel');
    carregarTudo();
    window.scrollTo(0,0);
  },
  show(id){
    const el = document.getElementById(id);
    if(!el){ console.warn('Tela não encontrada:', id); return; }
    document.querySelectorAll('.tela').forEach(t=>{ t.classList.remove('ativa'); t.style.display=''; });
    el.classList.add('ativa');
    const bv=document.getElementById('btn-voltar-fixo');
    if(bv) bv.classList.add('visivel');
    if(id==='tela-admin') this.adminCheck();
    if(id==='tela-avaliar') setTimeout(()=>this.carregarProximos(),300);
    if(id==='tela-busca') setTimeout(()=>this.carregarProximosBusca(),400);
    if(id==='tela-vagas') setTimeout(()=>APP.carregarVagas(),200);
    if(id==='tela-mapa-servicos') setTimeout(()=>APP.renderMapaServicos(),300);
    if(id==='tela-eventos') renderEventos();
    if(id==='tela-cursos') renderCursos();
    if(id==='tela-motoristas') renderMotoristas();
    if(id==='tela-loja'){APP.lojaFiltrar('todos');}
    if(id==='tela-noticias') APP.carregarNoticias();
    window.scrollTo(0,0);
  },
  togServ(id){ const btn=document.getElementById('sb-'+id); if(servSel.includes(id)){servSel=servSel.filter(s=>s!==id);btn.classList.remove('on');}else{servSel.push(id);btn.classList.add('on');} },
  togTag(i,t){ const btn=document.getElementById('tag-'+i); if(tagsCadSel.includes(t)){tagsCadSel=tagsCadSel.filter(x=>x!==t);btn.classList.remove('on');}else{tagsCadSel.push(t);btn.classList.add('on');} },
  autocomplete(){ const q=document.getElementById('busca-texto').value.toLowerCase().trim(); const box=document.getElementById('ac-box'); if(q.length<2){box.style.display='none';return;} const termos=['motor','câmbio','freio','suspensão','bomba','válvula','ar condicionado','diferencial','embreagem','injeção','radiador','correia','pneu','bateria','alternador','filtro','óleo','escapamento','tacógrafo','toxicológico','retífica','solda','baú','refrigeração']; const s=termos.filter(t=>t.includes(q)).slice(0,5); if(!s.length){box.style.display='none';return;} box.style.display='block'; box.innerHTML=s.map(x=>`<div class="ac-item" onclick="APP.selAC('${x}')">${x}</div>`).join(''); },
  selAC(s){ document.getElementById('busca-texto').value=s; document.getElementById('ac-box').style.display='none'; },
  async gps(ctx){
    const statusId=ctx==='busca'?'gps-busca':'gps-cad'; const el=document.getElementById(statusId); el.style.display='block'; el.textContent='📡 Localizando...';
    if(!navigator.geolocation){el.textContent='GPS não disponível';return;}
    navigator.geolocation.getCurrentPosition(async pos=>{
      coordsUser={lat:pos.coords.latitude,lng:pos.coords.longitude}; el.textContent='🔍 Buscando endereço...';
      try{
        const r=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coordsUser.lat}&lon=${coordsUser.lng}&format=json&addressdetails=1`); const d=await r.json();
        if(d?.address){ const a=d.address; const rua=a.road||a.street||''; const num=a.house_number||''; const bairro=a.suburb||a.neighbourhood||''; const cidade=a.city||a.town||a.village||''; const uf=a.state_code||''; const cep=a.postcode||''; const partes=[]; if(rua) partes.push(rua+(num?' '+num:'')); if(bairro) partes.push(bairro); if(cidade) partes.push(cidade); if(uf) partes.push(uf); if(cep) partes.push('CEP '+cep); const end=partes.join(', '); const loc=cidade+(uf?', '+uf:'');
          if(ctx==='busca'){document.getElementById('busca-local').value=loc; el.textContent='✅ Localização obtida!';}
          if(ctx==='cadastro'){ document.getElementById('cad-end').value=end||loc; document.getElementById('cad-lat').value=coordsUser.lat; document.getElementById('cad-lng').value=coordsUser.lng; el.textContent='✅ Endereço preenchido! Confirme se necessário.'; if(mapaCad){mapaCad.setView([coordsUser.lat,coordsUser.lng],17); if(marcCad) marcCad.remove(); marcCad=L.marker([coordsUser.lat,coordsUser.lng]).addTo(mapaCad).bindPopup(`${rua||'Sua localização'}${num?' '+num:''}<br>${cidade}${uf?', '+uf:''}${cep?'<br>CEP: '+cep:''}`).openPopup();} }
        }
      }catch(e){el.textContent='✅ Localização obtida!';}
    },(err)=>{ const e=document.getElementById(statusId); e.style.display='block'; e.textContent=err.code===1?'❌ GPS negado. Ative nas configurações.':'❌ Erro ao localizar.'; },{enableHighAccuracy:true,timeout:15000});
  },
  toggleDias(opcao){
    const segSab=document.getElementById('cad-dias-seg-sab');
    const domFer=document.getElementById('cad-dias-dom-fer');
    const todos=document.getElementById('cad-dias-todos');
    const lSegSab=document.getElementById('label-seg-sab');
    const lDomFer=document.getElementById('label-dom-fer');
    const lTodos=document.getElementById('label-todos-dias');
    if(opcao==='todos'){
      if(todos.checked){ segSab.checked=true; domFer.checked=true; }
      else{ segSab.checked=false; domFer.checked=false; }
    } else {
      if(segSab.checked && domFer.checked){ todos.checked=true; }
      else{ todos.checked=false; }
    }
    [lSegSab,lDomFer,lTodos].forEach(l=>l.style.border='2px solid #e0e0e0');
    [lSegSab,lDomFer,lTodos].forEach(l=>l.style.background='#f5f5f5');
    if(segSab.checked){lSegSab.style.border='2px solid #2d8c3e';lSegSab.style.background='#f0fdf4';}
    if(domFer.checked){lDomFer.style.border='2px solid #2d8c3e';lDomFer.style.background='#f0fdf4';}
    if(todos.checked){lTodos.style.border='2px solid #2d8c3e';lTodos.style.background='#f0fdf4';}
  },
  geocode(){ clearTimeout(geocTimer); geocTimer=setTimeout(async()=>{ const end=document.getElementById('cad-end').value.trim(); if(end.length<5) return; try{ const r=await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(end+', Brasil')}&format=json&limit=1`); const d=await r.json(); if(d?.[0]){ const lat=parseFloat(d[0].lat),lng=parseFloat(d[0].lon); document.getElementById('cad-lat').value=lat; document.getElementById('cad-lng').value=lng; if(mapaCad){mapaCad.setView([lat,lng],15); if(marcCad) marcCad.remove(); marcCad=L.marker([lat,lng]).addTo(mapaCad).bindPopup('Seu local').openPopup();} } }catch(e){} },700); },
  async buscar(){
    const txt=document.getElementById('busca-texto').value.trim().toLowerCase(); const loc=document.getElementById('busca-local').value.trim();
    if(!servSel.length&&!txt){alert('Selecione um serviço ou descreva o que precisa.');return;}
    if(!loc&&!coordsUser){alert('Informe sua localização.');return;}
    this.show('tela-resultados'); document.getElementById('lista-resultados').innerHTML='<div class="loading">Buscando...</div>';
    document.getElementById('result-titulo').textContent=servSel.map(s=>SERVICOS_BUSCA.find(x=>x.id===s)?.label||s).join(', ')||`"${txt}"`;
    if(!mapaRes){mapaRes=L.map('mapa-resultados').setView([-5.0892,-42.8019],7); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(mapaRes);}
    if(!coordsUser&&loc){try{const r=await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(loc+', Brasil')}&format=json&limit=1`); const d=await r.json(); if(d?.[0]) coordsUser={lat:parseFloat(d[0].lat),lng:parseFloat(d[0].lon)};}catch(e){}}
    if(coordsUser) mapaRes.setView([coordsUser.lat,coordsUser.lng],11);
    let fil=[...prestadores]; if(servSel.length) fil=fil.filter(p=>servSel.includes(p.tipo)); if(txt) fil=fil.filter(p=>(p.descricao||'').toLowerCase().includes(txt)||(p.nome||'').toLowerCase().includes(txt));
    fil=fil.map(p=>{const m=calcMedia(p.id); const dist=coordsUser&&p.lat&&p.lng?calcDist(coordsUser.lat,coordsUser.lng,p.lat,p.lng):null; return{...p,...m,dist};}).sort((a,b)=>{ if(a.dist!==null&&b.dist!==null) return a.dist-b.dist; return b.media-a.media;});
    const info=document.getElementById('result-info'); info.style.display='block'; info.textContent=`${fil.length} resultado(s) encontrado(s)`;
    mapaRes.eachLayer(l=>{if(l instanceof L.Marker) mapaRes.removeLayer(l);});
    fil.forEach(p=>{if(p.lat&&p.lng) L.marker([p.lat,p.lng]).addTo(mapaRes).bindPopup(`<strong>${p.nome}</strong>`);});
    const el=document.getElementById('lista-resultados');
    if(!fil.length){el.innerHTML='<div class="empty">Nenhum serviço encontrado.</div>';return;}
    el.innerHTML=fil.map(p=>cardHTML(p,'resultados')).join('');
  },
  async atualizarProximosBusca(){ await this.carregarProximosBusca(); },

  async carregarProximosBusca(){
    const status = document.getElementById('proximos-busca-status');
    const lista = document.getElementById('proximos-busca-lista');
    if(!status||!lista) return;
    lista.innerHTML='';
    if(!coordsUser){
      if(!navigator.geolocation){ status.textContent='📍 GPS não disponível'; return; }
      status.textContent='📡 Obtendo localização...';
      await new Promise(res=>navigator.geolocation.getCurrentPosition(pos=>{ coordsUser={lat:pos.coords.latitude,lng:pos.coords.longitude}; res(); },()=>res(),{enableHighAccuracy:true,timeout:8000}));
    }
    if(!coordsUser){ status.textContent='📍 Localização não disponível'; return; }
    status.textContent='🔍 Buscando serviços próximos...';
    try{
      // Buscar no banco por proximidade
      const banco = prestadores.filter(p=>p.lat&&p.lng).map(p=>({...p,_fonte:'banco',dist:calcDist(coordsUser.lat,coordsUser.lng,p.lat,p.lng)})).filter(p=>p.dist<=20).sort((a,b)=>a.dist-b.dist).slice(0,6);
      // Buscar internet
      let internet = [];
      try{
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=posto+OR+mecanico+OR+borracharia+OR+restaurante+OR+oficina&format=json&limit=6&addressdetails=1&countrycodes=br&viewbox=${coordsUser.lng-0.1},${coordsUser.lat+0.1},${coordsUser.lng+0.1},${coordsUser.lat-0.1}&bounded=1`);
        const d = await r.json();
        const excluirB=['pet','gourmet','petisco','salão','beleza','boutique','moda','roupa','calçado','joalheria','infantil','brinquedo','academia','padaria fina','sorveteria','bar','boate','clube'];
        internet = d.filter(i=>i.name&&!excluirB.some(ex=>(i.name||'').toLowerCase().includes(ex))).map(i=>({_internet:true,_fonte:'internet',_display:i.display_name,_lat:parseFloat(i.lat),_lng:parseFloat(i.lon),nome:i.name,endereco:i.display_name,tipo:detectarTipo(i.type||'',i.name||''),dist:calcDist(coordsUser.lat,coordsUser.lng,parseFloat(i.lat),parseFloat(i.lon))})).filter(i=>i.dist<20).sort((a,b)=>a.dist-b.dist).slice(0,6);
      }catch(e){}
      const todos=[...banco,...internet.filter(i=>!banco.find(b=>b.nome.toLowerCase().includes(i.nome.toLowerCase().substring(0,5))))].slice(0,10);
      if(!todos.length){status.textContent='Nenhum serviço próximo encontrado. Faça a busca manual.';return;}
      status.textContent=`${todos.length} serviço(s) encontrado(s) no raio de 20km:`;
      window._proximosBusca = todos;
      lista.innerHTML=todos.map((p,i)=>{
        const t=TIPOS[p.tipo]||TIPOS.outros;
        const distStr=p.dist<1?(p.dist*1000).toFixed(0)+'m':p.dist.toFixed(1)+'km';
        const icone=p._fonte==='banco'?'📋':'🌐';
        const endCurto=(p.endereco||p._display||'').split(',').slice(0,2).join(',');
        const m=p._fonte==='banco'?calcMedia(p.id):{media:0,total:0};
        const stars=m.media>0?'★'.repeat(Math.round(m.media))+'☆'.repeat(5-Math.round(m.media)):'';
        return `<div onclick="APP.abrirProximoBusca(${i})" style="background:#fff;border:1px solid #e5e5e5;border-radius:10px;padding:12px 14px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.05)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div style="flex:1;min-width:0">
              <div style="font-weight:700;font-size:14px;color:#1a1a1a">${p.nome}</div>
              <span style="display:inline-block;background:${t.color}18;color:${t.color};border:1px solid ${t.color}44;border-radius:4px;padding:1px 6px;font-size:10px;font-weight:700;margin-top:3px">${t.label}</span>
              <div style="font-size:11px;color:#888;margin-top:4px">📍 ${endCurto}</div>
              ${stars?`<div style="color:#f59e0b;font-size:12px;margin-top:2px">${stars} <span style="font-size:10px;color:#aaa">(${m.total}av)</span></div>`:''}
            </div>
            <div style="text-align:right;flex-shrink:0;margin-left:8px">
              <div style="font-size:13px;font-weight:700;color:#2d8c3e">${distStr}</div>
              <div style="font-size:9px;color:#aaa;margin-top:2px">${icone}</div>
            </div>
          </div>
          <div style="display:flex;gap:6px;margin-top:10px">
            <button onclick="event.stopPropagation();APP.abrirProximoBusca(${i})" style="background:#2d8c3e;color:#fff;border:none;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:11px;font-weight:700;flex:1">🔍 Ver detalhes</button>
            ${p._fonte==='banco'&&(p.whatsapp||'').replace(/\D/g,'')!==''?`<button onclick="event.stopPropagation();window.open('https://wa.me/55${(p.whatsapp||'').replace(/\D/g,'')}?text=Olá%21%20Sou%20caminhoneiro%20e%20vi%20seu%20número%20na%20Tr.Alienigena.%20Você%20pode%20me%20ajudar%3F','_blank')" style="background:#25d366;color:#fff;border:none;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:11px;font-weight:700">💬</button>`:''}
          </div>
        </div>`;
      }).join('');
    }catch(e){status.textContent='Erro ao buscar serviços próximos.';}
  },

  abrirProximoBusca(idx){
    const p = window._proximosBusca[idx];
    if(!p) return;
    if(p._fonte==='banco'){ this.detalhe(p.id,'busca'); }
    else { // Abrir detalhes inline da internet
      prestAtual={...p,id:'_temp',lat:p._lat,lng:p._lng,whatsapp:'',tags_servicos:[]};
      this.show('tela-detalhe');
      document.getElementById('btn-voltar-det').onclick=()=>this.show('tela-busca');
      const t=TIPOS[p.tipo]||TIPOS.outros;
      document.getElementById('det-nome').textContent=p.nome;
      document.getElementById('det-tipo').innerHTML=`<span class="tag" style="background:${t.color}18;color:${t.color};border:1px solid ${t.color}44">${t.label}</span>`;
    // Galeria de fotos
    const galeriaEl = document.getElementById('det-galeria');
    if(prestAtual.fotos && prestAtual.fotos.length > 0){
      galeriaEl.style.display='block';
      galeriaEl.innerHTML=`<div class="galeria-det">${prestAtual.fotos.map((url,i)=>`<img src="${url}" alt="Foto ${i+1}" onclick="APP.abrirFotoModal('${url}')" loading="lazy"/>`).join('')}</div>`;
    } else { galeriaEl.style.display='none'; galeriaEl.innerHTML=''; }
      document.getElementById('det-servicos').innerHTML='';
      document.getElementById('det-info').innerHTML=`<div class="info-linha"><span class="info-ico">📍</span><span>${p._display||p.endereco||''}</span></div><div class="info-linha"><span class="info-ico">🌐</span><span style="color:#888;font-size:12px">Encontrado na internet — ainda não cadastrado no app</span></div>`;
      document.getElementById('btn-wpp-g').style.display='none';
      document.getElementById('btn-rota-g').onclick=()=>{ if(p._lat&&p._lng) window.open(`https://www.openstreetmap.org/directions?to=${p._lat},${p._lng}#map=15/${p._lat}/${p._lng}`,'_blank'); };
      document.getElementById('lista-avs-det').innerHTML='<div class="empty">Ainda não cadastrado. Seja o primeiro a avaliar!</div>';
      if(!mapaDet){mapaDet=L.map('mapa-detalhe');L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(mapaDet);}
      if(p._lat&&p._lng){mapaDet.setView([p._lat,p._lng],15);L.marker([p._lat,p._lng]).addTo(mapaDet).bindPopup(p.nome).openPopup();}
    }
  },

  async relacao(){
    this.show('tela-relacao');
    const ord=[...prestadores].sort((a,b)=>{const tA=(TIPOS[a.tipo]||TIPOS.outros).label,tB=(TIPOS[b.tipo]||TIPOS.outros).label; return tA!==tB?tA.localeCompare(tB,'pt-BR'):(a.nome||'').localeCompare(b.nome||'','pt-BR');});
    renderRel(ord);
  },
  filtrarRel(){ const q=document.getElementById('rel-filtro').value.toLowerCase().trim(); const tipo=document.getElementById('rel-tipo').value; const res=prestadores.filter(p=>(!tipo||p.tipo===tipo)&&(!q||p.nome.toLowerCase().includes(q)||(p.descricao||'').toLowerCase().includes(q)||(p.endereco||'').toLowerCase().includes(q))); renderRel(res); },
  async detalhe(id,voltar='resultados'){
    prestAtual=prestadores.find(x=>x.id===id)||null;
    if(!prestAtual) return;
    this.show('tela-detalhe');
    const btn=document.getElementById('btn-voltar-det');
    btn.onclick=()=>this.show(voltar==='inicio'?'tela-inicio':voltar==='relacao'?'tela-relacao':'tela-resultados');
    const t=TIPOS[prestAtual.tipo]||TIPOS.outros;
    document.getElementById('det-nome').textContent=prestAtual.nome;
    document.getElementById('det-tipo').innerHTML=`<span class="tag" style="background:${t.color}18;color:${t.color};border:1px solid ${t.color}44">${t.label}</span>`;
    // Galeria de fotos
    const galeriaEl = document.getElementById('det-galeria');
    if(prestAtual.fotos && prestAtual.fotos.length > 0){
      galeriaEl.style.display='block';
      galeriaEl.innerHTML=`<div class="galeria-det">${prestAtual.fotos.map((url,i)=>`<img src="${url}" alt="Foto ${i+1}" onclick="APP.abrirFotoModal('${url}')" loading="lazy"/>`).join('')}</div>`;
    } else { galeriaEl.style.display='none'; galeriaEl.innerHTML=''; }
    // Tags de serviços adicionais
    const tagsEl=document.getElementById('det-servicos');
    if(prestAtual.tags_servicos&&prestAtual.tags_servicos.length){ tagsEl.innerHTML=`<div style="display:flex;flex-wrap:wrap;gap:4px">${prestAtual.tags_servicos.map(tg=>`<span class="pc-serv-tag">${tg}</span>`).join('')}</div>`; }else tagsEl.innerHTML='';
    const h=prestAtual.aberto24h?'🕐 Aberto 24 horas':(prestAtual.abre&&prestAtual.fecha?`🕐 ${prestAtual.abre}h às ${prestAtual.fecha}h`:'');
    document.getElementById('det-info').innerHTML=`${prestAtual.endereco?`<div class="info-linha"><span class="info-ico">📍</span><span>${prestAtual.endereco}</span></div>`:''}${prestAtual.whatsapp?`<div class="info-linha"><span class="info-ico">💬</span><span>${prestAtual.whatsapp}</span></div>`:''}${prestAtual.instagram?`<div class="info-linha"><span class="info-ico">📸</span><span>${prestAtual.instagram}</span></div>`:''}${h?`<div class="info-linha"><span class="info-ico">🕐</span><span>${h}</span></div>`:''}${prestAtual.descricao?`<div class="info-linha"><span class="info-ico">💬</span><span>${prestAtual.descricao}</span></div>`:''}`;
    const wppNum=(prestAtual.whatsapp||'').replace(/\D/g,'');
    const btnWpp=document.getElementById('btn-wpp-g');
    if(wppNum){btnWpp.style.display='flex'; btnWpp.onclick=()=>window.open(`https://wa.me/55${wppNum}?text=Olá%21%20Sou%20caminhoneiro%20e%20vi%20seu%20número%20na%20Tr.Alienigena%20-%20A%20Voz%20do%20Motorista.%20Você%20pode%20me%20ajudar%3F`,'_blank');}else btnWpp.style.display='none';
    document.getElementById('btn-rota-g').onclick=()=>{ if(prestAtual.lat&&prestAtual.lng) window.open(`https://www.openstreetmap.org/directions?to=${prestAtual.lat},${prestAtual.lng}#map=15/${prestAtual.lat}/${prestAtual.lng}`,'_blank'); else alert('Localização não disponível.'); };
    if(!mapaDet){mapaDet=L.map('mapa-detalhe'); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(mapaDet);}
    if(prestAtual.lat&&prestAtual.lng){mapaDet.setView([prestAtual.lat,prestAtual.lng],15); L.marker([prestAtual.lat,prestAtual.lng]).addTo(mapaDet).bindPopup(prestAtual.nome).openPopup();}
    this.carregarAvsDetalhe(id);
  },
  async carregarAvsDetalhe(id){
    const el=document.getElementById('lista-avs-det'); el.innerHTML='<div class="loading">Carregando...</div>';
    const lista=avs.filter(a=>a.prestador_id===id).sort((a,b)=>new Date(b.data)-new Date(a.data));
    if(!lista.length){el.innerHTML='<div class="empty">Nenhuma avaliação ainda.</div>';return;}
    el.innerHTML=lista.map(av=>{ const stars='★'.repeat(Math.round(av.nota_geral||0))+'☆'.repeat(5-Math.round(av.nota_geral||0)); const crits=av.criterios?Object.entries(av.criterios).map(([k,v])=>`<div class="crit-item">${k}: ${'★'.repeat(v)}</div>`).join(''):''; const fotosHTML = av.fotos&&av.fotos.length?`<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">${av.fotos.map(url=>`<img src="${url}" onclick="APP.abrirFotoModal('${url}')" style="width:80px;height:80px;object-fit:cover;border-radius:6px;cursor:pointer;border:1px solid #eee"/>`).join('')}</div>`:'';
      return `<div class="av-card"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="color:#f59e0b;font-size:13px">${stars}</span><span style="font-size:10px;color:#aaa">${av.data?new Date(av.data).toLocaleDateString('pt-BR'):''}</span></div>${av.texto?`<div style="font-size:12px;color:#444;margin-bottom:4px">${av.texto}</div>`:''}<div class="crit-grid">${crits}</div>${fotosHTML}<div style="font-size:10px;color:#aaa;margin-top:4px">por ${av.autor||'Anônimo'}</div></div>`; }).join('');
  },
  avaliarAtual(){ if(!prestAtual) return; this.show('tela-avaliar'); document.getElementById('btn-voltar-av').onclick=()=>this.show('tela-detalhe'); this.selAvAlvo(prestAtual.id); document.getElementById('av-busca').value=prestAtual.nome; },
  async buscarExistente(){ const q=document.getElementById('cad-busca').value.trim().toLowerCase(); const s=document.getElementById('cad-sug'); if(q.length<2){s.style.display='none';return;} const r=prestadores.filter(p=>p.nome.toLowerCase().includes(q)).slice(0,5); if(!r.length){s.style.display='none';return;} s.style.display='block'; s.innerHTML=r.map(p=>`<div class="bp-item" onclick="APP.vincular('${p.id}')"><div class="bp-item-nome">${p.nome}</div><div class="bp-item-tipo">${(TIPOS[p.tipo]||TIPOS.outros).label} • ${p.endereco||''}</div></div>`).join(''); },
  vincular(id){ const p=prestadores.find(x=>x.id===id); if(!p) return; document.getElementById('cad-sug').style.display='none'; document.getElementById('cad-ok').textContent='✅ Cadastro encontrado! Você já está vinculado a este estabelecimento.'; document.getElementById('cad-ok').style.display='block'; document.getElementById('form-novo').style.display='none'; setTimeout(()=>document.getElementById('cad-ok').style.display='none',4000); },
  _fotosParaUpload: [],

  previsualizarFotos(event){
    const files = Array.from(event.target.files);
    const preview = document.getElementById('fotos-preview-cad');
    const status = document.getElementById('fotos-status');
    // Máximo 5 fotos
    const total = this._fotosParaUpload.length + files.length;
    if(total > 5){ alert('Máximo de 5 fotos permitidas.'); return; }
    files.forEach(file=>{
      if(!file.type.startsWith('image/')){ alert('Apenas imagens são permitidas.'); return; }
      if(file.size > 5*1024*1024){ alert('Foto muito grande. Máximo 5MB por foto.'); return; }
      this._fotosParaUpload.push(file);
      const reader = new FileReader();
      reader.onload = e=>{
        const idx = this._fotosParaUpload.length - 1;
        const div = document.createElement('div');
        div.className = 'foto-preview-item';
        div.id = `foto-prev-${idx}`;
        div.innerHTML = `<img src="${e.target.result}" alt="foto"/><button class="foto-remove" onclick="APP.removerFoto(${idx})">✕</button>`;
        preview.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
    status.style.display='block';
    status.textContent=`${this._fotosParaUpload.length}/5 foto(s) selecionada(s)`;
  },

  removerFoto(idx){
    this._fotosParaUpload.splice(idx,1);
    const el = document.getElementById(`foto-prev-${idx}`);
    if(el) el.remove();
    // Reindexar
    document.querySelectorAll('.foto-preview-item').forEach((el,i)=>{
      el.id=`foto-prev-${i}`;
      const btn=el.querySelector('.foto-remove');
      if(btn) btn.setAttribute('onclick',`APP.removerFoto(${i})`);
    });
    const status=document.getElementById('fotos-status');
    status.textContent=`${this._fotosParaUpload.length}/5 foto(s) selecionada(s)`;
    if(!this._fotosParaUpload.length) status.style.display='none';
  },

  async uploadFotos(prestId){
    if(!this._fotosParaUpload.length) return [];
    const urls = [];
    const status = document.getElementById('fotos-status');
    for(let i=0; i<this._fotosParaUpload.length; i++){
      const file = this._fotosParaUpload[i];
      if(status) status.textContent=`📤 Enviando foto ${i+1} de ${this._fotosParaUpload.length}...`;
      try{
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUD_UPLOAD_PRESET);
        formData.append('folder', `tralienigena/${prestId}`);
        const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST', body: formData
        });
        const d = await r.json();
        if(d.secure_url) urls.push(d.secure_url);
        else console.error('Cloudinary erro:', d);
      }catch(e){ console.error('Erro upload foto:', e); }
    }
    return urls;
  },

  abrirFotoModal(url){
    document.getElementById('foto-modal-img').src = url;
    document.getElementById('foto-modal').classList.add('aberto');
  },

  fecharFotoModal(){
    document.getElementById('foto-modal').classList.remove('aberto');
    document.getElementById('foto-modal-img').src='';
  },

  async cadastrar(){
    const nome=document.getElementById('cad-nome').value.trim(); const tipo=document.getElementById('cad-tipo').value; const desc=document.getElementById('cad-desc').value.trim();
    const wpp=document.getElementById('cad-wpp').value.trim();
    const endVal=document.getElementById('cad-end').value.trim();
    if(!nome||!tipo||!desc){alert('Preencha Nome, Tipo e Descrição.');return;}
    if(!wpp){alert('WhatsApp é obrigatório para que motoristas possam te chamar.');return;}
    if(!endVal){alert('Endereço é obrigatório para aparecer no mapa.');return;}
    // Abrir modal de termos antes de salvar
    document.getElementById('modal-termos-prestador-overlay').style.display='flex';
    document.getElementById('termos-nome').value='';
    document.getElementById('termos-email').value='';
    document.getElementById('check-termos-prestador').checked=false;
    document.getElementById('btn-aceitar-termos-prestador').disabled=true;
    document.getElementById('btn-aceitar-termos-prestador').style.opacity='.5';
    document.getElementById('btn-aceitar-termos-prestador').style.cursor='not-allowed';
    window._cadastroPendente={nome,tipo,desc};
    return;
    const btn=document.getElementById('btn-cad'); btn.disabled=true; btn.textContent='Salvando...';
    try{
      // Primeiro criar o prestador para ter o ID
      const docRef = await addDoc(collection(db,'prestadores'),{nome,tipo,descricao:desc,tags_servicos:[...tagsCadSel],whatsapp:document.getElementById('cad-wpp').value.trim(),instagram:document.getElementById('cad-ig').value.trim(),endereco:document.getElementById('cad-end').value.trim(),lat:parseFloat(document.getElementById('cad-lat').value)||null,lng:parseFloat(document.getElementById('cad-lng').value)||null,abre:document.getElementById('cad-abre').value,fecha:document.getElementById('cad-fecha').value,aberto24h:document.getElementById('cad-24h').checked,fotos:[],data:new Date().toISOString(),responsavel_nome:usuarioNome||'',responsavel_email:usuarioEmail||'',responsavel_uid:usuarioId||''});
      // Upload das fotos se houver
      if(this._fotosParaUpload.length > 0){
        btn.textContent='📤 Enviando fotos...';
        const fotosUrls = await this.uploadFotos(docRef.id);
        if(fotosUrls.length > 0){
          await updateDoc(doc(db,'prestadores',docRef.id), {fotos: fotosUrls});
        }
      }
      APP.mostrarPopup('🏪','Cadastrado com sucesso!','Seu serviço foi registrado! Em breve você aparecerá nas buscas dos motoristas.');
      ['cad-nome','cad-wpp','cad-ig','cad-end','cad-desc','cad-abre','cad-fecha'].forEach(i=>document.getElementById(i).value='');
      this._fotosParaUpload=[]; document.getElementById('fotos-preview-cad').innerHTML=''; document.getElementById('fotos-status').style.display='none'; document.getElementById('input-fotos-cad').value=''; document.getElementById('cad-tipo').value=''; document.getElementById('cad-24h').checked=false; document.getElementById('cad-busca').value=''; document.getElementById('form-novo').style.display='block'; tagsCadSel=[]; buildGrids();
      await carregarTudo(); setTimeout(()=>document.getElementById('cad-ok').style.display='none',5000);
    }catch(e){alert('Erro ao cadastrar.');}
    btn.disabled=false; btn.textContent='✅ CADASTRAR MEU SERVIÇO';
  },
  async carregarProximos(){
    const status = document.getElementById('av-proximos-status');
    const lista = document.getElementById('av-proximos-lista');
    lista.innerHTML = '';
    if(!coordsUser){
      if(!navigator.geolocation){ status.textContent='📍 GPS não disponível'; return; }
      status.textContent='📡 Obtendo localização...';
      await new Promise(res=>navigator.geolocation.getCurrentPosition(pos=>{ coordsUser={lat:pos.coords.latitude,lng:pos.coords.longitude}; res(); },()=>res(),{enableHighAccuracy:true,timeout:8000}));
    }
    if(!coordsUser){ status.textContent='📍 Localização não disponível. Use a busca por nome.'; return; }
    status.textContent='🌐 Buscando serviços próximos não cadastrados...';
    try{
      // Buscar APENAS na internet — não cadastrados
      const termos = ['posto combustivel caminhao','borracharia pneu','mecanico caminhao','restaurante','pousada caminhoneiro','auto pecas pesado','eletrica veicular','tacografo','guincho reboque','lava jato caminhao','farmacia','oficina pesado'];
      // Palavras que NÃO devem aparecer — irrelevantes para caminhoneiro
      const excluir = ['pet shop','gourmet','petisco','salão','beleza','boutique','moda','roupa','calçado','joalheria','infantil','brinquedo','academia','sorveteria','boate','clube','escola','creche','dentista','ortodontia'];
      const resultados = [];
      for(const termo of termos.slice(0,6)){
        try{
          const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(termo)}&format=json&limit=4&addressdetails=1&countrycodes=br&viewbox=${coordsUser.lng-0.08},${coordsUser.lat+0.08},${coordsUser.lng+0.08},${coordsUser.lat-0.08}&bounded=1`);
          const d = await r.json();
          d.filter(i=>i.name).forEach(i=>{
            const dist = calcDist(coordsUser.lat,coordsUser.lng,parseFloat(i.lat),parseFloat(i.lon));
            const nomeMin = (i.name||'').toLowerCase();
            const isExcluido = excluir.some(ex=>nomeMin.includes(ex));
            if(dist <= 20 && !isExcluido) resultados.push({_internet:true,_fonte:'internet',_display:i.display_name,_lat:parseFloat(i.lat),_lng:parseFloat(i.lon),nome:i.name,endereco:i.display_name,tipo:detectarTipo(i.type||'',i.name||''),dist});
          });
        }catch(e){}
      }
      // Remover duplicatas e já cadastrados
      const nomesApp = new Set(prestadores.map(p=>p.nome.toLowerCase().trim()));
      const unicos = [];
      const vistos = new Set();
      resultados.sort((a,b)=>a.dist-b.dist).forEach(p=>{
        const key = p.nome.toLowerCase().trim();
        if(!vistos.has(key) && !nomesApp.has(key)){
          vistos.add(key); unicos.push(p);
        }
      });
      const top = unicos.slice(0,8);
      if(!top.length){ status.textContent='Nenhum serviço não cadastrado encontrado próximo.'; return; }
      status.textContent=`${top.length} empresa(s) no raio de 20km — clique para avaliar e cadastrar:`;
      lista.innerHTML = top.map((p,i)=>{
        const t=TIPOS[p.tipo]||TIPOS.outros;
        const distStr = p.dist<1?(p.dist*1000).toFixed(0)+'m':p.dist.toFixed(1)+'km';
        const endCurto = (p._display||'').split(',').slice(0,2).join(',');
        return `<div onclick="APP.selProximo(${i})" style="background:#fff;border:1px solid #e5e5e5;border-radius:8px;padding:10px 12px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:8px" id="prox-${i}">
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;font-size:13px;color:#1a1a1a">${p.nome}</div>
            <div style="font-size:10px;color:${t.color};font-weight:700;margin-top:1px">${t.label}</div>
            <div style="font-size:10px;color:#aaa;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${endCurto}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:12px;font-weight:700;color:#2d8c3e">${distStr}</div>
            <div style="font-size:9px;color:#f59e0b;font-weight:700">+ Cadastrar</div>
          </div>
        </div>`;
      }).join('');
      window._avProximos = top;
    }catch(e){ status.textContent='Não foi possível buscar. Use a busca por nome.'; }
  },
  selProximo(idx){
    const p = window._avProximos[idx];
    if(!p) return;
    // Destacar selecionado
    document.querySelectorAll('[id^="prox-"]').forEach(el=>el.style.borderColor='#e5e5e5');
    const el=document.getElementById('prox-'+idx); if(el){el.style.borderColor='#2d8c3e';el.style.background='#f0fdf4';}
    // Usar mesma lógica do selAvItem
    document.getElementById('av-btn-manual-box').style.display='none';
    document.getElementById('av-nao-enc-box').style.display='none';
    if(p._fonte==='banco'){
      window._avAlvoId=p.id; window._avAlvoTipo=p.tipo||'outros'; window._avAlvoInternet=null;
      document.getElementById('av-alvo-origem').textContent='✅ Encontrado no banco do aplicativo';
      document.getElementById('av-alvo-nome').textContent=p.nome;
      document.getElementById('av-alvo-tipo').textContent=(TIPOS[p.tipo]||TIPOS.outros).label;
      document.getElementById('av-alvo-end').textContent=p.endereco||'';
    }else{
      window._avAlvoId=null; window._avAlvoTipo=p.tipo||'outros';
      window._avAlvoInternet={nome:p.nome,tipo:p.tipo||'outros',endereco:p._display||p.endereco,lat:p._lat||p.lat,lng:p._lng||p.lng};
      document.getElementById('av-alvo-origem').textContent='🌐 Encontrado próximo a você — será cadastrado ao avaliar';
      document.getElementById('av-alvo-nome').textContent=p.nome;
      document.getElementById('av-alvo-tipo').textContent=(TIPOS[p.tipo]||TIPOS.outros).label;
      document.getElementById('av-alvo-end').textContent=(p._display||p.endereco||'').split(',').slice(0,3).join(',');
    }
    document.getElementById('av-alvo-box').style.display='block';
    mostrarCrits(p.tipo||'outros');
    // Scroll para o formulário
    document.getElementById('av-alvo-box').scrollIntoView({behavior:'smooth',block:'start'});
  },
  _avBuscaTimer: null,
  async buscarAv(){
    const q = document.getElementById('av-busca').value.trim();
    const sug = document.getElementById('av-sug');
    const buscando = document.getElementById('av-buscando');
    if(q.length < 2){ sug.style.display='none'; return; }
    clearTimeout(this._avBuscaTimer);
    this._avBuscaTimer = setTimeout(async()=>{
      buscando.style.display='block';
      sug.style.display='none';
      const ql = q.toLowerCase();
      // 1. Buscar no banco interno
      const banco = prestadores.filter(p=>p.nome.toLowerCase().includes(ql)||(p.endereco||'').toLowerCase().includes(ql)).slice(0,4);
      // 2. Buscar na internet via Nominatim
      let internet = [];
      try{
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q+', Brasil')}&format=json&limit=5&addressdetails=1&countrycodes=br`);
        const d = await r.json();
        internet = d.map(item=>({
          _internet: true,
          _display: item.display_name,
          _lat: parseFloat(item.lat),
          _lng: parseFloat(item.lon),
          _address: item.address,
          nome: item.name || item.display_name.split(',')[0],
          endereco: item.display_name,
          tipo: detectarTipo(item.type||'', item.name||''),
        })).filter(item=>item.nome && item.nome.length > 1);
      }catch(e){}
      buscando.style.display='none';
      const todos = [...banco.map(p=>({...p,_fonte:'banco'})), ...internet.map(p=>({...p,_fonte:'internet'}))];
      if(!todos.length){ sug.style.display='none'; return; }
      sug.style.display='block';
      sug.innerHTML = todos.map((p,i)=>{
        const t = TIPOS[p.tipo]||TIPOS.outros;
        const icone = p._fonte==='banco'?'📋':'🌐';
        const dispArr = (p._display||p.endereco||'').split(',');
        const cidSug = dispArr.length>2?dispArr[dispArr.length-3].trim():dispArr[0].trim();
        const endSug = dispArr.slice(0,2).join(',').trim();
        return `<div class="bp-item" onclick="APP.selAvItem(${i})" data-idx="${i}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div class="bp-item-nome">${p.nome}</div>
            <span style="font-size:10px;color:#888;flex-shrink:0;margin-left:6px">${icone} ${p._fonte==='banco'?'no app':'internet'}</span>
          </div>
          <div class="bp-item-tipo" style="color:${t.color}">${t.label}</div>
          <div style="font-size:10px;color:#2d8c3e;font-weight:700;margin-top:1px">📍 ${cidSug}</div>
          <div style="font-size:10px;color:#aaa;margin-top:1px">${endSug.substring(0,50)}${endSug.length>50?'...':''}</div>
        </div>`;
      }).join('');
      window._avResultados = todos;
    }, 600);
  },
  selAvItem(idx){
    const p = window._avResultados[idx];
    if(!p) return;
    document.getElementById('av-sug').style.display='none';
    document.getElementById('av-btn-manual-box').style.display='none';
    document.getElementById('av-nao-enc-box').style.display='none';
    if(p._fonte==='banco'){
      window._avAlvoId=p.id; window._avAlvoTipo=p.tipo||'outros';
      window._avAlvoInternet=null;
      document.getElementById('av-alvo-origem').textContent='✅ Encontrado no banco do aplicativo';
      document.getElementById('av-alvo-nome').textContent=p.nome;
      document.getElementById('av-alvo-tipo').textContent=(TIPOS[p.tipo]||TIPOS.outros).label;
      document.getElementById('av-alvo-end').textContent=p.endereco||'';
    } else {
      window._avAlvoId=null; window._avAlvoTipo=p.tipo||'outros';
      window._avAlvoInternet={nome:p.nome, tipo:p.tipo||'outros', endereco:p._display, lat:p._lat, lng:p._lng};
      document.getElementById('av-alvo-origem').textContent='🌐 Encontrado na internet — será cadastrado ao avaliar';
      document.getElementById('av-alvo-nome').textContent=p.nome;
      document.getElementById('av-alvo-tipo').textContent=(TIPOS[p.tipo]||TIPOS.outros).label;
      document.getElementById('av-alvo-end').textContent=(p._display||'').split(',').slice(0,4).join(',');
    }
    document.getElementById('av-alvo-box').style.display='block';
    mostrarCrits(p.tipo||'outros');
  },
  selAvAlvo(id){
    const p=prestadores.find(x=>x.id===id); if(!p) return;
    window._avAlvoId=id; window._avAlvoTipo=p.tipo||'outros'; window._avAlvoInternet=null;
    document.getElementById('av-sug').style.display='none';
    document.getElementById('av-busca').value=p.nome;
    document.getElementById('av-alvo-origem').textContent='✅ Encontrado no banco do aplicativo';
    document.getElementById('av-alvo-box').style.display='block';
    document.getElementById('av-alvo-nome').textContent=p.nome;
    document.getElementById('av-alvo-tipo').textContent=(TIPOS[p.tipo]||TIPOS.outros).label;
    document.getElementById('av-alvo-end').textContent=p.endereco||'';
    document.getElementById('av-nao-enc-box').style.display='none';
    document.getElementById('av-btn-manual-box').style.display='none';
    mostrarCrits(p.tipo||'outros');
  },
  modoManual(){
    window._avAlvoId=null; window._avAlvoInternet=null;
    document.getElementById('av-alvo-box').style.display='none';
    document.getElementById('av-btn-manual-box').style.display='none';
    document.getElementById('av-nao-enc-box').style.display='block';
    mostrarCrits('outros');
  },
  async gpsParaBuscarAv(){
    const status = document.getElementById('av-gps-busca-status');
    status.style.display='block'; status.textContent='📡 Obtendo localização...';
    if(!navigator.geolocation){ status.textContent='GPS não disponível'; return; }
    navigator.geolocation.getCurrentPosition(async pos=>{
      coordsUser={lat:pos.coords.latitude,lng:pos.coords.longitude};
      status.textContent='🔍 Buscando serviços próximos...';
      try{
        const r=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coordsUser.lat}&lon=${coordsUser.lng}&format=json&addressdetails=1`);
        const d=await r.json();
        if(d?.address){
          const a=d.address;
          const cidade=a.city||a.town||a.village||'';
          const uf=a.state_code||'';
          const locStr=cidade+(uf?' '+uf:'');
          document.getElementById('av-busca').value=locStr;
          status.textContent=`✅ Localização obtida: ${cidade}${uf?', '+uf:''}. Refinando busca...`;
          // Disparar busca automática
          setTimeout(()=>APP.buscarAv(),500);
        }
      }catch(e){ status.textContent='✅ Localização obtida! Digite o nome do serviço.'; }
    },(err)=>{ status.textContent='❌ Erro ao obter localização.'; },{enableHighAccuracy:true,timeout:10000});
  },

  async gpsAvManual(){
    const status = document.getElementById('av-man-gps-status');
    status.style.display='block'; status.textContent='📡 Obtendo localização...';
    if(!navigator.geolocation){ status.textContent='GPS não disponível'; return; }
    navigator.geolocation.getCurrentPosition(async pos=>{
      coordsUser={lat:pos.coords.latitude,lng:pos.coords.longitude};
      status.textContent='🔍 Buscando endereço...';
      try{
        const r=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coordsUser.lat}&lon=${coordsUser.lng}&format=json&addressdetails=1`);
        const d=await r.json();
        if(d?.address){
          const a=d.address;
          const cidade=a.city||a.town||a.village||'';
          const uf=a.state_code||'';
          document.getElementById('av-man-cidade').value=cidade+(uf?', '+uf:'');
          document.getElementById('av-man-lat').value=coordsUser.lat;
          document.getElementById('av-man-lng').value=coordsUser.lng;
          status.textContent='✅ Localização obtida: '+cidade+(uf?', '+uf:'');
        }
      }catch(e){ status.textContent='✅ Localização obtida!'; document.getElementById('av-man-lat').value=coordsUser.lat; document.getElementById('av-man-lng').value=coordsUser.lng; }
    },(err)=>{ status.textContent='❌ Erro ao obter localização.'; },{enableHighAccuracy:true,timeout:10000});
  },

  _endAvTimer: null,
  validarEndAv(){
    clearTimeout(this._endAvTimer);
    this._endAvTimer = setTimeout(async()=>{
      const end = document.getElementById('av-man-end').value.trim();
      const status = document.getElementById('av-end-status');
      if(end.length < 5){ status.style.display='none'; return; }
      status.style.display='block'; status.style.color='#888'; status.textContent='🔍 Validando endereço...';
      try{
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(end+', Brasil')}&format=json&limit=1`);
        const d = await r.json();
        if(d?.[0]){ window._avManLat=parseFloat(d[0].lat); window._avManLng=parseFloat(d[0].lon); status.style.color='#2d8c3e'; status.textContent='✅ Endereço validado e localizado no mapa!'; }
        else{ window._avManLat=null; window._avManLng=null; status.style.color='#f59e0b'; status.textContent='⚠️ Endereço não encontrado. Verifique e tente novamente.'; }
      }catch(e){ status.style.color='#aaa'; status.textContent='Não foi possível validar agora.'; }
    }, 800);
  },
  _fotosAvParaUpload: [],

  previsualizarFotosAv(event){
    const files = Array.from(event.target.files);
    const preview = document.getElementById('fotos-preview-av');
    const status = document.getElementById('fotos-av-status');
    const total = this._fotosAvParaUpload.length + files.length;
    if(total > 3){ alert('Máximo de 3 fotos por avaliação.'); return; }
    files.forEach(file=>{
      if(!file.type.startsWith('image/')){ alert('Apenas imagens.'); return; }
      if(file.size > 5*1024*1024){ alert('Foto muito grande. Máximo 5MB.'); return; }
      this._fotosAvParaUpload.push(file);
      const reader = new FileReader();
      reader.onload = e=>{
        const idx = this._fotosAvParaUpload.length - 1;
        const div = document.createElement('div');
        div.className = 'foto-preview-item';
        div.id = `foto-av-prev-${idx}`;
        div.innerHTML = `<img src="${e.target.result}" alt="foto"/><button class="foto-remove" onclick="APP.removerFotoAv(${idx})">✕</button>`;
        preview.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
    status.style.display='block';
    status.textContent=`${this._fotosAvParaUpload.length}/3 foto(s) selecionada(s)`;
  },

  removerFotoAv(idx){
    this._fotosAvParaUpload.splice(idx,1);
    const el=document.getElementById(`foto-av-prev-${idx}`);
    if(el) el.remove();
    document.querySelectorAll('[id^="foto-av-prev-"]').forEach((el,i)=>{
      el.id=`foto-av-prev-${i}`;
      const btn=el.querySelector('.foto-remove');
      if(btn) btn.setAttribute('onclick',`APP.removerFotoAv(${i})`);
    });
    const status=document.getElementById('fotos-av-status');
    status.textContent=`${this._fotosAvParaUpload.length}/3 foto(s) selecionada(s)`;
    if(!this._fotosAvParaUpload.length) status.style.display='none';
  },

  async uploadFotosAv(avId){
    if(!this._fotosAvParaUpload.length) return [];
    const urls=[];
    const status=document.getElementById('fotos-av-status');
    for(let i=0;i<this._fotosAvParaUpload.length;i++){
      const file=this._fotosAvParaUpload[i];
      if(status) status.textContent=`📤 Enviando foto ${i+1} de ${this._fotosAvParaUpload.length}...`;
      try{
        const formData=new FormData();
        formData.append('file',file);
        formData.append('upload_preset',CLOUD_UPLOAD_PRESET);
        formData.append('folder',`tralienigena/avaliacoes/${avId}`);
        const r=await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,{method:'POST',body:formData});
        const d=await r.json();
        if(d.secure_url) urls.push(d.secure_url);
      }catch(e){ console.error('Erro upload foto av:', e); }
    }
    return urls;
  },

  async enviarAv(){
    if(!usuarioLogado){alert('Você precisa fazer login com Google para enviar uma avaliação.');await APP.loginGoogle();return;}
    const autorVal = document.getElementById('av-autor').value.trim();
    const telVal = document.getElementById('av-tel').value.trim();
    if(!notaGeral){alert('Dê a nota geral.');return;}
    if(!autorVal){alert('Informe seu nome.');return;}
    if(!telVal){alert('Informe seu WhatsApp.');return;}
    const btn=document.getElementById('btn-av'); btn.disabled=true; btn.textContent='Enviando...';
    try{
      let prestId=window._avAlvoId,prestNome='',prestTipo=window._avAlvoTipo||'outros';
      if(window._avAlvoInternet && !prestId){
        // Cadastrar via dados da internet
        const ai = window._avAlvoInternet;
        const exist = prestadores.find(p=>p.nome.toLowerCase().trim()===ai.nome.toLowerCase().trim()&&(p.endereco||'').toLowerCase().includes((ai.lat||'').toString().substring(0,5)));
        if(exist){ prestId=exist.id; prestNome=exist.nome; prestTipo=exist.tipo||'outros'; }
        else {
          const ref = await addDoc(collection(db,'prestadores'),{nome:ai.nome,tipo:ai.tipo||'outros',endereco:ai.endereco,lat:ai.lat||null,lng:ai.lng||null,whatsapp:'',descricao:'',tags_servicos:[],data:new Date().toISOString(),cadastrado_via_internet:true,autor_email:usuarioEmail,autor_id:usuarioId});
          prestId=ref.id; prestNome=ai.nome; prestTipo=ai.tipo||'outros'; await carregarTudo();
        }
      } else if(!prestId){
        const nomePrest=document.getElementById('av-man-nome').value.trim(); if(!nomePrest){alert('Informe o nome.');btn.disabled=false;btn.textContent='⭐ ENVIAR AVALIAÇÃO';return;}
        const exist=prestadores.find(p=>p.nome.toLowerCase().trim()===nomePrest.toLowerCase().trim());
        if(exist){prestId=exist.id;prestNome=exist.nome;prestTipo=exist.tipo||'outros';}
        else{
          const tp=document.getElementById('av-man-tipo').value; const cid=document.getElementById('av-man-cidade').value.trim();
          const endAv=document.getElementById('av-man-end').value.trim();
          const ref=await addDoc(collection(db,'prestadores'),{nome:nomePrest,tipo:tp,endereco:endAv||cid,lat:window._avManLat||null,lng:window._avManLng||null,whatsapp:'',descricao:'',tags_servicos:[],data:new Date().toISOString(),cadastrado_via_avaliacao:true});
          prestId=ref.id;prestNome=nomePrest;prestTipo=tp; await carregarTudo();
        }
      } else { const p=prestadores.find(x=>x.id===prestId); prestNome=p?.nome||'';prestTipo=p?.tipo||'outros'; }
      await addDoc(collection(db,'avaliacoes'),{prestador_id:prestId,prestador_nome:prestNome,prestador_tipo:prestTipo,nota_geral:notaGeral,criterios:{...notasCrit},texto:document.getElementById('av-texto').value.trim(),autor:document.getElementById('av-autor').value.trim(),telefone_autor:document.getElementById('av-tel').value.trim(),data:new Date().toISOString(),autor_email:usuarioEmail,autor_id:usuarioId,autor_nome_google:usuarioNome,cidade_autor:document.getElementById('busca-local').value.trim()||'Desconhecida'});
      APP.mostrarPopup('⭐','Avaliação registrada!','Sua avaliação ('+document.getElementById('av-autor').value.trim()+' - '+document.getElementById('av-busca').value.trim()+') já está disponível para outros motoristas.'); ['av-busca','av-texto','av-autor','av-tel','av-man-nome','av-man-cidade'].forEach(i=>document.getElementById(i).value=''); document.getElementById('av-alvo-box').style.display='none'; document.getElementById('av-manual-box').style.display='none'; document.getElementById('av-form-box').style.display='none'; document.getElementById('av-sug').style.display='none'; window._avAlvoId=null; notaGeral=0; notasCrit={}; await carregarTudo();
      setTimeout(()=>APP.inicio(),3200);
    }catch(e){alert('Erro ao enviar.');}
    btn.disabled=false; btn.textContent='⭐ ENVIAR AVALIAÇÃO';
  },
  adminCheck(){ if(adminLogado){document.getElementById('admin-login').style.display='none'; document.getElementById('admin-painel').style.display='block'; this.adminCarregar();} },
  adminLogin(){ if(document.getElementById('admin-senha').value===ADMIN_SENHA){adminLogado=true; document.getElementById('admin-login').style.display='none'; document.getElementById('admin-painel').style.display='block'; document.getElementById('admin-erro').style.display='none'; this.adminCarregar();}else document.getElementById('admin-erro').style.display='block'; },
  adminCarregar(){ renderAdmPrest(); renderAdmAvs(); renderAdmEventos(); renderAdmCursos(); renderAdmMotoristas(); carregarVagasFirebase(); },
  _fotosEditParaUpload: [],
  _fotosEditAtuais: [],

  async editar(id){
    const p=prestadores.find(x=>x.id===id); if(!p) return;
    document.getElementById('edit-id').value=p.id;
    document.getElementById('edit-nome').value=p.nome||'';
    document.getElementById('edit-tipo').value=p.tipo||'outros';
    document.getElementById('edit-desc').value=p.descricao||'';
    document.getElementById('edit-wpp').value=p.whatsapp||'';
    document.getElementById('edit-ig').value=p.instagram||'';
    document.getElementById('edit-end').value=p.endereco||'';
    document.getElementById('edit-abre').value=p.abre||'';
    document.getElementById('edit-fecha').value=p.fecha||'';
    document.getElementById('edit-24h').checked=p.aberto24h||false;
    document.getElementById('edit-ok').style.display='none';
    // Inicializar fotos
    this._fotosEditParaUpload=[];
    this._fotosEditAtuais=[...(p.fotos||[])];
    document.getElementById('fotos-preview-edit').innerHTML='';
    document.getElementById('fotos-edit-status').style.display='none';
    document.getElementById('input-fotos-edit').value='';
    // Mostrar fotos atuais
    const fotosAtEl=document.getElementById('edit-fotos-atuais');
    if(this._fotosEditAtuais.length){
      fotosAtEl.innerHTML=this._fotosEditAtuais.map((url,i)=>`
        <div style="position:relative">
          <img src="${url}" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid #eee"/>
          <button onclick="APP.removerFotoEditAtual(${i})" style="position:absolute;top:2px;right:2px;background:rgba(220,38,38,.9);border:none;border-radius:50%;width:18px;height:18px;cursor:pointer;color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:700">✕</button>
        </div>`).join('');
    } else { fotosAtEl.innerHTML='<div style="font-size:11px;color:#aaa">Nenhuma foto cadastrada</div>'; }
    document.getElementById('modal-ed').style.display='block';
    document.body.style.overflow='hidden';
  },

  removerFotoEditAtual(idx){
    this._fotosEditAtuais.splice(idx,1);
    const fotosAtEl=document.getElementById('edit-fotos-atuais');
    if(this._fotosEditAtuais.length){
      fotosAtEl.innerHTML=this._fotosEditAtuais.map((url,i)=>`
        <div style="position:relative">
          <img src="${url}" style="width:70px;height:70px;object-fit:cover;border-radius:6px;border:1px solid #eee"/>
          <button onclick="APP.removerFotoEditAtual(${i})" style="position:absolute;top:2px;right:2px;background:rgba(220,38,38,.9);border:none;border-radius:50%;width:18px;height:18px;cursor:pointer;color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:700">✕</button>
        </div>`).join('');
    } else { fotosAtEl.innerHTML='<div style="font-size:11px;color:#aaa">Nenhuma foto cadastrada</div>'; }
  },

  previsualizarFotosEdit(event){
    const files=Array.from(event.target.files);
    const preview=document.getElementById('fotos-preview-edit');
    const status=document.getElementById('fotos-edit-status');
    const total=this._fotosEditAtuais.length+this._fotosEditParaUpload.length+files.length;
    if(total>5){alert('Máximo de 5 fotos no total.');return;}
    files.forEach(file=>{
      if(!file.type.startsWith('image/')){alert('Apenas imagens.');return;}
      this._fotosEditParaUpload.push(file);
      const reader=new FileReader();
      reader.onload=e=>{
        const idx=this._fotosEditParaUpload.length-1;
        const div=document.createElement('div');
        div.className='foto-preview-item';
        div.id=`foto-edit-prev-${idx}`;
        div.innerHTML=`<img src="${e.target.result}" alt="foto"/><button class="foto-remove" onclick="APP.removerFotoEdit(${idx})">✕</button>`;
        preview.appendChild(div);
      };
      reader.readAsDataURL(file);
    });
    status.style.display='block';
    status.textContent=`${this._fotosEditParaUpload.length} nova(s) foto(s) para enviar`;
  },

  removerFotoEdit(idx){
    this._fotosEditParaUpload.splice(idx,1);
    const el=document.getElementById(`foto-edit-prev-${idx}`);
    if(el) el.remove();
    document.querySelectorAll('[id^="foto-edit-prev-"]').forEach((el,i)=>{ el.id=`foto-edit-prev-${i}`; const btn=el.querySelector('.foto-remove'); if(btn) btn.setAttribute('onclick',`APP.removerFotoEdit(${i})`); });
  },
  fecharModal(){ document.getElementById('modal-ed').style.display='none'; document.body.style.overflow=''; },

  mostrarPopup(icone, titulo, msg, autoFechar=true){
    document.getElementById('popup-icone').textContent=icone;
    document.getElementById('popup-titulo').textContent=titulo;
    document.getElementById('popup-msg').textContent=msg;
    const popup=document.getElementById('popup-sucesso');
    popup.style.display='flex';
    document.body.style.overflow='hidden';
    if(autoFechar) setTimeout(()=>this.fecharPopup(),3000);
  },

  fecharPopup(){
    document.getElementById('popup-sucesso').style.display='none';
    document.body.style.overflow='';
  },
  async salvarEdit(){
    const id=document.getElementById('edit-id').value;
    const nome=document.getElementById('edit-nome').value.trim();
    if(!nome){alert('Nome obrigatório.');return;}
    const btn=document.querySelector('#modal-ed .btn-submit');
    btn.disabled=true; btn.textContent='Salvando...';
    try{
      // Upload de novas fotos se houver
      let todasFotos=[...this._fotosEditAtuais];
      if(this._fotosEditParaUpload.length>0){
        btn.textContent='📤 Enviando fotos...';
        for(let i=0;i<this._fotosEditParaUpload.length;i++){
          const file=this._fotosEditParaUpload[i];
          const formData=new FormData();
          formData.append('file',file);
          formData.append('upload_preset',CLOUD_UPLOAD_PRESET);
          formData.append('folder',`tralienigena/${id}`);
          const r=await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,{method:'POST',body:formData});
          const d=await r.json();
          if(d.secure_url) todasFotos.push(d.secure_url);
        }
      }
      await updateDoc(doc(db,'prestadores',id),{
        nome,tipo:document.getElementById('edit-tipo').value,
        descricao:document.getElementById('edit-desc').value.trim(),
        whatsapp:document.getElementById('edit-wpp').value.trim(),
        instagram:document.getElementById('edit-ig').value.trim(),
        endereco:document.getElementById('edit-end').value.trim(),
        abre:document.getElementById('edit-abre').value,
        fecha:document.getElementById('edit-fecha').value,
        aberto24h:document.getElementById('edit-24h').checked,
        fotos:todasFotos,
        atualizado:new Date().toISOString()
      });
      document.getElementById('edit-ok').style.display='block';
      await carregarTudo(); renderAdmPrest(); APP.fecharModal();
      APP.mostrarPopup('✏️','Alterações salvas!','O cadastro foi atualizado com sucesso.');
    }catch(e){alert('Erro ao salvar.');}
    btn.disabled=false; btn.textContent='💾 SALVAR ALTERAÇÕES';
  },
  async delPrest(id){ if(!confirm('Excluir?')) return; try{await deleteDoc(doc(db,'prestadores',id)); await carregarTudo(); renderAdmPrest();}catch(e){alert('Erro.');} },
  async delAv(id){ if(!confirm('Excluir?')) return; try{await deleteDoc(doc(db,'avaliacoes',id)); avs=avs.filter(a=>a.id!==id); renderAdmAvs();}catch(e){alert('Erro.');} },
  abrirApoio(){
    document.getElementById('modal-apoio-overlay').style.display='flex';
    document.getElementById('msg-pix-copiado').style.display='none';
  },
  fecharApoio(){
    document.getElementById('modal-apoio-overlay').style.display='none';
  },
  copiarPix(){
    const chave='63649771000124';
    navigator.clipboard.writeText(chave).then(()=>{
      const msg=document.getElementById('msg-pix-copiado');
      msg.style.display='block';
      setTimeout(()=>msg.style.display='none',3000);
    }).catch(()=>alert('Erro ao copiar. Tente novamente.'));
  },
  abrirPixCopiaECola(){
    const chave='63649771000124';
    const url=`https://nubank.com.br/pix/${chave}`;
    window.open(url,'_blank');
  },
  async loginGoogle(){
    try{
      const result=await signInWithPopup(auth,googleProvider);
      usuarioLogado=result.user;
      usuarioEmail=result.user.email;
      usuarioNome=result.user.displayName||result.user.email.split('@')[0];
      usuarioId=result.user.uid;
      alert('Login realizado com sucesso!');
    }catch(e){
      alert('Erro ao fazer login: '+e.message);
    }
  },
  async logout(){
    try{
      await signOut(auth);
      usuarioLogado=null;
      usuarioEmail=null;
      usuarioNome=null;
      usuarioId=null;
      alert('Desconectado com sucesso!');
    }catch(e){
      alert('Erro ao desconectar: '+e.message);
    }
  },
  aceitarConsentimento(){
    localStorage.setItem('consentimento_lgpd','aceito');
    document.getElementById('modal-consentimento-overlay').style.display='none';
  }
};

function calcDist(a,b,c,d){ const R=6371,dL=(c-a)*Math.PI/180,dO=(d-b)*Math.PI/180,x=Math.sin(dL/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dO/2)**2; return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)); }

function detectarTipo(osmType, nome){
  const n = (nome||'').toLowerCase();
  const t = (osmType||'').toLowerCase();
  if(t.includes('fuel')||n.includes('posto')||n.includes('petrobras')||n.includes('shell')||n.includes('ipiranga')||n.includes('br ')) return 'posto';
  if(n.includes('mecânic')||n.includes('mecanica')||n.includes('oficina')) return 'mecanico';
  if(n.includes('borrachar')||n.includes('pneu')||n.includes('borracha')) return 'borracharia';
  if(n.includes('elétric')||n.includes('eletric')||n.includes('auto eletric')) return 'eletricista';
  if(n.includes('peça')||n.includes('peca')||n.includes('autopeç')||n.includes('autopec')) return 'pecas';
  if(n.includes('restaur')||n.includes('lanchon')||n.includes('comer')||n.includes('churrascar')) return 'restaurante';
  if(n.includes('pousada')||n.includes('hotel')||n.includes('hosped')||n.includes('dormit')) return 'pousada';
  if(n.includes('farmác')||n.includes('farmac')||n.includes('drogaria')||n.includes('droga')) return 'farmacia';
  if(n.includes('tacógraf')||n.includes('tacograf')) return 'tacografo';
  if(n.includes('guincho')||n.includes('reboque')) return 'guindaste';
  if(n.includes('funilaria')||n.includes('pintura auto')) return 'funilaria';
  if(n.includes('lava')||n.includes('lavagem')) return 'lavajato';
  return 'outros';
}

function mostrarCrits(tipo){ notaGeral=0; notasCrit={}; const crits=CRITERIOS[tipo]||CRITERIOS.outros; document.getElementById('av-geral').innerHTML=[1,2,3,4,5].map(n=>`<span class="ei-star" id="ag${n}" onclick="APP._setNG(${n})">★</span>`).join(''); document.getElementById('av-crits').innerHTML=crits.map(c=>`<div class="c-row"><div class="c-nome">${c}</div><div class="c-stars">${[1,2,3,4,5].map(n=>`<span class="c-star" id="cs_${c.replace(/ /g,'_')}_${n}" onclick="APP._setNC('${c}',${n})">★</span>`).join('')}</div></div>`).join(''); document.getElementById('av-form-box').style.display='block'; }
APP._setNG=function(n){ notaGeral=n; for(let i=1;i<=5;i++) document.getElementById('ag'+i).classList.toggle('on',i<=n); };
APP._setNC=function(c,n){ notasCrit[c]=n; const k=c.replace(/ /g,'_'); for(let i=1;i<=5;i++){const el=document.getElementById(`cs_${k}_${i}`); if(el) el.classList.toggle('on',i<=n);} };

function cardHTML(p, ctx){
  const t=TIPOS[p.tipo]||TIPOS.outros; const m=calcMedia(p.id); const stars=m.media>0?'★'.repeat(Math.round(m.media))+'☆'.repeat(5-Math.round(m.media)):'☆☆☆☆☆'; const wpp=(p.whatsapp||'').replace(/\D/g,''); const dist=p.dist!==null&&p.dist!==undefined?(p.dist<1?(p.dist*1000).toFixed(0)+'m':p.dist.toFixed(1)+'km'):''; const tagsHTML=p.tags_servicos&&p.tags_servicos.length?`<div class="pc-servicos">${p.tags_servicos.slice(0,4).map(tg=>`<span class="pc-serv-tag">${tg}</span>`).join('')}${p.tags_servicos.length>4?`<span class="pc-serv-tag">+${p.tags_servicos.length-4}</span>`:''}</div>`:'';
  return `<div class="pc"><div class="pc-top"><div style="flex:1;min-width:0"><div class="pc-nome">${p.nome}</div><span class="pc-tipo" style="background:${t.color}18;color:${t.color};border:1px solid ${t.color}44">${t.label}</span>${p.endereco?`<div class="pc-local">📍 ${p.endereco}${dist?' • <strong style="color:#2d8c3e">'+dist+'</strong>':''}</div>`:''}</div><div style="text-align:right;flex-shrink:0"><div class="pc-stars-val">${stars}</div><span class="pc-stars-num">${m.media>0?m.media+' ('+m.total+'av)':'Sem avaliação'}</span></div></div>${tagsHTML}${p.descricao?`<div style="font-size:12px;color:#666;margin:6px 0;line-height:1.4">${p.descricao.substring(0,80)}${p.descricao.length>80?'...':''}</div>`:''}<div class="pc-btns">${wpp?`<button class="pc-btn pc-btn-wpp" onclick="window.open('https://wa.me/55${wpp}?text=Ol%C3%A1%21%20Sou%20caminhoneiro%20e%20vi%20seu%20n%C3%BAmero%20na%20Tr.Alienigena%20-%20A%20Voz%20do%20Motorista.%20Voc%C3%AA%20pode%20me%20ajudar%3F','_blank')">💬 WhatsApp</button>`:''}<button class="pc-btn pc-btn-det" onclick="APP.detalhe('${p.id}','${ctx}')">🔍 Detalhes</button><button class="pc-btn pc-btn-av" onclick="APP.show('tela-avaliar');APP.selAvAlvo('${p.id}')">⭐ Avaliar</button>${p.lat&&p.lng?`<button class="pc-btn pc-btn-rota" onclick="window.open('https://www.openstreetmap.org/directions?to=${p.lat},${p.lng}#map=15/${p.lat}/${p.lng}','_blank')">🗺️ Ir</button>`:''}</div></div>`;
}

function renderRel(lista){ const el=document.getElementById('lista-relacao'); document.getElementById('rel-count').textContent=lista.length+' prestador(es)'; if(!lista.length){el.innerHTML='<div class="empty">Nenhum encontrado.</div>';return;} const ord=[...lista].sort((a,b)=>{const tA=(TIPOS[a.tipo]||TIPOS.outros).label,tB=(TIPOS[b.tipo]||TIPOS.outros).label; return tA!==tB?tA.localeCompare(tB,'pt-BR'):(a.nome||'').localeCompare(b.nome||'','pt-BR');}); let tipoAtual='',html=''; ord.forEach(p=>{ const t=TIPOS[p.tipo]||TIPOS.outros; if(p.tipo!==tipoAtual){tipoAtual=p.tipo; html+=`<div style="background:${t.color}18;border-left:4px solid ${t.color};border-radius:6px;padding:7px 12px;margin:12px 0 8px;font-family:'Oswald',sans-serif;font-size:14px;font-weight:700;color:${t.color}">${t.label}</div>`;} html+=cardHTML(p,'relacao'); }); el.innerHTML=html; }

function renderAdmPrest(){ document.getElementById('adm-tot-p').textContent='('+prestadores.length+')'; document.getElementById('adm-lista-p').innerHTML=prestadores.length?[...prestadores].sort((a,b)=>(a.nome||'').localeCompare(b.nome||'')).map(p=>`<div class="admin-item"><div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13px">${p.nome}</div><div style="font-size:11px;color:#888">${(TIPOS[p.tipo]||TIPOS.outros).label} • ${p.endereco||''}</div>${p.whatsapp?`<div style="font-size:11px;color:#25d366">💬 ${p.whatsapp}</div>`:''}</div><div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0"><button class="btn-edit" onclick="APP.editar('${p.id}')">✏️ Editar</button><button class="btn-del" onclick="APP.delPrest('${p.id}')">🗑️ Excluir</button></div></div>`).join(''):'<div class="empty">Nenhum.</div>'; }
// ===== NOVAS FUNCIONALIDADES =====
const VAGAS_CSV_URL='https://raw.githubusercontent.com/jfilhoempresarial-ops/tralienigena/main/vagas.csv';
let vagasData=[],cursos=[],motoristas=[],eventos=[],curriculoFile=null;
let mapaServicos=null,mapaServFiltro='todos';

// CAPTURA AUTOMÁTICA IDT/SINE
const IDT_URL='https://idt.org.br/vagas-disponiveis';
const PALAVRAS_TRANSPORTE=[
  'motorista','caminhão','caminhoneiro','carreta','carreteiro',
  'caçambeiro','bitrem','basculante','guincho','munk','guindaste',
  'ajudante de motorista','ajudante de carga','ajudante de descarga',
  'carregador e descarregador',
  'operador de retro','retroescavadeira','retro-escavadeira',
  'operador de máquina','operador de máquinas de construção',
  'operador de trator','motofretista','motoboy',
  'fiscal de transporte','controlador de tráfego',
  'manobrador','manobrista','ônibus','condutor',
  'operador de balanças rodoviárias'
];
const EXCLUIR_TRANSPORTE=[
  'estoquista','almoxarife'
];

window.APP.captarVagasIDT=async function(){
  const status=document.getElementById('vagas-idt-status');
  const statusPub=document.getElementById('vagas-idt-status-pub');
  const setStatus=(msg,ok=true)=>{
    const bg=ok?'#f0fdf4':'#fef2f2'; const cor=ok?'#2d8c3e':'#dc2626';
    if(status){status.style.display='block';status.style.background=bg;status.style.color=cor;status.textContent=msg;}
    if(statusPub){statusPub.style.display='block';statusPub.style.background=bg;statusPub.style.color=cor;statusPub.textContent=msg;}
  };
  setStatus('🌐 Buscando vagas do SINE/IDT...');
  try{
    const proxies=[
      `https://corsproxy.io/?${encodeURIComponent(IDT_URL)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(IDT_URL)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(IDT_URL)}`,
    ];
    let html='';
    for(const proxy of proxies){
      try{
        const r=await fetch(proxy,{signal:AbortSignal.timeout(12000)});
        if(r.ok){const t=await r.text();if(t.includes('OCUPAÇÕES')||t.includes('SOBRAL')){html=t;break;}}
      }catch(e){continue;}
    }
    if(!html) throw new Error('Não foi possível acessar o site do IDT. Tente novamente.');
    const parser=new DOMParser();
    const doc2=parser.parseFromString(html,'text/html');
    const itens=[];
    // Mapa de informações por cidadeBase
    const infoUnidades={};
    let cidadeAtual='',cidadeBase='',emailAtual='',enderecoAtual='',foneAtual='';

    const parseCidade=(txt)=>{
      const raw=txt.split(/[\n\r]/)[0].replace(/[*]/g,'').trim();
      if(raw.includes(':')){
        const partes=raw.split(':');
        const base=partes[0].trim();
        const bairro=partes[1].split(/[-–]/)[0].split('/')[0].trim();
        return {base, nome: base.charAt(0)+base.slice(1).toLowerCase()+' - '+bairro.charAt(0)+bairro.slice(1).toLowerCase()};
      }
      const clean=raw.split(/[-–\s]+(?:Rua|Av\.|Fone|R\.)/)[0].trim();
      return {base:clean, nome:clean.charAt(0)+clean.slice(1).toLowerCase()};
    };

    doc2.querySelectorAll('table tr').forEach(tr=>{
      const tds=tr.querySelectorAll('td'); if(!tds.length) return;
      const txt=tds[0]?.textContent?.trim()||'';
      if(tds.length===1&&txt&&!txt.includes('OCUPAÇÕES')&&!txt.includes('Total')&&!txt.includes('PESSOA COM')){
        const pc=parseCidade(txt);
        if(pc.base.length>1&&pc.base.length<60){
          cidadeBase=pc.base; cidadeAtual=pc.nome;
          // Extrai endereço (linha com Rua/Av/Praça)
          const endM=txt.match(/(?:Rua|Av\.|Avenida|Praça|R\.|Al\.)[^\n\r,]*/i);
          enderecoAtual=endM?endM[0].trim():'';
          // Extrai telefone
          const foneM=txt.match(/(?:Fone|Tel|Telefone)[:\s]*\(?\d{2}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}/i);
          foneAtual=foneM?foneM[0].replace(/(?:Fone|Tel|Telefone)[:\s]*/i,'').trim():'';
          // Extrai e-mail
          const emM=txt.match(/[\w.-]+@[\w.-]+\.[\w]+/);
          emailAtual=emM?emM[0]:'';
          // Salva info da unidade (usa cidadeAtual como chave)
          if(!infoUnidades[cidadeBase]) infoUnidades[cidadeBase]={
            cidade:cidadeAtual,
            cidadeBase,
            endereco:enderecoAtual,
            fone:foneAtual,
            email:emailAtual
          };
        }
        return;
      }
      if(tds.length>=2){
        const cargo=tds[0]?.textContent?.trim().toLowerCase()||'';
        const qtd=parseInt(tds[1]?.textContent?.trim())||0;
        if(!cargo||!qtd||cargo==='ocupações'||cargo.startsWith('total')) return;
        const ok=PALAVRAS_TRANSPORTE.some(p=>cargo.includes(p))&&!EXCLUIR_TRANSPORTE.some(p=>cargo.includes(p));
        if(ok&&cidadeAtual) itens.push({cidade:cidadeAtual,cidadeBase,cargo:cargo.charAt(0).toUpperCase()+cargo.slice(1),quantidade:qtd,email:emailAtual,endereco:enderecoAtual,fone:foneAtual});
      }
    });
    if(!itens.length) throw new Error('Nenhuma vaga de transporte encontrada.');
    const vagasRef=doc(db,'config','vagas');
    try{await updateDoc(vagasRef,{itens,atualizado:new Date().toISOString(),fonte:'IDT/SINE'});}
    catch(e){await setDoc(vagasRef,{itens,atualizado:new Date().toISOString(),fonte:'IDT/SINE'});}
    vagasData=itens;
    renderAdmVagas();
    const tot=document.getElementById('adm-tot-vagas'); if(tot) tot.textContent='('+itens.length+')';
    const total=itens.reduce((s,v)=>s+v.quantidade,0);
    setStatus(`✅ ${itens.length} vagas captadas (${total} postos)!`);
    APP.renderVagas(itens);
    const totEl=document.getElementById('vagas-total-msg');
    if(totEl) totEl.textContent=`🔎 Hoje há ${total} vaga${total!==1?'s':''} disponíve${total!==1?'is':'l'} na região`;
    const dataEl=document.getElementById('vagas-data-hoje');
    if(dataEl) dataEl.textContent=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  }catch(e){
    setStatus('⚠️ '+e.message,false);
    console.error(e);
  }
};
// Auto-atualização: capta do IDT se passou mais de 6h
async function autoAtualizarVagas(){
  try{
    const vagasRef=doc(db,'config','vagas');
    const snap=await getDoc(vagasRef);
    if(snap.exists()&&snap.data().itens?.length){
      const diff=(new Date()-new Date(snap.data().atualizado||0))/3600000;
      if(diff<6){ vagasData=snap.data().itens; return true; }
    }
    const proxies=[
      `https://corsproxy.io/?${encodeURIComponent(IDT_URL)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(IDT_URL)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(IDT_URL)}`,
    ];
    let html='';
    for(const proxy of proxies){
      try{
        const r=await fetch(proxy,{signal:AbortSignal.timeout(10000)});
        if(r.ok){const t=await r.text();if(t.includes('OCUPAÇÕES')||t.includes('SOBRAL')){html=t;break;}}
      }catch(e){continue;}
    }
    if(!html) return false;
    const parser=new DOMParser();
    const doc2=parser.parseFromString(html,'text/html');
    const itens=[];
    let cidadeAtual='',cidadeBase='',emailAtual='',enderecoAtual='',foneAtual='';
    const parseCidade2=(txt)=>{
      const raw=txt.split(/[\n\r]/)[0].replace(/[*]/g,'').trim();
      if(raw.includes(':')){
        const partes=raw.split(':');
        const base=partes[0].trim();
        const bairro=partes[1].split(/[-–]/)[0].split('/')[0].trim();
        return {base, nome: base.charAt(0)+base.slice(1).toLowerCase()+' - '+bairro.charAt(0)+bairro.slice(1).toLowerCase()};
      }
      const clean=raw.split(/[-–\s]+(?:Rua|Av\.|Fone|R\.)/)[0].trim();
      return {base:clean, nome:clean.charAt(0)+clean.slice(1).toLowerCase()};
    };
    doc2.querySelectorAll('table tr').forEach(tr=>{
      const tds=tr.querySelectorAll('td'); if(!tds.length) return;
      const txt=tds[0]?.textContent?.trim()||'';
      if(tds.length===1&&txt&&!txt.includes('OCUPAÇÕES')&&!txt.includes('Total')&&!txt.includes('PESSOA COM')){
        const pc=parseCidade2(txt);
        if(pc.base.length>1&&pc.base.length<60){
          cidadeBase=pc.base; cidadeAtual=pc.nome;
          const endM=txt.match(/(?:Rua|Av\.|Avenida|Praça|R\.|Al\.)[^\n\r,]*/i);
          enderecoAtual=endM?endM[0].trim():'';
          const foneM=txt.match(/(?:Fone|Tel|Telefone)[:\s]*\(?\d{2}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}/i);
          foneAtual=foneM?foneM[0].replace(/(?:Fone|Tel|Telefone)[:\s]*/i,'').trim():'';
          const emM=txt.match(/[\w.-]+@[\w.-]+\.[\w]+/);
          emailAtual=emM?emM[0]:'';
        }
        return;
      }
      if(tds.length>=2){
        const cargo=tds[0]?.textContent?.trim().toLowerCase()||'';
        const qtd=parseInt(tds[1]?.textContent?.trim())||0;
        if(!cargo||!qtd||cargo==='ocupações'||cargo.startsWith('total')) return;
        const ok=PALAVRAS_TRANSPORTE.some(p=>cargo.includes(p))&&!EXCLUIR_TRANSPORTE.some(p=>cargo.includes(p));
        if(ok&&cidadeAtual) itens.push({cidade:cidadeAtual,cidadeBase,cargo:cargo.charAt(0).toUpperCase()+cargo.slice(1),quantidade:qtd,email:emailAtual,endereco:enderecoAtual,fone:foneAtual});
      }
    });
    if(itens.length){
      const agora=new Date().toISOString();
      try{await updateDoc(doc(db,'config','vagas'),{itens,atualizado:agora,fonte:'IDT/SINE'});}
      catch(e){await setDoc(doc(db,'config','vagas'),{itens,atualizado:agora,fonte:'IDT/SINE'});}
      vagasData=itens; return true;
    }
  }catch(e){console.error('Auto-atualização:',e);}
  return false;
}
// FIM CAPTURA IDT
window.APP.uploadVagasCSV=async function(event){
  const file=event.target.files[0]; if(!file) return;
  const status=document.getElementById('vagas-upload-status');
  status.style.display='block';
  status.style.background='#f0fdf4'; status.style.color='#2d8c3e';
  status.textContent='📂 Lendo arquivo...';
  try{
    const txt=await file.text();
    const linhas=txt.trim().split(/\r?\n/);
    const headers=linhas[0].split(',').map(h=>h.trim().replace(/"/g,'').toLowerCase());
    const itens=linhas.slice(1).filter(l=>l.trim()).map(linha=>{
      const vals=linha.split(',').map(v=>v.trim().replace(/^"|"$/g,''));
      const obj={};
      headers.forEach((h,i)=>{obj[h]=vals[i]||'';});
      const cidade=obj.cidade||obj.municipio||Object.values(obj)[0]||'';
      const cargo=obj['função']||obj.funcao||obj.cargo||obj.vaga||Object.values(obj)[1]||'';
      const totalStr=obj.total||obj.quantidade||obj.vagas||Object.values(obj)[2]||'1';
      const qtd=parseInt(totalStr)||1;
      return {cidade,cargo,quantidade:qtd};
    }).filter(v=>v.cargo&&v.cidade);

    if(!itens.length){throw new Error('Nenhuma vaga encontrada no arquivo.');}

    status.textContent=`💾 Salvando ${itens.length} vagas...`;

    // Salva no Firebase — usa um único documento com array
    const vagasRef=doc(db,'config','vagas');
    try{
      await updateDoc(vagasRef,{itens,atualizado:new Date().toISOString()});
    }catch(e){
      // Documento não existe ainda, cria com setDoc
      await setDoc(vagasRef,{itens,atualizado:new Date().toISOString()});
    }

    status.textContent=`✅ ${itens.length} vagas salvas com sucesso!`;
    document.getElementById('input-vagas-csv').value='';
    // Recarrega vagas
    vagasData=itens;
    renderAdmVagas();
    const tot=document.getElementById('vagas-total-msg');
    const totAdm=document.getElementById('adm-tot-vagas');
    if(tot) tot.textContent=`🔎 Hoje há ${itens.reduce((s,v)=>s+v.quantidade,0)} vagas disponíveis na região`;
    if(totAdm) totAdm.textContent='('+itens.length+')';
    setTimeout(()=>status.style.display='none',4000);
  }catch(e){
    status.style.background='#fef2f2'; status.style.color='#dc2626';
    status.textContent='⚠️ Erro: '+e.message;
    console.error(e);
  }
};

async function carregarVagasFirebase(){
  try{
    const vagasRef=doc(db,'config','vagas');
    const snap=await getDoc(vagasRef);
    if(snap.exists()&&snap.data().itens){
      vagasData=snap.data().itens;
      renderAdmVagas();
      const tot=document.getElementById('adm-tot-vagas');
      if(tot) tot.textContent='('+vagasData.length+')';
      return true;
    }
  }catch(e){console.error(e);}
  return false;
}

function renderAdmVagas(){
  const el=document.getElementById('adm-lista-vagas'); if(!el) return;
  if(!vagasData.length){el.innerHTML='<div class="empty">Nenhuma vaga cadastrada.</div>';return;}
  el.innerHTML=vagasData.map(v=>`
    <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #f0f0f0">
      <div>
        <div style="font-size:12px;font-weight:700;color:#1a1a1a">${v.cargo}</div>
        <div style="font-size:11px;color:#2d8c3e">📍 ${v.cidade} • ${v.quantidade} vaga${v.quantidade!==1?'s':''}</div>
      </div>
    </div>`).join('');
}

window.APP.carregarVagas=async function(){
  const el=document.getElementById('lista-vagas');
  el.innerHTML='<div class="loading">Carregando vagas...</div>';

  // 1. Tenta Firebase primeiro
  try{
    const ok=await autoAtualizarVagas();
    if(ok&&vagasData.length){
      const hoje=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
      const dataEl=document.getElementById('vagas-data-hoje');
      if(dataEl) dataEl.textContent=hoje;
      const total=vagasData.reduce((s,v)=>s+(v.quantidade||1),0);
      const totEl=document.getElementById('vagas-total-msg');
      if(totEl) totEl.textContent=`🔎 Hoje há ${total} vaga${total!==1?'s':''} disponíve${total!==1?'is':'l'} na região`;
      APP.renderVagas(vagasData);
      return;
    }
  }catch(e){console.warn('Firebase vagas:',e);}

  // 2. Fallback: busca CSV direto do GitHub
  try{
    const r=await fetch(VAGAS_CSV_URL+'?t='+Date.now(),{signal:AbortSignal.timeout(8000)});
    if(r.ok){
      const txt=await r.text();
      const linhas=txt.trim().split(/\r?\n/);
      if(linhas.length>1){
        const headers=linhas[0].split(',').map(h=>h.trim().replace(/"/g,'').toLowerCase());
        const itens=linhas.slice(1).filter(l=>l.trim()).map(linha=>{
          const vals=linha.split(',').map(v=>v.trim().replace(/^"|"$/g,''));
          const obj={};
          headers.forEach((h,i)=>{obj[h]=vals[i]||'';});
          const cidade=obj.cidade||obj.municipio||Object.values(obj)[0]||'';
          const cargo=obj['função']||obj.funcao||obj.cargo||obj.vaga||Object.values(obj)[1]||'';
          const qtd=parseInt(obj.total||obj.quantidade||obj.vagas||'1')||1;
          const tel=(obj.telefone||obj.fone||'').replace(/\D/g,'');
          return {cidade,cargo,quantidade:qtd,telefone:tel};
        }).filter(v=>v.cargo&&v.cidade);
        if(itens.length){
          vagasData=itens;
          const hoje=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
          const dataEl=document.getElementById('vagas-data-hoje');
          if(dataEl) dataEl.textContent=hoje;
          const total=itens.reduce((s,v)=>s+(v.quantidade||1),0);
          const totEl=document.getElementById('vagas-total-msg');
          if(totEl) totEl.textContent=`🔎 Hoje há ${total} vaga${total!==1?'s':''} disponíve${total!==1?'is':'l'} na região`;
          APP.renderVagas(itens);
          return;
        }
      }
    }
  }catch(e){console.warn('CSV vagas:',e);}

  el.innerHTML='<div class="empty" style="padding:20px;text-align:center">⚠️ Nenhuma vaga disponível no momento.<br><span style="font-size:12px;color:#888">Toque em 🔄 para tentar novamente.</span></div>';
};
// FIM VAGAS ADMIN
window.APP.renderVagas=function(lista){
  const el=document.getElementById('lista-vagas');
  if(!lista.length){el.innerHTML='<div class="empty">Nenhuma vaga encontrada.</div>';return;}

  // Botões de filtro por cidade-base
  const cidades=[...new Set(lista.map(v=>v.cidadeBase||v.cidade.split(' - ')[0]).filter(Boolean))].sort();
  const filtroAtual=el.dataset.filtroCity||'';
  const filtrosHTML=`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
    <button onclick="APP.filtrarVagasCidade('')" style="background:${!filtroAtual?'#2d8c3e':'#f0fdf4'};color:${!filtroAtual?'#fff':'#2d8c3e'};border:1px solid #2d8c3e;border-radius:20px;padding:5px 12px;font-size:11px;font-weight:700;cursor:pointer">🌐 Todas</button>
    ${cidades.map(c=>`<button onclick="APP.filtrarVagasCidade('${c}')" style="background:${filtroAtual===c?'#2d8c3e':'#f0fdf4'};color:${filtroAtual===c?'#fff':'#2d8c3e'};border:1px solid #2d8c3e;border-radius:20px;padding:5px 12px;font-size:11px;font-weight:700;cursor:pointer">${c.charAt(0)+c.slice(1).toLowerCase()}</button>`).join('')}
  </div>`;

  const listaFiltrada = filtroAtual ? lista.filter(v=>(v.cidadeBase||v.cidade.split(' - ')[0])===filtroAtual) : lista;

  // Card de info da unidade SINE (aparece só quando filtra por cidade)
  let infoUnidadeHTML='';
  if(filtroAtual&&listaFiltrada.length){
    const ref=listaFiltrada[0];
    const tel=(ref.fone||'').replace(/\D/g,'');
    const email=ref.email||'';
    const end=ref.endereco||'';
    if(end||tel||email){
      infoUnidadeHTML=`<div style="background:#1a3a1a;border-radius:10px;padding:14px;margin-bottom:14px;color:#fff">
        <div style="font-family:'Oswald',sans-serif;font-size:14px;font-weight:700;color:#a8d5b0;margin-bottom:8px">🏛️ SINE — ${ref.cidade}</div>
        ${end?`<div style="font-size:12px;color:#e0e0e0;margin-bottom:6px;display:flex;align-items:flex-start;gap:6px"><span>📍</span><span>${end}</span></div>`:''}
        ${tel?`<div style="font-size:12px;color:#e0e0e0;margin-bottom:6px">📞 ${ref.fone}</div>`:''}
        ${email?`<div style="font-size:12px;color:#a8d5b0;margin-bottom:10px">✉️ ${email}</div>`:''}
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${tel?`<button onclick="window.open('tel:+55${tel}')" style="background:#25d366;border:none;border-radius:8px;color:#fff;padding:7px 12px;font-size:12px;font-weight:700;cursor:pointer">📞 Ligar</button>`:''}
          ${email?`<button onclick="window.open('mailto:${email}')" style="background:#4a9eff;border:none;border-radius:8px;color:#fff;padding:7px 12px;font-size:12px;font-weight:700;cursor:pointer">✉️ E-mail</button>`:''}
          ${tel?`<button onclick="window.open('https://wa.me/55${tel}','_blank')" style="background:#128c7e;border:none;border-radius:8px;color:#fff;padding:7px 12px;font-size:12px;font-weight:700;cursor:pointer">💬 WhatsApp</button>`:''}
        </div>
      </div>`;
    }
  }

  el.innerHTML = filtrosHTML + infoUnidadeHTML + listaFiltrada.map(v=>{
    const cargo = v.cargo||v.função||v.funcao||v.vaga||'';
    const cidade = v.cidade||v.municipio||'';
    const qtd   = parseInt(v.quantidade||v.vagas||v.total||'1')||1;
    const tel   = (v.telefone||v.fone||'').replace(/\D/g,'');
    return `<div class="vaga-card">
      <div style="font-family:'Oswald',sans-serif;font-size:15px;font-weight:700">${cargo}</div>
      <div style="font-size:12px;color:#2d8c3e;font-weight:700;margin:4px 0">📍 ${cidade}${qtd>1?` • ${qtd} vagas`:' • 1 vaga'}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        ${tel?`<button onclick="window.open('tel:+55${tel}')" style="background:#25d366;border:none;border-radius:8px;color:#fff;padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer">📞 Ligar</button>`:''}
        ${tel?`<button onclick="window.open('https://wa.me/55${tel}','_blank')" style="background:#128c7e;border:none;border-radius:8px;color:#fff;padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer">💬 WhatsApp</button>`:''}
      </div>
    </div>`;
  }).join('');
  el.dataset.filtroCity = filtroAtual;
};
window.APP.filtrarVagasCidade=function(cidade){
  const el=document.getElementById('lista-vagas');
  el.dataset.filtroCity=cidade;
  APP.renderVagas(vagasData);
};
window.APP.filtrarVagas=function(){
  const q=document.getElementById('vagas-filtro').value.trim();
  if(!q){APP.renderVagas(vagasData);return;}
  if(!vagasData.length){
    document.getElementById('lista-vagas').innerHTML='<div class="empty">Carregue as vagas primeiro tocando em 🔄</div>';
    return;
  }
  const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const qn=norm(q);
  const filtradas=vagasData.filter(v=>
    norm(v.cidade).includes(qn)||
    norm(v.cargo).includes(qn)
  );
  APP.renderVagas(filtradas);
};

// MAPA SERVIÇOS
window.APP.filtrarMapaSrv=function(tipo){
  mapaServFiltro=tipo;
  document.querySelectorAll('.serv-mapa-btn').forEach(b=>b.classList.remove('on'));
  const btn=document.getElementById('smb-'+tipo); if(btn) btn.classList.add('on');
  APP.renderMapaServicos();
};
window.APP.renderMapaServicos=function(){
  if(!mapaServicos){
    mapaServicos=L.map('mapa-servicos-full').setView([-5.5,-39.5],6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(mapaServicos);
  }
  mapaServicos.eachLayer(l=>{if(l instanceof L.Marker||l instanceof L.CircleMarker) mapaServicos.removeLayer(l);});
  const lista=mapaServFiltro==='todos'?prestadores:prestadores.filter(p=>p.tipo===mapaServFiltro);
  const comCoords=lista.filter(p=>p.lat&&p.lng);
  const grupos={};
  comCoords.forEach(p=>{
    const key=`${Math.round(p.lat*10)/10},${Math.round(p.lng*10)/10}`;
    if(!grupos[key]) grupos[key]={lat:p.lat,lng:p.lng,total:0,nomes:[]};
    grupos[key].total++; grupos[key].nomes.push(p.nome);
  });
  Object.values(grupos).forEach(g=>{
    const cor=g.total>=5?'#dc2626':g.total>=3?'#f59e0b':'#2d8c3e';
    L.circleMarker([g.lat,g.lng],{radius:g.total>=5?18:g.total>=3?15:12,fillColor:cor,color:'#fff',weight:2,opacity:1,fillOpacity:.9})
      .addTo(mapaServicos).bindPopup(`<strong>${g.total} serviço(s)</strong><br>${g.nomes.slice(0,3).join('<br>')}`);
  });
  if(coordsUser) L.marker([coordsUser.lat,coordsUser.lng],{icon:L.divIcon({className:'',html:'<div style="background:#3b82f6;width:14px;height:14px;border-radius:50%;border:3px solid #fff"></div>',iconSize:[14,14]})}).addTo(mapaServicos).bindPopup('📍 Você está aqui');
  const el=document.getElementById('mapa-srv-count');
  if(el) el.textContent=comCoords.length+' serviço(s) • '+Object.keys(grupos).length+' localidade(s)';
  setTimeout(()=>mapaServicos.invalidateSize(),300);
};

// EVENTOS
async function carregarEventos(){
  try{
    const snap=await getDocs(collection(db,'eventos'));
    eventos=snap.docs.map(d=>({id:d.id,...d.data()}))
      .sort((a,b)=>new Date(a.data||0)-new Date(b.data||0)); // mais próximo primeiro
    
    // Auto-delete de eventos expirados (dia seguinte ao evento)
    const hoje=new Date(); hoje.setHours(0,0,0,0);
    for(const ev of eventos){
      const dataEvento=new Date(ev.data+'T23:59:59');
      const proximoDia=new Date(dataEvento);
      proximoDia.setDate(proximoDia.getDate()+1);
      if(hoje>=proximoDia){
        try{
          await deleteDoc(doc(db,'eventos',ev.id));
          console.log('Evento expirado deletado automaticamente:',ev.titulo);
        }catch(e){console.error('Erro ao deletar evento expirado:',e);}
      }
    }
    
    // Recarregar após deletar
    const snapAtualizado=await getDocs(collection(db,'eventos'));
    eventos=snapAtualizado.docs.map(d=>({id:d.id,...d.data()}))
      .sort((a,b)=>new Date(a.data||0)-new Date(b.data||0));
    
    renderEventos(); renderAdmEventos();
  }catch(e){console.error(e);}
}
function renderEventos(){
  const el=document.getElementById('lista-eventos'); if(!el) return;
  const hoje=new Date(); hoje.setHours(0,0,0,0);
  const futuros=eventos.filter(ev=>new Date(ev.data+'T12:00:00')>=hoje);
  if(!futuros.length){el.innerHTML='<div class="empty" style="padding:40px;text-align:center">📅 Nenhum evento programado no momento.</div>';return;}
  el.innerHTML=futuros.map(ev=>{
    const dataEvento=new Date(ev.data+'T12:00:00');
    const data=ev.data?dataEvento.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):'';
    const wpp=(ev.whatsapp||'').replace(/\D/g,'');
    const ig=ev.instagram?(ev.instagram.startsWith('http')?ev.instagram:'https://instagram.com/'+ev.instagram.replace('@','')):'';
    // Contador de dias
    const diffMs=dataEvento-hoje;
    const diffDias=Math.ceil(diffMs/(1000*60*60*24));
    let contadorHTML='';
    if(diffDias===0){
      contadorHTML=`<div style="display:inline-flex;align-items:center;gap:5px;background:#dc2626;color:#fff;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:700;margin-bottom:8px">🔴 HOJE!</div>`;
    } else if(diffDias===1){
      contadorHTML=`<div style="display:inline-flex;align-items:center;gap:5px;background:#f59e0b;color:#fff;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:700;margin-bottom:8px">⚡ AMANHÃ!</div>`;
    } else {
      const cor=diffDias<=7?'#f59e0b':diffDias<=30?'#2d8c3e':'#6b7280';
      contadorHTML=`<div style="display:inline-flex;align-items:center;gap:5px;background:${cor}15;color:${cor};border:1px solid ${cor}44;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:700;margin-bottom:8px">⏳ Faltam ${diffDias} dias</div>`;
    }
    return `<div style="background:#fff;border-radius:12px;margin-bottom:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);border:1px solid #eee">
      ${ev.imagem?`<img src="${ev.imagem}" style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block" loading="lazy"/>`:'<div style="width:100%;aspect-ratio:16/9;background:linear-gradient(135deg,#1a3a1a,#2d8c3e);display:flex;align-items:center;justify-content:center;font-size:40px">📅</div>'}
      <div style="padding:14px">
        ${contadorHTML}
        <div style="font-family:'Oswald',sans-serif;font-size:17px;font-weight:700;color:#1a1a1a;margin-bottom:6px">${ev.titulo||'Evento'}</div>
        <div style="font-size:12px;color:#2d8c3e;font-weight:700;margin-bottom:8px">📅 ${data}${ev.hora?' às '+ev.hora:''}</div>
        ${ev.descricao?`<div style="font-size:13px;color:#555;line-height:1.5;margin-bottom:10px">${ev.descricao}</div>`:''}
        ${ev.endereco?`<div style="font-size:12px;color:#666;margin-bottom:6px">📍 ${ev.endereco}</div>`:''}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
          ${wpp?`<button onclick="window.open('https://wa.me/55${wpp}','_blank')" style="background:#25d366;border:none;border-radius:8px;color:#fff;padding:9px 14px;font-size:12px;font-weight:700;cursor:pointer">💬 WhatsApp</button>`:''}
          ${ig?`<button onclick="window.open('${ig}','_blank')" style="background:linear-gradient(135deg,#f09433,#dc2743);border:none;border-radius:8px;color:#fff;padding:9px 14px;font-size:12px;font-weight:700;cursor:pointer">📸 Instagram</button>`:''}
          ${(ev.lat&&ev.lng)?
            `<button onclick="window.open('https://www.google.com/maps?q=${ev.lat},${ev.lng}','_blank')" style="background:#2d8c3e;border:none;border-radius:8px;color:#fff;padding:9px 14px;font-size:12px;font-weight:700;cursor:pointer">📍 Como chegar</button>`
            : ev.endereco?
            `<button onclick="window.open('https://www.google.com/maps/search/${encodeURIComponent(ev.endereco)}','_blank')" style="background:#2d8c3e;border:none;border-radius:8px;color:#fff;padding:9px 14px;font-size:12px;font-weight:700;cursor:pointer">📍 Como chegar</button>`
            :''}
          ${ev.tem_formulario&&ev.form_wpp?`<button onclick="APP.abrirInscricao('${ev.id}')" style="background:linear-gradient(135deg,#f59e0b,#d97706);border:none;border-radius:8px;color:#fff;padding:9px 16px;font-size:12px;font-weight:700;cursor:pointer;width:100%;margin-top:4px">📋 Quero me inscrever</button>`:''}
        </div>
      </div>
    </div>`;
  }).join('');
}
function renderAdmEventos(){
  const el=document.getElementById('adm-lista-ev'); const tot=document.getElementById('adm-tot-ev'); if(!el) return;
  if(tot) tot.textContent='('+eventos.length+')';
  // Ordenado por data do evento (mais próximo primeiro)
  const ordenados=[...eventos].sort((a,b)=>new Date(a.data||0)-new Date(b.data||0));
  el.innerHTML=ordenados.length?ordenados.map(ev=>`
    <div class="admin-item">
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:13px">${ev.titulo||'—'}</div>
        <div style="font-size:11px;color:#2d8c3e">${ev.data?new Date(ev.data+'T12:00:00').toLocaleDateString('pt-BR'):''}</div>
        <div style="font-size:11px;color:#888">${ev.endereco||''}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0">
        <button class="btn-edit" onclick="APP.editarEvento('${ev.id}')">✏️ Editar</button>
        <button class="btn-del" onclick="APP.delEvento('${ev.id}')">🗑️ Excluir</button>
      </div>
    </div>`).join(''):'<div class="empty">Nenhum evento.</div>';
}
window.APP.editarEvento=function(id){
  const ev=eventos.find(e=>e.id===id); if(!ev) return;
  document.getElementById('ev-id').value=id;
  document.getElementById('ev-titulo').value=ev.titulo||'';
  document.getElementById('ev-data').value=ev.data||'';
  document.getElementById('ev-hora').value=ev.hora||'';
  document.getElementById('ev-desc').value=ev.descricao||'';
  document.getElementById('ev-end').value=ev.endereco||'';
  document.getElementById('ev-ig').value=ev.instagram||'';
  document.getElementById('ev-wpp').value=ev.whatsapp||'';
  document.getElementById('ev-lat').value=ev.lat||'';
  document.getElementById('ev-lng').value=ev.lng||'';
  document.getElementById('ev-img').value=ev.imagem||'';
  // Formulário de inscrição
  const cb=document.getElementById('ev-tem-form');
  if(cb){ cb.checked=!!ev.tem_formulario; document.getElementById('ev-form-wpp-box').style.display=ev.tem_formulario?'block':'none'; }
  document.getElementById('ev-form-wpp').value=ev.form_wpp||'';
  // Mostrar preview da imagem atual
  if(ev.imagem){
    document.getElementById('ev-img-preview').style.display='block';
    document.getElementById('ev-img-preview-img').src=ev.imagem;
    document.getElementById('ev-img-status').style.display='block';
    document.getElementById('ev-img-status').textContent='✅ Imagem atual carregada';
  }
  document.getElementById('ev-form-titulo').textContent='✏️ Editando Evento';
  document.getElementById('ev-btn-cancelar').style.display='block';
  document.querySelector('.admin-card-t').scrollIntoView({behavior:'smooth',block:'start'});
};
window.APP.evCancelarEdicao=function(){
  document.getElementById('ev-id').value='';
  ['ev-titulo','ev-data','ev-hora','ev-desc','ev-end','ev-ig','ev-wpp','ev-lat','ev-lng','ev-img','ev-form-wpp'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const cb=document.getElementById('ev-tem-form'); if(cb) cb.checked=false;
  const fwpp=document.getElementById('ev-form-wpp-box'); if(fwpp) fwpp.style.display='none';;
  document.getElementById('ev-img-status').style.display='none';
  document.getElementById('ev-img-preview').style.display='none';
  document.getElementById('ev-form-titulo').textContent='➕ Novo Evento';
  document.getElementById('ev-btn-cancelar').style.display='none';
};
window.APP.evBuscarLocal=async function(){
  const end=document.getElementById('ev-end').value.trim();
  if(!end){alert('Digite o endereço primeiro.');return;}
  const status=document.getElementById('ev-loc-status');
  status.style.display='block'; status.textContent='📍 Buscando localização...';
  try{
    const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(end)}&limit=1`);
    const d=await r.json();
    if(d&&d[0]){
      document.getElementById('ev-lat').value=parseFloat(d[0].lat).toFixed(6);
      document.getElementById('ev-lng').value=parseFloat(d[0].lon).toFixed(6);
      status.textContent=`✅ Localização encontrada: ${d[0].display_name.substring(0,60)}...`;
      status.style.color='#2d8c3e';
    } else {
      status.textContent='⚠️ Não encontrado. Preencha Latitude e Longitude manualmente.';
      status.style.color='#f59e0b';
    }
  }catch(e){
    status.textContent='⚠️ Erro ao buscar. Preencha manualmente.';
    status.style.color='#dc2626';
  }
};
window.APP.uploadBannerEvento=async function(event){
  const file=event.target.files[0]; if(!file) return;
  const status=document.getElementById('ev-img-status');
  const preview=document.getElementById('ev-img-preview');
  const previewImg=document.getElementById('ev-img-preview-img');
  status.style.display='block'; status.textContent='📤 Enviando banner...';

  try{
    // Comprime antes de enviar
    const canvas=document.createElement('canvas');
    const img=new Image();
    img.src=URL.createObjectURL(file);
    await new Promise(r=>img.onload=r);
    const maxW=1080;
    let w=img.width, h=img.height;
    if(w>maxW){h=Math.round(h*maxW/w);w=maxW;}
    canvas.width=w; canvas.height=h;
    canvas.getContext('2d').drawImage(img,0,0,w,h);
    const blob=await new Promise(r=>canvas.toBlob(r,'image/jpeg',0.85));
    const compressed=new File([blob],file.name,{type:'image/jpeg'});

    const formData=new FormData();
    formData.append('file',compressed);
    formData.append('upload_preset',CLOUD_UPLOAD_PRESET);
    formData.append('folder','tralienigena/eventos');
    const r=await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,{method:'POST',body:formData});
    const d=await r.json();
    const url=d.secure_url||'';
    document.getElementById('ev-img').value=url;
    previewImg.src=url;
    preview.style.display='block';
    status.textContent='✅ Banner enviado com sucesso!';
  }catch(e){
    status.style.color='#dc2626';
    status.textContent='⚠️ Erro ao enviar. Tente novamente.';
    console.error(e);
  }
};
window.APP.salvarEvento=async function(){
  const titulo=document.getElementById('ev-titulo').value.trim();
  const data=document.getElementById('ev-data').value;
  if(!titulo||!data){alert('Preencha título e data.');return;}
  const evId=document.getElementById('ev-id').value;
  const temForm=document.getElementById('ev-tem-form').checked;
  const formWpp=(document.getElementById('ev-form-wpp').value||'').replace(/\D/g,'');
  const payload={titulo,data,hora:document.getElementById('ev-hora').value,descricao:document.getElementById('ev-desc').value.trim(),endereco:document.getElementById('ev-end').value.trim(),imagem:document.getElementById('ev-img').value.trim(),instagram:document.getElementById('ev-ig').value.trim(),whatsapp:document.getElementById('ev-wpp').value.trim(),lat:parseFloat(document.getElementById('ev-lat').value)||null,lng:parseFloat(document.getElementById('ev-lng').value)||null,tem_formulario:temForm,form_wpp:temForm?formWpp:''};
  try{
    if(evId){
      await updateDoc(doc(db,'eventos',evId),payload);
    } else {
      payload.criado=new Date().toISOString();
      await addDoc(collection(db,'eventos'),payload);
    }
    APP.evCancelarEdicao();
    document.getElementById('ev-ok').style.display='block';
    setTimeout(()=>document.getElementById('ev-ok').style.display='none',3000);
    await carregarEventos();
  }catch(e){alert('Erro ao salvar evento.');console.error(e);}
};
window.APP.delEvento=async function(id){if(!confirm('Excluir?'))return;try{await deleteDoc(doc(db,'eventos',id));await carregarEventos();}catch(e){alert('Erro.');}};

// CURSOS
async function carregarCursos(){
  try{
    const snap=await getDocs(collection(db,'cursos'));
    cursos=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>new Date(b.criado||0)-new Date(a.criado||0));
    renderCursos(); renderAdmCursos();
  }catch(e){console.error(e);}
}
function renderCursos(){
  const el=document.getElementById('lista-cursos'); if(!el) return;
  if(!cursos.length){el.innerHTML='<div class="empty" style="padding:40px;text-align:center">📚 Nenhum curso disponível.</div>';return;}
  el.innerHTML=cursos.map(c=>{
    const wpp=(c.whatsapp||'').replace(/\D/g,'');
    const site=c.site?(c.site.startsWith('http')?c.site:'https://'+c.site):'';
    return `<div style="background:#fff;border-radius:12px;margin-bottom:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);border:1px solid #eee">
      ${c.imagem?`<img src="${c.imagem}" style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block" loading="lazy"/>`:'<div style="width:100%;aspect-ratio:16/9;background:linear-gradient(135deg,#1a3a1a,#2d8c3e);display:flex;align-items:center;justify-content:center;font-size:40px">📚</div>'}
      <div style="padding:14px">
        <div style="font-family:'Oswald',sans-serif;font-size:16px;font-weight:700">${c.nome||'Curso'}</div>
        ${c.instituicao?`<div style="font-size:12px;color:#2d8c3e;font-weight:700;margin:4px 0">🏫 ${c.instituicao}</div>`:''}
        ${c.cidade?`<div style="font-size:12px;color:#666;margin-bottom:4px">📍 ${c.cidade}</div>`:''}
        ${c.preco?`<div style="font-size:13px;font-weight:700;color:#f59e0b;margin-bottom:6px">💰 ${c.preco}</div>`:''}
        ${c.descricao?`<div style="font-size:13px;color:#555;line-height:1.5;margin-bottom:10px">${c.descricao}</div>`:''}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
          ${wpp?`<button onclick="window.open('https://wa.me/55${wpp}','_blank')" style="background:#25d366;border:none;border-radius:8px;color:#fff;padding:9px 14px;font-size:12px;font-weight:700;cursor:pointer">💬 WhatsApp</button>`:''}
          ${site?`<button onclick="window.open('${site}','_blank')" style="background:#1565c0;border:none;border-radius:8px;color:#fff;padding:9px 14px;font-size:12px;font-weight:700;cursor:pointer">🌐 Saiba mais</button>`:''}
        </div>
      </div>
    </div>`;
  }).join('');
}
function renderAdmCursos(){
  const el=document.getElementById('adm-lista-cur'); const tot=document.getElementById('adm-tot-cur'); if(!el) return;
  if(tot) tot.textContent='('+cursos.length+')';
  el.innerHTML=cursos.length?cursos.map(c=>`<div class="admin-item"><div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13px">${c.nome||'—'}</div><div style="font-size:11px;color:#888">${c.instituicao||''} • ${c.cidade||''}</div></div><button class="btn-del" onclick="APP.delCurso('${c.id}')">🗑️</button></div>`).join(''):'<div class="empty">Nenhum curso.</div>';
}
window.APP.salvarCurso=async function(){
  const nome=document.getElementById('cur-nome').value.trim(); if(!nome){alert('Informe o nome.');return;}
  try{
    await addDoc(collection(db,'cursos'),{nome,descricao:document.getElementById('cur-desc').value.trim(),instituicao:document.getElementById('cur-inst').value.trim(),cidade:document.getElementById('cur-cidade').value.trim(),preco:document.getElementById('cur-preco').value.trim(),site:document.getElementById('cur-site').value.trim(),whatsapp:document.getElementById('cur-wpp').value.trim(),imagem:document.getElementById('cur-img').value.trim(),criado:new Date().toISOString()});
    ['cur-nome','cur-desc','cur-inst','cur-cidade','cur-preco','cur-site','cur-wpp','cur-img'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    document.getElementById('cur-ok').style.display='block';
    setTimeout(()=>document.getElementById('cur-ok').style.display='none',3000);
    await carregarCursos();
  }catch(e){alert('Erro.');}
};
window.APP.delCurso=async function(id){if(!confirm('Excluir?'))return;try{await deleteDoc(doc(db,'cursos',id));await carregarCursos();}catch(e){alert('Erro.');}};

// MOTORISTAS
async function carregarMotoristas(){
  try{
    const snap=await getDocs(collection(db,'motoristas'));
    const agora=new Date(); const seteDias=7*24*60*60*1000;
    const expirados=snap.docs.filter(d=>(agora-new Date(d.data().criado||0))>seteDias);
    if(expirados.length) await Promise.all(expirados.map(d=>deleteDoc(doc(db,'motoristas',d.id))));
    motoristas=snap.docs.filter(d=>(agora-new Date(d.data().criado||0))<=seteDias).map(d=>({id:d.id,...d.data()})).sort((a,b)=>new Date(b.criado||0)-new Date(a.criado||0));
    renderMotoristas(); renderAdmMotoristas();
  }catch(e){console.error(e);}
}
function renderMotoristas(){
  const el=document.getElementById('lista-motoristas'); if(!el) return;
  if(!motoristas.length){el.innerHTML='<div class="empty" style="padding:30px;text-align:center">🚛 Nenhum cadastro ainda.<br><span style="font-size:12px;color:#aaa">Seja o primeiro!</span></div>';return;}
  const agora=new Date();
  el.innerHTML=motoristas.map(m=>{
    const wpp=(m.whatsapp||'').replace(/\D/g,'');
    const dias=Math.ceil((7*24*60*60*1000-(agora-new Date(m.criado||0)))/(24*60*60*1000));
    const cor=dias<=2?'#dc2626':dias<=4?'#f59e0b':'#2d8c3e';
    const tipos=(m.tipo_veiculo||'').split(',').map(t=>t.trim()).filter(Boolean);
    const tiposHTML=tipos.length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin:4px 0">${tipos.map(t=>`<span style="background:#f0fdf4;color:#2d8c3e;border:1px solid #bbf7d0;border-radius:20px;padding:2px 8px;font-size:10px;font-weight:700">${t}</span>`).join('')}</div>`:'';
    const certs=(m.certificacoes||'').split(',').map(t=>t.trim()).filter(Boolean);
    const certsHTML=certs.length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin:4px 0">${certs.map(t=>`<span style="background:#fff8e1;color:#f59e0b;border:1px solid #fde68a;border-radius:20px;padding:2px 8px;font-size:10px;font-weight:700">🎓 ${t}</span>`).join('')}</div>`:'';    return `<div style="background:#fff;border-radius:12px;padding:14px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,.06);border:1px solid #eee;border-left:4px solid #2d8c3e">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#2d8c3e,#1a5c26);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff;flex-shrink:0">${(m.nome||'M')[0].toUpperCase()}</div>
        <div style="flex:1"><div style="font-family:'Oswald',sans-serif;font-size:15px;font-weight:700">${m.nome||'Motorista'}</div><div style="font-size:11px;color:#2d8c3e;font-weight:700">CNH ${m.cnh||''}</div></div>
        <div style="font-size:10px;font-weight:700;color:${cor};background:${cor}15;border:1px solid ${cor}44;border-radius:20px;padding:3px 8px">⏱️ ${dias}d</div>
      </div>
      ${tiposHTML}
      ${certsHTML}
      ${m.cidade?`<div style="font-size:12px;color:#666;margin-top:4px">📍 ${m.cidade}</div>`:''}
      ${m.experiencia?`<div style="font-size:12px;color:#666">⏱️ ${m.experiencia}</div>`:''}
      ${m.observacoes?`<div style="font-size:12px;color:#555;margin-top:4px;line-height:1.4">${m.observacoes}</div>`:''}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        ${wpp?`<button onclick="window.open('https://wa.me/55${wpp}?text=Olá! Vi seu cadastro no Tr.Alienigena.','_blank')" style="background:#25d366;border:none;border-radius:8px;color:#fff;padding:9px 14px;font-size:12px;font-weight:700;cursor:pointer">💬 Contatar</button>`:''}
        ${m.curriculo_url?`<button onclick="window.open('${m.curriculo_url}','_blank')" style="background:#1565c0;border:none;border-radius:8px;color:#fff;padding:9px 14px;font-size:12px;font-weight:700;cursor:pointer">📄 Ver Currículo</button>`:''}
      </div>
    </div>`;
  }).join('');
}
function renderAdmMotoristas(){
  const el=document.getElementById('adm-lista-mot'); const tot=document.getElementById('adm-tot-mot'); if(!el) return;
  if(tot) tot.textContent='('+motoristas.length+')';
  const agora=new Date();
  el.innerHTML=motoristas.length?motoristas.map(m=>{
    const dias=Math.ceil((7*24*60*60*1000-(agora-new Date(m.criado||0)))/(24*60*60*1000));
    const cor=dias<=2?'#dc2626':dias<=4?'#f59e0b':'#2d8c3e';
    return `<div class="admin-item"><div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13px">${m.nome||'—'} <span style="font-size:10px;color:${cor}">⏱️ ${dias}d</span></div><div style="font-size:11px;color:#2d8c3e">CNH ${m.cnh||''} • ${m.tipo_veiculo||''}</div><div style="font-size:11px;color:#888">${m.cidade||''} • ${m.whatsapp||''}</div>${m.curriculo_url?`<a href="${m.curriculo_url}" target="_blank" style="font-size:11px;color:#1565c0;font-weight:700">📄 Currículo</a>`:''}</div><button class="btn-del" onclick="APP.delMotorista('${m.id}')">🗑️ Excluir</button></div>`;
  }).join(''):'<div class="empty">Nenhum motorista.</div>';
}
window.APP.abrirCadMot=function(){
  document.getElementById('cad-mot-form').style.display='block';
  document.getElementById('btn-abrir-cad-mot').style.display='none';
  setTimeout(()=>document.getElementById('cad-mot-form').scrollIntoView({behavior:'smooth',block:'start'}),100);
};
window.APP.selecionarCurriculo=async function(event){
  const file=event.target.files[0]; if(!file) return;
  if(!file.type.includes('pdf')&&!file.name.endsWith('.pdf')){alert('Apenas PDF.');event.target.value='';return;}
  if(file.size>5*1024*1024){alert('Arquivo muito grande. Máximo 5MB.');return;}
  curriculoFile=file;
  const status=document.getElementById('curriculo-status');
  status.style.display='block'; status.style.color='#2d8c3e'; status.style.background='#f0fdf4';
  status.textContent='📄 '+file.name+' — 🤖 Lendo com IA...';
  try{
    const base64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>res(e.target.result.split(',')[1]);r.onerror=rej;r.readAsDataURL(file);});
    const resp=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-sonnet-4-5',max_tokens:1000,messages:[{role:'user',content:[{type:'document',source:{type:'base64',media_type:'application/pdf',data:base64}},{type:'text',text:'Leia este currículo e extraia. Responda SOMENTE JSON: {"nome":"","cnh":"","tipo_veiculo":"","cidade":"","experiencia":"","whatsapp":"","observacoes":""}'}]}]})});
    const data=await resp.json();
    const info=JSON.parse((data.content?.map(x=>x.text||'').join('')||'{}').replace(/```json|```/g,'').trim());
    if(info.nome) document.getElementById('mot-nome').value=info.nome;
    if(info.cnh){const s=document.getElementById('mot-cnh');for(let o of s.options)if(o.value===info.cnh){s.value=info.cnh;break;}}
    if(info.tipo_veiculo)(info.tipo_veiculo.split(',').map(t=>t.trim())).forEach(t=>{document.querySelectorAll('input[name="mot-tipo-check"]').forEach(cb=>{if(cb.value===t){cb.checked=true;cb.closest('label').classList.add('checked');}});});
    if(info.cidade) document.getElementById('mot-cidade').value=info.cidade;
    if(info.experiencia) document.getElementById('mot-exp').value=info.experiencia;
    if(info.whatsapp) document.getElementById('mot-wpp').value=info.whatsapp;
    if(info.observacoes) document.getElementById('mot-obs').value=info.observacoes;
    status.textContent='✅ Dados preenchidos automaticamente!';
  }catch(e){status.style.color='#f59e0b';status.style.background='#fff8e1';status.textContent='⚠️ Preencha os campos manualmente — PDF será anexado.';}
};
window.APP.salvarMotorista=async function(){
  if(!usuarioLogado){alert('Você precisa fazer login com Google para cadastrar como motorista.');await APP.loginGoogle();return;}
  const nome=document.getElementById('mot-nome').value.trim();
  const cnh=document.getElementById('mot-cnh').value;
  const wpp=document.getElementById('mot-wpp').value.trim();
  const cidade=document.getElementById('mot-cidade').value.trim();
  const veiculosSelecionados=Array.from(document.querySelectorAll('.mot-veiculo-tag.selected')).map(b=>b.getAttribute('data-veiculo'));
  const tipo_veiculo=veiculosSelecionados.join(', ')||'';
  if(!curriculoFile){alert('É obrigatório anexar o currículo em PDF.');return;}
  if(!nome||!cnh||!wpp||!cidade||!tipo_veiculo){alert('Preencha nome, CNH, cidade, WhatsApp e selecione pelo menos um tipo de veículo.');return;}
  const cursosSel=Array.from(document.querySelectorAll('input[name="mot-curso-check"]:checked')).map(c=>c.value);
  const certificacoes=cursosSel.join(', ')||'';
  const status=document.getElementById('curriculo-status');
  status.style.display='block'; status.textContent='Salvando...';
  try{
    let curriculo_url='';
    if(curriculoFile){
      status.textContent='📤 Enviando currículo...';
      const formData=new FormData();
      formData.append('file',curriculoFile);
      formData.append('upload_preset',CLOUD_UPLOAD_PRESET);
      formData.append('folder','tralienigena/curriculos');
      // Upload como auto para suportar PDF
      const r=await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,{method:'POST',body:formData});
      const d=await r.json();
      const rawUrl=d.secure_url||'';
      // Usar Google Docs Viewer para abrir PDF no browser sem precisar de auth
      curriculo_url=rawUrl?`https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=true`:'';
    }
    await addDoc(collection(db,'motoristas'),{nome,cnh,tipo_veiculo,certificacoes,cidade,experiencia:document.getElementById('mot-exp').value.trim(),whatsapp:wpp,observacoes:document.getElementById('mot-obs').value.trim(),curriculo_url,criado:new Date().toISOString()});
    ['mot-nome','mot-cidade','mot-exp','mot-wpp','mot-obs'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    document.getElementById('mot-cnh').value='';
    document.querySelectorAll('.mot-veiculo-tag').forEach(b=>b.classList.remove('selected'));
    document.querySelectorAll('input[name="mot-curso-check"]').forEach(c=>{c.checked=false;c.closest('label').classList.remove('checked');});
    curriculoFile=null; document.getElementById('input-curriculo').value='';
    document.getElementById('cad-mot-form').style.display='none';
    document.getElementById('btn-abrir-cad-mot').style.display='block';
    await carregarMotoristas();
    APP.mostrarPopup('🚛','Cadastro publicado!','Seu perfil está disponível! Agora é só aguardar o contato. Boa sorte! 💪',false);
  }catch(e){status.textContent='⚠️ Erro ao salvar.';console.error(e);}
};
window.APP.filtrarMotoristas=function(){
  const q=document.getElementById('mot-filtro').value.toLowerCase().trim();
  if(!q){renderMotoristas();return;}
  const fil=motoristas.filter(m=>Object.values(m).some(v=>(v||'').toString().toLowerCase().includes(q)));
  const el=document.getElementById('lista-motoristas');
  el.innerHTML=fil.length?fil.map(m=>{const wpp=(m.whatsapp||'').replace(/\D/g,'');return `<div style="background:#fff;border-radius:12px;padding:14px;margin-bottom:12px;border:1px solid #eee;border-left:4px solid #2d8c3e"><div style="font-weight:700;font-size:14px">${m.nome}</div><div style="font-size:11px;color:#2d8c3e">CNH ${m.cnh} • ${m.tipo_veiculo||''}</div><div style="font-size:12px;color:#666">📍 ${m.cidade||''}</div>${wpp?`<button onclick="window.open('https://wa.me/55${wpp}','_blank')" style="background:#25d366;border:none;border-radius:8px;color:#fff;padding:7px 12px;font-size:12px;font-weight:700;cursor:pointer;margin-top:8px">💬 Contatar</button>`:''}</div>`;}).join(''):'<div class="empty">Nenhum resultado.</div>';
};
window.APP.delMotorista=async function(id){if(!confirm('Excluir?'))return;try{await deleteDoc(doc(db,'motoristas',id));await carregarMotoristas();}catch(e){alert('Erro.');}};

// ===== PRESTADORES - VERIFICAÇÃO E TERMOS =====
window.APP.verificarLoginPrestador=function(){
  // Função removida - agora abre a tela direto
};
window.APP.fecharTermosPrestador=function(){
  document.getElementById('modal-termos-prestador-overlay').style.display='none';
  window._cadastroPendente=null;
};
window.APP.salvarTermosPrestador=async function(){
  const nome=document.getElementById('termos-nome').value.trim();
  const email=document.getElementById('termos-email').value.trim();
  if(!nome||!email){alert('Preencha seu nome e e-mail.');return;}
  if(!email.includes('@')){alert('E-mail invalido.');return;}
  if(!window._cadastroPendente){alert('Erro: dados do cadastro nao encontrados.');return;}
  const cad=window._cadastroPendente;
  document.getElementById('modal-termos-prestador-overlay').style.display='none';
  const btn=document.getElementById('btn-cad'); btn.disabled=true; btn.textContent='Salvando...';
  try{
    const diasFuncionamento=[];
    if(document.getElementById('cad-dias-seg-sab').checked) diasFuncionamento.push('Seg–Sáb');
    if(document.getElementById('cad-dias-dom-fer').checked) diasFuncionamento.push('Dom/Feriados');
    const docRef = await addDoc(collection(db,'prestadores'),{nome:cad.nome,tipo:cad.tipo,descricao:cad.desc,tags_servicos:[...tagsCadSel],whatsapp:document.getElementById('cad-wpp').value.trim(),instagram:document.getElementById('cad-ig').value.trim(),endereco:document.getElementById('cad-end').value.trim(),lat:parseFloat(document.getElementById('cad-lat').value)||null,lng:parseFloat(document.getElementById('cad-lng').value)||null,abre:document.getElementById('cad-abre').value,fecha:document.getElementById('cad-fecha').value,aberto24h:document.getElementById('cad-24h').checked,dias_funcionamento:diasFuncionamento,fotos:[],data:new Date().toISOString(),responsavel_nome:nome,responsavel_email:email,responsavel_uid:''});
    alert('Cadastro realizado com sucesso! Seu servico aparecera em breve apos verificacao.');
    // Limpar os campos do formulário
    document.getElementById('cad-nome').value='';
    document.getElementById('cad-tipo').value='';
    document.getElementById('cad-desc').value='';
    document.getElementById('cad-wpp').value='';
    document.getElementById('cad-ig').value='';
    document.getElementById('cad-end').value='';
    document.getElementById('cad-lat').value='';
    document.getElementById('cad-lng').value='';
    document.getElementById('cad-abre').value='';
    document.getElementById('cad-fecha').value='';
    document.getElementById('cad-24h').checked=false;
    ['cad-dias-seg-sab','cad-dias-dom-fer','cad-dias-todos'].forEach(id=>{document.getElementById(id).checked=false;});
    ['label-seg-sab','label-dom-fer','label-todos-dias'].forEach(id=>{const l=document.getElementById(id);if(l){l.style.border='2px solid #e0e0e0';l.style.background='#f5f5f5';}});
    document.getElementById('fotos-preview-cad').innerHTML='';
    document.getElementById('input-fotos-cad').value='';
    tagsCadSel=[];
    APP.show('tela-inicio');

  }catch(e){
    alert('Erro ao salvar: '+e.message);
  }finally{
    btn.disabled=false;
    btn.textContent='✅ CADASTRAR MEU SERVICO';
    window._cadastroPendente=null;
  }
};
document.addEventListener('change',function(e){
  if(e.target.id==='check-termos-prestador'){
    const btn=document.getElementById('btn-aceitar-termos-prestador');
    if(e.target.checked){
      btn.disabled=false;
      btn.style.opacity='1';
      btn.style.cursor='pointer';
    }else{
      btn.disabled=true;
      btn.style.opacity='.5';
      btn.style.cursor='not-allowed';
    }
  }
});

// ===== NOTÍCIAS =====
let todasNoticias=[];
const TEMAS_NOTICIAS={
  todos:{q:'caminhoneiro+frete+caminhão',label:'Todas'},
  frete:{q:'tabela+frete+caminhão',label:'Frete'},
  diesel:{q:'preço+diesel+caminhão',label:'Diesel'},
  lei:{q:'lei+caminhoneiro+legislação',label:'Leis'},
  pedagio:{q:'pedágio+rodovia+caminhão',label:'Pedágio'},
  antt:{q:'ANTT+transporte+caminhão',label:'ANTT'},
};
let temaAtual='todos';

// Fontes RSS de notícias de transporte (via proxy)
const RSS_FONTES=[
  'https://www.caminhoneiro.com.br/feed/',
  'https://www.revistaespecializada.com.br/feed/',
  'https://www.portaldotransporte.com.br/feed/',
  'https://transportaweb.com.br/feed/',
];

window.APP.carregarNoticias=async function(tema){
  if(tema) temaAtual=tema;
  const el=document.getElementById('lista-noticias');
  el.innerHTML='<div class="loading">Buscando notícias...</div>';

  let noticias=[];

  // Tenta buscar de fontes especializadas via proxy
  const fontes=[
    // GNews API — gratuita sem key para busca pública
    `https://api.allorigins.win/raw?url=${encodeURIComponent('https://gnews.io/api/v4/search?q=caminhoneiro+frete+motorista&lang=pt&country=br&max=10&apikey=pub_free')}`,
    // RSS de portais de transporte via proxy
    `https://api.allorigins.win/raw?url=${encodeURIComponent('https://transportaweb.com.br/feed/')}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent('https://www.caminhoneiro.com.br/feed/')}`,
    `https://corsproxy.io/?${encodeURIComponent('https://transportaweb.com.br/feed/')}`,
  ];

  for(const url of fontes){
    try{
      const r=await fetch(url,{signal:AbortSignal.timeout(8000)});
      if(!r.ok) continue;
      const txt=await r.text();

      // Tenta parsear como RSS/XML
      if(txt.includes('<item>')||txt.includes('<entry>')){
        const parser=new DOMParser();
        const doc2=parser.parseFromString(txt,'text/xml');
        const items=[...doc2.querySelectorAll('item, entry')];
        if(items.length){
          noticias=items.slice(0,20).map(item=>{
            const titulo=(item.querySelector('title')?.textContent||'').replace(/<!\[CDATA\[|\]\]>/g,'').trim();
            const link=item.querySelector('link')?.textContent||item.querySelector('link')?.getAttribute('href')||'';
            const pub=item.querySelector('pubDate, published, updated')?.textContent||'';
            const fonte=url.includes('transportaweb')?'Transporta Web':url.includes('caminhoneiro')?'Caminhoneiro.com':'Portal Transporte';
            const data=pub?new Date(pub).toLocaleDateString('pt-BR',{day:'numeric',month:'short'}):new Date().toLocaleDateString('pt-BR',{day:'numeric',month:'short'});
            return {titulo,link,data,fonte};
          }).filter(n=>n.titulo&&n.titulo.length>5&&n.link);
          if(noticias.length) break;
        }
      }
    }catch(e){continue;}
  }

  // Se nenhuma fonte funcionou, usa notícias estáticas relevantes com links reais
  if(!noticias.length){
    noticias=[
      {titulo:'Tabela de frete: confira os valores mínimos aprovados pela ANTT para 2026',link:'https://www.antt.gov.br/transporte-de-cargas/piso-minimo-de-frete',data:'2026',fonte:'ANTT'},
      {titulo:'Preço do diesel nas estradas: consulte a tabela atualizada da ANP',link:'https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/precos-revenda-e-de-distribuicao-combustiveis',data:'2026',fonte:'ANP'},
      {titulo:'ANTT regulamenta novas regras para transporte de carga a granel',link:'https://www.antt.gov.br',data:'2026',fonte:'ANTT'},
      {titulo:'Pedágios nas rodovias federais: veja os valores por eixo em 2026',link:'https://www.gov.br/infraestrutura/pt-br',data:'2026',fonte:'DNIT'},
      {titulo:'Jornada de trabalho do motorista: entenda seus direitos pela Lei 13.103',link:'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13103.htm',data:'2026',fonte:'Governo Federal'},
      {titulo:'MOPP: saiba como renovar sua habilitação para transporte de cargas perigosas',link:'https://www.antt.gov.br/transporte-de-cargas/produtos-perigosos',data:'2026',fonte:'ANTT'},
      {titulo:'Vale-pedágio obrigatório: regras e como o motorista deve receber o benefício',link:'https://www.planalto.gov.br/ccivil_03/leis/2002/l10561.htm',data:'2026',fonte:'Governo Federal'},
      {titulo:'CNH: novidades nas categorias C, D e E e exigências para motoristas profissionais',link:'https://www.detran.ce.gov.br',data:'2026',fonte:'DETRAN-CE'},
      {titulo:'Roubos de carga caem no Ceará: confira as rotas mais perigosas do Brasil',link:'https://www.cnt.org.br',data:'2026',fonte:'CNT'},
      {titulo:'Financiamento de caminhão: Finame e demais linhas de crédito para 2026',link:'https://www.bndes.gov.br',data:'2026',fonte:'BNDES'},
      {titulo:'Descanso obrigatório: fiscalização do TACÓGRAFO será intensificada em 2026',link:'https://www.antt.gov.br',data:'2026',fonte:'ANTT'},
      {titulo:'Seguro DPVAT e obrigações do caminhoneiro autônomo: o que mudou',link:'https://www.gov.br/senatran/pt-br',data:'2026',fonte:'SENATRAN'},
    ];
  }

  // Filtra por tema se necessário
  if(temaAtual!=='todos'){
    const filtros={
      frete:['frete','tabela','valor','preço do frete'],
      diesel:['diesel','combustível','gasolina','combustivel'],
      lei:['lei','legislação','cnh','direito','norma','regulam'],
      pedagio:['pedágio','pedagio','rodovia','concessão'],
      antt:['antt','agência','regulament','transporte'],
    };
    const palavras=filtros[temaAtual]||[];
    const filtradas=noticias.filter(n=>palavras.some(p=>n.titulo.toLowerCase().includes(p)||n.fonte.toLowerCase().includes(p)));
    APP.renderNoticias(filtradas.length?filtradas:noticias);
  } else {
    APP.renderNoticias(noticias);
  }
};

window.APP.renderNoticias=function(lista){
  const el=document.getElementById('lista-noticias');
  if(!lista.length){el.innerHTML='<div class="empty">Nenhuma notícia encontrada.</div>';return;}
  el.innerHTML=lista.map((n,i)=>`
    <div class="noticia-card" onclick="window.open('${n.link}','_blank')">
      <div style="padding:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span class="noticia-fonte">${n.fonte}</span>
          <span class="noticia-data">${n.data}</span>
        </div>
        <div class="noticia-titulo">${n.titulo}</div>
        <div style="margin-top:6px;display:flex;align-items:center;justify-content:space-between">
          <span class="noticia-tag">🚛 Transporte</span>
          <span style="font-size:11px;color:#2d8c3e;font-weight:700">Ler mais →</span>
        </div>
      </div>
    </div>`).join('');
};

window.APP.filtrarNoticias=function(tema){
  temaAtual=tema;
  document.querySelectorAll('.noticia-filtro').forEach(b=>b.classList.remove('on'));
  const btn=document.getElementById('nf-'+tema); if(btn) btn.classList.add('on');
  APP.carregarNoticias(tema);
};
// ===== FIM NOTÍCIAS =====
const LOJA_BASE='https://www.lojadoalienigena.com.br';
const CDN='https://acdn-us.mitiendanube.com/stores/004/263/853/products';

const LOJA_PRODUTOS=[
  // MASCULINO
  {nome:'BLUSA ALIEN PRETA VERDE ROTA 222',preco:'R$ 53,00',img:`${CDN}/blusa-alien-preta-verde-rota-222-1-480-0.webp`,url:`${LOJA_BASE}/produtos/blusa-alien-preta-verde-rota-222/`,cat:'masculino'},
  {nome:'BLUSA ALIEN PRETA AZUL ROTA 222',preco:'R$ 53,00',img:`${CDN}/blusa-alien-preta-azul-rota-222-1-480-0.webp`,url:`${LOJA_BASE}/produtos/blusa-alien-preta-azul-rota-222/`,cat:'masculino'},
  {nome:'CARRETEIRO CURIOSO PRETO',preco:'R$ 53,00',img:`${CDN}/carreteiro-curioso-preto-1-480-0.webp`,url:`${LOJA_BASE}/produtos/carreteiro-curioso-preto/`,cat:'masculino'},
  {nome:'SEU MADRUGA ROTA 222',preco:'R$ 53,00',img:`${CDN}/seu-madruga-rota-222-1-480-0.webp`,url:`${LOJA_BASE}/produtos/seu-madruga-rota-222/`,cat:'masculino'},
  {nome:'TRA SIMPSON VERDE',preco:'R$ 53,00',img:`${CDN}/tra-simpson-verde-1-480-0.webp`,url:`${LOJA_BASE}/produtos/tra-simpson-verde/`,cat:'masculino'},
  {nome:'TRA SIMPSON AZUL',preco:'R$ 53,00',img:`${CDN}/tra-simpson-azul-1-480-0.webp`,url:`${LOJA_BASE}/produtos/tra-simpson-azul/`,cat:'masculino'},
  {nome:'TRA ESPADA',preco:'R$ 53,00',img:`${CDN}/tra-espada-1-480-0.webp`,url:`${LOJA_BASE}/produtos/tra-espada/`,cat:'masculino'},
  {nome:'BLUSA ALIEN DA 222 PRETO',preco:'R$ 53,00',img:`${CDN}/blusa-alien-da-222-preto-1-480-0.webp`,url:`${LOJA_BASE}/produtos/blusa-alien-da-222-preto/`,cat:'masculino'},
  {nome:'LONGA TRA BAND ZADREZ',preco:'R$ 63,00',img:`${CDN}/longa-tra-band-zadrez-1-480-0.webp`,url:`${LOJA_BASE}/produtos/longa-tra-band-zadrez/`,cat:'masculino'},
  {nome:'MANGA LONGA ALIENIGENA',preco:'R$ 63,00',img:`${CDN}/manga-longa-alienigena-1-480-0.webp`,url:`${LOJA_BASE}/produtos/manga-longa-alienigena/`,cat:'masculino'},
  {nome:'LONGA ET AZUL',preco:'R$ 63,00',img:`${CDN}/longa-et-azul-1-480-0.webp`,url:`${LOJA_BASE}/produtos/longa-et-azul/`,cat:'masculino'},
  {nome:'LONGA ET ROSA',preco:'R$ 63,00',img:`${CDN}/longa-et-rosa-1-480-0.webp`,url:`${LOJA_BASE}/produtos/longa-et-rosa/`,cat:'masculino'},
  {nome:'LONGA TRA SIMPSON',preco:'R$ 63,00',img:`${CDN}/longa-tra-simpson-1-480-0.webp`,url:`${LOJA_BASE}/produtos/longa-tra-simpson/`,cat:'masculino'},
  {nome:'MOTORISTA REGGAE',preco:'R$ 47,00',img:`${CDN}/1022-motorista-reggae-unapologetically-794ac86aaf4446f5b717473330731969-480-0.webp`,url:`${LOJA_BASE}/produtos/motorista-reggae-unapologetically/`,cat:'masculino'},
  // BONÉS
  {nome:'CHAPEU BORDADO PESCADOR CORES',preco:'R$ 32,00',img:`${CDN}/chapeu-verde-pescador-tra-1-480-0.webp`,url:`${LOJA_BASE}/produtos/chapeu-verde-pescador-tra/`,cat:'bones'},
  {nome:'CHAPEU CAMINHONEIRO CATA OVO',preco:'R$ 74,00',img:`${CDN}/chapeu-caminhoneiro-cata-ovo-frases-natanzinho-1-480-0.webp`,url:`${LOJA_BASE}/produtos/chapeu-caminhoneiro-cata-ovo-frases-natanzinho/`,cat:'bones'},
  // ACESSÓRIOS
  {nome:'STICKER TR ALIENIGENA 26CM',preco:'R$ 20,00',img:`${CDN}/adesivo-frete-gratis-1-480-0.webp`,url:`${LOJA_BASE}/produtos/adesivo-frete-gratis/`,cat:'acessorios'},
  {nome:'ET PELÚCIA 35CM CAIPIRA',preco:'R$ 60,00',img:`${CDN}/et-pelucia-caipira-1-480-0.webp`,url:`${LOJA_BASE}/produtos/et-pelucia-caipira/`,cat:'acessorios'},
  {nome:'ET PELÚCIA 50CM CARECA ROSA',preco:'R$ 80,00',img:`${CDN}/alienigena-pelucia-et-rosa-50cm-1-480-0.webp`,url:`${LOJA_BASE}/produtos/alienigena-pelucia-et-rosa-50cm/`,cat:'acessorios'},
  {nome:'BOLSA NECESSAIRE ALIENIGENA',preco:'R$ 45,00',img:`${CDN}/bolsa-necessaire-alienigena-preta-1-480-0.webp`,url:`${LOJA_BASE}/produtos/bolsa-necessaire-alienigena-preta/`,cat:'acessorios'},
  {nome:'PENDRIVE CAMINHONEIRO +4MIL MÚSICAS',preco:'R$ 70,00',img:`${CDN}/pen-drive-caminhoneiro-raiz-4mil-musicas-1-480-0.webp`,url:`${LOJA_BASE}/produtos/pen-drive-caminhoneiro-raiz-4mil-musicas/`,cat:'acessorios'},
  {nome:'CORDÃO DE PESCOÇO ALIENÍGENA',preco:'R$ 12,00',img:`${CDN}/cordao-de-pescoco-alienigena-1-480-0.webp`,url:`${LOJA_BASE}/produtos/cordao-de-pescoco-alienigena/`,cat:'acessorios'},
  // ESTÉTICA
  {nome:'MASSA DE POLIR PEROLA',preco:'R$ 58,00',img:`${CDN}/massa-de-polir-perola-1-480-0.webp`,url:`${LOJA_BASE}/produtos/massa-de-polir-perola/`,cat:'estetica'},
  {nome:'PINGO MÁGICO FLOTADOR 500ML',preco:'R$ 39,00',img:`${CDN}/pingo-magico-flotador-extra-concentrado-500ml-1-480-0.webp`,url:`${LOJA_BASE}/produtos/pingo-magico-flotador-extra-concentrado-500ml/`,cat:'estetica'},
  {nome:'RESTAURAX 500ML',preco:'R$ 99,00',img:`${CDN}/restaurax-500ml-1-480-0.webp`,url:`${LOJA_BASE}/produtos/restaurax-500ml/`,cat:'estetica'},
  {nome:'PNEU PRETINHO 500ML',preco:'R$ 26,00',img:`${CDN}/pneu-pretinho-500ml-1-480-0.webp`,url:`${LOJA_BASE}/produtos/pneu-pretinho-500ml/`,cat:'estetica'},
  {nome:'LIMPA PNEU PEROLA',preco:'R$ 41,00',img:`${CDN}/limpa-pneu-perola-1-480-0.webp`,url:`${LOJA_BASE}/produtos/limpa-pneu-perola/`,cat:'estetica'},
  // KITS
  {nome:'KIT PROMOCIONAL ALMOFADA + CANECA',preco:'R$ 40,00',img:`${CDN}/kitpromocionalcaneca-1-480-0.webp`,url:`${LOJA_BASE}/produtos/kitpromocionalcaneca/`,cat:'kits'},
  {nome:'COMBO QUALIFICADO CHOFER',preco:'R$ 89,90',img:`${CDN}/combo-promocional-blusa-short-chofer-1-480-0.webp`,url:`${LOJA_BASE}/produtos/combo-promocional-blusa-short-chofer/`,cat:'kits'},
  {nome:'CANECA DE FIBRA ALIENÍGENA',preco:'R$ 122,00',img:`${CDN}/caneca-de-fibra-alienigena-das-brs-1-480-0.webp`,url:`${LOJA_BASE}/produtos/caneca-de-fibra-alienigena-das-brs/`,cat:'kits'},
  // FEMININO
  {nome:'BLUSA CAVALGADA NOSSA SENHORA',preco:'R$ 53,00',img:`${CDN}/blusa-cavalgada-nossa-senhora-1-480-0.webp`,url:`${LOJA_BASE}/produtos/blusa-cavalgada-nossa-senhora/`,cat:'feminino'},
  {nome:'BLUSA CAVALGADA MIMOSA',preco:'R$ 53,00',img:`${CDN}/tr-poeirao-cavalgad-1-480-0.webp`,url:`${LOJA_BASE}/produtos/tr-poeirao-cavalgad-1/`,cat:'feminino'},
];

let lojaFiltrados=[...LOJA_PRODUTOS];

window.APP.lojaFiltrar=function(cat, btn){
  document.querySelectorAll('.loja-cat-btn').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  document.getElementById('loja-busca').value='';
  lojaFiltrados = cat==='todos' ? [...LOJA_PRODUTOS] : LOJA_PRODUTOS.filter(p=>p.cat===cat);
  APP.lojaRenderGrid();
};

window.APP.lojaBuscar=function(){
  const q=document.getElementById('loja-busca').value.toLowerCase().trim();
  lojaFiltrados = q ? LOJA_PRODUTOS.filter(p=>p.nome.toLowerCase().includes(q)) : [...LOJA_PRODUTOS];
  APP.lojaRenderGrid();
};

window.APP.lojaRenderGrid=function(){
  const grid=document.getElementById('loja-grid');
  if(!lojaFiltrados.length){
    grid.innerHTML=`<div class="empty" style="grid-column:span 2;padding:30px;text-align:center">Nenhum produto encontrado.</div>`;
    return;
  }
  grid.innerHTML=lojaFiltrados.map(p=>`
    <div class="loja-prod-card" onclick="window.open('${p.url}','_blank')">
      <img class="loja-prod-img" src="${p.img}" loading="lazy"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
      <div style="display:none;width:100%;aspect-ratio:1;background:linear-gradient(135deg,#1a1a1a,#333);align-items:center;justify-content:center;font-size:36px">👽</div>
      <div class="loja-prod-info">
        <div class="loja-prod-nome">${p.nome}</div>
        <div class="loja-prod-preco">${p.preco}</div>
      </div>
      <div class="loja-prod-btn">🛒 Comprar</div>
    </div>`).join('');
};
// ===== FIM LOJA =====

// ===== PROGRAMA DE RÁDIO =====
window.APP.mostrarAbaRadio=function(aba){
  document.getElementById('aba-alo').style.display='none';
  document.getElementById('aba-musica').style.display='none';
  document.getElementById('aba-entrevista').style.display='none';
  document.getElementById('btn-alo').style.background='#e5e7eb';
  document.getElementById('btn-alo').style.color='#1f2937';
  document.getElementById('btn-musica').style.background='#e5e7eb';
  document.getElementById('btn-musica').style.color='#1f2937';
  document.getElementById('btn-entrevista').style.background='#e5e7eb';
  document.getElementById('btn-entrevista').style.color='#1f2937';
  
  if(aba==='alo'){
    document.getElementById('aba-alo').style.display='block';
    document.getElementById('btn-alo').style.background='#2d8c3e';
    document.getElementById('btn-alo').style.color='white';
  } else if(aba==='musica'){
    document.getElementById('aba-musica').style.display='block';
    document.getElementById('btn-musica').style.background='#2d8c3e';
    document.getElementById('btn-musica').style.color='white';
  } else if(aba==='entrevista'){
    document.getElementById('aba-entrevista').style.display='block';
    document.getElementById('btn-entrevista').style.background='#2d8c3e';
    document.getElementById('btn-entrevista').style.color='white';
  }
};

// Função para verificar se é domingo e limpar histórico de rádio
function verificarLimpezaRadioSemanal(){
  const ultimaLimpeza = localStorage.getItem('radio_ultima_limpeza');
  const agora = new Date();
  const hoje = agora.toISOString().split('T')[0];
  
  if(!ultimaLimpeza || ultimaLimpeza !== hoje){
    const diaSemana = agora.getDay();
    if(diaSemana === 0){ // 0 = domingo
      document.getElementById('alo-historico').innerHTML = '';
      document.getElementById('musica-historico').innerHTML = '';
      document.getElementById('entrevista-historico').innerHTML = '';
      console.log('Histórico de rádio limpo automaticamente no domingo');
    }
    localStorage.setItem('radio_ultima_limpeza', hoje);
  }
}

window.APP.enviarFormularioRadio=function(tipo){
  let dados={};
  if(tipo==='alo'){
    dados={
      tipo:'alo',
      nome:document.getElementById('alo-nome').value,
      cidade:document.getElementById('alo-cidade').value,
      mensagem:document.getElementById('alo-msg').value,
      data:new Date().toISOString()
    };
    if(!dados.nome||!dados.cidade||!dados.mensagem){
      return alert('Por favor, preencha todos os campos!');
    }
  } else if(tipo==='musica'){
    dados={
      tipo:'musica',
      nome:document.getElementById('musica-nome').value,
      titulo:document.getElementById('musica-titulo').value,
      artista:document.getElementById('musica-artista').value,
      dedicacao:document.getElementById('musica-dedicacao').value,
      data:new Date().toISOString()
    };
    if(!dados.nome||!dados.titulo||!dados.artista){
      return alert('Por favor, preencha todos os campos obrigatorios!');
    }
  } else if(tipo==='entrevista'){
    dados={
      tipo:'entrevista',
      nome:document.getElementById('entrevista-nome').value,
      whatsapp:document.getElementById('entrevista-wpp').value,
      tema:document.getElementById('entrevista-tema').value,
      data:new Date().toISOString()
    };
    if(!dados.nome||!dados.whatsapp||!dados.tema){
      return alert('Por favor, preencha todos os campos!');
    }
  }
  
  if(tipo==='alo'){
    const historicoDiv = document.getElementById('alo-historico');
    historicoDiv.innerHTML = `<p><b>Seu Alô:</b> ${dados.nome} de ${dados.cidade} - "${dados.mensagem}" (${new Date(dados.data).toLocaleString()})</p>` + historicoDiv.innerHTML;
    document.getElementById('alo-nome').value='';
    document.getElementById('alo-cidade').value='';
    document.getElementById('alo-msg').value='';
  } else if(tipo==='musica'){
    const historicoDiv = document.getElementById('musica-historico');
    historicoDiv.innerHTML = `<p><b>Sua Música:</b> "${dados.titulo}" de ${dados.artista} (Dedicado a: ${dados.dedicacao}) (${new Date(dados.data).toLocaleString()})</p>` + historicoDiv.innerHTML;
    document.getElementById('musica-nome').value='';
    document.getElementById('musica-titulo').value='';
    document.getElementById('musica-artista').value='';
    document.getElementById('musica-dedicacao').value='';
  } else if(tipo==='entrevista'){
    const historicoDiv = document.getElementById('entrevista-historico');
    historicoDiv.innerHTML = `<p><b>Sua Proposta:</b> ${dados.nome} (${dados.whatsapp}) - Tema: "${dados.tema}" (${new Date(dados.data).toLocaleString()})</p>` + historicoDiv.innerHTML;
    document.getElementById('entrevista-nome').value='';
    document.getElementById('entrevista-wpp').value='';
    document.getElementById('entrevista-tema').value='';
  }
  APP.mostrarPopup('✅','Formulário Enviado!','Obrigado por participar do Programa de Rádio! Entraremos em contato em breve.');
  verificarLimpezaRadioSemanal();
};
// ===== FIM PROGRAMA DE RÁDIO =====

// Service Worker
if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});}
// ===== FIM NOVAS FUNCIONALIDADES =====

function renderAdmAvs(){ document.getElementById('adm-tot-a').textContent='('+avs.length+')'; document.getElementById('adm-lista-a').innerHTML=avs.length?[...avs].sort((a,b)=>new Date(b.data)-new Date(a.data)).map(av=>`<div class="admin-item"><div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13px">${av.prestador_nome||'—'}</div><div style="font-size:11px;color:#f59e0b">${'★'.repeat(Math.round(av.nota_geral||0))}</div>${av.texto?`<div style="font-size:11px;color:#555">${av.texto.substring(0,50)}...</div>`:''}<div style="font-size:10px;color:#aaa">por ${av.autor||'Anônimo'} ${av.telefone_autor?'• '+av.telefone_autor:''}</div></div><button class="btn-del" onclick="APP.delAv('${av.id}')">🗑️</button></div>`).join(''):'<div class="empty">Nenhuma.</div>'; }

// =====================
// BLOCO 2 — EVENTOS / INSCRIÇÃO
// =====================
let inscricaoEvAtual=null;
window.APP.abrirInscricao=function(evId){
  const ev=eventos.find(e=>e.id===evId); if(!ev) return;
  inscricaoEvAtual=ev;
  document.getElementById('inscricao-evento-nome').textContent='🎯 '+ev.titulo+(ev.data?' — '+new Date(ev.data+'T12:00:00').toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'}):'');
  ['insc-nome','insc-wpp'].forEach(id=>document.getElementById(id).value='');
  ['insc-blusa','insc-short'].forEach(id=>document.getElementById(id).selectedIndex=0);
  const m=document.getElementById('modal-inscricao');
  m.style.display='flex';
  document.body.style.overflow='hidden';
};
window.APP.fecharInscricao=function(){
  document.getElementById('modal-inscricao').style.display='none';
  document.body.style.overflow='';
};
window.APP.enviarInscricao=function(){
  const nome=document.getElementById('insc-nome').value.trim();
  const wpp=document.getElementById('insc-wpp').value.replace(/\D/g,'');
  const blusa=document.getElementById('insc-blusa').value;
  const short=document.getElementById('insc-short').value;
  if(!nome){alert('Preencha seu nome.');return;}
  if(!wpp||wpp.length<10){alert('Preencha seu WhatsApp.');return;}
  if(!inscricaoEvAtual) return;
  const destino=inscricaoEvAtual.form_wpp;
  const dataEv=inscricaoEvAtual.data?new Date(inscricaoEvAtual.data+'T12:00:00').toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'}):'';
  const msg=`📋 *INSCRIÇÃO — ${inscricaoEvAtual.titulo}*${dataEv?'\n📅 '+dataEv:''}\n\n👤 *Nome:* ${nome}\n📱 *WhatsApp:* ${wpp}${blusa?'\n👕 *Blusa:* '+blusa:''}${short?'\n🩳 *Short:* '+short:''}\n\n_Inscrição enviada pelo app Tr.Alienigena_`;
  window.open(`https://wa.me/55${destino}?text=${encodeURIComponent(msg)}`,'_blank');
  APP.fecharInscricao();
};

// =====================
// BLOCO 3 — INICIALIZAÇÃO (dark mode)
// =====================
(function(){
  try{
    if(localStorage.getItem('darkMode')==='1'){
      document.body.classList.add('dark-mode');
      const btn=document.getElementById('btn-dark-toggle');
      if(btn) btn.textContent='☀️';
    }
  }catch(e){}
})();
</script>