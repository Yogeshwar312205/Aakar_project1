import { useEffect, useState } from "react";

function CheckBox({
  pemp_id,
  pskill_id,
  pselectedEmp,
  onSelectionChnge,
  disable = false,
  disableCondition,
}) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (disable) {
      setChecked(false);
    } else {
      const isChecked = pselectedEmp.some(
        (emp) => emp.employeeId === pemp_id && emp.skillId === pskill_id
      );
      setChecked(isChecked);
    }
  }, [pselectedEmp, pemp_id, pskill_id, disable]);

  const handleOnChange = () => {
    if (!disable && !disableCondition) {
      const newCheckedState = !checked;
      setChecked(newCheckedState);
      onSelectionChnge(pemp_id, pskill_id, newCheckedState);
    }
  };

  const handleClick = (e) => {
    if (disableCondition) {
      e.preventDefault(); 
    }
  };

  return (
    <div>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleOnChange}
        onClick={handleClick}
        disabled={disable}
        style={{
          cursor: disableCondition ? "not-allowed" : "pointer", 
        }}
      />
    </div>
  );
}

export default CheckBox;
