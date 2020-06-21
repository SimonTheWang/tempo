const dataset = require( './JEFITDB.json');
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService implements OnDestroy{



  stretchTime = 1
  exerTime = 0.75


/* data = {
  username : 'username',
  difficulty : 'intermediate',
  equipment : ['bodyweight'],
  bodypart : ['chest'],
  duration : 5,
}
*/
  private newWorkout: Array<Object>
  private _Workout : BehaviorSubject<any> = new BehaviorSubject(this.newWorkout)
  public Workout : Observable<any> = this._Workout.asObservable()

  constructor(private HttpService : HttpService) { }

  createWorkout(username){
    let possibleWorkout = []
    let chosenWorkout = []
    //get preferences of user from database
    this.HttpService.get('/user', {username : username}).then(data=>{
      // creates array of possible exercises using user preferences
      dataset.forEach(exercise => {
        if (data['user'][0].difficulty.includes(exercise.Difficulty)){
          if(data['user'][0].equipment.includes(exercise.Equipment)){
            if(data['user'][0].bodyPart.includes(exercise.Main)){
              if (!data['user'][0].blacklist.includes(exercise.Workout)){          //check blacklist
                possibleWorkout.push(exercise)
              }
            }
          }
        }
      });
      for (var time = 0; time < data['user'][0].workoutDuration; time++){
        //push exercises randomly according to timeframe
        let newExercise = possibleWorkout[Math.floor(Math.random()*(possibleWorkout.length-1))]// gets random exercise from array
        if (!chosenWorkout.includes(newExercise)){
          //avoids duplicate
          chosenWorkout.push(newExercise)
        }
      }
      console.log(chosenWorkout)
      return chosenWorkout
    })
  }
  saveWorkout(chosenWorkout, username){
    //save chosen workout to the database
    let exercises = []
    chosenWorkout.forEach((exercise) => {
      exercises.push(exercise.Workout)
    })
    console.log(exercises)
    //saves current workout to user database
    this.HttpService.post('/user/exercise',{
      username : username,
      date : new Date().toLocaleDateString(),
      time : new Date().toLocaleTimeString(),
      exercises : exercises
    }).then((res) => {
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
}
  ngOnDestroy(){
    this._Workout.unsubscribe()
  }

}
