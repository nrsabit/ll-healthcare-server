import jwt, { JwtPayload, Secret } from "jsonwebtoken";

const generateToken = (payload: any, secret: Secret, expiresIn: string) => {
  const token = jwt.sign(payload, secret, { algorithm: "HS256", expiresIn });

  return token;
};

const verifyToken = (token: string, secret: Secret) => {
  const decodedData = jwt.verify(token, secret) as JwtPayload;

  return decodedData;
};

export const jwtHelpers = {
  generateToken,
  verifyToken,
};
