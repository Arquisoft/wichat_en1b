const mongoose = require('mongoose');
const Question = require('../../../questionservice/models/question-model'); // Ajusta la ruta si es necesario
const mockQuestions = require('./mockQuestions');  // Asegúrate de que el archivo mockQuestions esté correctamente definido

async function insertMockQuestions() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Borrar las preguntas actuales (si las hay) para evitar duplicados
    await Question.deleteMany({});
    console.log('Preguntas anteriores eliminadas');

    // Insertar preguntas mockeadas
    await Question.insertMany(mockQuestions);
    console.log('Preguntas mock insertadas correctamente');
  } catch (error) {
    console.error('Error insertando preguntas:', error);
  } finally {
    // Cerrar la conexión a la base de datos
    await mongoose.disconnect();
  }
}

insertMockQuestions();
