import {useEffect, useState} from "react";
import { Icon, Marker, TileLayer} from "leaflet";
import { Map } from "leaflet"
import {BaseService} from "../base.service";
import iconUrl from '../../assets/icon/location.png'
import iconShadow from '../../assets/icon/marker-shadow.png'
import {SearchBox} from "./searchbox";
interface Props {
    lat?: any;
    lng?: any;
    onMapMove: (coords: {lat: any, lng:any}) => void
}
export const MapLatLng = (props: Props) => {
    const icon = new Icon({
        iconUrl: iconUrl,
        shadowUrl: iconShadow,
        iconSize: [50, 50],
        shadowSize: [40, 64],
        iconAnchor: [26, 45],
        shadowAnchor: [14, 60],
        popupAnchor: [-3,-76]
    });
    const [id, setId] = useState<any>();
    const [map, setMap] = useState<Map>();
    const [center, setCenter] = useState<boolean>(false);
    const [allowMove, setAllowMove] = useState<boolean>(false);
    const [marker, setMarker] = useState<Marker>();

    const setMapView = (event: any) => {
        if (map) {
            map.setView([event.lat, event.lng], 18, {
                duration: 500
            });

        }
    }

    const updateCoordinates = (event: any) => {
        props.onMapMove({ lat: event.lat, lng: event.lng });
        setMapView(event);
    }

    useEffect(() => {
        setId(BaseService.uuid());
    }, [])

    useEffect(() => {
        if (id) {
            setTimeout(() => {
                const newMap = new Map(id).setView([0, 0], 18);
                new TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    { attribution:'&copy; <a target="_blank" href="http://tollesoft.com">Tollesoft</a>' }).addTo(newMap);
                setMap(newMap);
            }, 1000);
        }
    }, [id]);

    useEffect(() => {
        if (map) {
            if (!center) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    map.setView([ props.lat ?? pos.coords.latitude, props.lng ?? pos.coords.longitude]);
                    const mark = new Marker([props.lat ?? pos.coords.latitude, props.lng ?? pos.coords.longitude], {icon: icon});
                    mark.addTo(map);
                    setMarker(mark);
                    setMap(map);
                    setCenter(true);
                }, () => {}, { enableHighAccuracy: true })
            }

            if (allowMove) {
                map.on('move', () => {
                    if (marker) {
                        marker.setLatLng(map.getCenter());
                        setMarker(marker);
                        props.onMapMove(map.getCenter());
                    }
                })
            }
        }
    }, [map, center, allowMove])

    useEffect(() => {
        if (marker) {
            setAllowMove(true);
        }
    }, [marker]);

    return (
        <>
            <div className={'absolute inset-0 rounded overflow-auto'}>
                <div className={'w-full h-full relative'}>
                    <div className={'absolute top-1 right-1 z-[999]'}>
                        <SearchBox onValueChange={updateCoordinates} rounded={'rounded'} allowSearch={true}/>
                    </div>
                    <div className={'w-full h-full'} id={id}></div>
                </div>
            </div>
        </>
    )
}
