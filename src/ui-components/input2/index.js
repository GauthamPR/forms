
import { getIn } from 'formik';
import styles from './Input2.module.css'

export default function Input({ label, placeholder, value, setFieldValue, name, errors }) {
    return (
        <div className={styles.inputContainer}>
            <p className={styles.label}> {label}</p>
            <input placeholder={placeholder} value={value[name]} 
            style={{
                
               boxShadow:getIn(errors, name) !== undefined ?"0 12px 20px 0 rgba(255, 45, 45, 0.301),inset 0 -1px 8px 0 #ff5f5f6e":"0 12px 20px 0 rgba(136,174,222,0.42),inset 0 -1px 8px 0 #B9D1F1",
               outlineColor: getIn(errors, name) !== undefined ? "red":"#1479ff"
               
            }} 
            onChange={(e) => setFieldValue(name, e.target.value)} className={styles.input} />
            {/* <p className={styles.errorMsg}>{getIn(errors, name) !== undefined ? getIn(errors, name) : ""}</p> */}
        </div>


    );
}