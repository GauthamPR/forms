
import Select from 'react-select'
import styles from './Select.module.css'
import { getIn } from 'formik';

export default function Select2({ options, label, name, errors,value,setFieldValue }) {
    const customStyles = {
        control:() => ({
            // backgroundColor:"red",
            display:"flex",
            height: "60px",
            borderRadius: "20px",
            boxShadow:getIn(errors, name) !== undefined ?"0 12px 20px 0 rgba(255, 45, 45, 0.301),inset 0 -1px 8px 0 #ff5f5f6e":"0 12px 20px 0 rgba(136,174,222,0.42),inset 0 -1px 8px 0 #B9D1F1"
          }),
        
      }

    return (
        <div className={styles.selectContainer}>
            <p className={styles.label}> {label}</p>
            <Select  styles={customStyles} value={value} options={options} instanceId onChange={(e)=>setFieldValue(name,e.value)}/>
            {/* <p className={styles.errorMsg}>{getIn(errors, name) !== undefined ? getIn(errors, name) : ""}</p> */}

        </div>

    );
}

