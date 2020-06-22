import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';
import { HttpService } from './../../services/http.service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { WorkoutService } from './../../services/workout.service'
import { MatAccordion } from '@angular/material/expansion';



export class Node {
  children: Node[]
  type: string
  name: string
}

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit, OnDestroy {
  done: boolean = false; // if current exercise is done
  first: boolean = true; // if the component is first loaded
  pause: boolean = false; // if workout is paused
  progress: boolean = false; // if workout is in progress

    // Start with an initial value of 60 seconds
    TIME_LIMIT = (localStorage.getItem('timeout'))? 60 * parseInt(localStorage.getItem('timeout')) : 3600; // time between each workout
    WARNING_THRESHOLD = 20; // changes color
    ALERT_THRESHOLD = 10; // changes color

    // Initially, no time has passed, but this will count up
    // and subtract from the TIME_LIMIT
    timePassed = 0;
    timeLeft = this.TIME_LIMIT;
    timerInterval = null;

    COLOR_CODES = {
      info: {
        color: "green"
      },
      warning: {
        color: "orange",
        threshold: this.WARNING_THRESHOLD
      },
      alert: {
        color: "red",
        threshold: this.ALERT_THRESHOLD
      }
    };


    remainingPathColor = this.COLOR_CODES.info.color;

    // expansion stuff
    @ViewChild(MatAccordion) accordion: MatAccordion;

  constructor(private HttpService : HttpService, private WorkoutService : WorkoutService){

  }

  ngOnInit(){
  }


  ngOnDestroy() {
    this.done = true;
    this.timeLeft = this.TIME_LIMIT
    this.timePassed = 0
    clearInterval(this.timerInterval)
    this.timerInterval = null;
  }

  // time displayed on timer
  formatTimeLeft(time: number) {
    // The largest round integer less than or equal to the result of time divided being by 60.
    const minutes = Math.floor(time / 60);

    // Seconds are the remainder of the time divided by 60 (modulus operator)
    let seconds = time % 60;
    let secondsString;

    // If the value of seconds is less than 10, then display seconds with a leading zero
    if (seconds < 0) {
      return "Done!"
    } else if (seconds == 0) {
      this.stopTimer()
      return 'Next!'
    } else if (seconds < 10) {
      secondsString = `0${seconds}`;
      this.setRemainingPathColor(this.timeLeft)
      // The output in MM:SS format
      return `${minutes}:${secondsString}`;
    } else {
      secondsString = seconds;
      this.setRemainingPathColor(this.timeLeft)
      // The output in MM:SS format
      return `${minutes}:${secondsString}`;
    }
  }
  // workout is started
  startTimer() {
      this.progress = true;
      this.done = false;
      this.first = false;
      this.timerInterval = setInterval(() => {

        // The amount of time passed increments by one
        this.timePassed = this.timePassed += 1;
        this.timeLeft = this.TIME_LIMIT - this.timePassed;

        // The time left label is updated
        document.getElementById("base-timer-label").innerHTML = this.formatTimeLeft(this.timeLeft);
        this.setCircleDasharray();
      }, 1000);
  }
    // each time timer reaches 0 seconds
    stopTimer() {
      this.done = true;
      this.timeLeft = this.TIME_LIMIT
      this.timePassed = 0
      clearInterval(this.timerInterval)
      this.timerInterval = null;}
        // on pause
  pauseTimer() {
    this.pause = true;
    clearInterval(this.timerInterval)
  }
  // on resume
  resumeTimer() {
    this.pause = false;
    this.startTimer();
  }

  // time stuff
  calculateTimeFraction() {
    const rawTimeFraction = this.timeLeft / this.TIME_LIMIT;
    return rawTimeFraction - (1 / this.TIME_LIMIT) * (1 - rawTimeFraction);
  }

  // time stuff
  setCircleDasharray() {
    const circleDasharray = `${(
      this.calculateTimeFraction() * 283
    ).toFixed(0)} 283`;
    document
      .getElementById("base-timer-path-remaining")
      .setAttribute("stroke-dasharray", circleDasharray);
  }

  setRemainingPathColor(timeLeft: number) {
    const { alert, warning, info } = this.COLOR_CODES;

    // If the remaining time is less than or equal to 5, remove the "warning" class and apply the "alert" class.
    if (timeLeft <= alert.threshold) {
      document
        .getElementById("base-timer-path-remaining")
        .classList.remove(warning.color);
      document
        .getElementById("base-timer-path-remaining")
        .classList.add(alert.color);

    // If the remaining time is less than or equal to 10, remove the base color and apply the "warning" class.
    } else if (timeLeft <= warning.threshold) {
      document
        .getElementById("base-timer-path-remaining")
        .classList.remove(info.color);
      document
        .getElementById("base-timer-path-remaining")
        .classList.add(warning.color);
    }


  }
}
