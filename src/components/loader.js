import './loader.css'
export default function Loader({ msg }) {

    return (
        <div className='loader'>
            <div className="snippet" data-title=".dot-falling">
                <div className="stage">
                    <div className="dot-falling"></div>
                </div>
            </div>

            <p className='loaderMsg'>{msg}</p>
        </div>
    )
}