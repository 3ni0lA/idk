/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
 **/

const { model, Schema } = require('mongoose')
const EnvironmentSchema = new Schema({
  id: {
    type: Number,
    required: true,
    default: 0
  },
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },

  //
  is_active: {
    type: Boolean,
    required: true,
    default: true
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

model('Environment', EnvironmentSchema)
