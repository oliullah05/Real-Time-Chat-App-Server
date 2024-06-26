import config from "../../config";
import ApiError from "../../errors/apiError";
import prisma from "../../shared/prisma"
import bcrypt from "bcrypt"
import jwt, { JwtPayload, Secret } from "jsonwebtoken"



const login = async (payload: { email: string, password: string }) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email
        }
    })

    const isPasswordMatch = await bcrypt.compare(payload.password, userData.password);

    if (!isPasswordMatch) {
        throw new ApiError(400, "Password do not matched")
    }


    // jwt 
    const jwtPayload: JwtPayload = {
        id:userData.id,
        email: userData.email,
        role: userData.role
    }

    const accessToken =  jwt.sign(jwtPayload, config.jwt.jwt_access_secret as Secret, {
        expiresIn: config.jwt.jwt_access_secret_expire_in
    })


    const refreshToken =  jwt.sign(jwtPayload, config.jwt.jwt_refresh_secret as Secret, {
        expiresIn: config.jwt.jwt_refresh_secret_expire_in
    })

  

    return {
        accessToken,
        user:{
            id: userData.id,
            role: userData.role,
            email:userData.email
        },
        refreshToken
    };
}



const refreshToken = async(token:string)=>{
    const verifyToken = jwt.verify(token,config.jwt.jwt_refresh_secret  as Secret);

    const {email}=verifyToken as JwtPayload;

 const userData = await prisma.user.findUniqueOrThrow({
    where:{
        email
    }
  })

  
// jwt 
const jwtPayload: JwtPayload = {
    id: userData.id,
    role: userData.role
}

const accessToken =  jwt.sign(jwtPayload, config.jwt.jwt_access_secret as Secret, {
    expiresIn: config.jwt.jwt_access_secret_expire_in
})


    return {
        accessToken
    }
}












export const AuthServices = {
    login,
    refreshToken
}