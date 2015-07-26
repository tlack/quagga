\d .quagga
\e 1 
/ dotZdotPH:.z.ph / backup the standard get handler
w:([]ws:();addr:();h:();lastAck:())
wI:5005
/ cleanReq:`qid`expr!({"G"$x};{_[x;0]})
cleanReq:`qid`expr!({"G"$x};::)
activity:([] qid: 0Ng; expr:enlist"init")
hits:([] uri:(); at:(); ip:())
sendstate:{
  / -1"sending state to ",(string count .quagga.w)," clients";
  {neg[x] -8! (`state;y "value `.")} ./: flip value exec ws,h from .quagga.w
  }

////////////////////////////////
\d .

REQ:0N;
contents:{"c"$ @[read1;`$.h.HOME,"/",x;""]}
.z.ph:{
	0N!x;
	if[""~u:first x;u:"index.html"];
	`.quagga.hits insert (enlist u;.z.P;.z.a);
	0N!u;
	.h.hy[`$last"."vs u;contents u]}

.z.ts:.quagga.sendstate;
.z.wo:{
  -1"u: ",(string x)," connected from ",(string .z.a);
  system 0N!"q c.q -p ",(string .quagga.wI+:1);
  system"sleep 1";
  h:hopen addr:`$"::",string .quagga.wI;
  `.quagga.w insert ((enlist x);addr;h;.z.p);
  show .quagga.w;
  }
.z.wc:{
  -1 "";
  -1"ws: ",(string x)," disconnected";
  show (`wc;x);
  delete from `.quagga.w where ws=x
  }
.z.ws:{
  -1 "";
  req:-9!x; / use @[;;] here ?
  if[0~count .quagga.w; :neg[.z.w] -8!enlist `reload]; / ask client to reload if we've lost everything
  workerHandle:first exec h from .quagga.w where ws=.z.w;

  if[1b~req[`dump];:neg[.z.w] -8!requestDump[workerHandle]]
  if[not (99h~type req);'"something is wrong"];

  req:.quagga.cleanReq@'req;
  `.quagga.activity insert req;
  / if [not " "~first req[`expr]]

  workerRes:@[workerHandle;req[`expr];{"'",x}];
  res:(`q;req;workerRes);
  if[100000< -22!res;(res[2]:`$"'result set too large";:neg[.z.w] -8!res)]
  neg[.z.w] -8!res
  }

requestDump:{
  filename: x (`.util.dumpToFile;());
  -1 "taking a dump";
  :(`dump;filename)
  }

.h.HOME:"html"
gulpWatch:{system"gulp watch&"}
/gulpWatch[]

\t 5000
