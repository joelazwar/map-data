import { useCallback, useEffect, useRef, useState } from 'react'
//import markers from './markers.json'
import './Home.css'
import { Map, Marker } from "pigeon-maps"
import Modal from './Modal.tsx'
import useMousePosition from './utilities/useMousePosition.tsx'
import axios from 'axios'
import Entry from './Entry.tsx'
import { listMarkers, writeEntry } from './utilities/ddbDoc.ts'
import Form from './Form.tsx'

const Home = () => {

  const [markers, setMarkers] = useState<Record<string, any>[]>([])
  const [animating, setAnimating] = useState(false)
  const [modal, setModal] = useState(<></>);
  const [center, setCenter] = useState<[number, number]>([43.653225, -79.383186]);
  const [zoom, setZoom] = useState(11)
  const search = useRef<HTMLInputElement>(null)

  const [newMarker, setNewMarker] = useState(<></>)
  const [newMarkerOn, setNewMarkerOn] = useState(false)
  const name= useRef("")
  const address = useRef("")
  const postalCode = useRef("")
  const coord = useRef<[number, number]>([0,0])

  const pos = useMousePosition();

  const getMarkers = useCallback( async () => {

    const data = await listMarkers();

    console.log(data)

    setMarkers(data)

  }, [])

  useEffect(() => {

    getMarkers().catch((error)=>console.error(error))
  },[getMarkers])

  const handleHover = (marker:any, pos:any) => setModal(<Modal marker={marker} pos={pos}/>) 
  
  const handleOut = () => setModal(<></>)

  const handleSearch = async (e) => {
    e.preventDefault();

    try{
      const {data} = await axios.get(`https://geocode.maps.co/search?q=${search.current?.value}`)

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

  const resetForm = () => {
    setNewMarker(<></>)
    setNewMarkerOn(false)
    name.current = ""
    address.current = ""
    postalCode.current = ""
  }

  const handleNewMarker = async (event, latLng:[number,number], pixel) =>{
    if(newMarkerOn){
      resetForm()
      return
    }

    try{
      const {data} = await axios.get(`https://geocode.maps.co/reverse?lat=${latLng[0]}&lon=${latLng[1]}`)


      console.log(data)


      name.current = isNaN(data.display_name[0]) ? data.display_name.split(',')[0] : ""
      address.current = ((data.address["house_number"] || "") + " " + data.address["road"]).trim()
      postalCode.current = data.address["postcode"]
      coord.current = latLng

      setNewMarker(<Marker width={50} anchor={latLng}/>)
      setNewMarkerOn(true)
      setCenter(latLng)
      setZoom(17)
    }
    catch (err){
      console.error(err)
    }



  }

  const handleFormSubmit = async (object:any) => {

    console.log("Writing entry: ", object)
    
    try{
      
      const res = await writeEntry(object)

      console.log(res)

      await getMarkers()

      resetForm()
    }
    catch(err){
      console.error(err)
    }
    
  }

  const handleEntryClick = (marker:any) =>{

      setCenter([marker.coordinates[0], marker.coordinates[1]]);
      setZoom(15)
    
  }

  return (
    <>
    <h1>Property Data</h1>
    <div style={{display:"flex"}}>
      <div style={{width:"50%"}}>
        <h3>Click on the entries to zoom into markers</h3>
        <h3>Use the search bar to navigate to address</h3>
      </div>
      <div style={{width:"50%"}}>
        <h3>Click anywhere on the map to add a point</h3>
        <h3>Hover over the markers to see more details</h3>
      </div>
    </div>
      <div id="main">
        <div id="list">
            {markers.map((marker, index) => <Entry key={index} marker={marker} handleEntryClick={handleEntryClick}/>)}
        </div>
        <div id="map">
          <form onSubmit={(e)=>handleSearch(e)}>
            <input id="address-input" ref={search} type="text" placeholder='Address' name="search"/>
          </form>
          {newMarkerOn? 
          <Form 
          handleFormSubmit={handleFormSubmit} 
          latLng={coord.current}
          initName={name.current}
          initAddress={address.current}
          initPostalCode={postalCode.current}/>:<></>}
          <Map 
          height={500} 
          center={center} 
          zoom={zoom} 
          animate={true}
          onBoundsChanged={({ center, zoom }) => { 
            setCenter(center)
            setZoom(zoom)
            if(!animating){
              setNewMarker(<></>)
              setNewMarkerOn(false)
            }
          }} 
          onClick = {({event, latLng, pixel})=>handleNewMarker(event, latLng, pixel)}
          onAnimationStart={()=>setAnimating(true)}
          onAnimationStop={()=>setTimeout(()=>setAnimating(false),1000)}
          >
            {markers?.map((marker,index)=>
              <Marker 
              key={index}
              width={50}
              anchor={[marker.coordinates[0], marker.coordinates[1]]} 
              onMouseOver={()=>handleHover(marker, pos)}
              onMouseOut={()=>handleOut()}
              onClick={()=>handleEntryClick(marker)}
              />
            )}

          {newMarker}
          </Map>
        </div>
        {modal}
      </div>
    </>
  )
}

export default Home
