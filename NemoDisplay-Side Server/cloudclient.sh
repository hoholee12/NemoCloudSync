#!/bin/bash

sudo docker run -it -v /syncfolder:/syncfolder owncloud/client /bin/bash -c 'while true; do sleep 1; owncloudcmd -u admin -p admin /syncfolder http://115.145.170.217:8080 2>/dev/null; done'
