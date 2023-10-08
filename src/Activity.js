import { useEffect, useState ,useRef} from 'react';
import './App.css';

function Activity(props) {
    const [historyData,setHistoryData] = useState([]);
    const [hasHistory,setHasHistory] = useState(false);
    const [time,setTime] = useState(0);
    const [isPaused,setIsPaused] = useState(true);
    const intervalRef = useRef(); //create a ref for interval
    const timer = () =>{
        setTime(time => time+1);
    }
    const interval = () => {
        intervalRef.current = setInterval(() => {
          timer();
        }, 1000);
      };
    const getDateTime = (timestamp) =>{
        const dateFormat = new Date(timestamp);
        const dateTime = dateFormat.getDate()+
           "/"+(dateFormat.getMonth()+1)+
           "/"+dateFormat.getFullYear()+
           " "+dateFormat.getHours()+
           ":"+dateFormat.getMinutes()+
           ":"+dateFormat.getSeconds();

        return dateTime;
    }
    useEffect(()=>{
        const activityData = props.data;
        setHasHistory(activityData.hasStarted);
        setHistoryData(activityData.history);
        if(!activityData.hasStarted){

        }
        else if(activityData.hasStarted && !activityData.isPaused){
            const currentTime = Date.now();
            const prevTime = activityData.resumeTime;
            const timeDiff = activityData.timeElapsed + parseInt((currentTime-prevTime)/1000);
            setTime(timeDiff);
            setIsPaused(false);
            interval();

        }else if(activityData.hasStarted && activityData.isPaused){
            setTime(activityData.timeElapsed)
            setIsPaused(true)
        }

        return (()=>{
            clearInterval(intervalRef.current);
        })
    },[])
    const handlePause = () =>{
        setIsPaused(true)
        //handle activity list functions
        const activityList = JSON.parse(localStorage.getItem("activities"));
        const newActivityList = []
        activityList.forEach(activity => {
            if((activity.id === props.data.id)){
                const currentTime = Date.now();
                const historyDataList = activity.history
                const newHistoryData = "activity started at "+getDateTime(activity.resumeTime)+" and stopped at " +getDateTime(currentTime);
                historyDataList.push(newHistoryData);
                activity.isPaused = true;
                activity.timeElapsed = time;
                activity.pauseTime = currentTime;
                // activity.history.push(newHistoryData);
                newActivityList.push(activity)
                setHistoryData(historyDataList);
            }
            else{
                newActivityList.push(activity)
            }
        });
        localStorage.setItem("activities",JSON.stringify(newActivityList));
        //handle main item functions
        const mainTimerData = JSON.parse(localStorage.getItem("main-timer"));
        mainTimerData.count--;
        localStorage.setItem("main-timer",JSON.stringify(mainTimerData));
        props.updateMainTimer();
        clearInterval(intervalRef.current);
    }
    const handleStart = () =>{
        //handle activity list functions
        const activityList = JSON.parse(localStorage.getItem("activities"));
        const newActivityList = []
        activityList.forEach(activity => {
            
            if((activity.id === props.data.id)){
                const currentTime = Date.now();
                if(!activity.hasStarted){
                    const historyDataList = activity.history
                    const newHistoryData = "activity started at "+getDateTime(currentTime)+ "(Active)" 
                    historyDataList.push(newHistoryData);
                    activity.hasStarted = true
                    activity.startTime = currentTime;
                    setHistoryData(historyDataList);
                    setHasHistory(true);
                }
                activity.isPaused = false;
                activity.resumeTime = currentTime;
                newActivityList.push(activity)
            }
            else{
                newActivityList.push(activity)
            }
        });
        localStorage.setItem("activities",JSON.stringify(newActivityList));
        //handle main item functions
        const mainTimerData = JSON.parse(localStorage.getItem("main-timer"));
        mainTimerData.count++;
        localStorage.setItem("main-timer",JSON.stringify(mainTimerData));
        props.updateMainTimer();
        setIsPaused(false)
        interval();
    }
    const handleDelete = () =>{
        console.log("delete called")
        const activityList = JSON.parse(localStorage.getItem("activities"));
        const newActivityList = []
        activityList.forEach(activity => {
            if(!(activity.id === props.data.id)){
                newActivityList.push(activity)
            }
        });
        console.log(newActivityList)
        localStorage.setItem("activities",JSON.stringify(newActivityList));
        props.setActivities(newActivityList);
        const mainTimerData = JSON.parse(localStorage.getItem("main-timer"));
        if(mainTimerData.count !==0) {
            mainTimerData.count--;
        };
        localStorage.setItem("main-timer",JSON.stringify(mainTimerData));
        props.updateMainTimer()
        props.deleteMainTimer()
    }
    return (
    <div style = {{borderStyle: "solid"}}>
        <div>
            Acitvity {props.data.id}
        </div>
        <div>
            <p>{time}</p>
        </div>
        <div>
            {isPaused &&<button onClick={handleStart}>start</button>}
            {!isPaused &&<button onClick={handlePause}>Pause</button>}
            <button onClick={handleDelete}>delete</button>
        </div>
        <div>
            <p>history</p>
            {!hasHistory && <p>No current history</p>}
            {hasHistory && historyData.map((data)=>{
                return <p>{data}</p>
            })}
        </div>

    </div>
    );
}

export default Activity;
