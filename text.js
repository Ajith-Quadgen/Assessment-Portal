function getTimeStamp() {
    return (new Date().toISOString().slice(0, 10) + " " + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' }));
}
console.log(getTimeStamp())
var x=new Date(getTimeStamp()).getTime()
var y=new Date(+ 60*60*1000).toISOString().slice(0, 10) + " " + new Date(x+ 60*60*1000).toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata' })
//var y=new Date(x+ 60*60*1000)
console.log(y)