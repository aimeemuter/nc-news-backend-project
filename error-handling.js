exports.handleCustomErrors = (error, request, response, next) => {
  if (error.status && error.message) {
    response.status(error.status).send({ message: error.message });
  }
  next(error);
};

exports.handlePsqlErrors = (error, request, response, next) => {
  switch (error.code) {
    case "22P02":
      response.status(400).send({ message: "Invalid datatype for parameter" });
      break;

    case "23503":
      if (error.constraint.includes("article_id_fkey")) {
        response
          .status(404)
          .send({ message: "No article matching the provided ID" });
      }
      if (error.constraint.includes("author_fkey")) {
        response.status(404).send({ message: "Username does not exist" });
      }
      break;

    case "23502":
      response.status(400).send({ message: "Insufficient data provided" });
      break;
  }
  next(error);
};

exports.handleServerErrors = (error, request, response, next) => {
  response.status(500).send({ message: "Internal server error" });
};
