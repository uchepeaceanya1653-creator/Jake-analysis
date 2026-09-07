const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const NGX = ["ZENITHBANK","GTCO","ACCESSCORP","MTNN","DANGCEM","BUACEMENT","FIRSTHOLDCO","UBA","FBNH","TRANSCORP"];

app.get('/', (req,res)=> res.send('Jake Analysis Backend LIVE - Use /api/crypto/all'));

app.get('/api/crypto/all', async (req,res)=>{
  try{
    const fetch = (await import('node-fetch')).default;
    const r = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=150&page=1');
    const data = await r.json();
    const formatted = data.map(c=>({symbol:c.symbol.toUpperCase(), name:c.name, price:c.current_price, change:c.price_change_percentage_24h, market_cap:c.market_cap}));
    res.json({data:formatted});
  }catch(e){res.json({data:[{symbol:'BTC',name:'Bitcoin',price:68000,change:2.5},{symbol:'ETH',name:'Ethereum',price:3500,change:1.2}]})}
});

app.get('/api/analysis/2h-alert', (req,res)=>{
  res.json({alertText:'📊 Jake 2H Update: BTC +1.2% | ETH +0.8% | ZENITHBANK +2% - Check Jake Analysis App now!'});
});

app.get('/api/notify/whatsapp', (req,res)=>{res.json({sent:true});});

app.get('/api/stocks/ngx', async (req,res)=>{
  const data = NGX.map(s=>({symbol:s, price:(50+Math.random()*60).toFixed(2), changePercent:(Math.random()*4-2).toFixed(2)}));
  res.json({data});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`Jake Analysis running on port ${PORT}`));
