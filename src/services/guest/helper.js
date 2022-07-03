/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 */
const bcrypt = require('bcrypt')
const { sign } = require('jsonwebtoken')
const { promisify } = require('util')
const jwt_sign = promisify(sign)

const {
  JWT_ISSUER,
  JWT_SECRET
} = require('../../../config')

module.exports = {
  checkPasswordMatch: async (plain_password, encrypted_password) => {
    return await bcrypt.compare(plain_password, encrypted_password)
  },

  encryptPassword: async (raw_password) => {
    const rounds = 10
    const salt = await bcrypt.genSalt(rounds)
    const encrypted_password = await bcrypt.hash(raw_password, salt)
    return encrypted_password
  },

  generateAuthenticationToken: async (data) => {
    const expiresIn = 21600000
    const token = await jwt_sign({ ...data, tenant_id: data.id }, JWT_SECRET, {
      expiresIn,
      issuer: JWT_ISSUER
    })
    return token
  },

  validatePassword: (raw_password) => {
    const password = raw_password.trim()

    if (password.length < 8) {
      return {
        is_valid: false,
        message: 'Password too short'
      }
    }

    return {
      is_valid: true,
      message: password
    }
  }
}
