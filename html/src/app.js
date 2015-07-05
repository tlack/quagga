/** @jsx m */
'use strict';
import m from 'mithril'
window.m=m;
import wscon from './wscon'
import {deserialize,serialize} from '../vendor/c.module'
import {
  cl,ce,uuid,fmt,
  EHREF,
  ARROW_UP,
  ARROW_DOWN,
  pd,
  noop,
  ab2str
} from './util'
import viewFn from './app.view';

var Status = { view: (ctrl,args) =>
  <div {...args}><h1>nothing in status yet</h1></div> }

var q = {
  controller: function(args){
    var _this=this;
    var MAXQ = 100;
    var waitq={};
    var ws=new WebSocket('ws://'+window.location.host); ws.binaryType='arraybuffer';
    this.ws=ws;
    this.handlers = {};
    this.registerHandler = function (tag, cb) { handlers[tag]=cb; }
    ws.onopen=function(e){cl(e);q.vm.ui('Websocket connected');m.redraw();
      // ws.send("here[]");
    };
    ws.onclose=function(e){cl(e); q.vm.ui('Websocket closed');};
    ws.onerror=function(e){cl(e); q.vm.ui('Websocket error');};
    ws.onmessage=function(e){
      var d = deserialize(e.data);
      cl(d);
      switch (d[0]) {
        case'q':      q.vm.oq(d[1].expr, d[2]); q.vm.jumpDown(true); break;
        case'state':  q.vm.dirContents(d[1]); m.redraw();  break;
        case'dump':   q.vm.link(d.dump); break;
      }
    }
    this.send=(qexpr,cb) => {
        cl(["sendwait",qexpr,cb]);
        if (Object.keys(waitq).length>MAXQ || qexpr.match('/(^|\")ID:')) return; // avoid cycles
        var u=uuid();
        waitq[u]=cb;
        var serializedReq = serialize({qid:u, expr:' '+qexpr});
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
    ui: (msg) => { q.vm.msgs(q.vm.msgs().concat({o:msg})) },
    oq: (expr,res) => { q.vm.msgs(q.vm.msgs().concat({i:expr,o:res})); m.redraw(); },
    msgs: m.prop([]), // array of {i:str o:any}
    cmdHist: [],
    cmdHistIdx: m.prop(0),
    stashCmd: m.prop(''),
    jumpDown:m.prop(false),

    dirContents: m.prop({}),    

    statusOpen: m.prop(false),
    dirOpen: m.prop(false),
    uiDirection: m.prop('column'),
    uiDark: m.prop(true),

    // toggleStatus: () => q.vm.statusOpen(!q.vm.statusOpen()),
    toggleStatus: () => q.ws.send(serialize({u:uuid(), dump:true})),
    toggleDir: () => q.vm.dirOpen(!q.vm.dirOpen()),
    toggleUiDirection: () => q.vm.uiDirection(q.vm.uiDirection()=='column'?'row':'column'),
    toggleUiColor: () => q.vm.uiDark(!q.vm.uiDark()),

    link: m.prop(''),

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
  view: viewFn
}
window.q = q;
        // <Terminal msgs={msgs} aM={vm.ui}/>

function quagga() {
  var $i, $o, $scl, $ui, state, ws;
        // low level functions:
  function kd(ev) {
    console.log(ev);
    if (ev.keyCode==10||ev.keyCode==13) {
      sendi();
    }
  }
  function qesc(data) {
    return data.replace('"', '\\"', data);
  }
  function setstate(data) {
    state=data;
  }
  // higher level stuff

  // handle 'error responses from server
  function error(resp) {
    // try to 'parse' whatever user entered
    cl(['error',resp]);
    ws.sendwait('parse "'+qesc(resp[1])+'"', function(result) {
      console.log('error parse');
      oq({error: resp[0], line: resp[1], parse: result});
    });
  }
  var throbber = {
    if_: function(on, classes) {
      var classes=classes.split(' ');
      classes.forEach(function(cl) {
        var cb = on ? function(cl){$scl.add(cl)} : function(cl){$scl.remove(cl)};
        cb();
      });
    },
    pulse: function(on) {
      this.if_(on, 'animated infinite pulse');
    },
    sending: function(on) {
      this.if_(on, 'animated infinite pulse sending');
    }
  }
  var pub = {
    boot: function boot() {
      $scl = $$('.status').classList;
      $ui = $$('#ui');
      $ui.addEventListener('submit', input.send, true);
      wscon();
    }
  }
  return pub;
}

// debugger;
m.mount(document.getElementById('app'), q);
