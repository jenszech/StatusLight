# Roadmap
## Geplante Features
* Webhook Anbindung Jenkins
* Webhook Anbindung Grafana


## Changelog
### 1.5.0
* Update dependencies

### 1.4.5
* Change Azure pipeline to check multiple pipelines

### 1.4.4
* Handling of initial hue state
* Handling of Azure build status 'canceled'
* Add more sounds
* Bugfixes


### 1.4.3
* Add Azure pipeline checks

### 1.4.2
* Add shortcut to play sound manualy
* Add config for gain 

### 1.4.1
* Make loglevel configurable

### 1.4.0
* New introduce notifyer
* Report Jira status change as notify
* Report notify with new sound integration

### 1.3.4
* Change declaration to "use strict"
* Bugfix: Some litte Bugs removed

### 1.3.3
* Bugfix issue  #1

### 1.3.2
* Bugfix: Jenkins Check ignore alarm values

### 1.3.1
* New Philips HUE Reporter

### 1.2.0
* Influx Report: Introduce new tag für alarm level
* Html Report: Insert embedded Grafana Panel (for example shows history of alarm changes)
* Config clean up
* Init phase clean up


### 1.1.0
* Count of checks is displayed
* Better group namse for DTSMon based on hostname 
* New Report Plugin for insert a measurement into influx

### 1.0.0
* Some code cleanup
* Introduce a alarm delay for DTSMon checks

### 0.9.3
* Added state related favicon
* Autoreload of the statuspage an visualisation of last reload timestamp
* New Report Plugin for slack reporting on status change
* New Monitoring Plugin for DTSMon monitoring

### 0.9.2
* Migration to ajax calls
* manuel minimal alarming level introduced