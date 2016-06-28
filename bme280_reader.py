#!/usr/bin/python
import sys
import datetime
import os

from time import sleep

from Adafruit_BME280 import *

filename = "wheather_log.txt"
message = "none"

sensor = BME280(mode=BME280_OSAMPLE_8)

while(1):
	current_time = datetime.datetime.now().time()

	degrees = sensor.read_temperature()
	pascals = sensor.read_pressure()
	hectopascals = pascals / 100
	humidity = sensor.read_humidity()

	fileMessage = str(current_time.isoformat()) + "\t" + str(degrees) + "\t" + str(hectopascals) + "\t" + str(humidity) + "\n"
	nodeMessage = "T" + str(current_time.isoformat()) + "C" + str(degrees) + "P" + str(hectopascals) + "H" + str(humidity) + "E"

	with open(filename, "a") as myfile:
		myfile.write(fileMessage)

#	os.system("clear");	
	print nodeMessage
	sys.stdout.flush()

	fileMessage = ""
	nodeMessage = ""

	time.sleep(1)
