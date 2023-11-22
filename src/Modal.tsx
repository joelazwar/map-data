import './Modal.css'
//import useMousePosition from './useMousePosition';

const Modal = (props) => {

    const {
        title, 
        address, 
        year_built, 
        curr_assesment, 
        property_type} = props.marker

    const pos = {
        top: props.pos["y"] - 100,
        left: props.pos["x"] + 25
    }

    let cad = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'CAD',
    });

    return (
    <div id="modal" style={pos}>
        <img src={`../public/${property_type}.png`} height="100px"/>
        <div id="modal-info">
            <div id="modal-info-line"><div id="value">{title}</div><div id="label">Title</div></div>
            <div id="line"></div>
            <div id="modal-info-line"><div id="value">{address}</div><div id="label">Address</div></div>
            <div id="line"></div>
            <div id="modal-info-line"><div id="value">{year_built}</div><div id="label">Year Built</div></div>
            <div id="line"></div>
            <div id="modal-info-line"><div id="value">{cad.format(curr_assesment)}</div><div id="label">Current Value</div></div>
            <div id="line"></div>
            <div id="modal-info-line"><div id="value">{property_type}</div><div id="label">Type</div></div>
        </div>
    </div>)
}

export default Modal;