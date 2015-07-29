PORT=80
# dont use rlwrap on prod due to segfaults
cmd="q quagga -c 99999 99999 -l -p $PORT"
echo Starting on port $PORT: $cmd
$cmd
