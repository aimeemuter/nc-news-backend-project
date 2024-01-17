const { fetchUsers } = require("../models/users-models");

exports.getUsers = async (request, response, next) => {
  const users = await fetchUsers();
  response.status(200).send({ users });
};
