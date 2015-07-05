PORT=8888
cmd="rlwrap -cr -f . q quagga -c 99999 99999 -l -p $PORT"
echo Starting on port $PORT: $cmd
$cmd
