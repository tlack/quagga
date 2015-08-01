(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** @jsx m */
'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _util = require('./util');

var _util2 = _interopRequireDefault(_util);

var Dir = {
  controller: function controller(args) {},
  view: function view(ctrl, args) {
    var contents = args.dirContents();
    // debugger;
    if (contents.length === 0) return (0, _mithril2['default'])(
      'h1',
      null,
      'nothing in the current namespace'
    );
    return (0, _mithril2['default'])(
      'table',
      null,
      Object.keys(contents).map(function (k) {
        return (0, _mithril2['default'])(
          'tr',
          null,
          (0, _mithril2['default'])(
            'th',
            { className: 'var' },
            k
          ),
          (0, _mithril2['default'])(
            'td',
            null,
            contents[k]
          )
        );
      })
    );
  }
};

exports['default'] = Dir;
module.exports = exports['default'];

},{"./util":5,"mithril":"mithril"}],2:[function(require,module,exports){
/** @jsx m */
'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var Status = { view: function view(ctrl, args) {
    return (0, _mithril2['default'])(
      'h1',
      null,
      'nothing in status yet'
    );
  }
};

exports['default'] = Status;
module.exports = exports['default'];

},{"mithril":"mithril"}],3:[function(require,module,exports){
/** @jsx m */
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _wscon = require('./wscon');

var _wscon2 = _interopRequireDefault(_wscon);

var _vendorCModule = require('../vendor/c.module');

var _util = require('./util');

var _appView = require('./app.view');

var _appView2 = _interopRequireDefault(_appView);

window.m = _mithril2['default'];

var USER_TOKEN = '_quagga_token' in localStorage ? localStorage['_quagga_token'] : null;

var Status = {
  view: function view(ctrl, args) {
    var contents = (0, _mithril2['default'])(
      'h1',
      null,
      'nothing in status yet'
    );
    if (args.dumpLink) content = (0, _mithril2['default'])(
      'a',
      { href: args.dumpLink, target: '_blank' },
      'Workspace available for download @ ',
      args.dumpLink
    );
    return (0, _mithril2['default'])(
      'div',
      null,
      content
    );
  }
};

var q = {
  controller: function controller(args) {
    var _this2 = this;

    var _this = this;
    var MAXQ = 100;
    var waitq = {};
    var ws = new WebSocket('ws://' + window.location.host);ws.binaryType = 'arraybuffer';
    this.ws = ws;
    this.handlers = {};
    this.registerHandler = function (tag, cb) {
      handlers[tag] = cb;
    };
    ws.onopen = function (e) {
      (0, _util.cl)(e);q.vm.ui('Websocket connected');_mithril2['default'].redraw();
      // ws.send("here[]");
    };
    ws.onclose = function (e) {
      (0, _util.cl)(e);q.vm.ui('Websocket closed');
    };
    ws.onerror = function (e) {
      (0, _util.cl)(e);q.vm.ui('Websocket error');
    };
    ws.onmessage = function (e) {
      var d = (0, _vendorCModule.deserialize)(e.data);
      (0, _util.cl)(d);
      switch (d[0]) {
        case 'q':
          q.vm.oq(d[1].expr, d[2]);q.vm.jumpDown(true);break;
        case 'state':
          q.vm.dirContents(d[1]);_mithril2['default'].redraw();break;
        case 'dump':
          q.vm.link(d.dump);break;
        case 'reload':
          window.location.reload();
      }
    };
    this.send = function (qexpr, cb) {
      (0, _util.cl)(['sendwait', qexpr, cb]);
      if (Object.keys(waitq).length > MAXQ || qexpr.match('/(^|")ID:')) return; // avoid cycles
      var u = (0, _util.uuid)();
      waitq[u] = cb;
      var serializedReq = (0, _vendorCModule.serialize)({ qid: u, expr: ' ' + qexpr });
      (0, _util.cl)((0, _util.ab2str)(serializedReq));
      ws.send(serializedReq);
    };
    q.ws = this.ws;
    this.submit = function (e) {
      e.preventDefault();var expr = q.vm.cmd();
      if (!expr) return;
      q.vm.cmd('');
      q.vm.cmdHistIdx(q.vm.cmdHist.push(expr));
      _this2.send(expr);
    };
    return this;
  },
  vm: {
    cmd: _mithril2['default'].prop(''),
    ui: function ui(msg) {
      q.vm.msgs(q.vm.msgs().concat({ o: msg }));
    },
    oq: function oq(expr, res) {
      q.vm.msgs(q.vm.msgs().concat({ i: expr, o: res }));_mithril2['default'].redraw();
    },
    msgs: _mithril2['default'].prop([]), // array of {i:str o:any}
    cmdHist: [],
    cmdHistIdx: _mithril2['default'].prop(0),
    stashCmd: _mithril2['default'].prop(''),
    jumpDown: _mithril2['default'].prop(false),

    dirContents: _mithril2['default'].prop({}),

    statusOpen: _mithril2['default'].prop(false),
    dirOpen: _mithril2['default'].prop(false),
    uiDirection: _mithril2['default'].prop('column'),
    uiDark: _mithril2['default'].prop(true),

    // toggleStatus: () => q.vm.statusOpen(!q.vm.statusOpen()),
    toggleStatus: function toggleStatus() {
      return q.ws.send((0, _vendorCModule.serialize)({ u: (0, _util.uuid)(), dump: true }));
    },
    toggleDir: function toggleDir() {
      return q.vm.dirOpen(!q.vm.dirOpen());
    },
    toggleUiDirection: function toggleUiDirection() {
      return q.vm.uiDirection(q.vm.uiDirection() == 'column' ? 'row' : 'column');
    },
    toggleUiColor: function toggleUiColor() {
      return q.vm.uiDark(!q.vm.uiDark());
    },

    link: _mithril2['default'].prop(''),

    handleHistory: function handleHistory(e) {
      var cmdHistIdx = q.vm.cmdHistIdx;var cmdHist = q.vm.cmdHist;var d = 0;
      switch (e.keyCode) {
        case _util.ARROW_UP:
          d = -1;break;
        case _util.ARROW_DOWN:
          d = 1;break;
        default:
          (0, _util.cl)('NOT MY JOB!');return;}
      var nIdx = cmdHistIdx() + d;
      if (e.keyCode == _util.ARROW_UP && cmdHistIdx() == cmdHist.length) {
        (0, _util.cl)('stashing: ' + q.vm.cmd());q.vm.stashCmd(q.vm.cmd());
      };
      cmdHistIdx(nIdx); // always save a position change
      if (e.keyCode == _util.ARROW_DOWN && nIdx == cmdHist.length) {
        q.vm.cmd(q.vm.stashCmd());return;
      }
      if (0 <= nIdx && nIdx < cmdHist.length) {
        q.vm.cmd(cmdHist[nIdx]);return;
      }
      // cl({up:e.keyCode==ARROW_UP,down:e.keyCode==ARROW_DOWN,nidx:nIdx,cmdlen:cmdHist.length,stash:q.vm.stashCmd()})
    }
  },
  view: _appView2['default']
};
window.q = q;
// <Terminal msgs={msgs} aM={vm.ui}/>

function quagga() {
  var $i, $o, $scl, $ui, state, ws;
  // low level functions:
  function kd(ev) {
    console.log(ev);
    if (ev.keyCode == 10 || ev.keyCode == 13) {
      sendi();
    }
  }
  function qesc(data) {
    return data.replace('"', '\\"', data);
  }
  function setstate(data) {
    state = data;
  }
  // higher level stuff

  // handle 'error responses from server
  function error(resp) {
    // try to 'parse' whatever user entered
    (0, _util.cl)(['error', resp]);
    ws.sendwait('parse "' + qesc(resp[1]) + '"', function (result) {
      console.log('error parse');
      oq({ error: resp[0], line: resp[1], parse: result });
    });
  }
  var throbber = {
    if_: function if_(on, classes) {
      var classes = classes.split(' ');
      classes.forEach(function (cl) {
        var cb = on ? function (cl) {
          $scl.add(cl);
        } : function (cl) {
          $scl.remove(cl);
        };
        cb();
      });
    },
    pulse: function pulse(on) {
      this.if_(on, 'animated infinite pulse');
    },
    sending: function sending(on) {
      this.if_(on, 'animated infinite pulse sending');
    }
  };
  var pub = {
    boot: function boot() {
      $scl = $$('.status').classList;
      $ui = $$('#ui');
      $ui.addEventListener('submit', input.send, true);
      (0, _wscon2['default'])();
    }
  };
  return pub;
}

// debugger;
_mithril2['default'].mount(document.getElementById('app'), q);

},{"../vendor/c.module":7,"./app.view":4,"./util":5,"./wscon":6,"mithril":"mithril"}],4:[function(require,module,exports){
/** @jsx m */
'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mithril = require('mithril');

var _mithril2 = _interopRequireDefault(_mithril);

var _util = require('./util');

var _Dir = require('./Dir');

var _Dir2 = _interopRequireDefault(_Dir);

var _Status = require('./Status');

var _Status2 = _interopRequireDefault(_Status);

var viewFn = function viewFn(ctrl, args) {
  if (!('WebSocket' in window)) return (0, _mithril2['default'])(
    'h1',
    null,
    'quagga needs websocket support in your browser, which you do not appear to have'
  );

  var _q = q;
  var vm = _q.vm;

  var thing = (0, _mithril2['default'])(
    'div',
    { className: vm.uiDark() ? 'dark' : '' },
    (0, _mithril2['default'])(
      'div',
      { id: 'nav' },
      (0, _mithril2['default'])(
        'a',
        { onclick: vm.toggleStatus.bind() },
        (0, _mithril2['default'])('i', { className: 'status fa fa-cloud ' + (vm.statusOpen() ? 'on' : '') })
      ),
      (0, _mithril2['default'])(
        'a',
        { onclick: function () {
            return ce('what do');
          } },
        (0, _mithril2['default'])('i', { className: 'terminal fa fa-terminal' })
      ),
      (0, _mithril2['default'])(
        'a',
        { onclick: vm.toggleDir.bind() },
        (0, _mithril2['default'])('i', { className: 'dir fa fa-sitemap ' + (vm.dirOpen() ? 'on' : '') })
      ),
      (0, _mithril2['default'])(
        'a',
        { onclick: vm.toggleUiDirection.bind() },
        (0, _mithril2['default'])('i', { className: 'fa fa-bars ' + (vm.uiDirection() == 'row' ? 'fa-rotate-90' : '') })
      ),
      (0, _mithril2['default'])(
        'a',
        { onclick: vm.toggleUiColor.bind() },
        (0, _mithril2['default'])('i', { className: 'fa fa-adjust' })
      )
    ),
    (0, _mithril2['default'])(
      'div',
      { id: 'panes', style: 'flex-direction:' + vm.uiDirection() },
      (0, _mithril2['default'])(
        'div',
        { className: 'pane status ' + (vm.statusOpen() ? 'open' : '') },
        (0, _mithril2['default'])(_Status2['default'], null)
      ),
      (0, _mithril2['default'])(
        'div',
        { className: 'pane open terminal' },
        (0, _mithril2['default'])(
          'div',
          { className: 'output', config: function (el, initd) {
              if (vm.jumpDown()) {
                el.scrollTop = el.scrollHeight;vm.jumpDown(false);
              }
            } },
          vm.msgs().map(function (c) {
            return (0, _mithril2['default'])(
              'div',
              { className: 'o' },
              c.i ? (0, _mithril2['default'])(
                'b',
                null,
                c.i,
                (0, _mithril2['default'])('br', null)
              ) : '',
              c.o ? (0, _util.fmt)(c.o) : ''
            );
          })
        ),
        (0, _mithril2['default'])(
          'span',
          null,
          q.vm.cmd()
        ),
        (0, _mithril2['default'])(
          'form',
          { onsubmit: ctrl.submit.bind() },
          (0, _mithril2['default'])(
            'label',
            { className: 'prompt' },
            'q)'
          ),
          (0, _mithril2['default'])('input', {
            onkeyup: vm.handleHistory.bind(),
            oninput: _mithril2['default'].withAttr('value', vm.cmd),
            value: vm.cmd(), type: 'text' })
        )
      ),
      (0, _mithril2['default'])(
        'div',
        { className: 'pane dir ' + (vm.dirOpen() ? 'open' : '') },
        (0, _mithril2['default'])(_Dir2['default'], { dirContents: q.vm.dirContents })
      )
    )
  );

  return thing;
};
exports['default'] = viewFn;
module.exports = exports['default'];

},{"./Dir":1,"./Status":2,"./util":5,"mithril":"mithril"}],5:[function(require,module,exports){
/** @jsx m */
'use strict';
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.uuid = uuid;
exports.fmt = fmt;
exports.arr2keys = arr2keys;
exports.ab2str = ab2str;
var cl = console.log.bind(console);
exports.cl = cl;
var ce = console.error.bind(console);
exports.ce = ce;

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}

var EHREF = 'javascript:;';
exports.EHREF = EHREF;
var ARROW_UP = 38;
exports.ARROW_UP = ARROW_UP;
var ARROW_DOWN = 40;
exports.ARROW_DOWN = ARROW_DOWN;
var pd = function pd(e) {
  return e.preventDefault();
};
exports.pd = pd;
var noop = function noop() {};

exports.noop = noop;
var _fmt = {
  'array': function array(d) {
    return m(
      'div',
      null,
      m(
        'span',
        null,
        '`array[$',
        d.length,
        ']`:'
      ),
      m(
        'ol',
        null,
        d.map(fmt).map(function (d1) {
          return m(
            'li',
            null,
            d1
          );
        })
      )
    );
  },
  'number': function number(d) {
    return d;
  },
  'object': function object(d) {
    return m(
      'div',
      null,
      m(
        'span',
        null,
        'dict[' + Object.keys(d).length + ']:'
      ),
      m(
        'table',
        { className: 'obj' },
        Object.keys(d).map(function (k) {
          return m(
            'tr',
            null,
            m(
              'th',
              null,
              fmt(k)
            ),
            m(
              'td',
              null,
              fmt(d[k])
            )
          );
        })
      )
    );
  },
  'string': function string(x) {
    return x;
  },
  'table': function table(d) {
    return m(
      'div',
      null,
      m(
        'span',
        null,
        'table[' + d.length + ']:'
      ),
      m(
        'table',
        { className: 'obj' },
        m(
          'thead',
          null,
          m(
            'tr',
            null,
            Object.keys(d[0]).map(function (k) {
              return m(
                'th',
                null,
                fmt(k)
              );
            })
          )
        ),
        m(
          'tbody',
          null,
          d.map(function (k) {
            return m(
              'tr',
              null,
              Object.keys(k).map(function (dk) {
                return m(
                  'td',
                  null,
                  fmt(k[dk])
                );
              })
            );
          })
        )
      )
    );
  }
};

exports._fmt = _fmt;

function fmt(data) {
  var t = typeof data;
  if (data instanceof Array) t = typeof data[0] == 'object' ? 'table' : 'array';
  // console.log('fmt', data);
  if (data === null) return 'null';
  return t in _fmt ? _fmt[t](data) : 'no handler ' + t;
}

function arr2keys(arr) {
  return arr.reduce(function (o, v) {
    o[v] = null;return o;
  }, {});
}

function ab2str(ab) {
  var view = new Uint8Array(ab);
  var str = '';
  for (var i = 0; i < view.length; i++) {
    str += view[i].toString(16);
  }
  return str;
}

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = wscon;

var _c = require('c');

function wscon() {
    var waitq = {};
    // // handler for specific response types, when wrapped
    // var hdlrs = {
    //     'state': function(d) {
    //         setstate(d[1]);
    //     },
    //     'q': function(d) {
    //         console.log('q',d);
    //         if (d[2][0]==="'") // errors denoted by 'name
    //             error(d);
    //         else
    //             oq(d[2]);
    //     }
    // }
    // function render(d) {
    //     var d = deserialize(d);
    //     cl(['render',d]);
    //     if (match = d[1].match(/^ID:"([0-9a-f-]+)";/)) {
    //         console.log('waitq resp',match);
    //         if (match[1] in waitq)
    //             waitq[match[1]](d[2]);
    //     }
    //     if (d.length>=2 && typeof d[0]=='string')
    //         hdlrs[d[0]](d);
    //     else
    //         console.log('no handler for',d);
    // }
}

module.exports = exports['default'];

},{"c":"c"}],7:[function(require,module,exports){
// 2014.03.18 Serialize date now adjusts for timezone.
// 2013.04.29 Dict decodes to map, except for keyed tables.
// 2013.02.13 Keyed tables were not being decoded correctly.
// 2012.06.20 Fix up browser compatibility. Strings starting with ` encode as symbol type.
// 2012.05.15 Provisional test release, subject to change
// for use with websockets and kdb+v3.0, (de)serializing kdb+ ipc formatted data within javascript within a browser.
// e.g. on kdb+ process, set .z.ws:{neg[.z.w] -8!value -9!x;}
// and then within javascript websocket.send(serialize("10+20"));
// ws.onmessage=function(e){var arrayBuffer=e.data;if(arrayBuffer){var v=deserialize(arrayBuffer);...
// note ws.binaryType = 'arraybuffer';

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deserialize = deserialize;
exports.serialize = serialize;

function deserialize(x) {
  var a = x[0],
      pos = 8,
      j2p32 = Math.pow(2, 32),
      ub = new Uint8Array(x),
      sb = new Int8Array(x),
      bb = new Uint8Array(8),
      hb = new Int16Array(bb.buffer),
      ib = new Int32Array(bb.buffer),
      eb = new Float32Array(bb.buffer),
      fb = new Float64Array(bb.buffer);
  function rBool() {
    return rInt8() == 1;
  }
  function rChar() {
    return String.fromCharCode(rInt8());
  }
  function rInt8() {
    return sb[pos++];
  }
  function rNUInt8(n) {
    for (var i = 0; i < n; i++) bb[i] = ub[pos++];
  }
  function rUInt8() {
    return ub[pos++];
  }
  function rGuid() {
    var x = "0123456789abcdef",
        s = "";for (var i = 0; i < 16; i++) {
      var c = rUInt8();s += i == 4 || i == 6 || i == 8 || i == 10 ? "-" : "";s += x[c >> 4];s += x[c & 15];
    }return s;
  }
  function rInt16() {
    rNUInt8(2);var h = hb[0];return h == -32768 ? NaN : h == -32767 ? -Infinity : h == 32767 ? Infinity : h;
  }
  function rInt32() {
    rNUInt8(4);var i = ib[0];return i == -2147483648 ? NaN : i == -2147483647 ? -Infinity : i == 2147483647 ? Infinity : i;
  }
  function rInt64() {
    rNUInt8(8);var x = ib[1],
        y = ib[0];return x * j2p32 + (y >= 0 ? y : j2p32 + y);
  } // closest number to 64 bit int...
  function rFloat32() {
    rNUInt8(4);return eb[0];
  }
  function rFloat64() {
    rNUInt8(8);return fb[0];
  }
  function rSymbol() {
    var i = pos,
        c,
        s = "";for (; (c = rInt8()) !== 0; s += String.fromCharCode(c));return s;
  };
  function rTimestamp() {
    return date(rInt64() / 86400000000000);
  }
  function rMonth() {
    var y = rInt32();var m = y % 12;y = 2000 + y / 12;return new Date(Date.UTC(y, m, 1));
  }
  function date(n) {
    return new Date(86400000 * (10957 + n));
  }
  function rDate() {
    return date(rInt32());
  }
  function rDateTime() {
    return date(rFloat64());
  }
  function rTimespan() {
    return date(rInt64() / 86400000000000);
  }
  function rSecond() {
    return date(rInt32() / 86400);
  }
  function rMinute() {
    return date(rInt32() / 1440);
  }
  function rTime() {
    return date(rInt32() / 86400000);
  }
  function r() {
    var _again = true;

    _function: while (_again) {
      fns = i = n = t = flip = x = y = o = i = x = y = A = j = o = i = s = A = f = undefined;
      _again = false;

      var fns = [r, rBool, rGuid, null, rUInt8, rInt16, rInt32, rInt64, rFloat32, rFloat64, rChar, rSymbol, rTimestamp, rMonth, rDate, rDateTime, rTimespan, rMinute, rSecond, rTime];
      var i = 0,
          n,
          t = rInt8();
      if (t < 0 && t > -20) return fns[-t]();
      if (t > 99) {
        if (t == 100) {
          rSymbol();_again = true;
          continue _function;
        }
        if (t < 104) return rInt8() === 0 && t == 101 ? null : "func";
        if (t > 105) r();else for (n = rInt32(); i < n; i++) r();
        return "func";
      }
      if (99 == t) {
        var flip = 98 == ub[pos],
            x = r(),
            y = r(),
            o;
        if (!flip) {
          o = {};
          for (var i = 0; i < x.length; i++) o[x[i]] = y[i];
        } else o = new Array(2), o[0] = x, o[1] = y;
        return o;
      }
      pos++;
      if (98 == t) {
        //    return r(); // better as array of dicts?
        rInt8(); // check type is 99 here
        // read the arrays and then flip them into an array of dicts
        var x = r(),
            y = r();
        var A = new Array(y[0].length);
        for (var j = 0; j < y[0].length; j++) {
          var o = {};
          for (var i = 0; i < x.length; i++) o[x[i]] = y[i][j];
          A[j] = o;
        }
        return A;
      }
      n = rInt32();
      if (10 == t) {
        var s = "";n += pos;for (; pos < n; s += rChar());return s;
      }
      var A = new Array(n);
      var f = fns[t];
      for (i = 0; i < n; i++) A[i] = f();
      return A;
    }
  }
  return r();
}

function serialize(x) {
  var a = 1,
      pos = 0,
      ub,
      bb = new Uint8Array(8),
      ib = new Int32Array(bb.buffer),
      fb = new Float64Array(bb.buffer);
  function toType(obj) {
    return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
  };
  function getKeys(x) {
    var v = [];for (var o in x) v.push(o);return v;
  }
  function getVals(x) {
    var v = [];for (var o in x) v.push(x[o]);return v;
  }
  function calcN(x, dt) {
    var t = dt ? dt : toType(x);
    switch (t) {
      case "null":
        return 2;
      case "object":
        return 1 + calcN(getKeys(x), "symbols") + calcN(getVals(x), null);
      case "boolean":
        return 2;
      case "number":
        return 9;
      case "array":
        {
          var n = 6;for (var i = 0; i < x.length; i++) n += calcN(x[i], null);return n;
        }
      case "symbols":
        {
          var n = 6;for (var i = 0; i < x.length; i++) n += calcN(x[i], "symbol");return n;
        }
      case "string":
        return x.length + (x[0] == "`" ? 1 : 6);
      case "date":
        return 9;
      case "symbol":
        return 2 + x.length;}
    throw "bad type " + t;
  }
  function wb(b) {
    ub[pos++] = b;
  }
  function wn(n) {
    for (var i = 0; i < n; i++) ub[pos++] = bb[i];
  }
  function w(x, dt) {
    var t = dt ? dt : toType(x);
    switch (t) {
      case "null":
        {
          wb(101);wb(0);
        }break;
      case "boolean":
        {
          wb(-1);wb(x ? 1 : 0);
        }break;
      case "number":
        {
          wb(-9);fb[0] = x;wn(8);
        }break;
      case "date":
        {
          wb(-15);fb[0] = (x.getTime() - new Date(x).getTimezoneOffset() * 60000) / 86400000 - 10957;wn(8);
        }break;
      case "symbol":
        {
          wb(-11);for (var i = 0; i < x.length; i++) wb(x[i].charCodeAt());wb(0);
        }break;
      case "string":
        if (x[0] == "`") {
          w(x.substr(1), "symbol");
        } else {
          wb(10);wb(0);ib[0] = x.length;wn(4);for (var i = 0; i < x.length; i++) wb(x[i].charCodeAt());
        }break;
      case "object":
        {
          wb(99);w(getKeys(x), "symbols");w(getVals(x), null);
        }break;
      case "array":
        {
          wb(0);wb(0);ib[0] = x.length;wn(4);for (var i = 0; i < x.length; i++) w(x[i], null);
        }break;
      case "symbols":
        {
          wb(0);wb(0);ib[0] = x.length;wn(4);for (var i = 0; i < x.length; i++) w(x[i], "symbol");
        }break;}
  }
  var n = calcN(x, null);
  var ab = new ArrayBuffer(8 + n);
  ub = new Uint8Array(ab);
  wb(1);wb(0);wb(0);wb(0);ib[0] = ub.length;wn(4);w(x, null);
  return ab;
}

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS90ai9xdWFnZ2EvaHRtbC9zcmMvRGlyLmpzIiwiL2hvbWUvdGovcXVhZ2dhL2h0bWwvc3JjL1N0YXR1cy5qcyIsIi9ob21lL3RqL3F1YWdnYS9odG1sL3NyYy9hcHAuanMiLCIvaG9tZS90ai9xdWFnZ2EvaHRtbC9zcmMvYXBwLnZpZXcuanMiLCIvaG9tZS90ai9xdWFnZ2EvaHRtbC9zcmMvdXRpbC5qcyIsIi9ob21lL3RqL3F1YWdnYS9odG1sL3NyYy93c2Nvbi5qcyIsIi9ob21lL3RqL3F1YWdnYS9odG1sL3ZlbmRvci9jLm1vZHVsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNDQSxZQUFZLENBQUM7Ozs7Ozs7dUJBQ0MsU0FBUzs7OztvQkFDUCxRQUFROzs7O0FBRXhCLElBQUksR0FBRyxHQUFHO0FBQ1IsWUFBVSxFQUFFLG9CQUFVLElBQUksRUFBRSxFQUMzQjtBQUNELE1BQUksRUFBRSxjQUFDLElBQUksRUFBQyxJQUFJLEVBQUs7QUFDbkIsUUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDOztBQUVsQyxRQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLE9BQU87Ozs7S0FBeUMsQ0FBQTtBQUMzRSxXQUFPOzs7TUFBUSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUM7ZUFDeEM7OztVQUFJOztjQUFJLFNBQVMsRUFBQyxLQUFLO1lBQUUsQ0FBQztXQUFNO1VBQUE7OztZQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUM7V0FBTTtTQUFLO09BQUEsQ0FBQztLQUN0RCxDQUFBO0dBQ1Q7Q0FDRixDQUFBOztxQkFFYyxHQUFHOzs7OztBQ2pCbEIsWUFBWSxDQUFDOzs7Ozs7O3VCQUNDLFNBQVM7Ozs7QUFFdkIsSUFBSSxNQUFNLEdB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O0FBQUMsUUFBSSxDQUFDLEdBQUMsa0JBQWtCO1FBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxLQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsRUFBRSxFQUFDLENBQUMsRUFBRSxFQUFDO0FBQUMsVUFBSSxDQUFDLEdBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFFLENBQUMsSUFBRSxDQUFDLElBQUUsQ0FBQyxJQUFFLENBQUMsSUFBRSxDQUFDLElBQUUsQ0FBQyxJQUFFLENBQUMsSUFBRSxFQUFFLEdBQUMsR0FBRyxHQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUUsQ0FBQyxDQUFDLENBQUMsSUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUUsQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsQ0FBQztLQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQUM7QUFDdkosV0FBUyxNQUFNLEdBQUU7QUFBQyxXQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFFLENBQUMsS0FBSyxHQUFDLEdBQUcsR0FBQyxDQUFDLElBQUUsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxRQUFRLEdBQUMsQ0FBQyxJQUFFLEtBQUssR0FBQyxRQUFRLEdBQUMsQ0FBQyxDQUFDO0dBQUM7QUFDdkcsV0FBUyxNQUFNLEdBQUU7QUFBQyxXQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFFLENBQUMsVUFBVSxHQUFDLEdBQUcsR0FBQyxDQUFDLElBQUUsQ0FBQyxVQUFVLEdBQUMsQ0FBQyxRQUFRLEdBQUMsQ0FBQyxJQUFFLFVBQVUsR0FBQyxRQUFRLEdBQUMsQ0FBQyxDQUFDO0dBQUM7QUFDdEgsV0FBUyxNQUFNLEdBQUU7QUFBQyxXQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUMsS0FBSyxJQUFFLENBQUMsSUFBRSxDQUFDLEdBQUMsQ0FBQyxHQUFDLEtBQUssR0FBQyxDQUFDLENBQUEsQUFBQyxDQUFDO0dBQUM7QUFDbEYsV0FBUyxRQUFRLEdBQUU7QUFBQyxXQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FBQztBQUM3QyxXQUFTLFFBQVEsR0FBRTtBQUFDLFdBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUFDO0FBQzdDLFdBQVMsT0FBTyxHQUFFO0FBQUMsUUFBSSxDQUFDLEdBQUMsR0FBRztRQUFDLENBQUM7UUFBQyxDQUFDLEdBQUMsRUFBRSxDQUFDLE9BQUssQ0FBQyxDQUFDLEdBQUMsS0FBSyxFQUFFLENBQUEsS0FBSSxDQUFDLEVBQUMsQ0FBQyxJQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FBQyxDQUFDO0FBQy9GLFdBQVMsVUFBVSxHQUFFO0FBQUMsV0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUMsY0FBYyxDQUFDLENBQUM7R0FBQztBQUM1RCxXQUFTLE1BQU0sR0FBRTtBQUFDLFFBQUksQ0FBQyxHQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFDLElBQUksR0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FBQztBQUMxRixXQUFTLElBQUksQ0FBQyxDQUFDLEVBQUM7QUFBQyxXQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBRSxLQUFLLEdBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQyxDQUFDO0dBQUM7QUFD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QUFDLENBQUMsQ0FBQyxHQUFDLEFBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEdBQUMsQUFBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBRSxpQkFBaUIsRUFBRSxHQUFDLEtBQUssQ0FBQSxHQUFFLFFBQVEsR0FBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQUMsTUFBTTtBQUFBLEFBQy9HLFdBQUssUUFBUTtBQUFDO0FBQUMsWUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUFDLE1BQU07QUFBQSxBQUNyRixXQUFLLFFBQVE7QUFBQyxZQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRSxHQUFHLEVBQUM7QUFBQyxXQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQyxRQUFRLENBQUMsQ0FBQztTQUFDLE1BQUk7QUFBQyxZQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBQyxDQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7U0FBQyxNQUFNO0FBQUEsQUFDcEosV0FBSyxRQUFRO0FBQUM7QUFBQyxZQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxDQUFDO1NBQUMsTUFBTTtBQUFBLEFBQ3hFLFdBQUssT0FBTztBQUFDO0FBQUMsWUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsQ0FBQztTQUFDLE1BQU07QUFBQSxBQUM5RixXQUFLLFNBQVM7QUFBQztBQUFDLFlBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsTUFBTSxFQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsUUFBUSxDQUFDLENBQUM7U0FBQyxNQUFNLENBQUM7R0FBQztBQUMxRyxNQUFJLENBQUMsR0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BCLE1BQUksRUFBRSxHQUFDLElBQUksV0FBVyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixJQUFFLEdBQUMsSUFBSSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdEIsSUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hELFNBQU8sRUFBRSxDQUFDO0NBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqIEBqc3ggbSAqL1xuJ3VzZSBzdHJpY3QnO1xuaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCdcbmltcG9ydCBmbXQgZnJvbSAnLi91dGlsJ1xuXG52YXIgRGlyID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbiAoYXJncykge1xuICB9LFxuICB2aWV3OiAoY3RybCxhcmdzKSA9PiB7XG4gICAgdmFyIGNvbnRlbnRzID0gYXJncy5kaXJDb250ZW50cygpO1xuICAgIC8vIGRlYnVnZ2VyO1xuICAgIGlmIChjb250ZW50cy5sZW5ndGggPT09IDApIHJldHVybiA8aDE+bm90aGluZyBpbiB0aGUgY3VycmVudCBuYW1lc3BhY2U8L2gxPlxuICAgIHJldHVybiA8dGFibGU+e09iamVjdC5rZXlzKGNvbnRlbnRzKS5tYXAoayA9PlxuICAgICAgPHRyPjx0aCBjbGFzc05hbWU9J3Zhcic+e2t9PC90aD48dGQ+e2NvbnRlbnRzW2tdfTwvdGQ+PC90cj4pfVxuICAgIDwvdGFibGU+XG4gIH0sXG59XG5cbmV4cG9ydCBkZWZhdWx0IERpcjsiLCIvKiogQGpzeCBtICovXG4ndXNlIHN0cmljdCc7XG5pbXBvcnQgbSBmcm9tICdtaXRocmlsJztcblxudmFyIFN0YXR1cyA9IHsgdmlldzogKGN0cmwsYXJncykgPT4gPGgxPm5vdGhpbmcgaW4gc3RhdHVzIHlldDwvaDE+XG59XG5cbmV4cG9ydCBkZWZhdWx0IFN0YXR1czsiLCIvKiogQGpzeCBtICovXG4ndXNlIHN0cmljdCc7XG5pbXBvcnQgbSBmcm9tICdtaXRocmlsJ1xud2luZG93Lm09bTtcbmltcG9ydCB3c2NvbiBmcm9tICcuL3dzY29uJ1xuaW1wb3J0IHtkZXNlcmlhbGl6ZSxzZXJpYWxpemV9IGZyb20gJy4uL3ZlbmRvci9jLm1vZHVsZSdcbmltcG9ydCB7XG4gIGNsLGNlLHV1aWQsZm10LFxuICBFSFJFRixcbiAgQVJST1dfVVAsXG4gIEFSUk9XX0RPV04sXG4gIHBkLFxuICBub29wLFxuICBhYjJzdHJcbn0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHZpZXdGbiBmcm9tICcuL2FwcC52aWV3JztcblxuY29uc3QgVVNFUl9UT0tFTiA9ICdfcXVhZ2dhX3Rva2VuJyBpbiBsb2NhbFN0b3JhZ2UgPyBsb2NhbFN0b3JhZ2VbJ19xdWFnZ2FfdG9rZW4nXSA6IG51bGxcblxudmFyIFN0YXR1cyA9IHtcbiAgdmlldzogKGN0cmwsYXJncykgPT4ge1xuICAgIHZhciBjb250ZW50cyA9IDxoMT5ub3RoaW5nIGluIHN0YXR1cyB5ZXQ8L2gxPjtcbiAgICBpZiAoYXJncy5kdW1wTGluaylcbiAgICAgIGNvbnRlbnQgPSA8YSBocmVmPXthcmdzLmR1bXBMaW5rfSB0YXJnZXQ9J19ibGFuayc+V29ya3NwYWNlIGF2YWlsYWJsZSBmb3IgZG93bmxvYWQgQCB7YXJncy5kdW1wTGlua308L2E+O1xuICAgIHJldHVybiA8ZGl2Pntjb250ZW50fTwvZGl2PlxuICB9XG59XG5cbnZhciBxID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKXtcbiAgICB2YXIgX3RoaXM9dGhpcztcbiAgICB2YXIgTUFYUSA9IDEwMDtcbiAgICB2YXIgd2FpdHE9e307XG4gICAgdmFyIHdzPW5ldyBXZWJTb2NrZXQoJ3dzOi8vJyt3aW5kb3cubG9jYXRpb24uaG9zdCk7IHdzLmJpbmFyeVR5cGU9J2FycmF5YnVmZmVyJztcbiAgICB0aGlzLndzPXdzO1xuICAgIHRoaXMuaGFuZGxlcnMgPSB7fTtcbiAgICB0aGlzLnJlZ2lzdGVySGFuZGxlciA9IGZ1bmN0aW9uICh0YWcsIGNiKSB7IGhhbmRsZXJzW3RhZ109Y2I7IH1cbiAgICB3cy5vbm9wZW49ZnVuY3Rpb24oZSl7Y2woZSk7cS52bS51aSgnV2Vic29ja2V0IGNvbm5lY3RlZCcpO20ucmVkcmF3KCk7XG4gICAgICAvLyB3cy5zZW5kKFwiaGVyZVtdXCIpO1xuICAgIH07XG4gICAgd3Mub25jbG9zZT1mdW5jdGlvbihlKXtjbChlKTsgcS52bS51aSgnV2Vic29ja2V0IGNsb3NlZCcpO307XG4gICAgd3Mub25lcnJvcj1mdW5jdGlvbihlKXtjbChlKTsgcS52bS51aSgnV2Vic29ja2V0IGVycm9yJyk7fTtcbiAgICB3cy5vbm1lc3NhZ2U9ZnVuY3Rpb24oZSl7XG4gICAgICB2YXIgZCA9IGRlc2VyaWFsaXplKGUuZGF0YSk7XG4gICAgICBjbChkKTtcbiAgICAgIHN3aXRjaCAoZFswXSkge1xuICAgICAgICBjYXNlJ3EnOiAgICAgIHEudm0ub3EoZFsxXS5leHByLCBkWzJdKTsgcS52bS5qdW1wRG93bih0cnVlKTsgYnJlYWs7XG4gICAgICAgIGNhc2Unc3RhdGUnOiAgcS52bS5kaXJDb250ZW50cyhkWzFdKTsgbS5yZWRyYXcoKTsgIGJyZWFrO1xuICAgICAgICBjYXNlJ2R1bXAnOiAgIHEudm0ubGluayhkLmR1bXApOyBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZW5kPShxZXhwcixjYikgPT4ge1xuICAgICAgICBjbChbXCJzZW5kd2FpdFwiLHFleHByLGNiXSk7XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyh3YWl0cSkubGVuZ3RoPk1BWFEgfHwgcWV4cHIubWF0Y2goJy8oXnxcXFwiKUlEOicpKSByZXR1cm47IC8vIGF2b2lkIGN5Y2xlc1xuICAgICAgICB2YXIgdT11dWlkKCk7XG4gICAgICAgIHdhaXRxW3VdPWNiO1xuICAgICAgICB2YXIgc2VyaWFsaXplZFJlcSA9IHNlcmlhbGl6ZSh7cWlkOnUsIGV4cHI6JyAnK3FleHByfSk7XG4gICAgICAgIGNsKGFiMnN0cihzZXJpYWxpemVkUmVxKSk7XG4gICAgICAgIHdzLnNlbmQoc2VyaWFsaXplZFJlcSk7XG4gICAgfVxuICAgIHEud3M9dGhpcy53cztcbiAgICB0aGlzLnN1Ym1pdD0oZSkgPT4ge2UucHJldmVudERlZmF1bHQoKTt2YXIgZXhwcj1xLnZtLmNtZCgpO1xuICAgICAgaWYoIWV4cHIpcmV0dXJuO1xuICAgICAgcS52bS5jbWQoJycpO1xuICAgICAgcS52bS5jbWRIaXN0SWR4KHEudm0uY21kSGlzdC5wdXNoKGV4cHIpKTtcbiAgICAgIHRoaXMuc2VuZChleHByKX1cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgdm06IHtcbiAgICBjbWQ6bS5wcm9wKCcnKSxcbiAgICB1aTogKG1zZykgPT4geyBxLnZtLm1zZ3MocS52bS5tc2dzKCkuY29uY2F0KHtvOm1zZ30pKSB9LFxuICAgIG9xOiAoZXhwcixyZXMpID0+IHsgcS52bS5tc2dzKHEudm0ubXNncygpLmNvbmNhdCh7aTpleHByLG86cmVzfSkpOyBtLnJlZHJhdygpOyB9LFxuICAgIG1zZ3M6IG0ucHJvcChbXSksIC8vIGFycmF5IG9mIHtpOnN0ciBvOmFueX1cbiAgICBjbWRIaXN0OiBbXSxcbiAgICBjbWRIaXN0SWR4OiBtLnByb3AoMCksXG4gICAgc3Rhc2hDbWQ6IG0ucHJvcCgnJyksXG4gICAganVtcERvd246bS5wcm9wKGZhbHNlKSxcblxuICAgIGRpckNvbnRlbnRzOiBtLnByb3Aoe30pLCAgICBcblxuICAgIHN0YXR1c09wZW46IG0ucHJvcChmYWxzZSksXG4gICAgZGlyT3BlbjogbS5wcm9wKGZhbHNlKSxcbiAgICB1aURpcmVjdGlvbjogbS5wcm9wKCdjb2x1bW4nKSxcbiAgICB1aURhcms6IG0ucHJvcCh0cnVlKSxcblxuICAgIC8vIHRvZ2dsZVN0YXR1czogKCkgPT4gcS52bS5zdGF0dXNPcGVuKCFxLnZtLnN0YXR1c09wZW4oKSksXG4gICAgdG9nZ2xlU3RhdHVzOiAoKSA9PiBxLndzLnNlbmQoc2VyaWFsaXplKHt1OnV1aWQoKSwgZHVtcDp0cnVlfSkpLFxuICAgIHRvZ2dsZURpcjogKCkgPT4gcS52bS5kaXJPcGVuKCFxLnZtLmRpck9wZW4oKSksXG4gICAgdG9nZ2xlVWlEaXJlY3Rpb246ICgpID0+IHEudm0udWlEaXJlY3Rpb24ocS52bS51aURpcmVjdGlvbigpPT0nY29sdW1uJz8ncm93JzonY29sdW1uJyksXG4gICAgdG9nZ2xlVWlDb2xvcjogKCkgPT4gcS52bS51aURhcmsoIXEudm0udWlEYXJrKCkpLFxuXG4gICAgbGluazogbS5wcm9wKCcnKSxcblxuICAgIGhhbmRsZUhpc3Rvcnk6IChlKSA9PiB7XG4gICAgICB2YXIgY21kSGlzdElkeD1xLnZtLmNtZEhpc3RJZHg7dmFyIGNtZEhpc3Q9cS52bS5jbWRIaXN0O3ZhciBkPTA7XG4gICAgICBzd2l0Y2ggKGUua2V5Q29kZSkge1xuICAgICAgICBjYXNlIEFSUk9XX1VQOiAgIGQ9KC0xKTticmVhaztcbiAgICAgICAgY2FzZSBBUlJPV19ET1dOOiBkPTE7ICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6IGNsKCdOT1QgTVkgSk9CIScpO3JldHVybjt9XG4gICAgICB2YXIgbklkeD1jbWRIaXN0SWR4KCkrZDtcbiAgICAgIGlmKGUua2V5Q29kZT09QVJST1dfVVAmJmNtZEhpc3RJZHgoKT09Y21kSGlzdC5sZW5ndGgpIHtjbCgnc3Rhc2hpbmc6ICcrcS52bS5jbWQoKSk7cS52bS5zdGFzaENtZChxLnZtLmNtZCgpKX07XG4gICAgICBjbWRIaXN0SWR4KG5JZHgpOyAvLyBhbHdheXMgc2F2ZSBhIHBvc2l0aW9uIGNoYW5nZVxuICAgICAgaWYoZS5rZXlDb2RlPT1BUlJPV19ET1dOJiZuSWR4PT1jbWRIaXN0Lmxlbmd0aCkgeyBxLnZtLmNtZChxLnZtLnN0YXNoQ21kKCkpOyByZXR1cm59XG4gICAgICBpZigwPD1uSWR4JiZuSWR4PGNtZEhpc3QubGVuZ3RoKSAgICAgICAgICAgICAgICB7IHEudm0uY21kKGNtZEhpc3RbbklkeF0pOyAgIHJldHVybn1cbiAgICAgIC8vIGNsKHt1cDplLmtleUNvZGU9PUFSUk9XX1VQLGRvd246ZS5rZXlDb2RlPT1BUlJPV19ET1dOLG5pZHg6bklkeCxjbWRsZW46Y21kSGlzdC5sZW5ndGgsc3Rhc2g6cS52bS5zdGFzaENtZCgpfSlcbiAgICB9XG4gIH0sXG4gIHZpZXc6IHZpZXdGblxufVxud2luZG93LnEgPSBxO1xuICAgICAgICAvLyA8VGVybWluYWwgbXNncz17bXNnc30gYU09e3ZtLnVpfS8+XG5cbmZ1bmN0aW9uIHF1YWdnYSgpIHtcbiAgdmFyICRpLCAkbywgJHNjbCwgJHVpLCBzdGF0ZSwgd3M7XG4gICAgICAgIC8vIGxvdyBsZXZlbCBmdW5jdGlvbnM6XG4gIGZ1bmN0aW9uIGtkKGV2KSB7XG4gICAgY29uc29sZS5sb2coZXYpO1xuICAgIGlmIChldi5rZXlDb2RlPT0xMHx8ZXYua2V5Q29kZT09MTMpIHtcbiAgICAgIHNlbmRpKCk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHFlc2MoZGF0YSkge1xuICAgIHJldHVybiBkYXRhLnJlcGxhY2UoJ1wiJywgJ1xcXFxcIicsIGRhdGEpO1xuICB9XG4gIGZ1bmN0aW9uIHNldHN0YXRlKGRhdGEpIHtcbiAgICBzdGF0ZT1kYXRhO1xuICB9XG4gIC8vIGhpZ2hlciBsZXZlbCBzdHVmZlxuXG4gIC8vIGhhbmRsZSAnZXJyb3IgcmVzcG9uc2VzIGZyb20gc2VydmVyXG4gIGZ1bmN0aW9uIGVycm9yKHJlc3ApIHtcbiAgICAvLyB0cnkgdG8gJ3BhcnNlJyB3aGF0ZXZlciB1c2VyIGVudGVyZWRcbiAgICBjbChbJ2Vycm9yJyxyZXNwXSk7XG4gICAgd3Muc2VuZHdhaXQoJ3BhcnNlIFwiJytxZXNjKHJlc3BbMV0pKydcIicsIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgY29uc29sZS5sb2coJ2Vycm9yIHBhcnNlJyk7XG4gICAgICBvcSh7ZXJyb3I6IHJlc3BbMF0sIGxpbmU6IHJlc3BbMV0sIHBhcnNlOiByZXN1bHR9KTtcbiAgICB9KTtcbiAgfVxuICB2YXIgdGhyb2JiZXIgPSB7XG4gICAgaWZfOiBmdW5jdGlvbihvbiwgY2xhc3Nlcykge1xuICAgICAgdmFyIGNsYXNzZXM9Y2xhc3Nlcy5zcGxpdCgnICcpO1xuICAgICAgY2xhc3Nlcy5mb3JFYWNoKGZ1bmN0aW9uKGNsKSB7XG4gICAgICAgIHZhciBjYiA9IG9uID8gZnVuY3Rpb24oY2wpeyRzY2wuYWRkKGNsKX0gOiBmdW5jdGlvbihjbCl7JHNjbC5yZW1vdmUoY2wpfTtcbiAgICAgICAgY2IoKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcHVsc2U6IGZ1bmN0aW9uKG9uKSB7XG4gICAgICB0aGlzLmlmXyhvbiwgJ2FuaW1hdGVkIGluZmluaXRlIHB1bHNlJyk7XG4gICAgfSxcbiAgICBzZW5kaW5nOiBmdW5jdGlvbihvbikge1xuICAgICAgdGhpcy5pZl8ob24sICdhbmltYXRlZCBpbmZpbml0ZSBwdWxzZSBzZW5kaW5nJyk7XG4gICAgfVxuICB9XG4gIHZhciBwdWIgPSB7XG4gICAgYm9vdDogZnVuY3Rpb24gYm9vdCgpIHtcbiAgICAgICRzY2wgPSAkJCgnLnN0YXR1cycpLmNsYXNzTGlzdDtcbiAgICAgICR1aSA9ICQkKCcjdWknKTtcbiAgICAgICR1aS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBpbnB1dC5zZW5kLCB0cnVlKTtcbiAgICAgIHdzY29uKCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwdWI7XG59XG5cbi8vIGRlYnVnZ2VyO1xubS5tb3VudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXBwJyksIHEpO1xuIiwiLyoqIEBqc3ggbSAqL1xuJ3VzZSBzdHJpY3QnO1xuaW1wb3J0IG0gZnJvbSAnbWl0aHJpbCdcbmltcG9ydCB7Zm10fSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgRGlyIGZyb20gJy4vRGlyJ1xuaW1wb3J0IFN0YXR1cyBmcm9tICcuL1N0YXR1cydcblxudmFyIHZpZXdGbiA9IChjdHJsLCBhcmdzKSA9PiB7XG4gIGlmICghKCdXZWJTb2NrZXQnIGluIHdpbmRvdykpIHJldHVybiA8aDE+cXVhZ2dhIG5lZWRzIHdlYnNvY2tldCBzdXBwb3J0IGluIHlvdXIgYnJvd3Nlciwgd2hpY2ggeW91IGRvIG5vdCBhcHBlYXIgdG8gaGF2ZTwvaDE+XG5cbiAgdmFyIHt2bX0gPSBxO1xuXG4gIHZhciB0aGluZz0gPGRpdiBjbGFzc05hbWU9e3ZtLnVpRGFyaygpPydkYXJrJzonJ30+XG4gICAgPGRpdiBpZD1cIm5hdlwiPlxuICAgICAgPGEgb25jbGljaz17dm0udG9nZ2xlU3RhdHVzLmJpbmQoKX0+PGkgY2xhc3NOYW1lPXtgc3RhdHVzIGZhIGZhLWNsb3VkICR7dm0uc3RhdHVzT3BlbigpPydvbic6Jyd9YH0+PC9pPjwvYT5cbiAgICAgIDxhIG9uY2xpY2s9eygpID0+IGNlKCd3aGF0IGRvJyl9PjxpIGNsYXNzTmFtZT17XCJ0ZXJtaW5hbCBmYSBmYS10ZXJtaW5hbFwifT48L2k+PC9hPlxuICAgICAgPGEgb25jbGljaz17dm0udG9nZ2xlRGlyLmJpbmQoKX0+PGkgY2xhc3NOYW1lPXtgZGlyIGZhIGZhLXNpdGVtYXAgJHt2bS5kaXJPcGVuKCk/J29uJzonJ31gfT48L2k+PC9hPlxuICAgICAgPGEgb25jbGljaz17dm0udG9nZ2xlVWlEaXJlY3Rpb24uYmluZCgpfT48aSBjbGFzc05hbWU9e2BmYSBmYS1iYXJzICR7dm0udWlEaXJlY3Rpb24oKT09J3Jvdyc/J2ZhLXJvdGF0ZS05MCc6Jyd9YH0vPjwvYT5cbiAgICAgIDxhIG9uY2xpY2s9e3ZtLnRvZ2dsZVVpQ29sb3IuYmluZCgpfT48aSBjbGFzc05hbWU9e2BmYSBmYS1hZGp1c3RgfS8+PC9hPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgaWQ9J3BhbmVzJyBzdHlsZT17YGZsZXgtZGlyZWN0aW9uOiR7dm0udWlEaXJlY3Rpb24oKX1gfT5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtgcGFuZSBzdGF0dXMgJHt2bS5zdGF0dXNPcGVuKCk/J29wZW4nOicnfWB9PjxTdGF0dXMvPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9J3BhbmUgb3BlbiB0ZXJtaW5hbCc+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPSdvdXRwdXQnIGNvbmZpZz17KGVsLGluaXRkKSA9PiB7IGlmICh2bS5qdW1wRG93bigpKSB7ZWwuc2Nyb2xsVG9wPWVsLnNjcm9sbEhlaWdodDsgdm0uanVtcERvd24oZmFsc2UpfSB9IH0+XG4gICAgICAgIHt2bS5tc2dzKCkubWFwKChjKT0+IHtcbiAgICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9J28nPlxuICAgICAgICAgICAge2MuaT88Yj57Yy5pfTxici8+PC9iPjonJ31cbiAgICAgICAgICAgIHtjLm8/Zm10KGMubyk6Jyd9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIH0pfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPHNwYW4+e3Eudm0uY21kKCl9PC9zcGFuPlxuICAgICAgICA8Zm9ybSBvbnN1Ym1pdD17Y3RybC5zdWJtaXQuYmluZCgpfT5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPSdwcm9tcHQnPnEpPC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgb25rZXl1cD17dm0uaGFuZGxlSGlzdG9yeS5iaW5kKCl9XG4gICAgICAgICAgICAgIG9uaW5wdXQ9e20ud2l0aEF0dHIoJ3ZhbHVlJywgdm0uY21kKX1cbiAgICAgICAgICAgICAgdmFsdWU9e3ZtLmNtZCgpfSB0eXBlPSd0ZXh0Jy8+XG4gICAgICAgIDwvZm9ybT5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzc05hbWU9e2BwYW5lIGRpciAke3ZtLmRpck9wZW4oKT8nb3Blbic6Jyd9YH0gPlxuICAgICAgICA8RGlyIGRpckNvbnRlbnRzPXtxLnZtLmRpckNvbnRlbnRzfS8+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG5cbiAgcmV0dXJuIHRoaW5nO1xufVxuZXhwb3J0IGRlZmF1bHQgdmlld0ZuOyIsIi8qKiBAanN4IG0gKi9cbid1c2Ugc3RyaWN0JztcbmV4cG9ydCB2YXIgY2w9Y29uc29sZS5sb2cuYmluZChjb25zb2xlKVxuZXhwb3J0IHZhciBjZT1jb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSlcbmV4cG9ydCBmdW5jdGlvbiB1dWlkKCkge1xuICByZXR1cm4gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbihjKSB7XG4gICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpKjE2fDAsIHYgPSBjID09ICd4JyA/IHIgOiAociYweDN8MHg4KTtcbiAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gIH0pO1xufVxuXG5leHBvcnQgY29uc3QgRUhSRUY9J2phdmFzY3JpcHQ6OydcbmV4cG9ydCBjb25zdCBBUlJPV19VUD0zOFxuZXhwb3J0IGNvbnN0IEFSUk9XX0RPV049NDBcbmV4cG9ydCBjb25zdCBwZD0oZSk9PmUucHJldmVudERlZmF1bHQoKTtcbmV4cG9ydCBjb25zdCBub29wPSgpPT57fVxuXG52YXIgX2ZtdCA9IHtcbiAgJ2FycmF5JzogZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiA8ZGl2PlxuICAgICAgPHNwYW4+YGFycmF5WyR7ZC5sZW5ndGh9XWA6PC9zcGFuPlxuICAgICAgPG9sPntkLm1hcChmbXQpLm1hcCgoZDEpPT4gPGxpPntkMX08L2xpPil9PC9vbD5cbiAgICA8L2Rpdj5cbiAgfSxcbiAgJ251bWJlcic6IChkKSA9PiB7IHJldHVybiBkIH0sXG4gICdvYmplY3QnOiBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIDxkaXY+XG4gICAgICA8c3Bhbj57XCJkaWN0W1wiKyhPYmplY3Qua2V5cyhkKS5sZW5ndGgpK1wiXTpcIn08L3NwYW4+XG4gICAgICA8dGFibGUgY2xhc3NOYW1lPSdvYmonPlxuICAgICAgICB7T2JqZWN0LmtleXMoZCkubWFwKChrKSA9PiBcbiAgICAgICAgICA8dHI+PHRoPntmbXQoayl9PC90aD48dGQ+e2ZtdChkW2tdKX08L3RkPjwvdHI+XG4gICAgICAgICl9XG4gICAgICA8L3RhYmxlPlxuICAgIDwvZGl2PlxuICB9LFxuICAnc3RyaW5nJzogKHgpID0+IHhcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZtdCAoZGF0YSkge1xuICB2YXIgdD10eXBlb2YgZGF0YTtcbiAgaWYgKGRhdGEgaW5zdGFuY2VvZiBBcnJheSkgdD0nYXJyYXknO1xuICAvLyBjb25zb2xlLmxvZygnZm10JywgZGF0YSk7XG4gIGlmIChkYXRhPT09bnVsbCkgcmV0dXJuICdudWxsJztcbiAgcmV0dXJuICh0IGluIF9mbXQpP19mbXRbdF0oZGF0YSk6J25vIGhhbmRsZXIgJyt0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJyMmtleXMgKGFycikge1xuICByZXR1cm4gYXJyLnJlZHVjZSgobyx2KSA9PiB7IG9bdl09bnVsbDsgcmV0dXJuIG99ICx7fSlcbn1cbmV4cG9ydCBmdW5jdGlvbiBhYjJzdHIgKGFiKSB7XG4gIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYWIpO1xuICB2YXIgc3RyID0gJyc7XG4gIGZvciAodmFyIGkgPSAwO2k8dmlldy5sZW5ndGg7aSsrKSB7XG4gICAgc3RyICs9IHZpZXdbaV0udG9TdHJpbmcoMTYpfVxuICByZXR1cm4gc3RyO1xufSIsImltcG9ydCB7c2VyaWFsaXplLGRlc2VyaWFsaXplfSBmcm9tICdjJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gd3Njb24gKCkge1xuICAgIHZhciB3YWl0cSA9IHt9O1xuICAgICAgICAvLyAvLyBoYW5kbGVyIGZvciBzcGVjaWZpYyByZXNwb25zZSB0eXBlcywgd2hlbiB3cmFwcGVkXG4gICAgICAgIC8vIHZhciBoZGxycyA9IHtcbiAgICAgICAgLy8gICAgICdzdGF0ZSc6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgLy8gICAgICAgICBzZXRzdGF0ZShkWzFdKTtcbiAgICAgICAgLy8gICAgIH0sXG4gICAgICAgIC8vICAgICAncSc6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgLy8gICAgICAgICBjb25zb2xlLmxvZygncScsZCk7XG4gICAgICAgIC8vICAgICAgICAgaWYgKGRbMl1bMF09PT1cIidcIikgLy8gZXJyb3JzIGRlbm90ZWQgYnkgJ25hbWVcbiAgICAgICAgLy8gICAgICAgICAgICAgZXJyb3IoZCk7XG4gICAgICAgIC8vICAgICAgICAgZWxzZVxuICAgICAgICAvLyAgICAgICAgICAgICBvcShkWzJdKTtcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfVxuICAgICAgICAvLyBmdW5jdGlvbiByZW5kZXIoZCkge1xuICAgICAgICAvLyAgICAgdmFyIGQgPSBkZXNlcmlhbGl6ZShkKTtcbiAgICAgICAgLy8gICAgIGNsKFsncmVuZGVyJyxkXSk7XG4gICAgICAgIC8vICAgICBpZiAobWF0Y2ggPSBkWzFdLm1hdGNoKC9eSUQ6XCIoWzAtOWEtZi1dKylcIjsvKSkge1xuICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKCd3YWl0cSByZXNwJyxtYXRjaCk7XG4gICAgICAgIC8vICAgICAgICAgaWYgKG1hdGNoWzFdIGluIHdhaXRxKSBcbiAgICAgICAgLy8gICAgICAgICAgICAgd2FpdHFbbWF0Y2hbMV1dKGRbMl0pO1xuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyAgICAgaWYgKGQubGVuZ3RoPj0yICYmIHR5cGVvZiBkWzBdPT0nc3RyaW5nJylcbiAgICAgICAgLy8gICAgICAgICBoZGxyc1tkWzBdXShkKTtcbiAgICAgICAgLy8gICAgIGVsc2UgXG4gICAgICAgIC8vICAgICAgICAgY29uc29sZS5sb2coJ25vIGhhbmRsZXIgZm9yJyxkKTtcbiAgICAgICAgLy8gfVxuXG59XG4iLCIvLyAyMDE0LjAzLjE4IFNlcmlhbGl6ZSBkYXRlIG5vdyBhZGp1c3RzIGZvciB0aW1lem9uZS5cbi8vIDIwMTMuMDQuMjkgRGljdCBkZWNvZGVzIHRvIG1hcCwgZXhjZXB0IGZvciBrZXllZCB0YWJsZXMuXG4vLyAyMDEzLjAyLjEzIEtleWVkIHRhYmxlcyB3ZXJlIG5vdCBiZWluZyBkZWNvZGVkIGNvcnJlY3RseS5cbi8vIDIwMTIuMDYuMjAgRml4IHVwIGJyb3dzZXIgY29tcGF0aWJpbGl0eS4gU3RyaW5ncyBzdGFydGluZyB3aXRoIGAgZW5jb2RlIGFzIHN5bWJvbCB0eXBlLlxuLy8gMjAxMi4wNS4xNSBQcm92aXNpb25hbCB0ZXN0IHJlbGVhc2UsIHN1YmplY3QgdG8gY2hhbmdlXG4vLyBmb3IgdXNlIHdpdGggd2Vic29ja2V0cyBhbmQga2RiK3YzLjAsIChkZSlzZXJpYWxpemluZyBrZGIrIGlwYyBmb3JtYXR0ZWQgZGF0YSB3aXRoaW4gamF2YXNjcmlwdCB3aXRoaW4gYSBicm93c2VyLlxuLy8gZS5nLiBvbiBrZGIrIHByb2Nlc3MsIHNldCAuei53czp7bmVnWy56LnddIC04IXZhbHVlIC05IXg7fVxuLy8gYW5kIHRoZW4gd2l0aGluIGphdmFzY3JpcHQgd2Vic29ja2V0LnNlbmQoc2VyaWFsaXplKFwiMTArMjBcIikpO1xuLy8gd3Mub25tZXNzYWdlPWZ1bmN0aW9uKGUpe3ZhciBhcnJheUJ1ZmZlcj1lLmRhdGE7aWYoYXJyYXlCdWZmZXIpe3ZhciB2PWRlc2VyaWFsaXplKGFycmF5QnVmZmVyKTsuLi5cbi8vIG5vdGUgd3MuYmluYXJ5VHlwZSA9ICdhcnJheWJ1ZmZlcic7XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXNlcmlhbGl6ZSh4KXtcbiAgdmFyIGE9eFswXSxwb3M9OCxqMnAzMj1NYXRoLnBvdygyLDMyKSx1Yj1uZXcgVWludDhBcnJheSh4KSxzYj1uZXcgSW50OEFycmF5KHgpLGJiPW5ldyBVaW50OEFycmF5KDgpLGhiPW5ldyBJbnQxNkFycmF5KGJiLmJ1ZmZlciksaWI9bmV3IEludDMyQXJyYXkoYmIuYnVmZmVyKSxlYj1uZXcgRmxvYXQzMkFycmF5KGJiLmJ1ZmZlciksZmI9bmV3IEZsb2F0NjRBcnJheShiYi5idWZmZXIpO1xuICBmdW5jdGlvbiByQm9vbCgpe3JldHVybiBySW50OCgpPT0xO31cbiAgZnVuY3Rpb24gckNoYXIoKXtyZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShySW50OCgpKTt9XG4gIGZ1bmN0aW9uIHJJbnQ4KCl7cmV0dXJuIHNiW3BvcysrXTt9XG4gIGZ1bmN0aW9uIHJOVUludDgobil7Zm9yKHZhciBpPTA7aTxuO2krKyliYltpXT11Yltwb3MrK107fVxuICBmdW5jdGlvbiByVUludDgoKXtyZXR1cm4gdWJbcG9zKytdO31cbiAgZnVuY3Rpb24gckd1aWQoKXt2YXIgeD1cIjAxMjM0NTY3ODlhYmNkZWZcIixzPVwiXCI7Zm9yKHZhciBpPTA7aTwxNjtpKyspe3ZhciBjPXJVSW50OCgpO3MrPWk9PTR8fGk9PTZ8fGk9PTh8fGk9PTEwP1wiLVwiOlwiXCI7cys9eFtjPj40XTtzKz14W2MmMTVdO31yZXR1cm4gczt9XG4gIGZ1bmN0aW9uIHJJbnQxNigpe3JOVUludDgoMik7dmFyIGg9aGJbMF07cmV0dXJuIGg9PS0zMjc2OD9OYU46aD09LTMyNzY3Py1JbmZpbml0eTpoPT0zMjc2Nz9JbmZpbml0eTpoO31cbiAgZnVuY3Rpb24gckludDMyKCl7ck5VSW50OCg0KTt2YXIgaT1pYlswXTtyZXR1cm4gaT09LTIxNDc0ODM2NDg/TmFOOmk9PS0yMTQ3NDgzNjQ3Py1JbmZpbml0eTppPT0yMTQ3NDgzNjQ3P0luZmluaXR5Omk7fVxuICBmdW5jdGlvbiBySW50NjQoKXtyTlVJbnQ4KDgpO3ZhciB4PWliWzFdLHk9aWJbMF07cmV0dXJuIHgqajJwMzIrKHk+PTA/eTpqMnAzMit5KTt9Ly8gY2xvc2VzdCBudW1iZXIgdG8gNjQgYml0IGludC4uLlxuICBmdW5jdGlvbiByRmxvYXQzMigpe3JOVUludDgoNCk7cmV0dXJuIGViWzBdO31cbiAgZnVuY3Rpb24gckZsb2F0NjQoKXtyTlVJbnQ4KDgpO3JldHVybiBmYlswXTt9XG4gIGZ1bmN0aW9uIHJTeW1ib2woKXt2YXIgaT1wb3MsYyxzPVwiXCI7Zm9yKDsoYz1ySW50OCgpKSE9PTA7cys9U3RyaW5nLmZyb21DaGFyQ29kZShjKSk7cmV0dXJuIHM7fTtcbiAgZnVuY3Rpb24gclRpbWVzdGFtcCgpe3JldHVybiBkYXRlKHJJbnQ2NCgpLzg2NDAwMDAwMDAwMDAwKTt9XG4gIGZ1bmN0aW9uIHJNb250aCgpe3ZhciB5PXJJbnQzMigpO3ZhciBtPXklMTI7eT0yMDAwK3kvMTI7cmV0dXJuIG5ldyBEYXRlKERhdGUuVVRDKHksbSwxKSk7fVxuICBmdW5jdGlvbiBkYXRlKG4pe3JldHVybiBuZXcgRGF0ZSg4NjQwMDAwMCooMTA5NTcrbikpO31cbiAgZnVuY3Rpb24gckRhdGUoKXtyZXR1cm4gZGF0ZShySW50MzIoKSk7fVxuICBmdW5jdGlvbiByRGF0ZVRpbWUoKXtyZXR1cm4gZGF0ZShyRmxvYXQ2NCgpKTt9XG4gIGZ1bmN0aW9uIHJUaW1lc3Bhbigpe3JldHVybiBkYXRlKHJJbnQ2NCgpLzg2NDAwMDAwMDAwMDAwKTt9XG4gIGZ1bmN0aW9uIHJTZWNvbmQoKXtyZXR1cm4gZGF0ZShySW50MzIoKS84NjQwMCk7fVxuICBmdW5jdGlvbiByTWludXRlKCl7cmV0dXJuIGRhdGUockludDMyKCkvMTQ0MCk7fVxuICBmdW5jdGlvbiByVGltZSgpe3JldHVybiBkYXRlKHJJbnQzMigpLzg2NDAwMDAwKTt9XG4gIGZ1bmN0aW9uIHIoKXtcbiAgICB2YXIgZm5zPVtyLHJCb29sLHJHdWlkLG51bGwsclVJbnQ4LHJJbnQxNixySW50MzIsckludDY0LHJGbG9hdDMyLHJGbG9hdDY0LHJDaGFyLHJTeW1ib2wsclRpbWVzdGFtcCxyTW9udGgsckRhdGUsckRhdGVUaW1lLHJUaW1lc3BhbixyTWludXRlLHJTZWNvbmQsclRpbWVdO1xuICAgIHZhciBpPTAsbix0PXJJbnQ4KCk7XG4gICAgaWYodDwwJiZ0Pi0yMClyZXR1cm4gZm5zWy10XSgpO1xuICAgIGlmKHQ+OTkpe1xuICAgICAgaWYodD09MTAwKXtyU3ltYm9sKCk7cmV0dXJuIHIoKTt9XG4gICAgICBpZih0PDEwNClyZXR1cm4gckludDgoKT09PTAmJnQ9PTEwMT9udWxsOlwiZnVuY1wiO1xuICAgICAgaWYodD4xMDUpcigpO1xuICAgICAgZWxzZSBmb3Iobj1ySW50MzIoKTtpPG47aSsrKXIoKTtcbiAgICAgIHJldHVyblwiZnVuY1wiO31cbiAgICBpZig5OT09dCl7XG4gICAgICB2YXIgZmxpcD05OD09dWJbcG9zXSx4PXIoKSx5PXIoKSxvO1xuICAgICAgaWYoIWZsaXApe1xuICAgICAgICBvPXt9O1xuICAgICAgICBmb3IodmFyIGk9MDtpPHgubGVuZ3RoO2krKylcbiAgICAgICAgICBvW3hbaV1dPXlbaV07XG4gICAgICB9ZWxzZVxuICAgICAgICBvPW5ldyBBcnJheSgyKSxvWzBdPXgsb1sxXT15O1xuICAgICAgcmV0dXJuIG87XG4gICAgfVxuICAgIHBvcysrO1xuICAgIGlmKDk4PT10KXtcbiAvLyAgICByZXR1cm4gcigpOyAvLyBiZXR0ZXIgYXMgYXJyYXkgb2YgZGljdHM/XG4gICAgICBySW50OCgpOyAvLyBjaGVjayB0eXBlIGlzIDk5IGhlcmVcbiAgICAvLyByZWFkIHRoZSBhcnJheXMgYW5kIHRoZW4gZmxpcCB0aGVtIGludG8gYW4gYXJyYXkgb2YgZGljdHNcbiAgICAgIHZhciB4PXIoKSx5PXIoKTtcbiAgICAgIHZhciBBPW5ldyBBcnJheSh5WzBdLmxlbmd0aCk7XG4gICAgICBmb3IodmFyIGo9MDtqPHlbMF0ubGVuZ3RoO2orKyl7XG4gICAgICAgIHZhciBvPXt9O1xuICAgICAgICBmb3IodmFyIGk9MDtpPHgubGVuZ3RoO2krKylcbiAgICAgICAgICBvW3hbaV1dPXlbaV1bal07XG4gICAgICAgIEFbal09bzt9XG4gICAgICByZXR1cm4gQTt9XG4gICAgbj1ySW50MzIoKTtcbiAgICBpZigxMD09dCl7dmFyIHM9XCJcIjtuKz1wb3M7Zm9yKDtwb3M8bjtzKz1yQ2hhcigpKTtyZXR1cm4gczt9XG4gICAgdmFyIEE9bmV3IEFycmF5KG4pO1xuICAgIHZhciBmPWZuc1t0XTtcbiAgICBmb3IoaT0wO2k8bjtpKyspQVtpXT1mKCk7XG4gICAgcmV0dXJuIEE7fVxuICByZXR1cm4gcigpO31cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZSh4KXt2YXIgYT0xLHBvcz0wLHViLGJiPW5ldyBVaW50OEFycmF5KDgpLGliPW5ldyBJbnQzMkFycmF5KGJiLmJ1ZmZlciksZmI9bmV3IEZsb2F0NjRBcnJheShiYi5idWZmZXIpO1xuICBmdW5jdGlvbiB0b1R5cGUob2JqKXtyZXR1cm4gKHt9KS50b1N0cmluZy5jYWxsKG9iaikubWF0Y2goL1xccyhbYS16fEEtWl0rKS8pWzFdLnRvTG93ZXJDYXNlKCk7fTtcbiAgZnVuY3Rpb24gZ2V0S2V5cyh4KXt2YXIgdj1bXTtmb3IodmFyIG8gaW4geCl2LnB1c2gobyk7cmV0dXJuIHY7fVxuICBmdW5jdGlvbiBnZXRWYWxzKHgpe3ZhciB2PVtdO2Zvcih2YXIgbyBpbiB4KXYucHVzaCh4W29dKTtyZXR1cm4gdjt9XG4gIGZ1bmN0aW9uIGNhbGNOKHgsZHQpe1xuICAgIHZhciB0PWR0P2R0OnRvVHlwZSh4KTtcbiAgICBzd2l0Y2godCl7XG4gICAgICBjYXNlJ251bGwnOnJldHVybiAyO1xuICAgICAgY2FzZSdvYmplY3QnOnJldHVybiAxK2NhbGNOKGdldEtleXMoeCksJ3N5bWJvbHMnKStjYWxjTihnZXRWYWxzKHgpLG51bGwpO1xuICAgICAgY2FzZSdib29sZWFuJzpyZXR1cm4gMjtcbiAgICAgIGNhc2UnbnVtYmVyJzpyZXR1cm4gOTtcbiAgICAgIGNhc2UnYXJyYXknOnt2YXIgbj02O2Zvcih2YXIgaT0wO2k8eC5sZW5ndGg7aSsrKW4rPWNhbGNOKHhbaV0sbnVsbCk7cmV0dXJuIG47fVxuICAgICAgY2FzZSdzeW1ib2xzJzp7dmFyIG49Njtmb3IodmFyIGk9MDtpPHgubGVuZ3RoO2krKyluKz1jYWxjTih4W2ldLCdzeW1ib2wnKTtyZXR1cm4gbjt9XG4gICAgICBjYXNlJ3N0cmluZyc6cmV0dXJuIHgubGVuZ3RoKyh4WzBdPT0nYCc/MTo2KTtcbiAgICAgIGNhc2UnZGF0ZSc6cmV0dXJuIDk7XG4gICAgICBjYXNlJ3N5bWJvbCc6cmV0dXJuIDIreC5sZW5ndGg7fVxuICAgIHRocm93IFwiYmFkIHR5cGUgXCIrdDt9XG4gIGZ1bmN0aW9uIHdiKGIpe3ViW3BvcysrXT1iO31cbiAgZnVuY3Rpb24gd24obil7Zm9yKHZhciBpPTA7aTxuO2krKyl1Yltwb3MrK109YmJbaV07fVxuICBmdW5jdGlvbiB3KHgsZHQpe1xuICAgIHZhciB0PWR0P2R0OnRvVHlwZSh4KTtcbiAgICBzd2l0Y2godCl7XG4gICAgICBjYXNlICdudWxsJzp7d2IoMTAxKTt3YigwKTt9YnJlYWs7XG4gICAgICBjYXNlICdib29sZWFuJzp7d2IoLTEpO3diKHg/MTowKTt9YnJlYWs7XG4gICAgICBjYXNlICdudW1iZXInOnt3YigtOSk7ZmJbMF09eDt3big4KTt9YnJlYWs7XG4gICAgICBjYXNlICdkYXRlJzp7d2IoLTE1KTtmYlswXT0oKHguZ2V0VGltZSgpLShuZXcgRGF0ZSh4KSkuZ2V0VGltZXpvbmVPZmZzZXQoKSo2MDAwMCkvODY0MDAwMDApLTEwOTU3O3duKDgpO31icmVhaztcbiAgICAgIGNhc2UgJ3N5bWJvbCc6e3diKC0xMSk7Zm9yKHZhciBpPTA7aTx4Lmxlbmd0aDtpKyspd2IoeFtpXS5jaGFyQ29kZUF0KCkpO3diKDApO31icmVhaztcbiAgICAgIGNhc2UgJ3N0cmluZyc6aWYoeFswXT09J2AnKXt3KHguc3Vic3RyKDEpLCdzeW1ib2wnKTt9ZWxzZXt3YigxMCk7d2IoMCk7aWJbMF09eC5sZW5ndGg7d24oNCk7Zm9yKHZhciBpPTA7aTx4Lmxlbmd0aDtpKyspd2IoeFtpXS5jaGFyQ29kZUF0KCkpO31icmVhaztcbiAgICAgIGNhc2UgJ29iamVjdCc6e3diKDk5KTt3KGdldEtleXMoeCksJ3N5bWJvbHMnKTt3KGdldFZhbHMoeCksbnVsbCk7fWJyZWFrO1xuICAgICAgY2FzZSAnYXJyYXknOnt3YigwKTt3YigwKTtpYlswXT14Lmxlbmd0aDt3big0KTtmb3IodmFyIGk9MDtpPHgubGVuZ3RoO2krKyl3KHhbaV0sbnVsbCk7fWJyZWFrO1xuICAgICAgY2FzZSAnc3ltYm9scyc6e3diKDApO3diKDApO2liWzBdPXgubGVuZ3RoO3duKDQpO2Zvcih2YXIgaT0wO2k8eC5sZW5ndGg7aSsrKXcoeFtpXSwnc3ltYm9sJyk7fWJyZWFrO319XG4gIHZhciBuPWNhbGNOKHgsbnVsbCk7XG4gIHZhciBhYj1uZXcgQXJyYXlCdWZmZXIoOCtuKTtcbiAgdWI9bmV3IFVpbnQ4QXJyYXkoYWIpO1xuICB3YigxKTt3YigwKTt3YigwKTt3YigwKTtpYlswXT11Yi5sZW5ndGg7d24oNCk7dyh4LG51bGwpO1xuICByZXR1cm4gYWI7fVxuIl19
