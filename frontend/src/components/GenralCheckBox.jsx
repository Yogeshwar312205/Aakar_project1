const GenralCheckBox = ({ emp_id, onSelectionChnge, selectToSend }) => {
    const isChecked = selectToSend.includes(emp_id); 

    const handleChange = (e) => {
        onSelectionChnge(emp_id, e.target.checked);  
    };

    return (
        <input
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            style={{ cursor: 'pointer' }}
        />
    );
};
export default GenralCheckBox;
