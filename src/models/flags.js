/**
 * @author Oguntuberu Nathan O. <nateoguns.work@gmail.com>
**/

const { model, Schema } = require('mongoose')
const FlagSchema = new Schema({
  id: {
    type: Number,
    required: true,
    default: 0
  },
  description: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: true
  },
  rules: [{
    environments: Object,
    criteria: [{
      property: String,
      condition: {
        type: String,
        enum: ['all', 'some', 'none']
      },
      value: Boolean
    }]
  }],
  tenant_id: {
    type: Number,
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

model('Flag', FlagSchema)
