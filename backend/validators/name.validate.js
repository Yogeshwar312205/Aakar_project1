import ApiError from "../utils/ApiError.js";

const nameValidate = (value) => {
    // Trim leading/trailing spaces
    const trimmedValue = value.trim();

    // Check if the name is empty
    if (trimmedValue === '') {
        return 'Name cannot be empty';
    }

    // Check for minimum and maximum length (e.g., name should be between 2 and 50 characters)
    if (trimmedValue.length < 2 || trimmedValue.length > 50) {
        return 'Name should be between 2 and 50 characters';
    }

    // Regular expression to check valid characters (letters, spaces, hyphens, apostrophes)
    const regex = /^[A-Za-z\s'-]+$/;

    // Validate name format
    if (!regex.test(trimmedValue)) {
        return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Check for multiple consecutive spaces
    if (/\s{2,}/.test(trimmedValue)) {
        return 'Name should not contain multiple consecutive spaces';
    }

    // If everything passes, return null (indicating validation success)
    return null;
};

export default nameValidate;