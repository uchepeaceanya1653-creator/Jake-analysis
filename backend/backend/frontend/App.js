import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import axios from 'axios';

const BACKEND_URL = 'https://jake-analysis.onrender.com';
const TASK = 'jake-analysis-2h';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true })
});

TaskManager.defineTask(TASK, async () => {
  try {
    const res = await axios.get(`${BACKEND_URL}/api/analysis/2h-alert`);
    await Notifications.scheduleNotificationAsync({
      content: { title: '📊 Jake Analysis 2H', body: res.data.alertText.substring(0,200), sound: true },
      trigger: null
    });
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch(e){ return BackgroundFetch.BackgroundFetchResult.Failed; }
});

export default function App(){
  const [crypto, setCrypto] = useState([]);
  const [ngx, setNgx] = useState([]);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    (async()=>{
      await Notifications.requestPermissionsAsync();
      await BackgroundFetch.registerTaskAsync(TASK, { minimumInterval: 7200, stopOnTerminate:false, startOnBoot:true });
    })();
    fetchAll();
  },[]);

  const fetchAll = async ()=>{
    setLoading(true);
    try{
      const [cRes, nRes, aRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/crypto/all`).catch(()=>({data:{data:[]}})),
        axios.get(`${BACKEND_URL}/api/stocks/ngx`).catch(()=>({data:{data:[]}})),
        axios.get(`${BACKEND_URL}/api/analysis/2h-alert`).catch(()=>({data:{signals:[]}}))
      ]);
      setCrypto(cRes.data.data.slice(0,100));
      setNgx(nRes.data.data || []);
      setSignals(aRes.data.signals || []);
    }catch(e){}
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll}/>}>
      <Text style={styles.title}>JAKE ANALYSIS</Text>
      <Text style={styles.sub}>All Altcoins + All Stocks • 2H Alerts</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🤖 Top AI Signals</Text>
        {signals.slice(0,10).map((s,i)=>(
          <View key={i} style={styles.row}><Text style={styles.symbol}>{s.symbol.replace('/USDT','')}</Text><Text>${s.price}</Text><Text style={s.signal==='BUY'?styles.buy:s.signal==='SELL'?styles.sell:styles.hold}>{s.signal} {s.confidence}%</Text></View>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>₿ All Altcoins (Top 100)</Text>
        {crypto.slice(0,30).map((c,i)=>(
          <View key={i} style={styles.row}><Text style={styles.symbol}>{c.symbol}</Text><Text>${c.price}</Text><Text style={c.change24h>=0?styles.green:styles.red}>{c.change24h?.toFixed(2)}%</Text></View>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🇳🇬 NGX All Stocks</Text>
        {ngx.slice(0,20).map((s,i)=>(
          <View key={i} style={styles.row}><Text style={styles.symbol}>{s.symbol}</Text><Text>N{s.price}</Text><Text style={s.changePercent>=0?styles.green:styles.red}>{s.changePercent}%</Text></View>
        ))}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#0a0a0a', padding:16, paddingTop:50 },
  title:{ color:'#fff', fontSize:28, fontWeight:'900' },
  sub:{ color:'#888', marginBottom:20 },
  card:{ backgroundColor:'#1a1a1a', borderRadius:12, padding:16, marginBottom:16 },
  cardTitle:{ color:'#fff', fontWeight:'700', marginBottom:12 },
  row:{ flexDirection:'row', justifyContent:'space-between', paddingVertical:8, borderBottomWidth:1, borderBottomColor:'#222' },
  symbol:{ color:'#fff', fontWeight:'600' },
  buy:{ color:'#00ff88', fontWeight:'700' }, sell:{ color:'#ff4444', fontWeight:'700' }, hold:{ color:'#ffaa00', fontWeight:'700' },
  green:{ color:'#00ff88' }, red:{ color:'#ff4444' }
});
