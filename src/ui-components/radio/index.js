import styles from './Radio.module.css'
import { getIn } from 'formik';

export default function Radio({ label, options, value, setFieldValue, name,errors }) {

    return (
        <div>
            <p className={styles.label}> {label}</p>
            {options.map((item,key) =>
                <div key={key}className={styles.radio}>
                    <input
                        className={styles.input}
                        type="radio"
                        id={item.value}
                        onClick={() => setFieldValue(name, item.value)}
                        onChange={()=>console.log()}
                        checked={item.value === value[name] ? true : false} />
                    <label onClick={() => setFieldValue(name, item.value)} className={styles.inputLabel} >{item.name}  Rs {item.value}/-</label>
                </div>)}

                <p className={styles.errorMsg}>{getIn(errors, name) !== undefined ? getIn(errors, name) : ""}</p>
        </div>
    );
}