# Roadmap
## Geplante Features
* GitHub umstellung
* Report Plugin Philips Hue
* Report Plugin Influx 
* Webhook Anbindung Jenkins
* Webhook Anbindung Grafana
* Stündliches Reset


## Changelog
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