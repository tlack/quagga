function quagga() {
	var MAXQ = 100;
	var $i, $o, $scl, $ui, state, ws;
	// low level functions:
	function $(sel) {
		return typeof(sel)=='object'?sel:document.querySelectorAll(sel);
	}
	function $$(sel) {
		return typeof(sel)=='object'?sel:document.querySelector(sel);
	}
	function cl(data) {
		console.log(data);
	}
	var _fmt = {
		'array': function(d) {
			html = "array["+(d.length)+"]:<ol>";
			html+= "<li>"+d.map(fmt).join("</li><li>")+"</li>";
			return html+"</ol>";
		},
		'number': function(d) {
			return d
		},
		'object': function(d) {
			html = "dict["+(Object.keys(d).length)+"]:<table class=obj>";
			for (var k in d) {
				html += "<tr><th>"+fmt(k)+"</th><td>"+fmt(d[k])+"</td></tr>";
			}
			return html+"</table>";
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
				delete $i;
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
			delete $i;
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
	function wscon() {
		var waitq = {};

		// handler for specific response types, when wrapped
		var hdlrs = {
			'state': function(d) {
				setstate(d[1]);
			},
			'q': function(d) {
				console.log('q',d);
				if (d[2][0]==="'") // errors denoted by 'name
					error(d);
				else
					oq(d[2]);
			}
		}
		function render(d) {
			var d = deserialize(d);
			cl(['render',d]);
			if (match = d[1].match(/^ID:"([0-9a-f-]+)";/)) {
				console.log('waitq resp',match);
				if (match[1] in waitq) 
					waitq[match[1]](d[2]);
			}
			if (d.length>=2 && typeof d[0]=='string')
				hdlrs[d[0]](d);
			else 
				console.log('no handler for',d);
		}

		throbber.pulse(true);
		var wss='WebSocket';
		if (!(wss in window))
			return ui('quagga needs websocket support in your browser, which you do not appear to have');
		ui('Connecting');
		ws=new WebSocket('ws://'+window.location.host); ws.binaryType='arraybuffer';
		ws.onopen=function(e){
			cl(e); 
			throbber.pulse(false);
			ui(wss+' connected');
			ws.send("here[]");
			input.render()
		};
		ws.onclose=function(e){cl(e); ui(wss+' closed')};
		ws.onerror=function(e){cl(e); ui(wss+' error')};
		ws.onmessage=function(e){cl(e); render(e.data); input.render();}//ui(fmt(deserialize(e.data)))};
		ws.sendwait=function(qexpr,cb) { 
			cl(["sendwait",qexpr,cb]);
			if (Object.keys(waitq).length>MAXQ || qexpr.match('/(^|\")ID:')) return; // avoid cycles
			var u=uuid(); waitq[u]=cb; ws.send("ID:\""+u+"\";"+qexpr); }
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
