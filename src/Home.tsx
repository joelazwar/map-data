import { useRef, useState } from 'react'
import markers from './markers.json'
import './Home.css'
import { Map, Marker } from "pigeon-maps"
import Modal from './Modal.tsx'
import useMousePosition from './useMousePosition.tsx'
import axios from 'axios'
import Entry from './Entry.tsx'

const Home = () => {

  const [modal, setModal] = useState(<></>);
  const [center, setCenter] = useState<[number, number]>([43.653225, -79.383186]);
  const [zoom, setZoom] = useState(11)
  const address = useRef<HTMLInputElement>(null);

  const pos = useMousePosition();

  const handleHover = (marker:any, pos:any) => setModal(<Modal marker={marker} pos={pos}/>) 
  
  const handleOut = () => setModal(<></>)

  const handleSearch = async (e) => {
    e.preventDefault();

    try{
      const {data} = await axios.get(`https://geocode.maps.co/search?q=${address.current?.value}`)

      console.log(data)

      if (data.length < 1) throw new Error("No matches found")

      setCenter([data[0].lat, data[0].lon]);
      setZoom(15)

      //console.log("set center " + data[0].lat + ", " + data[0].lon)
    }
    catch{
      console.error("Error in searching address")
    }
  }

  const handleEntryClick = (marker:any) =>{

      setCenter([marker.coordinates[0], marker.coordinates[1]]);
      setZoom(15)
    
  }

  return (
    <>
      <h1>Property Data</h1>
      <div id="main">
        <div id="list">
            {//markers.map(marker => <li style={{textAlign:"left"}}>{marker.title}</li>)
            }
            {markers.map(marker => <Entry marker={marker} handleEntryClick={handleEntryClick}/>)}
          
        </div>
        <div id="map">
          <form onSubmit={(e)=>handleSearch(e)}>
            <input id="address-input" ref={address} type="text" placeholder='Address' name="address"/>
          </form>
          <Map 
          height={500} 
          center={center} 
          zoom={zoom} 
          animate={true}
          onBoundsChanged={({ center, zoom }) => { 
            setCenter(center)
            setZoom(zoom) 
          }} 
          >
            {markers.map(marker=>
              <Marker 
              width={50}
              anchor={[marker.coordinates[0], marker.coordinates[1]]} 
              onMouseOver={()=>handleHover(marker, pos)}
              onMouseOut={()=>handleOut()}
              />
            )}
          </Map>
        </div>
        {modal}
      </div>
    </>
  )
}

export default Home
