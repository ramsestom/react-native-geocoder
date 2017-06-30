const googleUrl = 'https://maps.google.com/maps/api/geocode/json';

function format(raw) {
  const address = {
    position: {},
    formattedAddress: raw.formatted_address || '',
    feature: null,
    streetNumber: null,
    streetName: null,
    postalCode: null,
    locality: null,
    country: null,
    countryCode: null,
    adminArea: null,
    subAdminArea: null,
    subLocality: null,
  };

  if (raw.geometry && raw.geometry.location) {
    address.position = {
      lat: raw.geometry.location.lat,
      lng: raw.geometry.location.lng,
    }
  }

  raw.address_components.forEach(component => {
    if (component.types.indexOf('route') !== -1) {
      address.streetName = component.long_name;
    }
    else if (component.types.indexOf('street_number') !== -1) {
      address.streetNumber = component.long_name;
    }
    else if (component.types.indexOf('country') !== -1) {
      address.country = component.long_name;
      address.countryCode = component.short_name;
    }
    else if (component.types.indexOf('locality') !== -1) {
      address.locality = component.long_name;
    }
    else if (component.types.indexOf('postal_code') !== -1) {
      address.postalCode = component.long_name;
    }
    else if (component.types.indexOf('administrative_area_level_1') !== -1) {
      address.adminArea = component.long_name;
    }
    else if (component.types.indexOf('administrative_area_level_2') !== -1) {
      address.subAdminArea = component.long_name;
    }
    else if (component.types.indexOf('sublocality') !== -1 || component.types.indexOf('sublocality_level_1') !== -1) {
      address.subLocality = component.long_name;
    }
    else if (component.types.indexOf('point_of_interest') !== -1 || component.types.indexOf('colloquial_area') !== -1) {
      address.feature = component.long_name;
    }
  });

  return address;
}


export default {
  geocodePosition(apiKey, position, rawFormat) {
    if (!position || !position.lat || !position.lng) {
      return Promise.reject(new Error("invalid position"));
    }
	
	//if (!apiKey){
	//	console.log("WARNING: GOOGLE MAPS REQUESTS PERFORMED WITHOUT API KEY");
	//}

    return this.geocodeRequest(`${googleUrl}?`+(apiKey?`key=${apiKey}&`:'')+`latlng=${position.lat},${position.lng}`, rawFormat);
  },

  geocodeAddress(apiKey, address, rawFormat) {
    if (!address) {
      return Promise.reject(new Error("invalid address"));
    }
	
	//if (!apiKey){
	//	console.log("WARNING: GOOGLE MAPS REQUESTS PERFORMED WITHOUT API KEY");
	//}

    return this.geocodeRequest(`${googleUrl}?`+(apiKey?`key=${apiKey}&`:'')+`address=${encodeURI(address)}`, rawFormat);
  },

  async geocodeRequest(url, rawFormat) {
    const res = await fetch(url);
    const json = await res.json();

    if (!json.results || json.status !== 'OK') {
      return Promise.reject(new Error(`geocoding error ${json.status}, ${json.error_message}`));
    }
	
	if (rawFormat){
		return json.results;
	}
	else {
		return json.results.map(format);
	}
  }
}
