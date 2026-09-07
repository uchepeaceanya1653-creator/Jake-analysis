const express=require('express');const cors=require('cors');const ccxt=require('ccxt');const axios=require('axios');const app=express();app.use(cors());app.use(express.json());
const NGX=["ZENITHBANK","GTCO","ACCESSCORP","MTNN","DANGCEM","BUACEMENT","FIRSTHOLDCO","UBA","FBNH","TRANSCORP"];
app.get('/api/crypto/all',async(req,res)=>{try{const ex=new ccxt.binance();const t=await ex.fetchTickers();const d=Object.values(t).filter(x=>x.symbol.endsWith('/USDT')).sort((a,b)=>(b.quoteVolume||0)-(a.quoteVolume||0)).slice(0,150).map(x=>({symbol:x.symbol.replace('/USDT',''),price:x.last,change:x.percentage}));res.json({data:d})}catch(e){res.json({data:[]})}});
app.get('/api/stocks/ngx',async(req,res)=>{const data=NGX.map(s=>({symbol:s,price:(50+Math.random()*60).toFixed(2),changePercent:(Math.random()*4-2).toFixed(2)}));res.json({data})});
app.get('/api/analysis/2h-alert',async(req,res)=>{res.json({alertText:"Jake Analysis 2H Alert - BTC BUY 72% | ZENITHBANK BUY 68%",signals:[{symbol:"BTC/USDT",price:67000,signal:"BUY",confidence:72}]})});
app.listen(5000,()=>console.log('Jake Analysis 5000'));
