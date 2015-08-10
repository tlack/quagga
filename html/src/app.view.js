/** @jsx m */
'use strict';
import m from 'mithril'
import {fmt} from './util'
import Dir from './Dir'

var Status = {
  view: (ctrl,args) => {
    debugger;
      // {args.dumpLink() ? <a href={args.dumpLink()} target='_blank'>Workspace available for download @ {args.dumpLink()}</a> :null}
    return <div>
      <span><strong>Workspace:</strong> {args.wsName()}</span>
    </div>
  }
}

var viewFn = (ctrl, args) => {
  if (!('WebSocket' in window))
    return <h1>quagga needs websocket support in your browser, which you do not appear to have. <a href='//q4a.co/eval/'>Try q4a.co/eval instead</a></h1>

  var {vm} = q;

  var thing= <div className={vm.uiDark()?'dark':''}>
    <div id="nav">
      <a onclick={vm.toggleStatus.bind()}><i className={`status fa fa-cloud ${vm.statusOpen()?'on':''}`}></i></a>
      <a onclick={() => ce('what do')}><i className={"terminal fa fa-terminal"}></i></a>
      <a onclick={vm.toggleDir.bind()}><i className={`dir fa fa-sitemap ${vm.dirOpen()?'on':''}`}></i></a>
      <a onclick={vm.toggleUiDirection.bind()}><i className={`fa fa-bars ${vm.uiDirection()=='row'?'fa-rotate-90':''}`}/></a>
      <a onclick={vm.toggleUiColor.bind()}><i className={`fa fa-adjust`}/></a>
    </div>
    <div id='panes' style={`flex-direction:${vm.uiDirection()}`}>
      <div className={`pane status ${vm.statusOpen()?'open':''}`}><Status {...vm}/></div>
      <div className='pane open terminal'>
        <div className='output' config={(el,initd) => { if (vm.jumpDown()) {el.scrollTop=el.scrollHeight; vm.jumpDown(false)} } }>
        {vm.msgs().map((c)=> {
          return <div className='o'>
            {c.i?<b>{c.i}<br/></b>:''}
            {c.o?fmt(c.o):''}
          </div>
        })}
        </div>
        <span>{q.vm.cmd()}</span>
        <form onsubmit={ctrl.submit.bind()}>
          <label className='prompt'>q)</label>
          <input
              onkeyup={vm.handleHistory.bind()}
              oninput={m.withAttr('value', vm.cmd)}
              value={vm.cmd()} type='text'/>
        </form>
      </div>
      <div className={`pane dir ${vm.dirOpen()?'open':''}`} >
        <Dir dirContents={q.vm.dirContents}/>
      </div>
    </div>
  </div>

  return thing;
}
export default viewFn;