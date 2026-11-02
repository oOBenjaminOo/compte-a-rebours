const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
class Element {
  constructor() { this.children=[]; this.attributes={}; this.style={setProperty: (k,v)=>this.attributes[k]=v}; this.classList={toggle(){},add(){},remove(){}}; }
  append(...items) { for(const item of items){item.parent=this;this.children.push(item);} }
  replaceChildren(){this.children=[];}
  setAttribute(k,v){this.attributes[k]=v;}
  querySelector(){return this.board;}
  querySelectorAll(){return [];}
  remove(){this.parent.children=this.parent.children.filter(x=>x!==this);}
}
function setup(blocked=false) {
  const memory=new Map(), events={};
  const window={localStorage:{getItem:k=>memory.get(k)??null,setItem(k,v){if(blocked)throw Error('blocked');memory.set(k,v);},removeItem(k){if(blocked)throw Error('blocked');memory.delete(k);}},addEventListener:(k,f)=>events[k]=f,clearTimeout(){},setTimeout(){return 1;},matchMedia:()=>({matches:true})};
  const context=vm.createContext({window,Element,document:{readyState:'complete',createElement:()=>new Element(),querySelectorAll:()=>[]}});
  for(const f of ['config.js','countdown.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),context);
  const root=new Element();root.board=new Element();
  return {window,memory,events,clock:new window.FlipCountdown(root)};
}
test('default, save, invalid input and reset',()=>{
  const {window}=setup(), s=window.CountdownSettings;
  assert.equal(s.getTarget(),s.defaultTarget);
  s.saveTarget('2030-01-01T00:00:00Z');assert.equal(s.getTarget(),'2030-01-01T00:00:00Z');
  assert.throws(()=>s.saveTarget('invalid'));
  s.resetTarget();assert.equal(s.getTarget(),s.defaultTarget);
});
test('corrupt stored value falls back to default',()=>{
  const {window,memory}=setup(),s=window.CountdownSettings;
  memory.set(s.storageKey,'broken');assert.equal(s.getTarget(),s.defaultTarget);
});
test('storage writes report failures',()=>{
  const {window}=setup(true);assert.throws(()=>window.CountdownSettings.saveTarget('2030-01-01'));
});
test('past target stops at zero',()=>{
  const {clock}=setup();clock.setTarget('2000-01-01');assert.equal(clock.getRemaining().totalSeconds,0);assert.equal(clock.finished,true);
});
test('days are never truncated and slots shrink when resetting',()=>{
  const {clock}=setup();clock.setTarget(new Date(Date.now()+123*86400000+5000).toISOString());
  assert.equal(clock.slots[0].digits.map(d=>d.value).join(''),'123');
  assert.equal(clock.board.attributes['--hc-cols'],9);
  clock.setTarget('2000-01-01');assert.equal(clock.slots[0].digits.length,2);
});
test('remaining time splits into days, hours, minutes and seconds',()=>{
  const {clock}=setup();clock.target=new Date(Date.now()+((2*86400+3*3600+4*60+5)*1000));
  const r=clock.getRemaining();assert.equal(r.days,2);assert.equal(r.hours,3);assert.equal(r.minutes,4);assert.ok(r.seconds>=4&&r.seconds<=5);
});
test('storage clear event updates existing counters',()=>{
  const {window,events,clock}=setup();let calls=0;
  // Listener queries the live document, as a real page would.
  const contextRoot={__flipCountdown:{setTarget(){calls++;}}};
  // This branch is covered through a separate isolated listener context.
  const context=vm.createContext({window,Element,document:{readyState:'complete',querySelectorAll:()=>[contextRoot]}});
  contextRoot.__flipCountdown=clock;clock.setTarget=()=>calls++;
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..','countdown.js'),'utf8'),context);
  events.storage({key:null});assert.equal(calls,1);
  events.storage({key:'unrelated'});assert.equal(calls,1);
});
