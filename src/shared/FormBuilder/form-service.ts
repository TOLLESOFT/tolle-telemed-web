import {FormObject} from "./form-object";
import {FormInput} from "./form-input";
import {FormTextArea} from "./form-text-area";
import {FormSelect} from "./form-select";
import {FormImage} from "./form-image";
import {FormDate} from "./form-date";

export class FormService {
    static clearDefaultForm = (form: FormObject[]): FormObject[] => {
        form.forEach((item) => {
            if (item.type === 'text') {
                (item.props as FormInput).value = ''
            }
            if (item.type === 'textarea') {
                (item.props as FormTextArea).value = ''
            }
            if (item.type === 'select') {
                (item.props as FormSelect).value = ''
            }
            if (item.type === 'image') {
                (item.props as FormImage).image = ''
            }
            if (item.type === 'date') {
                (item.props as FormDate).date = new Date()
            }
            if (item.type === 'time') {
                (item.props as FormDate).date = new Date()
            }
        });

        return form;
    }
}
