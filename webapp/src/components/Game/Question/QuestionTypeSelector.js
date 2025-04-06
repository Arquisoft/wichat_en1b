import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useGame } from "../GameContext";

const QUESTION_TYPES = ["random", "flags", "animals", "monuments", "foods"]

export const QuestionTypeSelector = () => {
    const { questionType, setQuestionType } = useGame();

    const capitalizaFirstLetter = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    const handleChange = (event) => {
        setQuestionType(event.target.value);
    };

    return (
        <FormControl fullWidth>
            <InputLabel sx={{ fontSize: "1rem", fontWeight: "bold" }}>Question Type</InputLabel>
            <Select
                value={questionType}
                label="Question Type"
                onChange={handleChange}
                sx={{ fontSize: "1rem", fontWeight: "bold" }} // Adjust font size and weight for the Select
            >
                {QUESTION_TYPES.map((questionType) => (
                    <MenuItem key={questionType} value={questionType} sx={{ fontSize: "0.95rem", fontWeight: "500" }}>
                        {capitalizaFirstLetter(questionType)}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

