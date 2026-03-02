import express from 'express'
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  deleteTransaction
} from '../controllers/transactions.controller.js'

const router = express.Router()

// GET all transactions
router.get('/', getAllTransactions)

// GET a single transaction by ID
router.get('/:id', getTransactionById)

// POST a new transaction
router.post('/', createTransaction)


// DELETE transaction
router.delete('/:id', deleteTransaction)


export default router
