import jwt from "jsonwebtoken";

export const generateJwt = (id, email, role) => {
    console.log("Generating JWT for Role:", role);

    return jwt.sign({ id, email, role }, process.env.SECRET_KEY, {
        expiresIn: "24h",
    });
};
