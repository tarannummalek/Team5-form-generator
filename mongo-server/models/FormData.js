const mongoose = require('mongoose');
 
const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    questionType: { type: String, required: true },
    label: { type: String },
    name: { type: String, required: true },
    option: [String],        
    accept: String           
});
 
const formSchema = new mongoose.Schema({
    title: { type: String, required: true },
    noOfQues: { type: Number, required: true },
    questions: [questionSchema]
});
 
module.exports = mongoose.model('FormData', formSchema);
