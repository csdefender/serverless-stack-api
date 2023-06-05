import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import { genSalt } from "bcrypt";

export async function main(event, context) {
  const data = JSON.parse(event);
  switch (data.type) {
    case "user_create":
      createUser(event);
      break;
    default:
      break;
  }
}

async function createUser(event) {
  const data = JSON.parse(event);
  const passwordSalt = await genSalt(10);
  // const password = await hash(data.password, passwordSalt);
  const params = {
    TableName: process.env.tableName,
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      noteId: uuid.v1(),
      fname: data.fname,
      lname: data.lname,
      email: data.email,
      // password: password,
      createdAt: Date.now(),
    },
  };

  // try {
  //   await dynamoDbLib.call("put", params);
  //   return success("success");
  // } catch (e) {
  //   return failure({ status: false });
  // }
}

createUser();
