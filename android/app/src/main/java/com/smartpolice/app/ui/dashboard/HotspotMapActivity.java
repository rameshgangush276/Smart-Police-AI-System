package com.smartpolice.app.ui.dashboard;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.smartpolice.app.R;
import com.smartpolice.app.api.RetrofitClient;
import com.smartpolice.app.api.ApiService;
import com.smartpolice.app.models.HotspotResponse;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HotspotMapActivity extends AppCompatActivity {

    private WebView webView;
    private String token;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_hotspot_map);

        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("🗺 Crime Hotspot Map");
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }

        token = getIntent().getStringExtra("OFFICER_TOKEN");
        webView = findViewById(R.id.map);

        WebSettings ws = webView.getSettings();
        ws.setJavaScriptEnabled(true);
        ws.setDomStorageEnabled(true);
        ws.setLoadWithOverviewMode(true);
        ws.setUseWideViewPort(true);
        webView.setWebViewClient(new WebViewClient());

        // Show loading map immediately
        webView.loadDataWithBaseURL("https://unpkg.com", buildMapHtml("[]"), "text/html", "UTF-8", null);
        fetchHotspots();
    }

    @Override
    public boolean onSupportNavigateUp() { finish(); return true; }

    private void fetchHotspots() {
        ApiService api = RetrofitClient.getRetrofitInstance().create(ApiService.class);
        api.getHotspots("Bearer " + token).enqueue(new Callback<HotspotResponse>() {
            @Override
            public void onResponse(Call<HotspotResponse> c, Response<HotspotResponse> r) {
                if (r.isSuccessful() && r.body() != null && r.body().isSuccess()) {
                    List<HotspotResponse.Hotspot> list = r.body().getData();
                    if (list == null || list.isEmpty()) {
                        Toast.makeText(HotspotMapActivity.this, "No crime data available", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    renderMap(list);
                } else {
                    Toast.makeText(HotspotMapActivity.this, "Error: " + r.code(), Toast.LENGTH_SHORT).show();
                }
            }
            @Override
            public void onFailure(Call<HotspotResponse> c, Throwable t) {
                Toast.makeText(HotspotMapActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void renderMap(List<HotspotResponse.Hotspot> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            HotspotResponse.Hotspot h = list.get(i);
            if (i > 0) sb.append(",");
            sb.append("{")
              .append("\"lat\":").append(h.getLatitude()).append(",")
              .append("\"lng\":").append(h.getLongitude()).append(",")
              .append("\"cat\":\"").append(esc(h.getCrimeCategory())).append("\",")
              .append("\"id\":\"").append(esc(h.getComplaintId())).append("\",")
              .append("\"loc\":\"").append(esc(h.getLocationDesc())).append("\"")
              .append("}");
        }
        sb.append("]");
        final String html = buildMapHtml(sb.toString());
        runOnUiThread(() -> webView.loadDataWithBaseURL(
                "https://unpkg.com", html, "text/html", "UTF-8", null));
    }

    private String esc(String s) {
        if (s == null) return "Unknown";
        return s.replace("\\","\\\\").replace("\"","\\\"").replace("\n"," ").replace("\r","");
    }

    private String buildMapHtml(String json) {
        return "<!DOCTYPE html><html><head>" +
        "<meta name='viewport' content='width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no'>" +
        "<link rel='stylesheet' href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'/>" +
        "<script src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'></script>" +
        "<style>" +
        " *{box-sizing:border-box;margin:0;padding:0;font-family:Arial,sans-serif;}" +
        " body{display:flex;flex-direction:column;height:100vh;background:#1a1a2e;}" +
        " #statsBar{display:flex;overflow-x:auto;padding:8px;gap:8px;background:#16213e;min-height:60px;align-items:center;}" +
        " .statChip{flex-shrink:0;display:flex;align-items:center;gap:4px;padding:6px 10px;" +
        "  background:#0f3460;border-radius:20px;color:#fff;font-size:11px;font-weight:bold;border:1px solid #334;}" +
        " .statChip .num{font-size:16px;font-weight:900;}" +
        " #mapContainer{flex:1;position:relative;}" +
        " #map{width:100%;height:100%;}" +
        " .crime-label{background:transparent;border:none;font-size:10px;font-weight:bold;color:#fff;" +
        "  text-shadow:0 0 3px #000,0 0 3px #000;white-space:nowrap;}" +
        " .leaflet-popup-content-wrapper{border-radius:12px;background:#16213e;color:#fff;}" +
        " .leaflet-popup-content{font-size:13px;line-height:1.5;}" +
        " .leaflet-popup-tip{background:#16213e;}" +
        " .popup-cat{font-size:15px;font-weight:bold;margin-bottom:4px;}" +
        " .popup-id{font-size:10px;color:#aaa;}" +
        " .popup-loc{font-size:11px;color:#ccc;margin-top:2px;}" +
        " #legend{position:absolute;bottom:10px;left:10px;z-index:1000;background:rgba(22,33,62,0.95);" +
        "  padding:10px;border-radius:12px;color:#fff;font-size:11px;border:1px solid #334;}" +
        " .leg-row{display:flex;align-items:center;gap:6px;margin:2px 0;}" +
        "</style></head><body>" +

        "<div id='statsBar'>" +
        "  <div class='statChip'><span class='num' id='totalCount'>...</span>Total</div>" +
        "  <div class='statChip' style='border-color:#9C27B0'>🟣<span class='num' id='ndpsCount'>0</span>NDPS</div>" +
        "  <div class='statChip' style='border-color:#F44336'>🔴<span class='num' id='armsCount'>0</span>Arms</div>" +
        "  <div class='statChip' style='border-color:#FF9800'>🟠<span class='num' id='assaultCount'>0</span>Assault</div>" +
        "  <div class='statChip' style='border-color:#FFC107'>🟡<span class='num' id='theftCount'>0</span>Theft</div>" +
        "  <div class='statChip' style='border-color:#E91E63'>🌸<span class='num' id='chainCount'>0</span>Chain</div>" +
        "</div>" +

        "<div id='mapContainer'>" +
        "  <div id='map'></div>" +
        "  <div id='legend'>" +
        "    <b>📋 Crime Legend</b>" +
        "    <div class='leg-row'>🔴 Arms Act</div>" +
        "    <div class='leg-row'>🟣 NDPS Act</div>" +
        "    <div class='leg-row'>🟠 Assault</div>" +
        "    <div class='leg-row'>🟡 Theft</div>" +
        "    <div class='leg-row'>🌸 Chain Snatching</div>" +
        "    <div class='leg-row'>🔵 Cyber/Fraud</div>" +
        "    <div class='leg-row'>⚫ Other</div>" +
        "  </div>" +
        "</div>" +

        "<script>" +
        "var data=" + json + ";" +

        // Crime config
        "var crimes={" +
        " 'ndps':    {emoji:'🟣',color:'#9C27B0',label:'NDPS Act'}," +
        " 'arms':    {emoji:'🔴',color:'#F44336',label:'Arms Act'}," +
        " 'assault': {emoji:'🟠',color:'#FF9800',label:'Assault'}," +
        " 'chain':   {emoji:'🌸',color:'#E91E63',label:'Chain Snatching'}," +
        " 'theft':   {emoji:'🟡',color:'#FFC107',label:'Theft'}," +
        " 'murder':  {emoji:'🔴',color:'#B71C1C',label:'Murder'}," +
        " 'robbery': {emoji:'🔴',color:'#D32F2F',label:'Robbery'}," +
        " 'cyber':   {emoji:'🔵',color:'#2196F3',label:'Cyber'}," +
        " 'fraud':   {emoji:'🔵',color:'#1565C0',label:'Fraud'}," +
        " 'other':   {emoji:'⚫',color:'#607D8B',label:'Other'}" +
        "};" +

        "function getCrime(cat){" +
        " if(!cat)return crimes.other;" +
        " var c=cat.toLowerCase();" +
        " if(c.includes('ndps'))return crimes.ndps;" +
        " if(c.includes('arms'))return crimes.arms;" +
        " if(c.includes('assault'))return crimes.assault;" +
        " if(c.includes('chain'))return crimes.chain;" +
        " if(c.includes('theft')||c.includes('house'))return crimes.theft;" +
        " if(c.includes('murder'))return crimes.murder;" +
        " if(c.includes('robbery'))return crimes.robbery;" +
        " if(c.includes('cyber'))return crimes.cyber;" +
        " if(c.includes('fraud'))return crimes.fraud;" +
        " return crimes.other;" +
        "}" +

        // Init map
        "var map=L.map('map',{zoomControl:true}).setView([28.6000,77.2090],11);" +
        "L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'," +
        " {maxZoom:19,attribution:'© OSM'}).addTo(map);" +

        // Count stats
        "var counts={ndps:0,arms:0,assault:0,theft:0,chain:0,total:0};" +

        // Plot markers
        "var bounds=[];" +
        "data.forEach(function(h){" +
        " if(!h.lat||!h.lng)return;" +
        " var cr=getCrime(h.cat);" +
        " var ll=[h.lat,h.lng];" +
        " bounds.push(ll);" +
        " counts.total++;" +
        " var c=h.cat?h.cat.toLowerCase():'';" +
        " if(c.includes('ndps'))counts.ndps++;" +
        " else if(c.includes('arms'))counts.arms++;" +
        " else if(c.includes('assault'))counts.assault++;" +
        " else if(c.includes('chain'))counts.chain++;" +
        " else if(c.includes('theft'))counts.theft++;" +

        // Pulsing circle zone
        " L.circle(ll,{radius:400,color:cr.color,fillColor:cr.color," +
        "  fillOpacity:0.18,weight:2,dashArray:'5,5'}).addTo(map);" +

        // Big emoji marker
        " var icon=L.divIcon({className:''," +
        "  html:'<div style=\"font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.7));\">'+" +
        "   cr.emoji+'</div>'," +
        "  iconSize:[30,30],iconAnchor:[15,15],popupAnchor:[0,-15]});" +

        " var m=L.marker(ll,{icon:icon}).addTo(map);" +

        // Popup
        " m.bindPopup(" +
        "  '<div class=popup-cat>'+cr.emoji+' '+h.cat+'</div>'" +
        "  +'<div class=popup-id>📋 '+h.id+'</div>'" +
        "  +'<div class=popup-loc>📍 '+(h.loc||'N/A')+'</div>'" +
        " );" +

        // Permanent label below marker
        " L.marker(ll,{icon:L.divIcon({className:'crime-label'," +
        "  html:'<div style=\"background:'+cr.color+';padding:2px 5px;border-radius:4px;" +
        "font-size:9px;font-weight:bold;color:#fff;margin-top:16px;white-space:nowrap;\">'" +
        "   +h.cat+'</div>'," +
        "  iconSize:[80,20],iconAnchor:[-5,-5]})}).addTo(map);" +
        "});" +

        // Update stats bar
        "document.getElementById('totalCount').textContent=counts.total;" +
        "document.getElementById('ndpsCount').textContent=counts.ndps;" +
        "document.getElementById('armsCount').textContent=counts.arms;" +
        "document.getElementById('assaultCount').textContent=counts.assault;" +
        "document.getElementById('theftCount').textContent=counts.theft;" +
        "document.getElementById('chainCount').textContent=counts.chain;" +

        // Fit map to all markers
        "if(bounds.length>0){map.fitBounds(bounds,{padding:[30,30]});}" +

        // Click on map shows coordinates (debug)
        "map.on('click',function(e){" +
        " L.popup().setLatLng(e.latlng)" +
        "  .setContent('📍 '+e.latlng.lat.toFixed(4)+', '+e.latlng.lng.toFixed(4))" +
        "  .openOn(map);" +
        "});" +

        "</script></body></html>";
    }
}
