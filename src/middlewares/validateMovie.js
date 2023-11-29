const validateMovie = (req, res, next) => {
  const { title, director, year, color, duration } = req.body;

  const errors = [];

  if (title == null) {
    errors.push({ message: "The field 'title' is required" });
  } else if (title.length >= 255) {
    errors.push({
      field: "title",
      message: "Should contain less than 255 characters",
    });
  }
  if (director == null) {
    errors.push({ message: "The field 'director' is required" });
  } else if (director.length >= 255) {
    errors.push({
      field: "director",
      message: "Should contain less than 255 characters",
    });
  }
  if (year == null) {
    errors.push({ message: "The field 'year' is required" });
  } else if (year.length !== 4) {
    errors.push({ message: "The field 'year' should contain 4 characters" });
  }
  if (color == null) {
    errors.push({ message: "The field 'color' is required" });
  } else if (typeof color !== "boolean") {
    errors.push({ message: "The field 'color' should be a boolean" });
  }
  if (duration == null) {
    errors.push({ message: "The field 'duration' is required" });
  } else if (typeof duration !== "number") {
    errors.push({ message: "The field 'duration' should be a number" });
  }

  if (errors.length) {
    res.status(422).json({ validationErrors: errors });
  } else {
    next();
  }
};

module.exports = validateMovie;
