import { Component } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native'; 
import { HomePage } from '../pages/home/home';
// declare var WifiWizard: any;
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;

  constructor(platform: Platform) {
    this.rootPage = HomePage;
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }
}
