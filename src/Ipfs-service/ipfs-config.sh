#!/bin/sh
## The shell in the go-ipfs container is busybox, so a version of ash
## Shellcheck might warn on things POSIX sh cant do, but ash can
## In Shellcheck, ash is an alias for dash, but busybox ash can do more than dash
## https://github.com/koalaman/shellcheck/blob/master/src/ShellCheck/Data.hs#L134
echo "setting Gateway config"
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://0.0.0.0:5001", "http://localhost:80", "http://localhost:81", "http://localhost:82", "http://localhost:83", "http://127.0.0.1:5001", "https://webui.ipfs.io"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST"]'