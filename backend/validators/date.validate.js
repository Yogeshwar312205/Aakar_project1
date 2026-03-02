const dateValidate = (date) => {
    // Convert the input to a Date object
    const parsedDate = new Date(date);

    // Ensure the date is valid
    if (isNaN(parsedDate.getTime())) {
        return 'Invalid date format. Please use YYYY-MM-DD.';
    }

    // Ensure the date follows the format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        return 'Date should be in the format YYYY-MM-DD.';
    }

    // If the date is valid and correctly formatted
    return null;
};

export default dateValidate;
