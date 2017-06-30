import { NativeModules } from 'react-native';
import GoogleApi from './googleApi.js';

const { RNGeocoder } = NativeModules;


static function getKey (point, possibleValues) {
    var key;
    possibleValues.every(function(val) {
		//if(typeof point != 'object') {return true;}
		return point.hasOwnProperty(val) ? (function() { key = val; return false; }()) : true;
    });
    return key;
}

static function toGeoPoint(position){
	if (!position || typeof position != 'object'){return null;}
	var latitude = getKey(position, ['lat', 'latitude']);
	var longitude = getKey(position, ['lng', 'lon', 'longitude']);
    if (!latitude || !longitude){return null;}
	return {lat: latitude, lng: longitude};
}


export default {
  apiKey: null,

  fallbackToGoogle(key) {
    this.apiKey = key;
  },

  geocodePosition(position, completeFormat) {
	
	var coords = toGeoPoint(position);
	if (!coords) {
      return Promise.reject(new Error("invalid position"));
    }  
		
	if (completeFormat){
		return GoogleApi.geocodePosition(this.apiKey, coords, true);
	}
	else {
		return RNGeocoder.geocodePosition(coords).catch(err => {
		  //if (!this.apiKey) { throw err; }
		  return GoogleApi.geocodePosition(this.apiKey, coords, false);
		});
	}
  },

  geocodeAddress(address, completeFormat) {
    if (!address) {
      return Promise.reject(new Error("address is null"));
    }

	if (completeFormat){
		return GoogleApi.geocodeAddress(this.apiKey, address, true);
	}
	else {
		return RNGeocoder.geocodeAddress(address).catch(err => {
		  //if (!this.apiKey) { throw err; }
		  return GoogleApi.geocodeAddress(this.apiKey, address, false);
		});
	}
  },
}
