/** @jsx m */
'use strict';
export var cl=console.log.bind(console)
export var ce=console.error.bind(console)
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

export const EHREF='javascript:;'
export const ARROW_UP=38
export const ARROW_DOWN=40
export const LS_KEY = '_quagga_token';
export const pd=(e)=>e.preventDefault();
export const noop=()=>{};

export var _fmt = {
  'array': function(d) {
    return <div>
      <span>`array[${d.length}]`:</span>
      <ol>{d.map(fmt).map((d1)=> <li>{d1}</li>)}</ol>
    </div>
  },
  'number': (d) => { return d },
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
  'string': (x) => x,
	'table': function(d) {
    return <div>
      <span>{"table["+(d.length)+"]:"}</span>
      <table className='obj'>
				<thead>
					<tr>
					{Object.keys(d[0]).map((k)=><th>{fmt(k)}</th>)}
					</tr>
				</thead>
				<tbody>
        {d.map((k) =>
					<tr>
						{Object.keys(k).map((dk)=><td>{fmt(k[dk])}</td>)}
					</tr>)}
				</tbody>
      </table>
    </div>
	}
};

export function fmt (data) {
  var t=typeof data;
  if (data instanceof Array) 
		t=(typeof data[0]=='object')?'table':'array';
  // console.log('fmt', data);
  if (data===null) return 'null';
  return (t in _fmt)?_fmt[t](data):'no handler '+t;
}

export function arr2keys (arr) {
  return arr.reduce((o,v) => { o[v]=null; return o} ,{})
}
export function ab2str (ab) {
  var view = new Uint8Array(ab);
  var str = '';
  for (var i = 0;i<view.length;i++) {
    str += view[i].toString(16)}
  return str;
}

export function getToken() {
  return JSON.parse(localStorage[LS_KEY]||"{}");
}

export function isNewUser(token) {
  return true;
}

export function toggle(prop) {
  return () => prop(!prop())
}