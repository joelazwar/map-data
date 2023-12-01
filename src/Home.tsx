import { useCallback, useEffect, useRef, useState } from 'react'
//import markers from './markers.json'
import './Home.css'
import { Map, Marker } from "pigeon-maps"
import Modal from './Modal.tsx'
import useMousePosition from './utilities/useMousePosition.tsx'
import axios from 'axios'
import Entry from './Entry.tsx'
import { listMarkers, writeEntry } from './utilities/ddbDoc.ts'

const Home = () => {

  const [markers, setMarkers] = useState<Record<string, any>[]>([])
  const [animating, setAnimating] = useState(false)
  const [modal, setModal] = useState(<></>);
  const [center, setCenter] = useState<[number, number]>([43.653225, -79.383186]);
  const [zoom, setZoom] = useState(11)
  const search = useRef<HTMLInputElement>(null)

  const [newMarker, setNewMarker] = useState(<></>)
  const [newMarkerOn, setNewMarkerOn] = useState(false)
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [value, setValue] = useState(0)
  const [sqf, setSqf] = useState(0)
  const [yearBuilt, setYearBuilt] = useState(new Date().getFullYear())
  const [propType, setPropType] = useState("residential")
  const [coord, setCoord] = useState<[number, number]>([0,0])

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
    setName("")
    setAddress("")
    setPostalCode("")
    setValue(0)
    setSqf(0)
    setYearBuilt(new Date().getFullYear())
    setPropType("residential")
    setCoord([0,0])
  }

  const handleNewMarker = async (event, latLng:[number,number], pixel) =>{
    if(newMarkerOn){
      resetForm()
      return
    }

    try{
      const {data} = await axios.get(`https://geocode.maps.co/reverse?lat=${latLng[0]}&lon=${latLng[1]}`)

      const {address} = data

      console.log(data)


      if(isNaN(data.display_name[0])) setName(data.display_name.split(',')[0]); else setName("")

      setAddress(((address["house_number"] || "") + " " + address["road"]).trim())
      setPostalCode(address["postcode"])
      setNewMarker(<Marker width={50} anchor={latLng}/>)
      setNewMarkerOn(true)
      setCenter(latLng)
      setZoom(17)
      setCoord(latLng)
    }
    catch (err){
      console.error(err)
    }



  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    const id =  crypto.randomUUID()

    const object = {
        id : id,
        title : name,
        address : address,
        postal_code : postalCode,
        coordinates : coord,
        value: value,
        square_footage: sqf,
        property_type: propType,
        year_built: yearBuilt
    }

    console.log(object)
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
            {markers.map(marker => <Entry marker={marker} handleEntryClick={handleEntryClick}/>)}
        </div>
        <div id="map">
          <form onSubmit={(e)=>handleSearch(e)}>
            <input id="address-input" ref={search} type="text" placeholder='Address' name="search"/>
          </form>
          {newMarkerOn? 
          <div id="new-marker-form">
            <form style={{display:"block"}} onSubmit={(e)=>handleFormSubmit(e)}>
              <label>Name</label>
              <input onChange={(e)=>setName(e.currentTarget.value)} value={name} type="text"/>
              <label>Address</label>
              <input onChange={(e)=>setAddress(e.currentTarget.value)} value={address} type="text"/>
              <label>Postal Code</label>
              <input onChange={(e)=>setPostalCode(e.currentTarget.value)} value={postalCode} type="text"/>
              <label>Square Footage {"("}m<sup>2</sup>{")"}</label>
              <input onChange={(e)=>setSqf(e.currentTarget.valueAsNumber)} value={sqf} type="number"/>
              <label>Value</label>
              <input onChange={(e)=>setValue(e.currentTarget.valueAsNumber)} value={value} type="number"/>
              <label>Year Built</label>
              <input onChange={(e)=>setYearBuilt(e.currentTarget.valueAsNumber)} value={yearBuilt} type="number"/>
              <label>Type</label>
              <select onChange={(e)=>setPropType(e.target.value)} defaultValue="residential">
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
              </select>
              <button style={{position:"absolute", bottom:"2%", left:"25%", backgroundColor:"#2e2e2e"}} type="submit">Submit</button>
            </form>
          </div>
          :<></>}
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
              setCoord([0,0])
            }
          }} 
          onClick = {({event, latLng, pixel})=>handleNewMarker(event, latLng, pixel)}
          onAnimationStart={()=>setAnimating(true)}
          onAnimationStop={()=>setTimeout(()=>setAnimating(false),1000)}
          >
            {markers?.map(marker=>
              <Marker 
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
