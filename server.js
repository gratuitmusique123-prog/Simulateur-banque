'use strict';
// Banc de test uniquement : aucun paiement réel, aucune carte bancaire émise.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || '8787');
const TOKEN = process.env.SIM_BANK_TOKEN || '';
if (HOST !== '127.0.0.1' && HOST !== 'localhost' && !TOKEN) {
  console.error('Pour rendre le serveur accessible sur le réseau, configurez SIM_BANK_TOKEN.');
  process.exit(1);
}
const store = path.join(__dirname, 'bank-data.json');
const index = path.join(__dirname, 'index.html');
const initial = () => ({version:1,balanceCents:1000000,cards:[],transactions:[]});
const uuid = () => crypto.randomUUID();
let state;
try {
  state = JSON.parse(fs.readFileSync(store, 'utf8'));
  if (!state || state.version !== 1 || !Number.isSafeInteger(state.balanceCents) ||
      !Array.isArray(state.cards) || !Array.isArray(state.transactions)) state = initial();
} catch { state = initial(); }

function save() {
  fs.writeFileSync(store + '.tmp', JSON.stringify(state, null, 2));
  fs.renameSync(store + '.tmp', store);
}
function reply(res, status, obj) {
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'});
  res.end(JSON.stringify(obj));
}
function authorized(req) {
  if (!TOKEN) return true;
  const authorization = String(req.headers.authorization || '');
  if (!authorization.startsWith('Bearer ')) return false;
  const received = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(TOKEN);
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}
function validAmount(v) { return Number.isSafeInteger(v) && v > 0 && v <= 1000000000; }
async function body(req) {
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 100000) throw new Error('Corps de requête trop volumineux');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}
function apply(route, b) {
  if (route === '/api/cards') {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 3);
    state.cards.unshift({id:'SIM-' + uuid().toUpperCase(), createdAt:new Date().toISOString(),
      expires:expires.toISOString().slice(0,7),active:true});
  } else if (route === '/api/toggle') {
    const card = state.cards.find(c => c.id === b.cardId);
    if (!card) return {status:404,error:'Carte inconnue'};
    card.active = !card.active;
  } else if (route === '/api/credit') {
    if (!validAmount(b.amountCents) || state.balanceCents + b.amountCents > Number.MAX_SAFE_INTEGER)
      return {status:400,error:'Montant incorrect'};
    state.balanceCents += b.amountCents;
    state.transactions.unshift({id:uuid(),date:new Date().toISOString(),cardId:'',
      amountCents:b.amountCents,accepted:true,reason:'Crédit fictif'});
  } else if (route === '/api/pay') {
    if (!validAmount(b.amountCents) || typeof b.cardId !== 'string' ||
      typeof b.idempotencyKey !== 'string' || b.idempotencyKey.length < 1 ||
      b.idempotencyKey.length > 128) return {status:400,error:'Paramètres incorrects'};
    if (!state.transactions.some(t => t.key === b.idempotencyKey)) {
      const card = state.cards.find(c => c.id === b.cardId);
      const reason = !card ? 'Carte inconnue' : !card.active ? 'Carte bloquée' :
        String(b.pin) !== '1234' ? 'Code fictif incorrect' :
        b.amountCents > state.balanceCents ? 'Solde insuffisant' : null;
      if (!reason) state.balanceCents -= b.amountCents;
      state.transactions.unshift({id:uuid(),key:b.idempotencyKey,
        date:new Date().toISOString(),cardId:b.cardId,amountCents:b.amountCents,
        accepted:!reason,reason:reason || 'Paiement accepté'});
    }
  } else if (route === '/api/reset') {
    if (b.confirm !== 'RESET') return {status:400,error:'Confirmation nécessaire'};
    state = initial();
  } else return {status:404,error:'Route API inconnue'};
  state.transactions = state.transactions.slice(0,3000);
  save();
  return {status:200,data:state};
}

http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/api/status')
      return reply(res, 200, {ok:true,mode:'server',version:1,requiresToken:!!TOKEN});
    if (req.method === 'GET' && url.pathname === '/api/state')
      return authorized(req) ? reply(res,200,state) : reply(res,401,{error:'Clé du serveur requise'});
    if (url.pathname.startsWith('/api/')) {
      if (!authorized(req)) return reply(res,401,{error:'Clé du serveur requise'});
      if (req.method !== 'POST') return reply(res,405,{error:'Méthode incorrecte'});
      const result = apply(url.pathname,await body(req));
      return reply(res,result.status,result.error ? {error:result.error} : result.data);
    }
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8',
        'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
      return fs.createReadStream(index).pipe(res);
    }
    return reply(res,404,{error:'Page inexistante'});
  } catch (error) {
    console.error(error);
    return reply(res,400,{error:'Requête invalide'});
  }
}).listen(PORT,HOST,()=>console.log('Simulation Bank (TEST) : http://'+HOST+':'+PORT));
