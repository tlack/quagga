/** @jsx m */
'use strict';
import m from 'mithril'
import fmt from './util'

var Dir = {
  controller: function (args) {
  },
  view: (ctrl,args) => {
    var contents = args.dirContents();
    // debugger;
    if (contents.length === 0) return <h1>nothing in the current namespace</h1>
    return <table>{Object.keys(contents).map(k =>
      <tr><th className='var'>{k}</th><td>{contents[k]}</td></tr>)}
    </table>
  },
}

export default Dir;