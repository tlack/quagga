0N!tables[]
if[not`ACTIVITY in tables[];ACTIVITY:0N!([] dt:0Np;     wid: 0Ng;     uid:0Ng;      expr:enlist"init")]
if[not`HITS     in tables[];HITS:0N!    ([] uri: ();    at:();        ip:())]
if[not`USERS    in tables[];USERS:0N!   ([ uid: ()];    last_dt:())]
if[not`WS       in tables[];WS:0N!      ([ wid: ()];    name:();      last_dt:());]
if[not`WS_USER in tables[];WS_USER:0N!  ([] uid: ();    wid:())]
system"S -",($)(*/)(*)"i"$system"openssl rand -hex 2"
DP:{if[DEBUG;-1 x]}
DEBUG:1b;
ISOLATE:0b;
worker_cmd:$[ISOLATE;"sudo -u qclient /opt/q/l32/q";"q"]
.h.HOME:"html"
gulpWatch:{system"gulp watch&"}
\d .quagga
\e 1

words@:where not (any') not (words:read0`:/usr/share/dict/words) in"c"$(til 26)+"i"$"a"

if[not`w in tables`.quagga;w:([wid:()]sockets:();addr:();h:();lastAck:())]
if[()~key`wI;wI:5005]

/ dotZdotPH:.z.ph / backup the standard get handler
/ cleanReq:`qid`expr!({"G"$x};{_[x;0]})
cleanReq:{[req] :(key req)#(`qid`wid`uid`expr`type!("G"$;"G"$;"G"$;::;`$))@'req; }
sendState:{[]                                                                             DP "sending state to ",(string count .quagga.w)," clients";
  {neg[x] -8! (`state;y "value `.")} ./: flip value exec sockets,h from .quagga.w
  }

generateName:{[]
  / TODO: collision
  "-"sv -2?.quagga.words
  }

////////////////////////////////
\d .
REQ:0N;
contents:{"c"$ @[read1;`$.h.HOME,"/",x;""]}

.z.ph:{
  / 0N!x;
  if[(not "." in u)|""~u:first x;u:$[DEBUG;"lr.html";"index.html"]];
  `HITS insert (u;.z.P;.z.a);
  response:contents u;
  $[response~"";
    .h.hn["404";`html;"\n"sv read0 `$.h.HOME,"/404.html"];
    .h.hy[`$last"."vs u;response]]
  }

.z.ts:.quagga.sendState;
.z.wo:{                                                                                   DP"u: ",(string x)," connected from ",(string .z.a);
  }
.z.wc:{                                                                                   DP"u: ",(string x)," disconnected";
  delete from `.quagga.w where any x in sockets
  ;
  }
.z.ws:{                                                                                   DP"ws: ",.Q.s1 x;
  REQ::req:.quagga.cleanReq .j.k x; / use @[;;] here ?
  / ask client to reload if we've lost everything
  / if[0~count .quagga.w; :neg[.z.w] .j.j (1#`type)!1#`reload];
  / (neg x) .j.j (`type`wsName)!(`connect;.quagga.generateName[])
  if[`connect~ req`type;  :neg[.z.w] .j.j handleConnect[.z.w;req]];

  room:exec sockets,h from .quagga.w where .z.w in' sockets;
  WH::worker_handle:(*)room`h;
  if[`dump~     req`type; :neg[.z.w] .j.j requestDump[worker_handle]];
  / if[1b~req[`new]   ; :neg[.z.w] .j.j (enlist`error)!(enlist"nyi")];
  / H::worker_handle;

  `ACTIVITY insert .z.p,value`uid`wid`expr#req;
  (neg worker_handle) ({
    c_handles:x[0];
    q_req:x[1;`expr];
    q_res: @[value;q_req;{"'",x}];
    // N.B. .z.w refers to us here
    (neg .z.w) (`returnAsyncEval; (c_handles;x[1];q_res) )};((*)room`sockets;req))
  / workerRes:@[worker_handle;req[`expr];{"'",x}];
  / res:(`q;req;workerRes);
  / if[100000< -22!res;(res[2]:`$"'result set too large";:neg[.z.w] -8!res)]
  / neg[.z.w] -8!res
  }

requestDump:{
  filename: x (`.util.dumpToFile;());
  -1 "taking a dump";
  :(`dump;filename)
  }

handleConnect:{[client_handle;req]
  REQ::req;
  $[not`uid in key req;[                                                                  DP"generating user token";
      / why doesnt this work? req[`uid]:rand 0Ng;
      req:req,(1#`uid)!1#rand 0Ng;
    ];[                                                                                   DP"touching logged in user";
      req:req,flip select name from USERS where uid=req`uid;
      ]];
  `USERS upsert (req`uid;.z.p);
  $[0~count workspaces:select wid,name from WS_USER ij/(WS;USERS) where uid=req`uid;[     DP"creating a default workspace";
      req:req,(1#`workspaces)!enlist enlist`wid`name!ws:(wid:rand 0Ng;name:.quagga.generateName[]);
      `WS upsert ws,.z.p;
      `WS_USER insert (req`uid;wid);
    ];[                                                                                   DP"getting user workspaces";
      req[`workspaces]:workspaces;
      ]];
  $[0~count select from .quagga.w where wid in req[`workspaces;`wid];[                    DP"spawning a workspace";
      system 0N!worker_cmd," c.q -u 1 -p ",(($).quagga.wI+:1)," -name ",req[`workspaces;0;`name];
      system"sleep 1";
      h:hopen addr:`$"::",($).quagga.wI;
      `.quagga.w upsert (req[`workspaces;0;`wid];(enlist client_handle);addr;h;.z.p);
    ];[                                                                                   DP"attaching to existing workspace";
      update sockets:(distinct each sockets,'client_handle) from `.quagga.w where wid in req[`workspaces;`wid];
      ]];

  :RES::req
  }

returnAsyncEval:{                                                                         DP"returning rAE";
  / destructuring would be nice
  / (client_handles;clientReq;workerRes):x
  X::x;
  RES::res:.j.j `type`in`out!(`eval;x[1;`expr];x[2]);
  neg[x[0]]@\:res
  }

\t 0

.z.exit:{
  / clean up client processes
  }
