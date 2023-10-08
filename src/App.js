import logo from './logo.svg';
import {useEffect, useState,useRef} from "react";
import { v4 as uuid } from 'uuid'; 
import './App.css';
import Activity from './Activity';

function App() {
  const [activities,setActivities] = useState([]);
  const [time,setTime] = useState(0);
  const intervalRefMain = useRef(); //create a ref for interval
  const timer = () =>{
    setTime(time => time+1);
  }
  const intervalMain = () => {
    console.log("interval called")

    intervalRefMain.current = setInterval(() => {
      timer();
    }, 1000);
  };
  const updateMainTimer = () =>{
    let mainTimerData = JSON.parse(localStorage.getItem("main-timer"));
    if(!mainTimerData.started){
      mainTimerData.started = true;
      mainTimerData.startTime = Date.now();
    }
    if(mainTimerData.count === 0){
      clearInterval(intervalRefMain.current);
      mainTimerData.timelapsed = time;
      mainTimerData.resumed = false;
  
    }else if(mainTimerData.count >= 0 && !mainTimerData.resumed){
      mainTimerData.resumeTime = Date.now();
      mainTimerData.resumed = true
      intervalMain();
    }
    localStorage.setItem("main-timer",JSON.stringify(mainTimerData));
  }
  const deleteMainTimer = () =>{
    const mainTimerData = JSON.parse(localStorage.getItem("main-timer"));
    const activityList = JSON.parse(localStorage.getItem("activities"));
    if(activityList.length === 0){
      clearInterval(intervalRefMain.current)
      setTime(0)
      mainTimerData.timelapsed = 0
      mainTimerData.count = 0
      mainTimerData.startTime = 0
      mainTimerData.resumeTime = 0
      mainTimerData.resumed = false
      mainTimerData.started = false
      localStorage.setItem("main-timer",JSON.stringify(mainTimerData));

    }
    // if(mainTimerData.resumed){
    //   const minActivity = activityList.reduce((prev, curr) => {
    //     return curr.startTime < prev.startTime ? curr : prev;
    //   });
    //   const timeDiff = parseInt((minActivity.startTime - mainTimerData.startTime)/1000);
    //   setTime(time - timeDiff);
    //   mainTimerData.startTime = minActivity.startTime;
    //   localStorage.setItem("main-timer",JSON.stringify(mainTimerData));
    // }else{

    // }
  }
  useEffect(()=>{
    const activityList = JSON.parse(localStorage.getItem("activities"))?? [];
    let mainTimerData = JSON.parse(localStorage.getItem("main-timer"));
    //check if main timer present in LS
    if(!mainTimerData){
      mainTimerData = {
      "count" : 0,
      "startTime" : 0,
      "resumeTime" : 0,
      "timelapsed" : 0,
      "resumed" :false,
      "started" :false,
    }
    localStorage.setItem("main-timer",JSON.stringify(mainTimerData))
    }
    if(mainTimerData.count!==0){
      const currentTime = Date.now();
      const timeDiff = mainTimerData.timelapsed + parseInt((currentTime - mainTimerData.resumeTime)/1000);
      setTime(timeDiff);
      intervalMain();
    }else{
      setTime(mainTimerData.timelapsed);
    }
    setActivities(activityList);

    return (()=>{
      clearInterval(intervalRefMain.current);
    })
  },[])
  const onAdd = () =>{
    const activityObj = {
      "id" :uuid(),
      "name" : "Activity Name",
      "startTime" :0,
      "pauseTime" : 0,
      "hasStarted":false,
      "resumeTime" : 0,
      "timeElapsed":0,
      "isPaused":true,
      "history" :[],
    }
    const activityList = JSON.parse(localStorage.getItem("activities")) ?? [];
    activityList.push(activityObj);
    localStorage.setItem("activities",JSON.stringify(activityList));
    setActivities(activityList);
  }

  const setNewList = (newActivityList) =>{
    setActivities(newActivityList)
  }
  return (
    <div className="App">
      <div>
        <p>Total time : {time}</p>
      </div>
      <div>
        <button onClick = {onAdd}>Add</button>
      </div>
      <div>
        {activities.map((activity)=>{
          return <Activity key = {activity.id} setActivities={setNewList} data={activity} updateMainTimer={updateMainTimer} deleteMainTimer = {deleteMainTimer}></Activity>
        })}
      </div>
    </div>
  );
}

export default App;
