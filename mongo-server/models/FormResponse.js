const mongoose = require('mongoose');
const { Schema } = mongoose;

const formResponseSchema = new Schema({
  formId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FormData',

  },
  userId: { 
    type: String
  
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
