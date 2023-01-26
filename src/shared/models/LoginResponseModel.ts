import {User} from "./User";
import {TokenModel} from "./TokenModel";

export interface LoginResponseModel{
    accesstoken?: TokenModel,
    user?: User;
    
}