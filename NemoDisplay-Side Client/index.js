"use strict";

//initial variables
var fs = require('fs');
var SFTPServer = require("node-sftp-server");
const { exec } = require('child_process');
var nemosftpsrv = new SFTPServer();

var INotifyWait = require('inotifywait');
var spawn = require('child_process').spawn;
var path = require('path');

var watch1 = new INotifyWait('/syncfolder/', { recursive: false });


watch1.on('ready', function (filename) {
  console.log('NemoDisplay watching for cloud sync...');
});


watch1.on('add', function (filename) {
 var resultfile = '';
 if(filename.indexOf('.jpeg') != -1){
  //from cloud
  var tmpfilename = filename.split('.').slice(0, -2).join('');
  if(tmpfilename == "") return;	//not from cloud.
  resultfile = tmpfilename + '.jpeg';
  //filename
  console.log("cloud: " + resultfile);
  
  //view received image
  //exec("/opt/pkgs/nemo.image/exec -f " + resultfile + " -a nemo.image", (error, stdout, stderr) => {});

  var copytofile = "/opt/contents/default/media/pct/news/" + resultfile.split('/').pop();
  //copy to the Nemo folder
  const stream = fs.createReadStream(filename);
	stream.on('error', function(error){
		fs.createReadStream(resultfile).pipe(fs.createWriteStream(copytofile));
	});
	stream.pipe(fs.createWriteStream(copytofile));
  console.log("copied to "+copytofile);

 }
  
});

//listen to 8022(client)
nemosftpsrv.listen(8022);
console.log("NemoDisplay listening on 8022...");

//connect to client
nemosftpsrv.on("connect", function (auth, info) {
  //reject if its not a connection from client..
  if (auth.method !== "password" || auth.username !== "nemoux" || auth.password !== "nemoux") {
    return auth.reject(["password"], false);
  }
  //auth variables
  var username = auth.username;
  var password = auth.password;

  //accept client
  return auth.accept(function (session) {
    //override writefile
    return session.on("writefile", function (path, readstream) {
      //variables for writestream
      var writestream;
      var filename = path + new Date().getTime() + '.jpeg';

      //create writestream
      writestream = fs.createWriteStream(filename);
      readstream.on("end", function () {
        //filename
		console.log("sftp: " + filename);
		//view received image
		//exec("/opt/pkgs/nemo.image/exec -f " + filename + " -a nemo.image", (error, stdout, stderr) => {});
		//copy to the Nemo folder
		var copytofile = "/opt/contents/default/media/pct/news/" + filename.split('/').pop();
		fs.createReadStream(filename).pipe(fs.createWriteStream(copytofile));
		console.log("copied to "+copytofile);
      });
      //readstream a writestream of sftp connection to client
      return readstream.pipe(writestream);
    });
  });
});

