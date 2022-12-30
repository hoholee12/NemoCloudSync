import { Component, ɵSafeResourceUrl } from '@angular/core';
import { Capacitor, Plugins } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, FilesystemDirectory, Encoding, Directory } from '@capacitor/filesystem';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { Geolocation } from '@ionic-native/geolocation';
import { Platform, ModalController } from '@ionic/angular';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';

//for cordova plugins.
//do look into plugin.xml 'clobbers' tag for var name.
declare var window: any;
declare var piexif: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  private file: File;
  public geolat = "";
  public geolong = "";
  public datetime = "";
  public geoerror = "";
  public lat: number;
  public long: number;
  public mtime: number;

  //this is for changing upload pattern
  public delaytime = 0; //delay before another send
  public delaycount = 100; //number of files to send in batch

  //this is for determining whether to send directly or via cloud
  public latencylimit = 100;
  public latencyadd = 0;
  public delayswitch = false;

  //this is for latency check
  public displayLatency = '';
  public displayLatency2 = '';
  seamlessMode: boolean;
  photo: SafeResourceUrl;
  public sendlatencystat: number;
  public path = "";
  public sftp: any;

  constructor(private sanitizer: DomSanitizer, private http: HttpClient, private platform: Platform, 
  private diagnostic: Diagnostic, private fileChooser: FileChooser, private filePath: FilePath) {
    this.locate();  //due to async, geolocation may not be updated in time.
  }

  //for browser(deprecated)
  //use with ssl disabled.
  locate(){
    if(this.diagnostic.isLocationAuthorized() && this.diagnostic.isLocationAvailable()){
       this.platform.ready().then(()=>{
        Geolocation.watchPosition({enableHighAccuracy: true}).subscribe((pos)=>{
          this.lat = pos.coords.latitude;
          this.long = pos.coords.longitude;
          this.geolat = "latitude: " + pos.coords.latitude;
          this.geolong = "longitude: " + pos.coords.longitude;
        });

        this.updatedatetime();
      });
    }
    else{
      this.lat = 1234;
      this.long = 1234;
      this.geolat = "latitude: not authorized?";
      this.geolong = "longitude: not authorized?";
    }
  }

//this is for timestamp
  updatedatetime(){
    var date = new Date();
    this.datetime = date.getFullYear() + ':' + ('0' + date.getMonth()).slice(-2) + ':' + ('0' + date.getDay()).slice(-2) + ' ' + 
	('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getDay()).slice(-2);
  }

  async dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);
  
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
  
    // create a view into the buffer
    var ia = new Uint8Array(ab);
  
    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
  
    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], {type: mimeString});
    return blob;
  
  }
  
  isChecked() {
    console.log('State:' + this.seamlessMode);
  	if(this.seamlessMode) this.geoerror = 'upload checked';

    /* TODO: Add transmission code (seamlessMode == true) */
  }
  
 //this is to convert to base64 code from path
  async base64FromPath(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject('method did not return a string')
        }
      };
      reader.readAsDataURL(blob);
    });
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  //use upload list to batch send via sftp
  public uplist:{remote: string, local: string}[] = [];
  batchUpload(firstphotopath: string){
    var count = 0;
    var total = 0;

    Filesystem.readdir({path: '', directory: Directory.Documents}).then((result)=>{

      this.uplist = [];
      var counter = result.files.length;
      var countertotal = counter;
      
      result.files.forEach((filename, idx)=>{
        total++;

        Filesystem.readFile({path: filename, directory: Directory.Documents}).then((result)=>{
          
          //get the target exif
          var convertedData = atob(result.data);
          var exifObj = piexif.load(convertedData);

          //1. photo taken in range of 0.0000005 lat/long
          var latoff = Math.floor(this.lat * 10000000) - Math.floor(piexif.GPSHelper.dmsRationalToDeg(exifObj["GPS"][piexif.GPSIFD.GPSLatitude]) * 10000000);
          var longoff = Math.floor(this.long * 10000000) - Math.floor(piexif.GPSHelper.dmsRationalToDeg(exifObj["GPS"][piexif.GPSIFD.GPSLongitude]) * 10000000);
          var parsetime:string = exifObj["GPS"][piexif.GPSIFD.GPSDateStamp];
          var resultmtime = 
            parseInt(parsetime.split(' ')[0].split(':')[0]) * 365 * 31 * 24 * 60  +
            parseInt(parsetime.split(' ')[0].split(':')[1]) * 31 * 24 * 60 +
            parseInt(parsetime.split(' ')[0].split(':')[2]) * 24 * 60 +
            parseInt(parsetime.split(' ')[1].split(':')[0]) * 60 +
            parseInt(parsetime.split(' ')[1].split(':')[1]);
            

          if((latoff < 10000 && latoff > -10000 && longoff < 10000 && longoff > -10000)){
            //2. photo taken in under 5 minutes
            var mtimeoff = this.mtime - resultmtime;

            if((mtimeoff < 5 && mtimeoff > -5)){  //TODO: this.mtime
              count++;
              Filesystem.getUri({path:filename, directory: Directory.Documents}).then((result)=>{
                this.path = result.uri.replace('file://', '');

                if(!filename.includes(firstphotopath)){
                  if(this.sendlatencystat == 0){
                    this.uplist.push({remote: '/syncfolder/', local: this.path});
                  }
                  else{
                    this.uplist.push({remote: '/syncfolder/', local: this.path});
                  }
                }

                counter -= 1;
                var copyofuplist = this.uplist.slice();
                if(counter === (total - count)){  //last index
                  
                  this.geoerror = "sent: " + count + " files out of: " + total + " files total";

					//this changes upload path 
                  if(this.delayswitch == true){
                    var start = Date.now();
                    while(Date.now() < start + this.delaytime){}
                  }
                  this.delayswitch = true;
                  if(this.sendlatencystat == 0){
                    this.sftp = new window.JJsftp('115.145.170.225', '8022', 'nemoux', 'nemoux');
                  }
                  else{
                    this.sftp = new window.JJsftp('115.145.170.217', '8022', 'nemoux', 'nemoux');
                  }
                  
                  this.sftp.uploadList(copyofuplist, (success)=>{
            
                    //display result===========================
                    this.displayLatency = 'batch: ' + (this.latencyadd + success.latency) + ' msec';
                    //=========================================
                    this.latencyadd = 0;
                    this.delayswitch = false;

                  }, (fail)=>{

                  });
                  this.uplist = []; //clear array

                }
                else if((countertotal - counter) % this.delaycount === 0){
                  //this changes upload path 
                  if(this.delayswitch == true){
                    var start = Date.now();
                    while(Date.now() < start + this.delaytime){}
                  }
                  this.delayswitch = true;
                  if(this.sendlatencystat == 0){
                    //send to nemodisplay
                    this.sftp = new window.JJsftp('115.145.170.225', '8022', 'nemoux', 'nemoux');
                  }
                  else{
                    //send to cloud server
                    this.sftp = new window.JJsftp('115.145.170.217', '8022', 'nemoux', 'nemoux');
                  }
                  
                  this.sftp.uploadList(copyofuplist, (success)=>{
                    this.displayLatency = "sending batches..." + counter;
                    this.latencyadd += success.latency;

                    //switch to cloud when sending was slower than expected
                    if(success.latency > this.latencylimit * this.delaycount){
                      this.sendlatencystat = 1;
                      this.geoerror = "send the rest via cloud";
                    }

                  }, (fail)=>{
                    
                  });
                  this.uplist = []; //clear array
                  
                }
              }); 
            }
          }
        })
      })
    })
  }
  
//photo button func
  takePhoto(myCameraSource: CameraSource){
    if(this.platform.is('android')){
      const options = {
        quality: 60,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: myCameraSource,
	    	format: "jpeg",
			correctOrientation: true
      };
      if(myCameraSource == CameraSource.Photos){
        this.fileChooser.open().then((url)=>{

			this.filePath.resolveNativePath(url).then((fpath)=>{
				var filename = fpath.split('\\').pop().split('/').pop(); //filename only
				this.geoerror = 'filename:' + filename;

				Filesystem.readFile({path: filename, directory: Directory.Documents}).then((result)=>{

				  //display as base64
				  var str = "data:image/jpeg;base64," + result.data;
				  this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(str);
				  
				  //get the target exif
				  var convertedData = atob(result.data);
				  var exifObj = piexif.load(convertedData);

				  this.lat = piexif.GPSHelper.dmsRationalToDeg(exifObj["GPS"][piexif.GPSIFD.GPSLatitude]);
				  this.long = piexif.GPSHelper.dmsRationalToDeg(exifObj["GPS"][piexif.GPSIFD.GPSLongitude]);
				  var parsetime:string = exifObj["GPS"][piexif.GPSIFD.GPSDateStamp];
				  this.mtime = 
					parseInt(parsetime.split(' ')[0].split(':')[0]) * 365 * 31 * 24 * 60  +
					parseInt(parsetime.split(' ')[0].split(':')[1]) * 31 * 24 * 60 +
					parseInt(parsetime.split(' ')[0].split(':')[2]) * 24 * 60 +
					parseInt(parsetime.split(' ')[1].split(':')[0]) * 60 +
					parseInt(parsetime.split(' ')[1].split(':')[1]);
				  
				   Filesystem.getUri({path:filename, directory: Directory.Documents}).then((result)=>{
					this.path = result.uri.replace('file://', '');
					this.sftp = new window.JJsftp('115.145.170.225', '8022', 'nemoux', 'nemoux');
					this.sftp.upload('/syncfolder/', this.path, (success)=>{
					  if(success.latency < this.latencylimit){
						//send everything via sftp
						this.sendlatencystat = 0;
						this.geoerror = "send the rest via sftp";
					  }
					  else if(success.latency < 1000000){
						//send the rest via cloud
						this.sendlatencystat = 1;
						this.geoerror = "send the rest via cloud";
					  }
					  else{
						//send everything via cloud - sftp failed
						this.sendlatencystat = 2;
						this.geoerror = "unable to connect to nemodisplay: send all via cloud";
					  }
					}, (bad)=>{});
					});
					this.batchUpload(filename); //premigration
				})
			})
        })
      }
      else{
        const fileName = new Date().getTime() + ".jpeg";
        Camera.getPhoto(options).then((image)=>{
          this.locate();	//update location before checking
		  //insert location metadata
          this.base64FromPath(image.webPath).then((base64Data)=>{
            this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(base64Data);

            var exifObj = piexif.load(base64Data);
            if(! exifObj["GPS"][piexif.GPSIFD.GPSLatitude]){
              exifObj["GPS"][piexif.GPSIFD.GPSLatitudeRef] = this.lat < 0 ? 'S' : 'N';
              exifObj["GPS"][piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(this.lat);
              exifObj["GPS"][piexif.GPSIFD.GPSLongitudeRef] = this.long < 0 ? 'W' : 'E';
              exifObj["GPS"][piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(this.long);
              exifObj["GPS"][piexif.GPSIFD.GPSDateStamp] = this.datetime;
              var exifbytes = piexif.dump(exifObj);
              var base64Data = piexif.insert(exifbytes, base64Data) + ''; //workaround type check
            }

            Filesystem.writeFile({
              path: fileName,
              data: base64Data,
              directory: Directory.Documents
            }).then((result)=>{

              if(this.seamlessMode){
                this.path = result.uri.replace('file://', '');
				
                this.sftp = new window.JJsftp('115.145.170.225', '8022', 'nemoux', 'nemoux');
                this.sftp.upload('/syncfolder/', this.path, (success)=>{
                
                  //display result===========================
                  this.displayLatency = 'single: ' + success.latency + ' msec';
                  //=========================================

                }, (bad)=>{}); 
              }
            })
          });
        });
      }
    }
    else{
		//this is for browser
      const options = {
        quality: 60,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: myCameraSource,
	    	format: "jpeg",
			correctOrientation: true
      };
      const fileName = new Date().getTime() + ".jpeg";
      Camera.getPhoto(options).then((image)=>{
        
        this.path = image.webPath;
        this.geoerror = this.path;
          
        this.base64FromPath(image.webPath).then((base64Data)=>{
          var exifObj = piexif.load(base64Data);
          
		  //location metadata
          if(! exifObj["GPS"][piexif.GPSIFD.GPSLatitude]){
            exifObj["GPS"][piexif.GPSIFD.GPSLatitudeRef] = this.lat < 0 ? 'S' : 'N';
            exifObj["GPS"][piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(this.lat);
            exifObj["GPS"][piexif.GPSIFD.GPSLongitudeRef] = this.long < 0 ? 'W' : 'E';
            exifObj["GPS"][piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(this.long);
            var exifbytes = piexif.dump(exifObj);
            var base64Data = piexif.insert(exifbytes, base64Data) + ''; //workaround type check
          }
          this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(base64Data);
          this.geoerror = 'this is it' + base64Data;
          if(this.seamlessMode){
            this.dataURItoBlob(base64Data).then((photoBlob)=>{

              let formData = new FormData();
              formData.append("file", photoBlob, fileName);
              
			  //browser based blob upload
              this.http.post("http://115.145.170.217:3000/upload", formData).subscribe((response)=>{ console.log(response)});
            });
          }
        });
      }); 
    }
  }

//this is for initializing latency checker
  initlatencycheck(){
    this.geoerror = "";
    this.displayLatency = "";
  }

//this is the seamless Mode
  takePicture() {
    this.updatedatetime();
    this.initlatencycheck();
    this.takePhoto(CameraSource.Camera);
  }
  
//this is the pre-migration Mode
  takeGallery() {
    this.updatedatetime();
    this.initlatencycheck();
    this.takePhoto(CameraSource.Photos);  
  }
  
  
}
