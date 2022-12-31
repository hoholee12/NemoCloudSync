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
