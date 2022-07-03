/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const { model, Schema } = require('mongoose')
const UserSchema = new Schema({
  id: {
    type: Number,
    required: true,
    default: 0,
    index: true
  },
  email_address: {
    type: String,
    required: true,
    unique: true
  },
  first_name: {
    type: String
  },
  is_super_admin: {
    type: Boolean,
    required: true,
    default: false
  },
  last_name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: Number
  },
  status: {
    type: String,
    enum: ['invited', 'removed', 'accepted'],
    default: 'invited'
  },
  tenant_id: {
    type: Number,
    required: true
  },

  //
  is_active: {
    type: Boolean,
    required: true,
    default: false
  },
  is_deleted: {
    type: Boolean,
    required: true,
    default: false
  },
  time_stamp: {
    type: Number,
    required: true,
    default: () => Date.now()
  },
  created_on: {
    type: Date,
    required: true,
    default: () => new Date()
  },
  updated_on: {
    type: Date,
    required: true,
    default: () => new Date()
  }
})

model('User', UserSchema)
