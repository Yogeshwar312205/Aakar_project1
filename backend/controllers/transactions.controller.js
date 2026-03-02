import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import { connection as db } from '../db/index.js'

const query = (sql, values = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (error, results) => {
      if (error) return reject(error)
      resolve(results)
    })
  })
}

// CREATE transaction
export const createTransaction = asyncHandler(async (req, res) => {
  let {
    itemId,
    date,
    purchase_order,
    name,
    quantity,
    department,
    challan,
    transaction_type,
    v_id
  } = req.body

  try {
    if (!['purchase', 'issue'].includes(transaction_type)) {
      throw new ApiError(400, 'Invalid transaction type')
    }

    // Default v_id to null if not provided
    if (typeof v_id === 'undefined') v_id = null

    if (transaction_type === 'issue') {
      if (v_id !== null) throw new ApiError(400, 'v_id must be null for issue transactions')
      if (!name) throw new ApiError(400, 'name is required for issue transactions')
    }

    if (transaction_type === 'purchase') {
      if (!v_id) throw new ApiError(400, 'v_id is required for purchase transactions')

      const vendorCheckQuery = 'SELECT * FROM vendor_master WHERE vendorId = ?'
      const vendorRows = await query(vendorCheckQuery, [v_id])
      if (vendorRows.length === 0) {
        throw new ApiError(400, 'Vendor ID not found')
      }
    }

    const insertQuery = `
      INSERT INTO transactions_details (
        itemId, date, purchase_order, name, quantity, department, challan, transaction_type, v_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const values = [
      itemId,
      date,
      transaction_type === 'purchase' ? purchase_order : null,
      transaction_type === 'purchase' ? null : name,
      quantity,
      department,
      transaction_type === 'purchase' ? challan : null,
      transaction_type,
      transaction_type === 'purchase' ? v_id : null
    ]

    await query(insertQuery, values)

    return res.status(201).json(new ApiResponse(201, null, 'Transaction recorded successfully.'))
  } catch (error) {
    const status = error instanceof ApiError ? error.statusCode : 500
    const message = error.message || 'Internal server error'
    return res.status(status).json(new ApiResponse(status, null, message, false, error.stack))
  }
})

// GET all transactions
export const getAllTransactions = asyncHandler(async (req, res) => {
  try {
    const rawData = await query(`
      SELECT td.*, vm.SupplierName
      FROM transactions_details td
      LEFT JOIN vendor_master vm ON td.v_id = vm.vendorId
    `)

    const cleanedData = rawData.map((row) => {
      const { v_id, SupplierName, ...rest } = row
      if (row.transaction_type === 'issue') {
        return rest 
      }
      return row 
    })

    return res.status(200).json(new ApiResponse(200, cleanedData, 'Transactions retrieved successfully.'))
  } catch (error) {
    console.error('Get All Transactions Error:', error)

    return res.status(500).json({
      statusCode: 500,
      data: null,
      message: 'Error retrieving transactions',
      success: false,
      error: error.stack
    })
  }
})


// GET transaction by ID
export const getTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params
  try {
    const data = await query(`
      SELECT td.*, vm.SupplierName
      FROM transactions_details td
      LEFT JOIN vendor_master vm ON td.v_id = vm.vendorId
      WHERE td.id = ?
    `, [id])

    if (data.length === 0) {
      return res.status(404).json(new ApiError(404, 'Transaction not found'))
    }

    let transaction = data[0]
    if (transaction.transaction_type === 'issue') {
      const { v_id, SupplierName, ...rest } = transaction
      transaction = rest // Remove v_id and SupplierName for 'issue'
    }

    return res.status(200).json(new ApiResponse(200, transaction, 'Transaction retrieved successfully.'))
  } catch (error) {
    console.error('Get Transaction By ID Error:', error)

    return res.status(500).json({
      statusCode: 500,
      data: null,
      message: 'Error retrieving transaction',
      success: false,
      error: error.stack
    })
  }
})

// DELETE transaction by ID
export const deleteTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params
  try {
    await query('DELETE FROM transactions_details WHERE id = ?', [id])

    return res.status(200).json(new ApiResponse(200, null, 'Transaction deleted successfully.'))
  } catch (error) {
    console.error('Delete Transaction Error:', error)

    return res.status(500).json({
      statusCode: 500,
      data: null,
      message: 'Error deleting transaction',
      success: false,
      error: error.stack
    })
  }
})
