PORT=8888
cmd="rlwrap -cr -f . q quagga.q -c 99999 99999 -p $PORT -e 1"
echo Starting on port $PORT: $cmd
$cmd
