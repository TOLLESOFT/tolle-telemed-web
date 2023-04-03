import {TokenModel} from "./TokenModel";
import {User} from "./User";
import {LoginResponseModel} from "./LoginResponseModel";
import {HubConnection} from "@microsoft/signalr";

export interface ContextInterface {
    isAuthenticated: boolean;
    accessToken?: TokenModel | null,
    user?: User | null,
    canLogin: (value: LoginResponseModel) => void;
    canLogout: () => void;
    allowedRoutes?: Array<any>;
    hubConnect?: HubConnection;
}
