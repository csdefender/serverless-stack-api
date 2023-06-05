import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

export async function main(event, context) {
  const data = await JSON.parse(event.body);
  switch (data.type) {
    case "signup":
      signup(event);
      break;
    default:
      break;
  }
}

async function signup(event) {
  const data = JSON.parse(event.body).data;
  const passwordSalt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(data.password, passwordSalt);
  const existUserParams = {
    TableName: process.env.userTable,
    key: {
      email: data.email,
    },
  };
  const params = {
    TableName: process.env.userTable,
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      //   noteId: uuid.v1(),
      fname: data.fname,
      lname: data.lname,
      email: data.email,
      // password: password,
      createdAt: Date.now(),
    },
  };
  const existUser = await dynamoDbLib.call("get", existUserParams);
  if (existUser) {
    return failure({ status: false, error: "Email is already exist" });
  }
  try {
    // await dynamoDbLib.call("put", params);
    return success("success");
  } catch (e) {
    return failure({ status: false });
  }
}

async function signin(event) {
  const data = JSON.parse(event.body).data;
  const passwordSalt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(data.password, passwordSalt);
  const params = {
    TableName: process.env.tableName,
    // 'Key' defines the partition key and sort key of the item to be retrieved
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'noteId': path parameter
    Key: {
      email: data.email,
    },
  };

  try {
    const result = await dynamoDbLib.call("get", params);
    if (!result) {
      return failure({ status: 404, error: "User not found." });
    }

    const password = await bcrypt.compare(data.password, result.password);
    if (!password) {
      return failure({ status: 403, error: "Password incorrect." });
    } else {
      var token = await jwt.sign({ id: result.email }, "secret", {
        expiresIn: 86400,
      });
      return success({ token: token });
    }
  } catch (e) {
    return failure({ status: false });
  }
}
