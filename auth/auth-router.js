const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Data = require('../api/persons/persons-model')

const router = express.Router()

router.post('/register', (req, res) => {
  let person = req.body
  const hash = bcrypt.hashSync(person.password, 10)
  person.password = hash

  Data.add(person)
    .then((saved) => {
      const token = generateToken(saved)
      res.status(201).json({
        message: `Welcome ${person.name}`,
        token,
      })
    })
    .catch(({ name, code, message, stack }) => {
      res.status(500).json({ name, code, message, stack })
    })
})

router.post('/login', (req, res) => {
  let { name, password } = req.body

  Data.findBy({ name })
    .first()
    .then((person) => {
      if (person && bcrypt.compareSync(password, person.password)) {
        const token = generateToken(person)

        res.status(200).json({
          message: `Welcome back ${person.name}`,
          token,
        })
      } else {
        res.status(401).json({ message: 'Invalid Credentials' })
      }
    })
    .catch(({ name, code, message, stack }) => {
      res.status(500).json({ name, code, message, stack })
    })
})

function generateToken(person) {
  const payload = {
    subject: person.id,
    name: person.name,
    email: person.email,
  }

  const options = {
    expiresIn: '2h',
  }

  return jwt.sign(payload, process.env.JWT_SECRET, options)
}

module.exports = router
