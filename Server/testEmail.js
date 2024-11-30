const { sendEmail } = require("./emailService");

(async () => {
  await sendEmail(
    "lecturer@example.com",
    "New Course Assignment",
    "You have been assigned to the course 'Intro to Programming'."
  );
})();
