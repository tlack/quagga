/** @jsx m */
'use strict';
import m from 'mithril';

var History = {
  view: (ctrl,args) => {
    return <div>
      {args.stmts.map((c)=>
        <div className='i'>
          <span className='prompt'>q){c.input}</span>
        </div>
      )}
    </div>
  }
}

export default History;