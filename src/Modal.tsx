import './Modal.css'
//import useMousePosition from './useMousePosition';

interface ModalProps{
    pos:{x:number,y:number},
    marker:any
}

const Modal = ({pos, marker}:ModalProps) => {

    const {
        title, 
        address, 
        year_built, 
        value, 
        property_type} = marker

    const position = {
        top: pos["y"] - 100,
        left: pos["x"] + 25
    }

    let cad = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'CAD',
    });

    return (
    <div id="modal" style={position}>
        <img src={`./${property_type}.png`} height="100px"/>
        <div id="modal-info">
            <div id="modal-info-line"><div id="value">{title}</div><div id="label">Title</div></div>
            <div id="line"></div>
            <div id="modal-info-line"><div id="value">{address}</div><div id="label">Address</div></div>
            <div id="line"></div>
            <div id="modal-info-line"><div id="value">{year_built}</div><div id="label">Year Built</div></div>
            <div id="line"></div>
            <div id="modal-info-line"><div id="value">{cad.format(value)}</div><div id="label">Current Value</div></div>
            <div id="line"></div>
            <div id="modal-info-line"><div id="value">{property_type[0].toUpperCase() + property_type.slice(1)}</div><div id="label">Type</div></div>
        </div>
    </div>)
}

export default Modal;