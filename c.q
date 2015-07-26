.q.system:(::);
.util.dumpToFile:{[] (`$":html/",filename:("c"$ (`int$"a")+10?26),".txt") 0: value "k)",/:(string each key `.),'":",' .Q.s1 each value `.; filename}
/ .z.pg:{(neg logF)(string .z.p)," ",x; value x }

/ if[not 0~system"p";logF:hopen `$":",string system"p"]

