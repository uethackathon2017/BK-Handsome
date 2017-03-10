import { Component } from '@angular/core';
import { Platform, ToastController, NavController } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
declare var WifiWizard: any
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  // Custom tab varible
  private numTabs = 3;
  private currentTab = 1;
  private tabContent: HTMLElement;
  private tabHighLight: HTMLElement;
  private frameWidth = 360;
  private frameHeight = 640;
  private scrollLeft = 0;
  private fpa = 15; //frame per animate

  private firstTouchX: number;
  private lastTouchX: number;
  private firstTouchY: number;
  private lastTouchY: number;
  private direction: number = 0; // 1 = vetical; 2 =  horizontal;  0 = unknow
  private firstTouchTime: number;
  private lastTouchTime: number;
  private holdDirection: number = 0; //while hold directon != 0 can not change the direction in touchmove

  private requestId; //id of requestAnimationFrame
  //End Custom tab varible

  constructor(platform: Platform, public toastCtrl: ToastController, public navCtrl: NavController) {

    platform.ready().then(() => {
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }
  // Custom tab function
  ngAfterViewInit() {
    this.tabContent = document.getElementById('tab-content');
    this.frameWidth = this.tabContent.clientWidth;
    this.frameHeight = this.tabContent.clientHeight;
    this.scrollLeft = this.tabContent.scrollLeft;
    this.tabHighLight = document.getElementById('tab-highlight-content');

    if (this.tabContent == undefined) return;
    this.tabContent.addEventListener('touchmove', (event) => {
      event.preventDefault();
      let distanceX = this.lastTouchX - event.touches[0].clientX;
      cancelAnimationFrame(this.requestId);
      this.scrollToLeft(this.tabContent.scrollLeft + distanceX, this.frameWidth / this.fpa, 100 / this.numTabs / this.fpa);

      this.lastTouchX = event.touches[0].clientX;
      this.lastTouchY = event.touches[0].clientY;
    })

    this.tabContent.addEventListener("touchend", (event) => {
      this.lastTouchTime = new Date().getTime();
      let distance = Math.abs(this.lastTouchX - this.firstTouchX);
      let velocity = distance / (this.lastTouchTime - this.firstTouchTime);
      if (distance >= 100 || (distance >= 20 && velocity >= 0.5)) {
        this.currentTab += (this.firstTouchX - this.lastTouchX) / distance;
      }
      if (this.currentTab == 0) { this.currentTab = 1; return; }
      if (this.currentTab == this.numTabs + 1) { this.currentTab = this.numTabs; return; }
      this.activeTab(this.currentTab);
      this.direction = 0;
    });

    this.tabContent.addEventListener('touchstart', (event) => {
      this.firstTouchX = event.touches[0].clientX;
      this.lastTouchX = event.touches[0].clientX;
      this.firstTouchY = event.touches[0].clientY;
      this.lastTouchY = event.touches[0].clientY;
      this.firstTouchTime = new Date().getTime();
    });

    let tabItemContents = <HTMLCollection>document.getElementsByClassName('tab-item-content');
    for (let i = 0; i < tabItemContents.length; i++) {
      let tabItemContent = <HTMLDivElement>tabItemContents[i];
      tabItemContent.addEventListener("touchmove", (event) => {
        event.preventDefault();
        if (this.holdDirection == 2) {
          this.direction = this.holdDirection;
          return
        };
        switch (this.direction) {
          case 1: { // vetical scroll
            event.stopPropagation();
            let thisElm = <HTMLDivElement>event.currentTarget;
            let distanceY = this.lastTouchY - event.touches[0].clientY;
            this.scrollToTop(thisElm, thisElm.scrollTop + distanceY, this.frameHeight / this.fpa);
            this.lastTouchY = event.touches[0].clientY;
            break;
          }
          case 2: { // horizontal scroll
            return;
          }
          default: { // unknow
            event.stopPropagation();
            let distanceX = Math.abs(event.touches[0].clientX - this.firstTouchX);
            let distanceY = Math.abs(event.touches[0].clientY - this.firstTouchY);
            if (distanceX > distanceY) this.direction = 2;
            else this.direction = 1;
            break;
          }
        }
      });

      tabItemContent.addEventListener("touchend", (event) => {
        if (this.direction == 1) {
          let thisElm = <HTMLDivElement>event.currentTarget;
          this.lastTouchTime = new Date().getTime();
          let distance = this.firstTouchY - this.lastTouchY;
          let duration = this.lastTouchTime - this.firstTouchTime
          let velocity = Math.abs(distance / duration);
          let acceleration = velocity / duration * 400;
          if (duration < 1000 && velocity > 0.5) {
            this.scrollToTop(thisElm, thisElm.scrollTop + acceleration * distance, this.frameHeight * acceleration / this.fpa)
          }
          this.direction = 0;
          event.stopPropagation();
        }
      })
    }
  }

  activeTab(tab: number) {
    if (this.requestId != null && this.requestId != undefined) cancelAnimationFrame(this.requestId);
    this.scrollLeft = this.tabContent.scrollLeft;
    let acceleration = Math.abs(this.currentTab - tab);
    if (acceleration == 0) acceleration = 1;
    this.currentTab = tab;
    this.holdDirection = 2;
    this.scrollToLeft((tab - 1) * this.frameWidth, acceleration * this.frameWidth / this.fpa, acceleration * 100 / this.numTabs / this.fpa);
    this.setClassActive();
  }

  scrollToLeft(left: number, delta: number, highlightDelta: number) {
    this.scrollLeft = this.tabContent.scrollLeft;
    let highlightPosition = (left / this.frameWidth) * 100 / this.numTabs; //unit %

    if (this.scrollLeft < left - delta) {
      this.tabContent.scrollLeft += delta;
      this.tabHighLight.style.left = (this.tabHighLight.offsetLeft / this.frameWidth * 100 + highlightDelta) + "%";
      this
      this.requestId = window.requestAnimationFrame(() => this.scrollToLeft(left, delta, highlightDelta));
    } else {
      if (this.scrollLeft > left + delta) {
        this.tabContent.scrollLeft -= delta;
        this.tabHighLight.style.left = (this.tabHighLight.offsetLeft / this.frameWidth * 100 - highlightDelta) + "%";
        this.requestId = window.requestAnimationFrame(() => this.scrollToLeft(left, delta, highlightDelta));
      } else {
        this.tabContent.scrollLeft = left;
        this.tabHighLight.style.left = highlightPosition + '%';
        this.holdDirection = 0;
      }
    }
  }

  scrollToTop(elm: HTMLElement, top: number, delta: number) {
    cancelAnimationFrame(this.requestId);
    let scrollTop: number = elm.scrollTop;
    if (scrollTop + delta < top) {
      elm.scrollTop = scrollTop + delta;
      this.requestId = window.requestAnimationFrame(() => this.scrollToTop(elm, top, delta));
    } else {
      if (scrollTop - delta > top) {
        elm.scrollTop = scrollTop - delta;
        this.requestId = window.requestAnimationFrame(() => this.scrollToTop(elm, top, delta));
      } else {
        elm.scrollTop = top;
      }
    }
  }

  setClassActive() {
    var tabItems = document.getElementsByClassName("tap-item");
    for (var i = 0; i < tabItems.length; i++) {
      tabItems[i].classList.remove('active');
    }

    switch (this.currentTab) {
      case 1: { document.getElementById('tab-home').classList.add('active'); break; }
      case 2: { document.getElementById('tab-feed').classList.add('active'); break; }
      case 3: { document.getElementById('tab-profile').classList.add('active'); break; }
      case 4: { document.getElementById('tab-other').classList.add('active'); break; }
      default: { document.getElementById('tab-home').classList.add('active'); }
    }
  }

  //End custom tab function

  showToast(message: string, duration: number) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: duration
    })
    toast.present();
  }

}
