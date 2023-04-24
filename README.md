# NemoCloudSync

This work was supported by Institute of Information & communications Technology Planning & Evaluation(IITP) grant funded by the Korea government(MSIT) (No.2015-0-00284, (SW Starlab) Development of UX Platform Software for Supporting Concurrent Multi-users on Large Displays).

## Overview

NemoCloudSync is a cloud-based storage service engine developed to support large displays.
Based on the [NemoSharing][sharinglink] project, the following features have been added.

* Simpler file sharing between multiple clients.
* Improved accessibility through a web page without using a dedicated API.

[sharinglink]: https://github.com/hoholee12/NemoSharing

## Dependencies

 - NodeJS -v 14.17.0
 - NPM -v 6.14.13
 - Ionic -v 6.16.2
 - NPX -v 6.14.13

## Installation & Build & Running

### Android:

1. Build the web application
```
$ npm install -g @ionic/cli
$ npm install -g @angular/core
$ npm install -g @capacitor/core
$ npm install -g @capacitor/camera
$ npm install -g @angular/platform-browser
$ cd NemoSharing
$ npm install
$ npm uninstall @ionic-native/geolocation --save
$ npm install @ionic-native/geolocation@5.27.0 --save
$ ionic build
$ npx cap sync
$ npx cap open android
```

2. Allow the following permissions in `manifest.xml`
```
<!-- Permissions -->

    <uses-permission android:name="android.permission.INTERNET" />

    <!-- Camera, Photos, input file -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    <!-- Geolocation API -->
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
    <uses-feature android:name="android.hardware.location.gps"/>
    <!-- Network API -->
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
    <!-- Video -->
    <uses-permission android:name="android.permission.CAMERA"/>
    <!-- Audio -->
    <uses-permission android:name="android.permission.RECORD_AUDIO"/>
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS"/>
```

### NemoDisplay-Side Server
NemoDisplay-Side Server is a Nemo Display side component that communicates with the client using the sftp protocol. It launches an image viewer for any image files that have been transferred through the established connection.

Run NemoDisplay-Side Server by:
```
cd "NemoDisplay-Side Server"
sudo ./cloudclient.sh
sudo node index.js
```


### CloudServer-Side Server
CloudServer-Side Server is a Cloud Server side component that communicates with the client using the sftp protocol. It launches an image viewer for any image files that have been transferred through the established connection.

Run CloudServer-Side Server by:
```
cd "CloudServer-Side Server"
sudo node index.js
```

The NemoDisplay-Side Server and the CloudServer-Side Server programs are designed to run only on the NEMOUX platform.

## Demo (how to use)
![Usage-Demo](nemo-demo.gif)

## See Also
* [NEMOUX](https://ko-kr.facebook.com/nemoux/)
* [Owncloud](https://github.com/owncloud/core)

## Contact Info.
Please contact us at <ins>`hoholee12@gmail.com`</ins> with any questions.
###

## Sources Used
### NemoCloudSync Display
* [asn1](https://github.com/TritonDataCenter/node-asn1) MIT License
* [core-util-is](https://github.com/isaacs/core-util-is) MIT License
* [inotifywait](https://github.com/Inist-CNRS/node-inotifywait) MIT License
* [isarray](https://github.com/juliangruber/isarray) MIT License
* [lazy](https://github.com/pkrumins/node-lazy) MIT License
* [os-tmpdir](https://github.com/sindresorhus/os-tmpdir) MIT License
* [readable-stream](https://github.com/nodejs/readable-stream) MIT License
* [safer-buffer](https://github.com/ChALkeR/safer-buffer) MIT License
* [ssh2-streams](https://github.com/mscdex/ssh2-streams) MIT License
* [ssh2](https://github.com/mscdex/ssh2) MIT License
* [streamsearch](https://github.com/mscdex/streamsearch) MIT License
* [string_decoder](https://github.com/nodejs/string_decoder) MIT License
* [tmp](https://github.com/raszi/node-tmp) MIT License
* [inherits](https://github.com/isaacs/inherits) ISC License
* [semver](https://github.com/npm/node-semver) ISC License
* [node-sftp-server](https://github.com/validityhq/node-sftp-server) ISC License
* [npm](https://github.com/npm/cli) The Artistic License 2.0
### NemoCloudSync Mobile
* [android](https://www.android.com/) Apache License 2.0
* [Ionic Capacitor](https://github.com/ionic-team/capacitor) MIT License
* [AngularJS](https://github.com/angular/angular.js?) MIT License
* [piexifjs](https://github.com/hMatoba/piexifjs) MIT License
### Cloud Server
* [tmp](https://github.com/raszi/node-tmp) MIT License
* [string_decoder](https://github.com/nodejs/string_decoder) MIT License
* [streamsearch](https://github.com/mscdex/streamsearch) MIT License
* [ssh2](https://github.com/mscdex/ssh2) MIT License
* [ssh2-streams](https://github.com/mscdex/ssh2-streams) MIT License
* [safer-buffer](https://github.com/ChALkeR/safer-buffer) MIT License
* [readable-stream](https://github.com/nodejs/readable-stream) MIT License
* [os-tmpdir](https://github.com/sindresorhus/os-tmpdir) MIT License
* [isarray](https://github.com/juliangruber/isarray) MIT License
* [core-util-is](https://github.com/isaacs/core-util-is) MIT License
* [asn1](https://github.com/TritonDataCenter/node-asn1) MIT License
* [semver](https://github.com/npm/node-semver) ISC License
* [inherits](https://github.com/isaacs/inherits) ISC License
* [node-sftp-server](https://github.com/validityhq/node-sftp-server) ISC License
* [npm](https://github.com/npm/cli) The Artistic License 2.0
