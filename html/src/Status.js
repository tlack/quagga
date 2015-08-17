/** @jsx m */
'use strict';
import m from 'mithril';
import {EHREF} from './util'

var Status = {
  view: (ctrl,args) => {
    // debugger;
      // {args.dumpLink() ? <a href={args.dumpLink()} target='_blank'>Workspace available for download @ {args.dumpLink()}</a> :null}
    return <div>
      <span><strong>Workspace:</strong> {args.wsName()}</span>
      <Tutorial/>
    </div>
  }
}

var Tutorial = {
  vm: {
    cmds: ['3 3 # til 9', '(div/) (+/;#:) @\\: 10 ? 100', 'system\"ls\"']
  },
  view: (ctrl,args) => {
    return <section>
      <strong>Getting Started</strong>
      <p>Try some commands!</p>
      <ul>{Tutorial.vm.cmds.map((c) =>
        <li><a href={EHREF} onclick={(() => q.vm.cmd(c)).bind()}>{c}</a></li>)
      }</ul></section>
  }
}

export default Status;