const mongoose = require('mongoose');
const { Schema } = mongoose;

const formResponseSchema = new Schema({
  formId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FormData',

  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
  },
  responses: [
    {
      questionText: {type: String},
      response: {type: String}
    }
  ]
});
const FormResponse = mongoose.model('FormResponse', formResponseSchema);

module.exports = FormResponse;
