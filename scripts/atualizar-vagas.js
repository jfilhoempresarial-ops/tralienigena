// scripts/atualizar-vagas.js
//
// Busca as vagas de transporte do SINE/IDT direto do servidor (sem CORS,
// sem proxy de terceiros) e grava o resultado em vagas.csv na raiz do repo.
// Esse arquivo é lido pelo app (VAGAS_CSV_URL) como fonte de dados das vagas.
//
// Roda via GitHub Actions (.github/workflows/atualizar-vagas.yml), 2x ao dia.

import { writeFile } from 'fs/promises';
import * as cheerio from 'cheerio';

const IDT_URL = 'https://idt.org.br/vagas-disponiveis';
const OUTPUT_FILE = 'vagas.csv';

const PALAVRAS_TRANSPORTE = [
  'motorista', 'caminhão', 'caminhoneiro', 'carreta', 'carreteiro',
  'caçambeiro', 'bitrem', 'basculante', 'guincho', 'munk', 'guindaste',
  'ajudante de motorista', 'ajudante de carga', 'ajudante de descarga',
  'carregador e descarregador',
  'operador de retro', 'retroescavadeira', 'retro-escavadeira',
  'operador de máquina', 'operador de máquinas de construção',
  'operador de trator', 'motofretista', 'motoboy',
  'fiscal de transporte', 'controlador de tráfego',
  'manobrador', 'manobrista', 'ônibus', 'condutor',
  'operador de balanças rodoviárias',
];
const EXCLUIR_TRANSPORTE = ['estoquista', 'almoxarife'];

function parseCidade(txt) {
  const raw = txt.split(/[\n\r]/)[0].replace(/[*]/g, '').trim();
  if (raw.includes(':')) {
    const partes = raw.split(':');
    const base = partes[0].trim();
    const bairro = partes[1].split(/[-–]/)[0].split('/')[0].trim();
    return {
      base,
      nome: base.charAt(0) + base.slice(1).toLowerCase() + ' - ' + bairro.charAt(0) + bairro.slice(1).toLowerCase(),
    };
  }
  const clean = raw.split(/[-–\s]+(?:Rua|Av\.|Fone|R\.)/)[0].trim();
  return { base: clean, nome: clean.charAt(0) + clean.slice(1).toLowerCase() };
}

function csvField(value) {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

async function main() {
  console.log(`Buscando vagas em ${IDT_URL} ...`);
  const resp = await fetch(IDT_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TrAlienigenaBot/1.0)' },
    signal: AbortSignal.timeout(20000),
  });
  if (!resp.ok) throw new Error(`Falha ao acessar IDT: HTTP ${resp.status}`);
  const html = await resp.text();
  if (!html.includes('OCUPAÇÕES') && !html.includes('SOBRAL')) {
    throw new Error('Página do IDT não tem o formato esperado (sem "OCUPAÇÕES"/"SOBRAL"). O site pode ter mudado de layout.');
  }

  const $ = cheerio.load(html);
  const itens = [];
  let cidadeAtual = '', cidadeBase = '', emailAtual = '', enderecoAtual = '', foneAtual = '';

  $('table tr').each((_, tr) => {
    const tds = $(tr).find('td');
    if (!tds.length) return;
    const txt = $(tds[0]).text().trim();

    if (tds.length === 1 && txt && !txt.includes('OCUPAÇÕES') && !txt.includes('Total') && !txt.includes('PESSOA COM')) {
      const pc = parseCidade(txt);
      if (pc.base.length > 1 && pc.base.length < 60) {
        cidadeBase = pc.base;
        cidadeAtual = pc.nome;
        const endM = txt.match(/(?:Rua|Av\.|Avenida|Praça|R\.|Al\.)[^\n\r,]*/i);
        enderecoAtual = endM ? endM[0].trim() : '';
        const foneM = txt.match(/(?:Fone|Tel|Telefone)[:\s]*\(?\d{2}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}/i);
        foneAtual = foneM ? foneM[0].replace(/(?:Fone|Tel|Telefone)[:\s]*/i, '').trim() : '';
        const emM = txt.match(/[\w.-]+@[\w.-]+\.[\w]+/);
        emailAtual = emM ? emM[0] : '';
      }
      return;
    }

    if (tds.length >= 2) {
      const cargo = $(tds[0]).text().trim().toLowerCase();
      const qtd = parseInt($(tds[1]).text().trim(), 10) || 0;
      if (!cargo || !qtd || cargo === 'ocupações' || cargo.startsWith('total')) return;
      const ok = PALAVRAS_TRANSPORTE.some((p) => cargo.includes(p)) && !EXCLUIR_TRANSPORTE.some((p) => cargo.includes(p));
      if (ok && cidadeAtual) {
        itens.push({
          cidade: cidadeAtual,
          cargo: cargo.charAt(0).toUpperCase() + cargo.slice(1),
          total: qtd,
          telefone: foneAtual,
          endereco: enderecoAtual,
          email: emailAtual,
        });
      }
    }
  });

  if (!itens.length) {
    throw new Error('Nenhuma vaga de transporte encontrada — confira se o layout do site do IDT mudou.');
  }

  const header = 'cidade,cargo,total,telefone,endereco,email';
  const linhas = itens.map((v) =>
    [v.cidade, v.cargo, v.total, v.telefone, v.endereco, v.email].map(csvField).join(',')
  );
  const csv = [header, ...linhas].join('\n') + '\n';

  await writeFile(OUTPUT_FILE, csv, 'utf8');
  const totalVagas = itens.reduce((s, v) => s + v.total, 0);
  console.log(`OK: ${itens.length} ocupações de transporte (${totalVagas} vagas) gravadas em ${OUTPUT_FILE}.`);
}

main().catch((err) => {
  console.error('Erro ao atualizar vagas:', err.message);
  process.exit(1);
});
