function calculatePregnancy(lmpDate) {

    const lmp = new Date(lmpDate);

    const today = new Date();

    const diffDays = Math.floor(
        (today - lmp) / (1000 * 60 * 60 * 24)
    );

    const currentWeek = Math.floor(diffDays / 7) + 1;

    const currentDay = diffDays % 7;

    const dueDate = new Date(lmp);

    dueDate.setDate(dueDate.getDate() + 280);

    let trimester = "First";

    if (currentWeek > 13 && currentWeek <= 27)
        trimester = "Second";

    if (currentWeek > 27)
        trimester = "Third";

    return {
        currentWeek,
        currentDay,
        trimester,
        dueDate,
    };
}

module.exports = calculatePregnancy;