import {User} from "./User";
import {TokenModel} from "./TokenModel";

export interface LoginResponseModel{
    accessToken?: TokenModel,
    user?: User;
    permissions: any []
}
