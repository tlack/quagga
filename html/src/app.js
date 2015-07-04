/** @jsx m */
'use strict'
import m from 'mithril'
import wscon from './wscon'
// import History from './History'
const EHREF='javascript:;'

var cl=console.log.bind(console)
var _fmt = {
  'array': function(d) {
    return <div>
      <span>`array[${d.length}]`:</span>
      <ol>
        {d.map(fmt).map((d1)=>
          <li>{d1}</li>
        )}
      </ol>
    </div>
  },
  'number': function(d) {
    return d
  },
  'object': function(d) {
    return <div>
      <span>{"dict["+(Object.keys(d).length)+"]:"}</span>
      <table className='obj'>
        {Object.keys(d).map((k) => 
          <tr><th>{fmt(k)}</th><td>{fmt(d[k])}</td></tr>
        )}
      </table>
    </div>
  },
  'string': htmlesc
}
function fmt(data) {
  var t=typeof data;
  if (data instanceof Array) t='array';
  console.log('fmt', data);
  if (data===null) return 'null';
  return (t in _fmt)?_fmt[t](data):'no handler '+t;
}
function htmlesc(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
var Terminal = {
  view: (ctrl,args) => {
    return <div>
      {args.msgs().map((c)=> {
        return <div>
          {c.i!=null&&fmt(c.i)}
          <br/>
          {c.o!=null&&fmt(c.o)}
        </div>
      })}
    </div>
  }
}
var Dir = { view: (args) =>
  <div className={'pane '+(args.open&&'open')}><h1>nothing in dir yet</h1></div> }
var Status = { view: (args) =>
  <div className={'pane '+(args.open&&'open')}><h1>nothing in status yet</h1></div> }
var quapp = {
  controller:function(args){this.vm=quapp.vm;return this;},
  vm: {
    ui: (msg) => quapp.vm.msgs(quapp.vm.msgs().concat(m)),
    msgs: m.prop([{i:'weeee',o:'que loser'}]),
    pane: m.prop()
  },
  view: (ctrl) => {
    if (!('WebSocket' in window))
      return <h1>quagga needs websocket support in your browser, which you do not appear to have</h1>;

    var {vm} = ctrl;
    var {msgs,pane} = vm;

    return <div>
      <div id="nav">
        <i onclick={pane.bind(vm,'status')} className="status fa fa-cloud"></i>
        <i onclick={pane.bind(vm,'terminal')} className="terminal fa fa-terminal"></i>
        <i onclick={pane.bind(vm,'dir')} className="dir fa fa-sitemap"></i>
      </div>
      <Status/>
      <Dir/>
      <Terminal msgs={msgs} />
    </div>
  }
}

function quagga() {
  var MAXQ = 100;
  var $i, $o, $scl, $ui, state, ws;
  // low level functions:
  function kd(ev) {
    console.log(ev);
    if (ev.keyCode==10||ev.keyCode==13) {
      sendi();
    }
  }
  function ui(html,cl) {
    var div = document.createElement('div');
    div.classList.add(cl?cl:'o');
    div.innerHTML = html;
    $ui.insertBefore(div, div.childNodes[div.length-1]);
  }
  // output q value - handy wrapper
  function oq(value,cl) {
    ui(fmt(value),cl);
  }
  function qesc(data) {
    return data.replace('"', '\\"', data);
  }
  function setstate(data) {
    state=data;
  }
  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
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
  var input = {
    check: function() {
    },
    empty: function() {
      return ($i && !$i.value)?true:false;
    },
    html: function() {
      return "<input type=text/>";
    },
    render: function() {
      console.log('render', $i);
      if ($i && $i.parentNode) {
        // if were removing an empty input, remove prompt too
        console.log('val', $i.value);
        if (this.empty() && 
            $i.parentNode && 
            $i.parentNode.parentNode) $i = $i.parentNode;
        $i.parentNode.removeChild($i);
        // delete $i;
      }
      ui('<span class=prompt>q)</span><input type=text/>', 'i');
      $i = $$('input');
      console.log($i, $i.parentNode);
      $i.focus();
    },
    send: function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (input.empty()) return;
      var v = $i.value;
      cl(['sending',$i.value]);
      input.check(v);
      throbber.sending(true);
      ws.send($i.value);
      input.sent(v);
    },
    sent: function(line) {
      cl(['sent', line]);
      var pn = $i.parentNode;
      pn.removeChild($i);
      // delete $i;
      $i = false;
      pn.innerHTML += "<span class='sent'>"+htmlesc(line)+"</span>";
      throbber.sending(false);
      //input.render();
    }
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

m.mount(document.getElementById('app'), quapp);
