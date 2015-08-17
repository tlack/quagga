/** @jsx m */
'use strict';
import m from 'mithril'
window.m=m;
import wscon from './wscon'
// import {deserialize,serialize} from '../vendor/c.module'
const serialize = JSON.stringify;
const deserialize = JSON.parse;
import {
  cl,
  ce,
  uuid,
  fmt,
  EHREF,
  ARROW_UP,
  ARROW_DOWN,
  pd,
  noop,
  ab2str,
  LS_KEY,
  getToken
} from './util'

var USER_TOKEN = JSON.parse(localStorage[LS_KEY]||"{}");

var q = {
  controller: function(args){
    var ctrl = this;
    var MAXQ = 100;
    var waitq={};
    var ws=new WebSocket('ws://'+window.location.host); ws.binaryType='arraybuffer';
    this.ws=ws;
    this.handlers = {};
    this.registerHandler = function (tag, cb) { handlers[tag]=cb; }
    this.handleConnect = function(token) {
      USER_TOKEN = token;
      var current_workspace = USER_TOKEN.workspaces[0];
      USER_TOKEN.current_wid = current_workspace.wid;
      q.vm.wsName(current_workspace.name);
      localStorage[LS_KEY] = JSON.stringify(token);
      m.redraw();
    }
    ws.onopen=function(e){cl(e);q.vm.ui('Websocket connected');m.redraw();
      ws.send(serialize(Object.assign(USER_TOKEN,{type:"connect"})));
    };
    ws.onclose=function(e){cl(e); q.vm.ui('Websocket closed');};
    ws.onerror=function(e){cl(e); q.vm.ui('Websocket error');};
    ws.onmessage=function(e){
      var d = deserialize(e.data);
      cl(d);
      switch (d.type) {
        case'eval':     q.vm.oq(d.in, d.out); q.vm.jumpDown(true); break;
        case'state':    q.vm.dirContents(d[1]); m.redraw();  break;
        case'dump':     q.vm.link(d.dump); break;
        case'connect':  ctrl.handleConnect(d);break;
        case'reload':   window.location.reload();break;
        default:        q.vm.ui(e.data);
      }
    }
    this.send=(qexpr,cb) => {
        cl(["sendwait",qexpr,cb]);
        if (Object.keys(waitq).length>MAXQ || qexpr.match('/(^|\")ID:')) return; // avoid cycles
        var u=uuid();
        waitq[u]=cb;
        debugger;
        var serializedReq = JSON.stringify({
          type:'eval', wid:USER_TOKEN['current_workspace'], uid:u, expr:' '+qexpr});
        cl(ab2str(serializedReq));
        ws.send(serializedReq);
    }
    q.ws=this.ws;
    this.submit=(e) => {e.preventDefault();var expr=q.vm.cmd();
      if(!expr)return;
      q.vm.cmd('');
      q.vm.cmdHistIdx(q.vm.cmdHist.push(expr));
      this.send(expr)}
    return this;
  },
  vm: {
    cmd:m.prop(''),
    ui: (msg) => { q.vm.msgs(q.vm.msgs().concat({o:msg})); m.redraw(); },
    oq: (expr,res) => { q.vm.msgs(q.vm.msgs().concat({i:expr,o:res})); m.redraw(); },
    msgs: m.prop([]), // array of {i:str o:any}
    cmdHist: [],
    cmdHistIdx: m.prop(0),
    stashCmd: m.prop(''),
    jumpDown:m.prop(false),
    wsName: m.prop(''),

    dirContents: m.prop({}),    

    statusOpen: m.prop(false),
    dirOpen: m.prop(false),
    uiVertical: m.prop('column'),
    uiDark: m.prop(false),

    toggleStatus: () => q.vm.statusOpen(!q.vm.statusOpen()),
    toggleDir: () => q.vm.dirOpen(!q.vm.dirOpen()),
    toggleUiColor: () => q.vm.uiDark(!q.vm.uiDark()),
    toggleUiVertical: () => q.vm.uiVertical(!q.vm.uiVertical()),
    // takeDump: () => q.ws.send(serialize({u:uuid(), dump:true})),

    handleHistory: (e) => {
      var cmdHistIdx=q.vm.cmdHistIdx;var cmdHist=q.vm.cmdHist;var d=0;
      switch (e.keyCode) {
        case ARROW_UP:   d=(-1);break;
        case ARROW_DOWN: d=1;   break;
        default: cl('NOT MY JOB!');return;}
      var nIdx=cmdHistIdx()+d;
      if(e.keyCode==ARROW_UP&&cmdHistIdx()==cmdHist.length) {cl('stashing: '+q.vm.cmd());q.vm.stashCmd(q.vm.cmd())};
      cmdHistIdx(nIdx); // always save a position change
      if(e.keyCode==ARROW_DOWN&&nIdx==cmdHist.length) { q.vm.cmd(q.vm.stashCmd()); return}
      if(0<=nIdx&&nIdx<cmdHist.length)                { q.vm.cmd(cmdHist[nIdx]);   return}
      // cl({up:e.keyCode==ARROW_UP,down:e.keyCode==ARROW_DOWN,nidx:nIdx,cmdlen:cmdHist.length,stash:q.vm.stashCmd()})
    }
  },
  view: require('./app.view')
}
export default q;
m.mount(document.getElementById('app'), q);
