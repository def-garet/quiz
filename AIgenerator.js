const { default: ollama } = require('ollama');

//from npm ollama documentation
const AIgenerator = async (query, questionType) => {
    try {
        const prompt = constructPrompt(query, questionType); 
        const response = await ollama.chat({
            model: 'dolphin-llama3', 
            messages: [{ role: 'user', content: prompt }],
        });

        const rawQuestions = response.message.content; 
        console.log('Raw AI response:', rawQuestions); // Log the raw response

        if (typeof rawQuestions !== 'string' || !rawQuestions.trim()) {
            throw new Error('Received invalid response from AI');
        }

        const formattedQuestions = formatQuestions(rawQuestions); 
        return formattedQuestions;

    } catch (error) {
        console.error('Error interacting with AI:', error);
        throw new Error('Error interacting with AI: ' + error.message);
    }
};

const constructPrompt = (query, questionType) => {
    switch (questionType) {
        case 'multiple_choice':
            return `Generate a JSON array of multiple choice questions in this format: {"questions": [{"question": "Question text", "options": ["Option 1", "Option 2"], "answer": "Correct answer"}]} based on the following text:\n${query}`;
        case 'fill_in_the_blank':
            return `Generate a JSON array of fill-in-the-blank questions in this format: [{"question": "Question text", "answer": "Correct answer"}] based on the following text:\n${query}`;
        case 'true_or_false':
            return `Generate a JSON array of true or false questions in this format: [{"question": "Question text", "answer": "True/False"}] based on the following text:\n${query}`;
        default:
            throw new Error('Invalid question type: ' + questionType);
    }
};

const formatQuestions = (rawQuestions) => {
    try {
        const parsedQuestions = JSON.parse(rawQuestions); 

        if (!Array.isArray(parsedQuestions.questions)) {
            throw new Error('Parsed questions is not an array');
        }

        return parsedQuestions.questions.map((item, index) => ({
            id: index + 1,
            question: item.question,
            options: item.options || [],
            answer: item.answer
        }));
    } catch (error) {
        console.error('Error formatting questions:', error);
        throw new Error('Error formatting questions: ' + error.message);
    }
};

module.exports = AIgenerator;