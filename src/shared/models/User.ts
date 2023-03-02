import {Role} from "./Role";
import {Facility} from "./Facility";

export interface User {
    email?: string;
    firstName?: string;
    id?: string;
    image?: string;
    lastName?: string;
    facilityId?: string;
    facility?: Facility;
    role?: Role;
    genderId?: string
    gender?: any
    address?: string
    nationality?: string
    nationalityId?: string
    active?: boolean
    dateOfBirth?: any;
    firstTimer?: string
    specialtyId?: string
    specialty?: string
    bio?: string
    workPlace?: Facility
    workPlaceId?: string
    concurrencyStamp?: string
    normalizedEmail?: string
    normalizedUserName?: string
    userName?: string
}
