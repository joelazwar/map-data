import { useState } from "react"
import "./Form.css"

interface FormProps{
    handleFormSubmit: (object:any) => void;
    latLng : [number,number]
    initName : string
    initAddress : string
    initPostalCode : string
}

const Form = ({handleFormSubmit, latLng, initName, initAddress, initPostalCode}:FormProps) => {

    
  const [name, setName] = useState(initName)
  const [address, setAddress] = useState(initAddress)
  const [postalCode, setPostalCode] = useState(initPostalCode)
  const [value, setValue] = useState(0)
  const [sqf, setSqf] = useState(0)
  const [yearBuilt, setYearBuilt] = useState(new Date().getFullYear())
  const [propType, setPropType] = useState("residential")

    return(
        <div id="new-marker-form">
            <form 
             style={{display:"block"}}
             onSubmit={(e)=>{
                e.preventDefault()
                handleFormSubmit({
                    id : crypto.randomUUID(),
                    title : name,
                    address : address,
                    postal_code : postalCode,
                    coordinates : latLng,
                    value: value,
                    square_footage: sqf,
                    property_type: propType,
                    year_built: yearBuilt
                })
                }}>
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
    )
}

export default Form