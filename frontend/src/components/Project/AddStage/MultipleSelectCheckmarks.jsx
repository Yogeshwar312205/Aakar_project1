import * as React from 'react'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import ListItemText from '@mui/material/ListItemText'
import Select from '@mui/material/Select'
import Checkbox from '@mui/material/Checkbox'

const ITEM_HEIGHT = 36 // Reduced height for menu items
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP, // Reduced max height
      width: 250,
    },
  },
}

export default function MultipleSelectCheckmarks({
  subpartsList,
  includedSubparts,
  setIncludedSubparts,
  name,
}) {
  const handleChange = (event) => {
    const {
      target: { value },
    } = event

    const clickedItem = subpartsList.find(
      (subpart) => subpart.id === value[value.length - 1].id
    )

    const isAlreadyIncluded = includedSubparts.some(
      (item) => item.id === clickedItem.id
    )

    let newIncludedSubparts
    if (isAlreadyIncluded) {
      // If the item is already included, remove it
      newIncludedSubparts = includedSubparts.filter(
        (item) => item.id !== clickedItem.id
      )
    } else {
      // If the item is not included, add it
      newIncludedSubparts = [...includedSubparts, clickedItem]
    }

    setIncludedSubparts(newIncludedSubparts)
  }

  return (
    <div>
      <FormControl sx={{ m: 1, width: 300, marginTop: '15px' }}>
        <InputLabel
          id="demo-multiple-checkbox-label"
          sx={{ fontSize: '14px' }} // Smaller font size for the label
        >
          {name}
        </InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={includedSubparts}
          onChange={handleChange}
          input={
            <OutlinedInput
              label="Tag"
              sx={{
                height: '40px', // Reduced height for the input field
                fontSize: '14px', // Smaller font size for the input field
              }}
            />
          }
          renderValue={(selected) =>
            selected.map((item) => item.name).join(', ')
          }
          MenuProps={MenuProps}
          sx={{ fontSize: '14px' }} // Smaller font size for the select component
        >
          {subpartsList.map((subpart) => (
            <MenuItem
              key={subpart.id}
              value={subpart}
              sx={{ height: ITEM_HEIGHT, fontSize: '14px' }} // Smaller height and font size for menu items
            >
              <Checkbox
                checked={includedSubparts.some(
                  (item) => item.id === subpart.id
                )}
                sx={{ padding: '6px' }} // Smaller padding for checkboxes
              />
              <ListItemText primary={subpart.name} sx={{ fontSize: '14px' }} />{' '}
              {/* Smaller font size for list items */}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}
