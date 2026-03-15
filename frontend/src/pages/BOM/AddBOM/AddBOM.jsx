import React, { useEffect } from 'react'
import "./AddBOM.css"
import { useForm, Controller } from 'react-hook-form'
import TextField from '@mui/material/TextField'
import { useDispatch } from 'react-redux'
import { updateBomDesign, fetchBom, addBomDesign } from '../../../features/BOM.js'
import { useParams } from 'react-router-dom'

const AddBOM = ({ view, triggerEdit, setTriggerEdit, stageId, onClose }) => {
  const { projectId } = useParams()
  const dispatch = useDispatch()

  const defaultValues = {
    itemCode: '', itemName: '', specification: '', material: '', grade: '',
    ALength: '', AWidth: '', AHeight: '', AQuantity: '',
    unit: '', weight: '', rate: '', remark: ''
  }

  const { control, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm({ defaultValues })

  const watchQty = watch('AQuantity')
  const watchRate = watch('rate')

  useEffect(() => {
    if (triggerEdit.active && triggerEdit.bom && Object.keys(triggerEdit.bom).length > 0) {
      const b = triggerEdit.bom
      setValue('itemCode', b.itemCode || '')
      setValue('itemName', b.itemName || '')
      setValue('specification', b.specification || '')
      setValue('material', b.material || '')
      setValue('grade', b.grade || '')
      setValue('ALength', b.ALength || '')
      setValue('AWidth', b.AWidth || '')
      setValue('AHeight', b.AHeight || '')
      setValue('AQuantity', b.AQuantity || '')
      setValue('unit', b.unit || '')
      setValue('weight', b.weight || '')
      setValue('rate', b.rate || '')
      setValue('remark', b.remark || '')
    }
  }, [triggerEdit.active, triggerEdit.bom, setValue])

  const computedAmount = (watchQty && watchRate) ? (parseFloat(watchQty) * parseFloat(watchRate)).toFixed(2) : ''

  const fields = view === "designer" ? [
    { name: "itemCode", label: "Item Code", type: "text", rules: { required: "Required" } },
    { name: "itemName", label: "Item Name", type: "text", rules: { required: "Required" } },
    { name: "specification", label: "Specification", type: "text", rules: { required: "Required" } },
    { name: "material", label: "Material", type: "text" },
    { name: "grade", label: "Grade / Type", type: "text" },
    { name: "ALength", label: "Length", type: "number" },
    { name: "AWidth", label: "Width", type: "number" },
    { name: "AHeight", label: "Height", type: "number" },
    { name: "AQuantity", label: "Quantity", type: "number", rules: { required: "Required" } },
    { name: "unit", label: "Unit", type: "text" },
    { name: "weight", label: "Weight (Kg)", type: "number" },
    { name: "rate", label: "Rate", type: "number" },
    { name: "remark", label: "Remark", type: "text" },
  ] : [
    { name: "ALength", label: "Length", type: "number" },
    { name: "AWidth", label: "Width", type: "number" },
    { name: "AHeight", label: "Height", type: "number" },
    { name: "AQuantity", label: "Quantity", type: "number" },
  ]

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      ELength: data.ALength, EWidth: data.AWidth, EHeight: data.AHeight, EQuantity: data.AQuantity,
      projectNumber: projectId,
      stageId: stageId,
      amount: computedAmount || null,
    }

    try {
      if (triggerEdit.active) {
        payload.itemId = triggerEdit.bom.itemId
        await dispatch(updateBomDesign([triggerEdit.id, payload])).unwrap()
      } else {
        await dispatch(addBomDesign(payload)).unwrap()
      }

      await dispatch(fetchBom(projectId)).unwrap()
      reset(defaultValues)
      setTriggerEdit({ active: false, id: null, bom: {} })
      if (onClose) onClose()
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to save BOM item.'
      window.alert(message)
    }
  }

  return (
    <div className="add-bom-form">
      <form id="addBomForm" onSubmit={handleSubmit(onSubmit)}>
        <div className="add-bom-fields">
          {fields.map((f) => (
            <Controller
              key={f.name}
              name={f.name}
              control={control}
              rules={f.rules || {}}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={f.label}
                  required={!!f.rules?.required}
                  variant="outlined"
                  type={f.type}
                  size="small"
                  error={!!errors[f.name]}
                  helperText={errors[f.name]?.message}
                  sx={{ '& .MuiOutlinedInput-root': { height: '38px', fontSize: '13px' } }}
                />
              )}
            />
          ))}
          {view === "designer" && (
            <TextField
              label="Amount"
              variant="outlined"
              size="small"
              value={computedAmount}
              disabled
              sx={{ '& .MuiOutlinedInput-root': { height: '38px', fontSize: '13px' } }}
            />
          )}
        </div>
        <div className="add-bom-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="submit-btn">
            {triggerEdit.active ? 'Update' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddBOM
