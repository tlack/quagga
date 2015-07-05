import {serialize,deserialize} from 'c';

export default function wscon () {
    var waitq = {};
        // // handler for specific response types, when wrapped
        // var hdlrs = {
        //     'state': function(d) {
        //         setstate(d[1]);
        //     },
        //     'q': function(d) {
        //         console.log('q',d);
        //         if (d[2][0]==="'") // errors denoted by 'name
        //             error(d);
        //         else
        //             oq(d[2]);
        //     }
        // }
        // function render(d) {
        //     var d = deserialize(d);
        //     cl(['render',d]);
        //     if (match = d[1].match(/^ID:"([0-9a-f-]+)";/)) {
        //         console.log('waitq resp',match);
        //         if (match[1] in waitq) 
        //             waitq[match[1]](d[2]);
        //     }
        //     if (d.length>=2 && typeof d[0]=='string')
        //         hdlrs[d[0]](d);
        //     else 
        //         console.log('no handler for',d);
        // }

}
