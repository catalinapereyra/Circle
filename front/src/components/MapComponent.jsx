import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
    width: '100%',
    height: '400px'
};

const initialCenter = {
    lat: -34.6037,  // Buenos Aires por defecto
    lng: -58.3816
};

function MapComponent({ setLatLng }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyCJjLLa7z9aygQ4EjfoIA_zAgweAoCn840'
    });

    const [map, setMap] = useState(null);
    const [location, setLocation] = useState(null);

    const onLoad = useCallback(map => setMap(map), []);
    const onUnmount = useCallback(() => setMap(null), []);

    const handleMapClick = useCallback((event) => {
        const newLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        };
        setLocation(newLocation);
        setLatLng(newLocation);
    }, [setLatLng]);

    const sendLocationToBackend = async (latitude, longitude) => {
        const token = localStorage.getItem("access_token"); // Asegurate de haberlo guardado en login

        try {
            const response = await fetch('/user/update_location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ latitude, longitude })
            });

            const data = await response.json();
            console.log('Respuesta del backend:', data);

            if (response.ok) {
                // (Opcional) Buscar usuarios cercanos después de guardar
                fetchNearbyUsers(latitude, longitude);
            }

        } catch (error) {
            console.error('Error al enviar ubicación:', error);
        }
    };

    const fetchNearbyUsers = async (latitude, longitude) => {
        const token = localStorage.getItem("access_token");

        try {
            const response = await fetch('/user/nearby_users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    latitude,
                    longitude,
                    distance: 1000  // 1000 metros por ejemplo
                })
            });

            const users = await response.json();
            console.log('Usuarios cercanos:', users);

        } catch (error) {
            console.error('Error al buscar usuarios cercanos:', error);
        }
    };

    return isLoaded ? (
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
    ) : <>Cargando mapa...</>;
}

export default React.memo(MapComponent);