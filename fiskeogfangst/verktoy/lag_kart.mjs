// Lager kystlinja til oversiktskartet (src/js/fig/kart-data.js).
// Kjøres bare hvis kartutsnittet skal endres:
//   npm install world-atlas@2 d3-geo@3 topojson-client@3 topojson-simplify@3
//   node verktoy/lag_kart.mjs
// Kilde: Natural Earth 1:10m via world-atlas (fri bruk, public domain).
import fs from 'fs';
import {geoMercator, geoPath, geoClipRectangle} from 'd3-geo';
import {feature} from 'topojson-client';
import {presimplify, simplify, quantile} from 'topojson-simplify';

const topo = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-10m.json'));
const pre = presimplify(topo);
const simp = simplify(pre, quantile(pre, 0.965));
const land = feature(simp, simp.objects.countries);
const W = 600, H = 760;
// Mercator – samme projeksjon som sjøkartet.
const ramme = {type:'Feature',geometry:{type:'Polygon',coordinates:[[[0.5,57.7],[0.5,72.6],[33.5,72.6],[33.5,57.7],[0.5,57.7]]]}};
const proj = geoMercator().fitSize([W,H], ramme);
const clip = geoClipRectangle(0,0,W,H);
const path = geoPath({stream: s => proj.stream(clip(s))});
const land_ = {'Norway':'no','Sweden':'se','Finland':'fi','Russia':'ru','Denmark':'dk','United Kingdom':'uk'};
const ut = {W,H};
for (const f of land.features){
  const k = land_[f.properties.name]; if(!k) continue;
  const polys = f.geometry.type==='MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
  const behold = polys.filter(c => path.area({type:'Polygon',coordinates:c}) > (k==='no'?2.5:12));
  let d = path({type:'MultiPolygon',coordinates:behold}); if(!d) continue;
  ut[k] = d.replace(/(\d+)\.\d+/g,'$1').replace(/L(\d+),(\d+)(?=L\1,\2)/g,'');
}
const p = ll => proj(ll).map(v => +v.toFixed(1));
// Etappene på kursen – én havn per modul.
ut.etapper = [
  ['Bud',[6.91,62.91]],['Kristiansund',[7.73,63.11]],['Sula',[8.47,63.85]],['Rørvik',[11.24,64.86]],
  ['Brønnøysund',[12.21,65.47]],['Træna',[12.10,66.50]],['Bodø',[14.40,67.28]],['Røst',[12.07,67.52]],
  ['Henningsvær',[14.20,68.15]],['Andenes',[16.12,69.32]],['Tromsø',[18.95,69.65]],['Torsvåg',[19.50,70.25]],
  ['Hasvik',[22.15,70.49]],['Hammerfest',[23.68,70.66]],['Honningsvåg',[25.97,70.98]],['Mehamn',[27.85,71.04]],
  ['Båtsfjord',[29.72,70.63]],['Vardø',[31.10,70.37]]
].map(([n,ll]) => [n, ...p(ll)]);
// Punkter til andre kart
ut.sted = Object.fromEntries(Object.entries({
  hustadvika:[7.0,62.95], lofoten:[13.6,68.0], vesteralen:[15.0,68.8], tromso:[18.95,69.65], bergen:[5.32,60.39],
  alesund:[6.15,62.47], stad:[5.1,62.19], finnmark:[26,70.7], barentshavet:[30,72.2], norskehavet:[4,66.5],
  nordsjoen:[3.2,58.6], trondheim:[10.39,63.43], bodo:[14.40,67.28], vardo:[31.10,70.37], egersund:[6.0,58.45],
  maloy:[5.11,61.93], kristiansund:[7.73,63.11], hammerfest:[23.68,70.66]
}).map(([k,ll]) => [k, p(ll)]));
ut.bredde = [58,60,62,64,66,68,70,72].map(b => [b, p([10,b])[1]]);
ut.lengde = [0,5,10,15,20,25,30].map(l => [l, p([l,65])[0]]);
fs.writeFileSync('src/js/fig/kart-data.js',
  '// Generert av verktoy/lag_kart.mjs – Natural Earth 1:10m, Mercator.\nFF.kartdata = ' + JSON.stringify(ut) + ';\n');
console.log('kart-data.js', fs.statSync('src/js/fig/kart-data.js').size, 'byte');
