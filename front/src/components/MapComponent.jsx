
import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';

const mapContainerStyle = {
    width: '100%',
    height: '400px',
};

const initialCenter = {
    lat: -34.6037, // Buenos Aires por defecto
    lng: -58.3816,
};

function MapComponent({ setLatLng }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyCJjLLa7z9aygQ4EjfoIA_zAgweAoCn840',
        libraries: ['places'], // importante para Autocomplete
    });

    const [map, setMap] = useState(null);
    const [location, setLocation] = useState(null);
    const autocompleteRef = useRef(null);

    const onLoad = useCallback((mapInstance) => setMap(mapInstance), []);
    const onUnmount = useCallback(() => setMap(null), []);

    const handleMapClick = (event) => {
        const newLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        };
        setLocation(newLocation);
        setLatLng(newLocation); // actualiza en el padre
    };

    const handlePlaceChanged = () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry && place.geometry.location) {
            const newLocation = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
            };
            setLocation(newLocation);
            setLatLng(newLocation); // actualiza en el padre
            map.panTo(newLocation);
        }
    };

    return isLoaded ? (
        <>
            <div style={{ marginBottom: '10px' }}>
                <Autocomplete
                    onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                    onPlaceChanged={handlePlaceChanged}
                >
                    <input
                        type="text"
                        placeholder="Buscar ubicación"
                        style={{
                            width: '100%',
                            height: '40px',
                            padding: '0 12px',
                            fontSize: '16px',
                        }}
                    />
                </Autocomplete>
            </div>

            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={location || initialCenter}
                zoom={12}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={handleMapClick}
            >
                {location && <Marker position={location} />}
            </GoogleMap>
        </>
    ) : (
        <>Cargando mapa...</>
    );
}

export default React.memo(MapComponent);