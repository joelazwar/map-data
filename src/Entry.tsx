import './Entry.css'

const Entry = (props:any) => {
    const {handleEntryClick, marker} = props
    return (
        <div id="entry" onClick={()=>handleEntryClick(marker)}>
            <img src={`./${marker["property_type"]}.png`} height="30px"/>
            <div id="entry-info">
                {marker.title}
            </div>
        </div>
    )
}


export default Entry