w:();
/sendstate:{if[count w;{neg[x]-8!enlist(`state;key`.)}each w]}
sendstate:{if[count w;@[{neg[x] -8! (`state;key`.)};;()] each w]}
.z.po:{show(`po;.z.w);w,::.z.w}
.z.pc:{show(`pc;.z.w);w::w except .z.w}
.z.ws:{neg[.z.w] -8! (`q;x;@[value;x;{`$"'",x}]);}
.z.ts:sendstate;

