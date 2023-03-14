import {FormDate} from "./form-date";
import {FormInput} from "./form-input";
import {FormTextArea} from "./form-text-area";
import {FormImage} from "./form-image";
import {FormSelect} from "./form-select";

export interface FormObject {
    id: string
    type: 'text' | 'textarea' | 'checkbox' | 'image' | 'date' | 'time' | 'select';
    props: FormDate | FormInput | FormTextArea | FormImage| FormSelect
}
