.util.ws_name:(.Q.opt .z.x)[`name;0]
.util.dumpToFile:{[]
  (`$":",.util.ws_name) set get `.
  }



/   / (`$":html/",filename:("c"$ (`int$"a")+10?26),".txt") 0:
/   /   value "k)",/:(string each key `.),'":",' .Q.s1 each value `.; filename
/   }
/ neg (*)"I"$(.Q.opt .z.x)`sup (`clientStarted;::)