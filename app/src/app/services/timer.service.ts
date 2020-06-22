import { SidebarComponent } from './../components/sidebar/sidebar.component';
import { Router } from '@angular/router';
import { timer, BehaviorSubject, Observable } from 'rxjs';
import { ElectronService } from 'ngx-electron';
import { Injectable, DoCheck, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  state: string
  notif: Notification

  private _timeAlert: BehaviorSubject<boolean> = new BehaviorSubject(false)
  timeAlert: Observable<boolean> = this._timeAlert.asObservable()

  constructor(private ElectronService: ElectronService,
              private Router: Router,
              private NgZone: NgZone) {

                this.ElectronService.ipcRenderer.on('timeAlert', (event, arg) => {
      console.log(arg)
      this._timeAlert.next(true)
      this.notif = new Notification('Time to Take a Break!', {
        body: 'Your new workout is ready',
        requireInteraction: true,
        // actions: [
        //   {
        //     action: 'Start',
        //     title: "Start",
        //     icon: '../../../logo.png'
        //   }
        // ]
      })
      this.notif.onclick = () => {
        console.log('cliked')
        this.NgZone.run(() => {
          Router.navigateByUrl('/workout')
        })
      }
    })
  }

}
