PORT=8888
cmd="rlwrap q quagga  -c 99999 99999 -l -p $PORT"
echo Starting on port $PORT: $cmd
$cmd


