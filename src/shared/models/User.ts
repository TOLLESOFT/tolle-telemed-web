import {Role} from "./Role";
import {Facility} from "./Facility";

export interface User {
    email: string;
    firstName: string;
    id: string;
    image: string;
    lastName: string;
    facilityId?: string;
    facility?: Facility;
    role?: Role;
}