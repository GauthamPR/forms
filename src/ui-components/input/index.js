
import { getIn } from 'formik';
import './styles.css'

export default function Input({label,placeholder,value,setFieldValue,name,errors}) {
    return (
        <div className='inputContainer'>
            <p className="label"> {label}</p>
            <input placeholder={placeholder} value={value[name]} onChange={(e)=>setFieldValue(name,e.target.value)} className="input"/>
            <p className="errorMsg">{getIn(errors, name)!==undefined?getIn(errors, name):""}</p>
        </div>


    );
}