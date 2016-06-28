var fs = require('fs'),
http = require('http'),
socketio = require('socket.io'),
url = require("url"),
SerialPort = require("serialport").SerialPort

require('events').EventEmitter.prototype._maxListeners = 100;

var socketServer;
var serialPort;
var portName = '/dev/ttyACM0'; //change this to your Arduino port
var sendData = "";
var isendData=0;

var spawn = require('child_process').spawn,
    ls = spawn('python',['bme280_reader.py']);


var receivedData = "";
var sensorData = "";
var currentTime = "";
var temperature = "";
var pressure = "";
var humidity = "";

var iTempData = 0;
var iPressData = 0;
var iHumidData = 0;



// handle contains locations to browse to (vote and poll); pathnames.
function startServer(route,handle,debug)
{
        // on request event
        function onRequest(request, response) {
          // parse the requested url into pathname. pathname will be compared
          // in route.js to handle (var content), if it matches the a page will
          // come up. Otherwise a 404 will be given.
          var pathname = url.parse(request.url).pathname;
          console.log("Request for " + pathname + " received");
          var content = route(handle,pathname,response,request,debug);
        }

        var httpServer = http.createServer(onRequest).listen(4111, function()
        {
                console.log("Listening at: 192.168.42.1:4111");
                console.log("Server is up");
        });
        serialListener(debug);
        initSocketIO(httpServer,debug);
}

function initSocketIO(httpServer,debug)
{
        socketServer = socketio.listen(httpServer);
        if(debug == false){
                socketServer.set('log level', 1); // socket IO debug off
        }
        socketServer.on('connection', function (socket) {
        console.log("user connected");
        socket.emit('onconnection', {pollOneValue:sendData});
        socketServer.on('update', function(data) {
        socket.emit('message',{pollOneValue:data});
        });
        socket.on('buttonval', function(data) {
                serialPort.write(data + 'E');
        });
        socket.on('sliderval', function(data) {
                serialPort.write(data + 'P');
        });

    });
}
 
// Listen to serial port
function serialListener(debug)
{
    serialPort = new SerialPort(portName, {
        baudrate: 9600,
        // defaults for Arduino serial communication
         dataBits: 8,
         parity: 'none',
         stopBits: 1,
         flowControl: false
    });

    serialPort.on("open", function ()
    {
        console.log('open serial communication');

        // Listens to incoming data
        serialPort.on('data', function(data)
        {
            receivedData += data.toString();

            if (receivedData .indexOf('E') >= 0 && receivedData .indexOf('B') >= 0)
            {
                sendData = receivedData .substring(receivedData .indexOf('B') + 1, receivedData .indexOf('E'));
                receivedData = '';
            }

            // send the incoming data to browser with websockets.
            var iSendData = parseFloat(sendData);

            socketServer.emit('messageEField', {pollOneValue:iSendData});
            socketServer.emit('update', iSendData);

//            var currentData = "";

            ls.stdout.on('data', function (sensor)
            {
                sensorData = sensor.toString();
/*
                if(sensorData != currentData)
                {
                    console.log(sensorData .substring(0, 10));
                    currentData = sensorData;
                }
*/
//              console.log(Date.now());
                if (sensorData .indexOf('T') >= 0 && sensorData .indexOf('C') >= 0 && sensorData .indexOf('P') >= 0)
                {
//                  console.log(sensorData);
                    currentTime = sensorData .substring(sensorData .indexOf('T') + 1, sensorData .indexOf('C'));
            		temperature = sensorData .substring(sensorData .indexOf('C') + 1, sensorData .indexOf('P'));
            		pressure = sensorData .substring(sensorData .indexOf('P') + 1, sensorData .indexOf('H'));
            		humidity = sensorData .substring(sensorData .indexOf('H') + 1, sensorData .indexOf('E'));
			
//                    currentData = 
            		sensorData = '';
                }
//              sensorData = '';
            });

            iTempData = parseFloat(temperature);
            iPressData = parseFloat(pressure);
            iHumidData = parseFloat(humidity);

            socketServer.emit('messageTemp', {pollOneValue:iTempData});
            socketServer.emit('messagePress', {pollOneValue:iPressData});
            socketServer.emit('messageHumid', {pollOneValue:iHumidData});

        });
    });

}


exports.start = startServer;
