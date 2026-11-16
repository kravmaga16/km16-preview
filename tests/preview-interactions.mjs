import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
const html=readFileSync('index.html','utf8');
const source=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(source,'Script de la maquette absent');
const nodes={};
function node(id){return nodes[id]??={id,value:'',hidden:false,textContent:'',listeners:{},addEventListener(type,fn){this.listeners[type]=fn},focus(){this.focused=true}}}
const cards=[{dataset:{name:'camille exemple',status:'active'}},{dataset:{name:'alex test',status:'pending'}}];
for(const card of cards){card.hidden=false;card.details=[{open:false},{open:false}];card.button={textContent:'Déplier la fiche',attributes:{},listeners:{},addEventListener(type,fn){this.listeners[type]=fn},setAttribute(k,v){this.attributes[k]=v}};card.querySelector=(s)=>s==='.toggle-details'?card.button:null;card.querySelectorAll=()=>card.details}
nodes['status-filter']=node('status-filter');nodes['status-filter'].value='all';
const document={getElementById:node,querySelectorAll:(selector)=>selector==='.profile'?cards:[]};
runInNewContext(source,{document});
assert.equal(node('count').textContent,'','The counter is populated only after the first filter interaction');
node('search').value='';node('search').listeners.input();
assert.equal(node('count').textContent,'2 fiches fictives affichées');
node('search').value='CAMILLE';node('search').listeners.input();
assert.deepEqual(cards.map(x=>x.hidden),[false,true]);
node('search').value='';node('status-filter').value='pending';node('status-filter').listeners.change();
assert.deepEqual(cards.map(x=>x.hidden),[true,false]);
cards[1].button.listeners.click();
assert.ok(cards[1].details.every(x=>x.open));
assert.equal(cards[1].button.attributes['aria-expanded'],'true');
cards[1].button.listeners.click();
assert.ok(cards[1].details.every(x=>!x.open));
node('reset').listeners.click();
assert.deepEqual(cards.map(x=>x.hidden),[false,false]);
assert.equal(node('status-filter').value,'all');
console.log('Tests fonctionnels KM16 Preview reussis');
