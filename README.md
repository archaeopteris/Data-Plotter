# Data-Plotter
This plotter was originally designed to be run on Raspberry pi which is configured to be an access point.
The idea is to get data from the BME280 sensor board and arduino board connected to USB port and make a live graph of data in browser.

There is a python script called bme280_reader.py which reads data from bme280 sensor board connected to I2C port and prints it as standart output. Then server.js uses child process to cach the output of python script and gets the data of the sensor board. Simultaneously it reads data from Arduino connected to Serial port.

Data from Arduino must have prefix "B" and suffix "E". For example" B"data"EB"data"EB"data"E, where "data" is your data from Arduino which you want to plot.
We need this because node js keeps received data in buffer array and the size of the array varies from data to data. And with this simple solution we just concatenate received data from character "B" to character "E".

To run the server go to directory where your files are and type in terminal:
$node index.js
Perhaps you would to run it as sudo.

Then in your browser type the IP address or host name of the machine on which server is running and whoala.

Feel free to ask me questions.
