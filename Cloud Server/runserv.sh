#!/bin/bash

if [[ $(which docker) == "" ]]; then
	sudo apt install docker.io -y
	sudo docker pull owncloud/server
fi
mkdir $HOME/syncfolder
sudo docker run --rm --name oc-eval -d -e OWNCLOUD_DOMAIN=localhost:8080 -p8080:8080 owncloud/server
